import json, os, re, urllib.request, urllib.error
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin
import math

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
existing = json.loads(match.group(1))
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
for product in catalog:
    if product.get("is_ignored"):
        continue
    detail = get("/store/products/" + str(product["id"]))["result"]
    item = detail["sync_product"]
    variants = [v for v in detail["sync_variants"] if not v.get("is_ignored") and v.get("retail_price") is not None]
    if not variants or not item.get("thumbnail_url"):
        continue
    name = item["name"]
    if any(v.get("currency", "USD") != "USD" for v in variants):
        continue
    prices = [float(v["retail_price"]) for v in variants]
    if not all(math.isfinite(v) and v > 0 for v in prices):
        continue
    prior = next((x for x in existing if str(x.get("id")) == str(item["id"])), None)
    if prior is not None:
        prior.update(price=min(prices), image=item["thumbnail_url"], name=name)
        continue
    if any(x["name"].casefold() == name.casefold() for x in existing):
        continue
    existing.append({"id":item["id"],"name":name,"category":"Support Gear","price":min(prices),"url":"","image":item["thumbnail_url"],"detail":"From price; choose options in official store" if min(prices)!=max(prices) else "Choose options in official store"})
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
try:
    parser = Links()
    with urllib.request.urlopen(shop, timeout=20) as response:
        parser.feed(response.read(2000000).decode("utf-8", errors="replace"))
    for entry in existing:
        if entry.get("url"):
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", entry["name"].lower()).strip("-")
        if slug in parser.links:
            try:
                with urllib.request.urlopen(shop + "product/" + slug, timeout=20) as response:
                    if response.status == 200 and urlsplit(response.geturl()).netloc == urlsplit(shop).netloc and urlsplit(response.geturl()).path.rstrip("/") == "/product/" + slug:
                        entry["url"] = slug
                        print("Advertised product link resolved:", slug)
            except OSError:
                print("Product link unavailable:", slug)
except OSError:
    print("Storefront link discovery unavailable; preserving links")
print("Returned catalog IDs:", [x.get("id") for x in catalog])
p.write_text(source[:match.start(1)] + json.dumps(existing, ensure_ascii=False, separators=(",",":")) + source[match.end(1):])
print("Catalog entries:", len(existing))
if not any(str(x.get("id")) == "499679302" for x in existing):
    print("Requested product 499679302 not imported; verify it is published in store " + store)

