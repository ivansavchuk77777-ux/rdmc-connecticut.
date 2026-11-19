import { amazonMerch } from './amazon-merch.mjs';

const grid = document.getElementById('merch-products');
const template = document.getElementById('merch-product-template');

for (const product of amazonMerch) {
  const card = template.content.cloneNode(true);
  const image = card.querySelector('img');
  image.src = product.image;
  image.alt = product.name;
  card.querySelector('h3').textContent = product.name;
  const detail = card.querySelector('p');
  detail.textContent = product.detail ?? product.category ?? '';
  detail.hidden = !detail.textContent;
  const link = card.querySelector('a');
  link.href = product.url;
  link.setAttribute('aria-label', 'Buy ' + product.name + ' on Amazon');
  grid.append(card);
}

if (amazonMerch.length) {
  document.getElementById('merch-coming-soon').hidden = true;
  grid.hidden = false;
}
