import json
import math
import os
import re
import urllib.error
import urllib.request
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin

token = os.environ["PRINTFUL_API_TOKEN"]
store = os.environ.get("PRINTFUL_STORE_ID", "18911068")
def get(path):
    req = urllib.request.Request("https://api.printful.com" + path, headers={"Authorization": "Bearer " + token, "X-PF-Store-Id": store})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Printful API {path.split(chr(63))[0]} returned HTTP {exc.code}; check store access and token scopes") from None
p = Path("src.jsx")
source = p.read_text()
match = re.search(r'^const merch=(\[.*\]);$', source, re.M)
if not match:
    raise RuntimeError("Catalog declaration not found")
existing = [entry for entry in json.loads(match.group(1)) if entry.get("url")]
catalog = []
offset = 0
while True:
    response = get(f"/store/products?limit=100&offset={offset}")
    batch = response["result"]
    catalog.extend(batch)
    offset += len(batch)
    if not batch or offset >= response.get("paging", {}).get("total", offset):
        break
target = "499679302"
other_gaiter = "499701986"
if not any(str(x.get("id")) == target for x in catalog):
    try:
        direct = get("/store/products/" + target)["result"]["sync_product"]
        if str(direct.get("id")) == target:
            catalog.append(direct)
            print("Located requested product through direct lookup")
    except RuntimeError as exc:
        print(str(exc))
if not catalog:
    raise RuntimeError("No products returned; preserving existing catalog")
# Resolve only links advertised by the official storefront.
shop = "https://rdmcfairfieldcounty.printful.me/"
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = set()
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            url = urlsplit(urljoin(shop, dict(attrs).get("href") or ""))
            if url.scheme == "https" and url.netloc == urlsplit(shop).netloc:
                m = re.fullmatch(r"/product/([a-z0-9-]+)/?", url.path)
                if m:
                    self.links.add(m.group(1))
parser = Links()
with urllib.request.urlopen(shop, timeout=20) as response:
    parser.feed(response.read(2000000).decode("utf-8", errors="replace"))

for product in catalog:
    product_id = str(product["id"])
    if product.get("is_ignored") or product_id == other_gaiter:
        continue
    detail = get("/store/products/" + product_id)["result"]
    item = detail["sync_product"]
    name = item["name"]
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    prior = next((entry for entry in existing if str(entry.get("id")) == product_id), None)
    if prior is None and (
        slug not in parser.links
        or any(entry["url"] == slug or entry["name"].casefold() == name.casefold() for entry in existing)
    ):
        continue
    variants = [
        variant for variant in detail["sync_variants"]
        if not variant.get("is_ignored") and variant.get("retail_price") is not None
    ]
    if not variants or not item.get("thumbnail_url"):
        continue
    if any(variant.get("currency", "USD") != "USD" for variant in variants):
        continue
    prices = [float(variant["retail_price"]) for variant in variants]
    if not all(math.isfinite(price) and price > 0 for price in prices):
        continue
    if product_id == target and min(prices) != 13.50:
        print("Requested neck gaiter does not match the approved $13.50 retail price")
        continue
    if prior is not None:
        prior.update(price=min(prices), image=item["thumbnail_url"], name=name)
        continue
    product_path = "/product/" + slug
    try:
        with urllib.request.urlopen(urljoin(shop, product_path), timeout=20) as response:
            final_url = urlsplit(response.geturl())
            if response.status != 200 or final_url.netloc != urlsplit(shop).netloc or final_url.path.rstrip("/") != product_path:
                continue
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            continue
        raise
    existing.append({
        "id": item["id"],
        "name": name,
        "category": "Support Gear",
        "price": min(prices),
        "url": slug,
        "image": item["thumbnail_url"],
        "detail": "From price; choose options in official store" if min(prices) != max(prices) else "Choose options in official store",
    })
    print("Imported advertised product:", slug)

print("Returned catalog IDs:", [x.get("id") for x in catalog])
p.write_text(source[:match.start(1)] + json.dumps(existing, ensure_ascii=False, separators=(",",":")) + source[match.end(1):])
print("Catalog entries:", len(existing))
if not any(str(x.get("id")) == "499679302" for x in existing):
    print("::notice::Requested neck gaiter is unavailable as a verified $13.50 product in Printful store " + store)

