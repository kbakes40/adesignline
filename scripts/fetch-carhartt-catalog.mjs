/**
 * Fetches all Carhartt products from the live A Design Line catalog
 * (embedded window.DC.catalog JSON). Run: node scripts/fetch-carhartt-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE =
  'https://www.adesignline.com/p/catalog/39049732-7d64-47e0-93e0-7a77d01f8b50/carhartt';

function parseDcCatalog(html) {
  const marker = 'window.DC.catalog = ';
  const s = html.indexOf(marker);
  if (s < 0) throw new Error('window.DC.catalog not found');
  let i = s + marker.length;
  let depth = 0;
  const start = i;
  for (; i < html.length; i++) {
    const c = html[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return JSON.parse(html.slice(start, i + 1));
    }
  }
  throw new Error('unclosed JSON');
}

function escTs(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
    .replace(/'/g, "\\'");
}

function descriptionHtml(desc) {
  const parts = desc
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.map((p) => `<p>${escTs(p).replace(/\n/g, '<br/>')}</p>`).join('');
}

async function fetchAll() {
  const first = await fetch(BASE);
  const html1 = await first.text();
  const d1 = parseDcCatalog(html1);
  const total = d1.results.products.total;
  const limit = 30;
  const pages = Math.ceil(total / limit);
  const all = [...d1.results.products.records];

  for (let p = 1; p < pages; p++) {
    const r = p * limit;
    const res = await fetch(`${BASE}?r=${r}`);
    const html = await res.text();
    const d = parseDcCatalog(html);
    all.push(...d.results.products.records);
  }

  if (all.length !== total) {
    console.warn(`Expected ${total} records, got ${all.length}`);
  }
  return all;
}

function recordToProductObject(rec) {
  const slug = rec.Link.replace(/^\/p\/product\//, '').split('/').filter(Boolean).join('/') || rec.SuplItemNo;
  const handle = `/product/${slug}`;
  const price = Number.parseFloat(rec.MinRetail);
  const id = `ch-${String(rec.SuplItemNo).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const title = rec.ItemName.trim();
  const description = rec.Description.trim().split(/\n\n+/)[0]?.replace(/\n/g, ' ') || title;
  const descHtml = descriptionHtml(rec.Description);

  return {
    id,
    handle,
    title,
    description: escTs(description.slice(0, 500)),
    descriptionHtml: descHtml,
    price,
    imageUrl: rec.ImagePath,
    supplierSku: rec.SuplItemNo,
    productionDays: rec.ProdTime,
    minQuantity: rec.MinQty
  };
}

const records = await fetchAll();
const objects = records.map(recordToProductObject);

const outPath = path.join(__dirname, '..', 'lib', 'carhartt-catalog-data.ts');
const header = `import type { VercelProduct } from './bigcommerce/types';

/** Synced from [A Design Line Carhartt catalog](https://www.adesignline.com/p/catalog/39049732-7d64-47e0-93e0-7a77d01f8b50/carhartt) — ${objects.length} SKUs */

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode: 'USD' as const };
}

function img(url: string, altText: string) {
  return { url, altText, width: 2400, height: 2400 };
}

function variant(
  id: string,
  title: string,
  amount: number,
  selectedOptions: { name: string; value: string }[] = []
) {
  return {
    id,
    title,
    availableForSale: true,
    selectedOptions,
    price: money(amount)
  };
}

function carharttProduct(spec: {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  price: number;
  imageUrl: string;
  supplierSku: string;
  productionDays: number;
  minQuantity: number;
}): VercelProduct {
  const {
    id,
    handle,
    title,
    description,
    descriptionHtml,
    price,
    imageUrl,
    supplierSku,
    productionDays,
    minQuantity
  } = spec;
  const image = img(imageUrl, title);
  const options = [{ id: 'title', name: 'Title', values: ['Default'] }];
  const variants = [variant(\`\${id}-default\`, title, price)];
  return {
    id,
    handle: \`/product/\${handle}\`,
    availableForSale: true,
    title,
    description,
    descriptionHtml,
    options,
    priceRange: { minVariantPrice: money(price), maxVariantPrice: money(price) },
    variants,
    featuredImage: image,
    images: [image],
    seo: { title: title.slice(0, 70), description: description.slice(0, 160) },
    catalog: {
      supplierSku,
      productionDays,
      minQuantity
    },
    tags: ['carhartt', 'brands', 'categories', 'men', 'women'],
    updatedAt: new Date().toISOString()
  };
}

export const carharttCatalogProducts: VercelProduct[] = [
`;

const items = objects
  .map(
    (o) => `  carharttProduct({
    id: '${escTs(o.id)}',
    handle: '${escTs(o.handle.replace(/^\/product\//, ''))}',
    title: '${escTs(o.title)}',
    description: '${escTs(o.description)}',
    descriptionHtml: \`${o.descriptionHtml}\`,
    price: ${o.price},
    imageUrl: '${escTs(o.imageUrl)}',
    supplierSku: '${escTs(o.supplierSku)}',
    productionDays: ${o.productionDays},
    minQuantity: ${o.minQuantity}
  })`
  )
  .join(',\n');

const footer = `
];
`;

fs.writeFileSync(outPath, header + items + footer, 'utf8');
console.log('Wrote', outPath, 'products:', objects.length);
