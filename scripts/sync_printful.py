import json, os, re, urllib.request, urllib.error
from pathlib import Path

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
    if any(x.get("id") == item["id"] or x["name"].casefold() == name.casefold() or x["url"] == re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") for x in existing):
        continue
    if any(v.get("currency", "USD") != "USD" for v in variants):
        continue
    prices = [float(v["retail_price"]) for v in variants]
    existing.append({"id":item["id"],"name":name,"category":"Support Gear","price":min(prices),"url":"","image":item["thumbnail_url"],"detail":"From price; choose options in official store" if min(prices)!=max(prices) else "Choose options in official store"})
p.write_text(source[:match.start(1)] + json.dumps(existing, ensure_ascii=False, separators=(",",":")) + source[match.end(1):])
print("Catalog entries:", len(existing))
if not any(str(x.get("id")) == "499679302" for x in existing):
    print("Requested product 499679302 not imported; verify it is published in store " + store)

