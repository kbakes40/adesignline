/**
 * Fetches A Design Line brand catalogs (window.DC.catalog) and writes lib/brand-catalogs-data.ts
 * Run: node scripts/fetch-all-brand-catalogs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fruit of the Loom: the /fruit-of-the-loom catalog slug returns the full site index (~116k SKUs); seeded in lib/fruit-of-the-loom-seed.ts instead.

/** @type {{ base: string; slug: string; idPrefix: string; label: string }[]} */
const CATALOGS = [
  {
    label: 'Columbia',
    base: 'https://www.adesignline.com/p/catalog/16581b64-474d-4a6e-a6fb-721d7a36630a/columbia',
    slug: 'columbia',
    idPrefix: 'cl'
  },
  {
    label: 'Cutter & Buck',
    base: 'https://www.adesignline.com/p/catalog/39b05983-85ba-469f-9a94-1f2b352a41c6/cutter-buck',
    slug: 'cutter-buck',
    idPrefix: 'cb'
  },
  {
    label: 'Moleskine',
    base: 'https://www.adesignline.com/p/catalog/ea1cd6ef-b98a-41a4-a2cb-095c6beb1883/moleskine',
    slug: 'moleskine',
    idPrefix: 'ms'
  },
  {
    label: 'Puma',
    base: 'https://www.adesignline.com/p/catalog/64cfd898-8cd9-4062-90d1-b02a60373a1b/puma',
    slug: 'puma',
    idPrefix: 'pu'
  },
  {
    label: 'The North Face',
    base: 'https://www.adesignline.com/p/catalog/dd8a52e2-ff7b-4859-acc3-1d67198a1b7c/the-north-face',
    slug: 'north-face',
    idPrefix: 'tnf'
  },
  {
    label: 'Under Armour',
    base: 'https://www.adesignline.com/p/catalog/2061ef6a-d72f-4b7b-a727-27827d52b4d5/under-armour',
    slug: 'under-armour',
    idPrefix: 'ua'
  }
];

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

async function fetchCatalogRecords(base) {
  const first = await fetch(base);
  const html1 = await first.text();
  const d1 = parseDcCatalog(html1);
  const total = d1.results.products.total;
  const limit = 30;
  const pages = Math.ceil(total / limit);
  const all = [...d1.results.products.records];

  for (let p = 1; p < pages; p++) {
    const r = p * limit;
    const res = await fetch(`${base}?r=${r}`);
    const html = await res.text();
    const d = parseDcCatalog(html);
    all.push(...d.results.products.records);
  }

  if (all.length !== total) {
    console.warn(`[${base}] expected ${total} records, got ${all.length}`);
  }
  return all;
}

function recordToSpec(rec, idPrefix) {
  const slug = rec.Link.replace(/^\/p\/product\//, '').split('/').filter(Boolean).join('/') || rec.SuplItemNo;
  const handle = slug;
  const price = Number.parseFloat(rec.MinRetail);
  const id = `${idPrefix}-${String(rec.SuplItemNo).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const title = rec.ItemName.trim();
  const description = rec.Description.trim().split(/\n\n+/)[0]?.replace(/\n/g, ' ') || title;
  const descHtml = descriptionHtml(rec.Description);

  return {
    id,
    handle,
    title,
    description: description.slice(0, 500),
    descriptionHtml: descHtml,
    price,
    imageUrl: rec.ImagePath,
    supplierSku: String(rec.SuplItemNo),
    productionDays: rec.ProdTime,
    minQuantity: rec.MinQty
  };
}

const header = `import type { VercelProduct } from './bigcommerce/types';
import { brandCatalogProduct } from './brand-catalog-product';

/**
 * Synced from A Design Line brand catalogs (same source pattern as Carhartt).
 * Regenerate: \`node scripts/fetch-all-brand-catalogs.mjs\`
 */

export const additionalBrandCatalogProducts: VercelProduct[] = [
`;

const footer = `
];
`;

async function main() {
  const chunks = [];
  let total = 0;
  for (const cat of CATALOGS) {
    console.log('Fetching', cat.label, '...');
    const records = await fetchCatalogRecords(cat.base);
    const objects = records.map((r) => recordToSpec(r, cat.idPrefix));
    total += objects.length;
    const block = objects
      .map(
        (o) => `  brandCatalogProduct({
    id: ${JSON.stringify(o.id)},
    handle: ${JSON.stringify(o.handle)},
    title: ${JSON.stringify(o.title)},
    description: ${JSON.stringify(o.description)},
    descriptionHtml: ${JSON.stringify(o.descriptionHtml)},
    price: ${o.price},
    imageUrl: ${JSON.stringify(o.imageUrl)},
    supplierSku: ${JSON.stringify(o.supplierSku)},
    productionDays: ${o.productionDays},
    minQuantity: ${o.minQuantity},
    brandSlug: ${JSON.stringify(cat.slug)}
  })`
      )
      .join(',\n');
    chunks.push(block);
    console.log('  ', objects.length, 'products');
  }

  const outPath = path.join(__dirname, '..', 'lib', 'brand-catalogs-data.ts');
  const body = chunks.join(',\n');
  fs.writeFileSync(outPath, header + body + footer, 'utf8');
  console.log('Wrote', outPath, 'total products:', total);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
