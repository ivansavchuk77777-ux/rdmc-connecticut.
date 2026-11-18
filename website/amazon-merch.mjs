// Add published Amazon listings with approved product images.
const catalog = [
  // { name, category, url, image, detail }
];

export function amazonProductUrl(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      !['amazon.com', 'www.amazon.com'].includes(url.hostname) ||
      url.username || url.password || url.port
    ) {
      return null;
    }

    const product = url.pathname.match(/^\/(?:[^/]+\/)?dp\/([a-z0-9]{10})\/?$/i)
      ?? url.pathname.match(/^\/gp\/product\/([a-z0-9]{10})\/?$/i);
    return product ? 'https://www.amazon.com/dp/' + product[1].toUpperCase() : null;
  } catch {
    return null;
  }
}

const products = new Map();
for (const entry of catalog) {
  const url = amazonProductUrl(entry.url);
  if (url && entry.name?.trim() && entry.image?.trim() && !products.has(url)) {
    products.set(url, { ...entry, url });
  }
}

export const amazonMerch = [...products.values()];
