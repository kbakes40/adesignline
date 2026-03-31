/**
 * Fetches all products from A Design Line “Featured Collections” catalogs (live site):
 * PPE, Golf, Workwear / Uniforms, Top Sellers — and writes lib/featured-collections-catalog-data.ts
 *
 * For each SKU, also pulls per-product options from Distributor Central
 * `GET /products/{SupplierItemGUID}/options` (same payload the live PDP uses for option accordions).
 *
 * Run: node scripts/import-featured-collections-catalogs.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../lib/featured-collections-catalog-data.ts');

/** Same catalogs as nav “Featured Collections” on https://www.adesignline.com/ */
const FEATURED_CATALOGS = [
  {
    id: 'ppe',
    url: 'https://www.adesignline.com/p/catalog/80e9a60a-0161-4f35-8216-c07955631fcb/ppe',
    tags: ['ppe', 'featured-ppe']
  },
  {
    id: 'golf',
    url: 'https://www.adesignline.com/p/catalog/b0e80b74-0eba-453d-8fd2-e67fb7510699/golf',
    tags: ['golf', 'featured-golf']
  },
  {
    id: 'workwear',
    url: 'https://www.adesignline.com/p/catalog/9ab7f550-95a6-4a39-a697-39815fa5aaf5/workwear-uniforms',
    tags: ['workwear', 'uniform', 'featured-workwear']
  },
  {
    id: 'top-sellers',
    url: 'https://www.adesignline.com/p/catalog/cfc24e81-5997-411c-827a-327981273edb/top-sellers',
    tags: ['top', 'sellers', 'featured-top-sellers']
  }
];

const SITE_ORIGIN = 'https://www.adesignline.com';
/** Distributor Central API — same `/products/{guid}/options` call the live PDP uses for accordion options. */
const DC_API_BASE = 'https://prod-api.distributorcentral.com';
/** `distributorAccountGUID` query param; matches A Design Line site embed (`DC.acctGuid`). */
const DC_DISTRIBUTOR_ACCOUNT_GUID = '2375FB04-FF05-484A-B7EC-056AE38AE5F6';

/** First JSON array after marker `"QuantityPrices":` in embedded DC.product (supplier PDP). */
function parseFirstQuantityPricesArray(html) {
  const marker = '"QuantityPrices":';
  const idx = html.indexOf(marker);
  if (idx < 0) return null;
  let i = idx + marker.length;
  while (i < html.length && /\s/.test(html[i])) i++;
  if (html[i] !== '[') return null;
  const begin = i;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (; i < html.length; i++) {
    const c = html[i];
    if (inString) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === '"') inString = false;
    } else {
      if (c === '"') inString = true;
      else if (c === '[') depth++;
      else if (c === ']') {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(html.slice(begin, i + 1));
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
}

function normalizeQuantityPriceRows(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const row of arr) {
    const q = Number(row.Quantity);
    const raw = String(row.RetailPrice ?? '').trim();
    const rp = Number.parseFloat(raw);
    if (!Number.isFinite(q) || q < 1 || !Number.isFinite(rp) || Number.isNaN(rp)) continue;
    out.push({ quantity: q, unitPrice: rp });
  }
  out.sort((a, b) => a.quantity - b.quantity);
  return out;
}

async function fetchQuantityPricesForLink(linkPath) {
  const p = String(linkPath || '');
  if (!p.startsWith('/')) return [];
  const url = `${SITE_ORIGIN}${p}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ADL-Clone-Import/1.0 (local dev catalog mirror)'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const raw = parseFirstQuantityPricesArray(html);
    return normalizeQuantityPriceRows(raw);
  } catch {
    return [];
  }
}

/** Per-SKU product options (woven borders, backing, etc.) — mirrors live site accordion. */
async function fetchProductOptionsPayload(supplierItemGuid) {
  const guid = String(supplierItemGuid || '').trim();
  if (!guid) return null;
  const qs = new URLSearchParams({
    currencySymbol: '$',
    distributorAccountGUID: DC_DISTRIBUTOR_ACCOUNT_GUID,
    priceDecimalPlaces: '2'
  });
  const url = `${DC_API_BASE}/products/${guid}/options?${qs.toString()}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ADL-Clone-Import/1.0 (local dev catalog mirror)'
      }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const payload = json?.payload;
    return Array.isArray(payload) && payload.length > 0 ? payload : null;
  } catch {
    return null;
  }
}

function parseRecordsArray(html) {
  const marker = '"records":';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error('No "records" array in HTML');
  let i = start + marker.length;
  while (/\s/.test(html[i])) i++;
  if (html[i] !== '[') throw new Error('Expected [ after records');
  const begin = i;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (; i < html.length; i++) {
    const c = html[i];
    if (inString) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === '"') inString = false;
    } else {
      if (c === '"') inString = true;
      else if (c === '[') depth++;
      else if (c === ']') {
        depth--;
        if (depth === 0) {
          return JSON.parse(html.slice(begin, i + 1));
        }
      }
    }
  }
  throw new Error('Unclosed records array');
}

function extractTotal(html) {
  const m = html.match(/"total":(\d+),"loading"/);
  return m ? Number.parseInt(m[1], 10) : 0;
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugFromLink(link) {
  const parts = String(link).replace(/^\/p\/product\//, '').split('/');
  return parts[parts.length - 1] || 'patch';
}

async function fetchCatalogPage(catalogBaseUrl, offset) {
  const url = `${catalogBaseUrl}?offset=${offset}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ADL-Clone-Import/1.0 (local dev catalog mirror)'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function j(s) {
  return JSON.stringify(s ?? '');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strip scripts / event handlers from distributor HTML */
function sanitizeBasicHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
}

/** Plain text with newlines for parsing decoration / product-detail blocks (mirrors site copy) */
function normalizeDescriptionForExtraction(raw) {
  let t = String(raw || '').trim();
  t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<\/p>/gi, '\n');
  t = t.replace(/<p[^>]*>/gi, '\n');
  t = t.replace(/<b[^>]*>/gi, '\n');
  t = t.replace(/<\/b>/gi, ' ');
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/[ \t]+/g, ' ');
  t = t.replace(/\n[ \t]+/g, '\n');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Distributor Central "Product Detail" lines use multi-word labels (e.g. "Standard Colors:").
 * A generic split on ` Word:` breaks those — match known field names explicitly (longest first).
 */
const PRODUCT_DETAIL_FIELD_NAMES = [
  'Item Dimension (inch)',
  'Item Weight (g)',
  'Standard Colors',
  'Standard Package',
  'Imprint Methods',
  'Imprint Location',
  'Imprint Size',
  'Item Shape',
  'Capacities',
  'Material',
  'Type',
  'MOQ'
];

function splitProductDetailSegment(segment) {
  const s = String(segment || '').trim();
  if (!s) return [];
  const names = PRODUCT_DETAIL_FIELD_NAMES.map(escapeRegex).join('|');
  const re = new RegExp(
    `\\b(${names}):\\s*([\\s\\S]*?)(?=\\s+(?:${names}):\\s|$)`,
    'gi'
  );
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    const label = m[1].trim();
    const value = m[2].trim().replace(/\s+/g, ' ');
    if (label && value) out.push({ label, value });
  }
  return out;
}

function extractProductDetailPairs(norm) {
  const m = norm.match(/Product Detail:\s*([\s\S]*?)(?=\s*Add-Ons(?:\s+with\s+Extra\s+Charges)?\s*:|$)/i);
  if (!m) return [];
  let segment = m[1].trim().split(/\s*Tags:\s*/i)[0].trim();
  return splitProductDetailSegment(segment);
}

function splitAddOnTail(tail) {
  let s = String(tail || '').trim();
  if (!s) return [];
  s = s.replace(/\s*[\n\r]+\s*/g, '\n');
  const lines = s.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  if (lines.length > 1) return lines;

  s = lines[0] || s;
  const chunks = s.split(/\)\s+(?=[A-Z])/).map((p, i, arr) => {
    let t0 = p.trim();
    if (i < arr.length - 1 && !t0.endsWith(')')) t0 += ')';
    return t0;
  }).filter(Boolean);

  const out = [];
  for (const w of chunks) {
    const tailSplit = w.split(/\s+(?=[A-Z][a-z]+(?:\s+[a-z]+){2,}(?:\s+[a-z]+)?$)/);
    if (tailSplit.length > 1) out.push(...tailSplit.map((x) => x.trim()).filter(Boolean));
    else out.push(w);
  }
  return out;
}

function extractAddOnItems(norm) {
  const m = norm.match(/Add-Ons(?:\s+with\s+Extra\s+Charges)?:\s*([\s\S]+?)(?:\s*Tags:\s*|$)/i);
  if (!m) return [];
  let tail = m[1].trim().split(/\s*Tags:\s*/i)[0].trim();
  if (!tail) return [];
  return splitAddOnTail(tail);
}

function extractDecorationSections(norm) {
  const sections = [];
  const stdM = norm.match(/Standard Decoration Includes:\s*([\s\S]+?)(?=\s*All Available Decoration Options:|\s*Decoration Options:|\s*Standard Packaging:|\s*Tags:\s*|$)/i);
  if (stdM) {
    let v = stdM[1].trim().split(/\s*Tags:\s*/i)[0].trim();
    if (v) sections.push({ title: 'Standard decoration (included)', body: v });
  }
  const allM = norm.match(/All Available Decoration Options:\s*([\s\S]+?)(?=\s*Standard Packaging:|\s*Material:|\s*Tags:\s*|$)/i);
  if (allM) {
    let v = allM[1].trim().split(/\s*Tags:\s*/i)[0].trim();
    if (v) sections.push({ title: 'All available decoration options', body: v });
  }
  if (!allM) {
    const decM = norm.match(/Decoration Options:\s*([\s\S]+?)(?=\s*Standard Packaging:|\s*Tags:\s*|$)/i);
    if (decM) {
      let v = decM[1].trim().split(/\s*Tags:\s*/i)[0].trim();
      if (v) sections.push({ title: 'Decoration options', body: v });
    }
  }
  return sections;
}

function formatOptionBodyAsHtml(body) {
  const lines = String(body)
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) {
    return `<p class="text-[13px] leading-relaxed text-neutral-800">${escapeHtml(body)}</p>`;
  }
  return `<ul class="list-disc pl-5 space-y-1 text-[13px] leading-snug">${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
}

/** Supplier-sourced specs & options for the Product Options tab (not in catalog JSON) */
function buildAdditionalOptionsFromDescription(rawDesc) {
  const norm = normalizeDescriptionForExtraction(rawDesc);
  const pairs = extractProductDetailPairs(norm);
  const addOns = extractAddOnItems(norm);
  const deco = extractDecorationSections(norm);

  if (pairs.length === 0 && addOns.length === 0 && deco.length === 0) return '';

  const chunks = [];

  if (pairs.length > 0) {
    const rows = pairs
      .map(
        ({ label, value }) =>
          `<tr class="border-b border-neutral-100"><td class="py-2 pr-3 text-neutral-500 align-top">${escapeHtml(label)}</td><td class="py-2 text-neutral-800">${escapeHtml(value)}</td></tr>`
      )
      .join('');
    chunks.push(
      `<h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-700 mt-5 mb-2">Product detail (supplier)</h4>
<table class="w-full border-collapse text-left text-[13px]">
<thead><tr class="border-b border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500"><th class="py-2 pr-3 font-medium">Specification</th><th class="py-2 font-medium">Details</th></tr></thead>
<tbody>${rows}</tbody>
</table>`
    );
  }

  if (addOns.length > 0) {
    chunks.push(
      `<h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-700 mt-5 mb-2">Add-ons &amp; upcharges</h4>
<ul class="list-disc pl-5 space-y-1 text-[13px] leading-snug">${addOns.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
    );
  }

  for (const { title, body } of deco) {
    chunks.push(
      `<h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-700 mt-5 mb-2">${escapeHtml(title)}</h4>
${formatOptionBodyAsHtml(body)}`
    );
  }

  return chunks.join('\n');
}

/**
 * Build Product Options accordion HTML from DC `GET /products/{guid}/options` payload (same data as live).
 */
function buildSupplierOptionsAccordionHtml(payload) {
  if (!Array.isArray(payload) || payload.length === 0) return '';
  const sorted = [...payload].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const blocks = sorted.map((opt) => {
    const title = escapeHtml(String(opt.optionName || 'Option'));
    const optDesc =
      opt.optionDescription && String(opt.optionDescription).trim()
        ? `<p class="mb-3 text-[13px] leading-relaxed text-neutral-700">${escapeHtml(String(opt.optionDescription).trim())}</p>`
        : '';
    const choices = Array.isArray(opt.choices) ? opt.choices : [];
    let choicesHtml = '';
    if (choices.length === 0) {
      const hint =
        opt.optionNumber && String(opt.optionNumber) !== String(opt.optionName)
          ? `<p class="text-[13px] text-neutral-700">${escapeHtml(String(opt.optionNumber).trim())}</p>`
          : '';
      choicesHtml =
        hint ||
        '<p class="text-[12px] text-neutral-500">No line choices listed—contact the studio for this add-on.</p>';
    } else {
      choicesHtml = choices
        .map((ch) => {
          const num = String(ch.choiceNumber || '').trim();
          const name = String(ch.choiceName || '').trim();
          const headline = escapeHtml(num || name || 'Choice');
          const sub =
            num && name && name !== num
              ? `<p class="text-[12px] text-neutral-600">${escapeHtml(name)}</p>`
              : '';
          const descRaw = ch.choiceDescription ? String(ch.choiceDescription).replace(/\r\n/g, '\n').trim() : '';
          const desc = descRaw
            ? `<p class="mt-1 text-[13px] leading-relaxed text-neutral-700">${escapeHtml(descRaw)}</p>`
            : '';
          const seen = new Set();
          const lines = [];
          for (const arr of [ch.pricing, ch.quantityPrices]) {
            if (!Array.isArray(arr)) continue;
            for (const row of arr) {
              const d = row.retailPriceDisplayWithUnits || row.retailPriceDisplay;
              if (d && !seen.has(d)) {
                seen.add(d);
                lines.push(escapeHtml(d));
              }
            }
          }
          const priceLine =
            lines.length > 0
              ? `<p class="mt-1 text-[12px] font-medium text-neutral-800">${lines.join(' · ')}</p>`
              : '';
          const imgSrc = ch.imagePathSmall || ch.imagePathLarge;
          const img = imgSrc
            ? `<div class="mb-2"><img src="${escapeHtml(imgSrc)}" alt="" class="max-h-28 max-w-[180px] rounded border border-neutral-200 object-contain" loading="lazy" /></div>`
            : '';
          return `<div class="border-b border-neutral-100 py-3 last:border-0">${img}<p class="font-semibold text-neutral-900">${headline}</p>${sub}${desc}${priceLine}</div>`;
        })
        .join('');
    }

    return `<details class="group border-b border-neutral-200 last:border-b-0 open:bg-neutral-50/50">
<summary class="cursor-pointer list-none py-3 pl-1 pr-2 text-[13px] font-semibold text-neutral-900 outline-none [&::-webkit-details-marker]:hidden">
<span class="flex items-start justify-between gap-3">
<span>${title}</span>
<span class="mt-0.5 shrink-0 text-[10px] font-normal text-neutral-400 transition group-open:rotate-180" aria-hidden="true">▼</span>
</span>
</summary>
<div class="border-t border-neutral-100 bg-white px-1 pb-3 pt-2">${optDesc}${choicesHtml}</div>
</details>`;
  });

  return `<div class="not-prose mt-5">
<h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-700 mb-2">Patch options (supplier)</h4>
<p class="text-[12px] text-neutral-600 mb-3">Options and add-ons from the live Distributor Central product page for this SKU. Pricing may change; confirm on your quote.</p>
<div class="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50/30">
${blocks.join('\n')}
</div>
</div>`;
}

/**
 * Full Description tab: intro + Price includes + Lead time + Product detail + Add-ons
 */
function buildDescriptionHtml(raw) {
  const s = String(raw || '').trim();
  if (!s) return '<p></p>';

  if (/<[a-z][\s\S]*>/i.test(s) && (s.includes('<br') || s.includes('<b>') || s.includes('<p>'))) {
    const cleaned = sanitizeBasicHtml(s).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return `<div class="patch-rich space-y-3">${cleaned}</div>`;
  }

  let text = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  text = text.replace(/\n(?=Price Includes:)/gi, '\n\n');
  text = text.replace(/\n(?=Lead Time)/gi, '\n\n');
  text = text.replace(/\n(?=Product Detail:)/gi, '\n\n');
  text = text.replace(/\n(?=Add-Ons)/gi, '\n\n');
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const parts = [];

  for (const block of blocks) {
    if (/^Price Includes:/i.test(block)) {
      const lines = block
        .replace(/^Price Includes:\s*/i, '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      parts.push(
        `<h3 class="text-sm font-semibold text-neutral-900 mt-4 mb-2 first:mt-0">Price includes</h3><ul class="list-disc pl-5 space-y-1.5 text-[13px] leading-snug">${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`
      );
    } else if (/^Lead Time/i.test(block)) {
      parts.push(
        `<h3 class="text-sm font-semibold text-neutral-900 mt-4 mb-2">Lead time</h3><p class="text-[13px] leading-relaxed whitespace-pre-wrap">${escapeHtml(block)}</p>`
      );
    } else if (/^Product Detail:/i.test(block)) {
      const body = block.replace(/^Product Detail:\s*/i, '');
      const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
      const rows = lines.map((line) => {
        const m = line.match(/^([^:]+):\s*(.+)$/);
        if (m) {
          return `<div class="grid grid-cols-1 gap-1 border-b border-neutral-100 py-2 text-[13px] last:border-0 sm:grid-cols-[minmax(8rem,0.35fr)_1fr] sm:gap-3"><dt class="text-neutral-500">${escapeHtml(m[1].trim())}</dt><dd class="text-neutral-800">${escapeHtml(m[2].trim())}</dd></div>`;
        }
        return `<p class="text-[13px] py-1 text-neutral-800">${escapeHtml(line)}</p>`;
      });
      parts.push(
        `<h3 class="text-sm font-semibold text-neutral-900 mt-4 mb-2">Product detail</h3><div class="rounded border border-neutral-200 bg-neutral-50/90 px-3 py-1">${rows.join('')}</div>`
      );
    } else if (/^Add-Ons/i.test(block)) {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      parts.push(
        `<h3 class="text-sm font-semibold text-neutral-900 mt-4 mb-2">Add-ons &amp; extras</h3><div class="text-[13px] leading-relaxed space-y-2">${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('')}</div>`
      );
    } else {
      parts.push(
        `<p class="text-[13px] leading-relaxed mb-3 last:mb-0">${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`
      );
    }
  }

  return `<div class="patch-rich space-y-1">${parts.join('')}</div>`;
}

function buildProductOptionsHtml(rec, rawDesc, optionsPayload) {
  const sku = String(rec.SuplItemNo || rec.SuplDisplayNo || '');
  const minP =
    rec.MinRetail != null && rec.MinRetail !== '' ? Number.parseFloat(String(rec.MinRetail)) : 0;
  const maxP =
    rec.MaxRetail != null && rec.MaxRetail !== '' ? Number.parseFloat(String(rec.MaxRetail)) : minP;
  const minQty = rec.MinQty != null ? String(rec.MinQty) : '—';
  const prodDays =
    rec.ProdTime != null && !Number.isNaN(Number(rec.ProdTime))
      ? `${rec.ProdTime} day${Number(rec.ProdTime) === 1 ? '' : 's'}`
      : 'See description';
  const priceNote =
    minP > 0 && maxP > 0
      ? `$${minP.toFixed(2)} – $${maxP.toFixed(2)} USD`
      : minP > 0
        ? `From $${minP.toFixed(2)} USD`
        : 'Call for pricing';

  const bullets = [rec.bulletPoint1, rec.bulletPoint2, rec.bulletPoint3, rec.bulletPoint4, rec.bulletPoint5].filter(
    Boolean
  );

  const highlights =
    bullets.length > 0
      ? `<h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-700 mt-5 mb-2">Catalog highlights</h4><ul class="list-disc pl-5 space-y-1 text-[13px] leading-snug">${bullets.map((b) => `<li>${escapeHtml(String(b))}</li>`).join('')}</ul>`
      : '';

  const additional = buildAdditionalOptionsFromDescription(rawDesc);
  const supplierOptionsHtml = buildSupplierOptionsAccordionHtml(optionsPayload);
  const footer = additional || supplierOptionsHtml
    ? '<p class="text-[12px] text-neutral-500 mt-4">Final quote may reflect selected options, proofs, rush, or freight beyond list pricing.</p>'
    : '<p class="text-[12px] text-neutral-500 mt-4">When the supplier lists imprint methods, colors, packaging, or upgrades in catalog copy, they will appear in the sections above.</p>';

  const tiers = rec._quantityPrices;
  const qtyTable =
    tiers && tiers.length > 0
      ? `<h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-700 mt-5 mb-2">Quantity pricing (USD)</h4>
<p class="text-[12px] text-neutral-600 mb-2">Price per unit at each order-quantity break (from the live product page).</p>
<table class="w-full border-collapse text-left text-[13px]">
<thead><tr class="border-b border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500"><th class="py-2 pr-3 font-medium">Quantity</th><th class="py-2 font-medium">Price (each)</th></tr></thead>
<tbody>${tiers
        .map(
          (t) =>
            `<tr class="border-b border-neutral-100"><td class="py-2 pr-3 text-neutral-800 tabular-nums">${escapeHtml(String(t.quantity))}</td><td class="py-2 tabular-nums">$${escapeHtml(t.unitPrice.toFixed(2))} each</td></tr>`
        )
        .join('')}</tbody>
</table>`
      : '';

  return `<div class="space-y-4 text-[13px] leading-relaxed text-neutral-800">
<p class="text-neutral-600">Use this section for <strong class="text-neutral-900">ordering rules</strong>: style number, price band, minimums, and stated production time from the supplier catalog. Final invoice may reflect decoration, proofs, rush, or freight.</p>
<table class="w-full border-collapse text-left text-[13px]">
<thead><tr class="border-b border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500"><th class="py-2 pr-3 font-medium">Field</th><th class="py-2 font-medium">Value</th></tr></thead>
<tbody>
<tr class="border-b border-neutral-100"><td class="py-2 pr-3 text-neutral-500 align-top">Style #</td><td class="py-2 font-mono text-neutral-900">${escapeHtml(sku)}</td></tr>
<tr class="border-b border-neutral-100"><td class="py-2 pr-3 text-neutral-500 align-top">List price range</td><td class="py-2">${escapeHtml(priceNote)}</td></tr>
<tr class="border-b border-neutral-100"><td class="py-2 pr-3 text-neutral-500 align-top">Minimum quantity</td><td class="py-2">${escapeHtml(minQty)}</td></tr>
<tr class="border-b border-neutral-100"><td class="py-2 pr-3 text-neutral-500 align-top">Stated production time</td><td class="py-2">${escapeHtml(prodDays)}</td></tr>
</tbody>
</table>
${qtyTable}
${highlights}
${supplierOptionsHtml}
${additional}
${footer}
</div>`;
}

function buildSalesToolsHtml(rec) {
  const sku = String(rec.SuplItemNo || rec.SuplDisplayNo || '');
  const title = String(rec.ItemName || '');
  return `<div class="space-y-4 text-[13px] leading-relaxed text-neutral-800">
<p><strong class="text-neutral-900">Pitch this SKU</strong> — ${escapeHtml(title)}. Lead with use case (uniforms, retail, teams, recognition), then minimums and timeline. Reference included services from “Price includes” in the Description tab when present (e.g. setup, virtual proof, shipping offers).</p>
<ul class="list-disc pl-5 space-y-2">
<li>Quote style <span class="font-mono text-neutral-900">${escapeHtml(sku)}</span> on proposals and POs.</li>
<li>Offer virtual proofs and artwork checks before production.</li>
<li>Cross-sell with hats, bags, or jackets for kit programs.</li>
<li>For decoration and imprint methods, follow supplier notes in the Description tab.</li>
</ul>
<p class="text-[12px] text-neutral-500">Approved partners can request internal sell sheets, comparison matrices, and margin guidance from the A Design Line team.</p>
</div>`;
}

function buildInventoryHtml(rec) {
  const minQty = rec.MinQty != null ? String(rec.MinQty) : '—';
  const prod =
    rec.ProdTime != null && !Number.isNaN(Number(rec.ProdTime))
      ? `Supplier-stated production window: <strong>${rec.ProdTime} day${Number(rec.ProdTime) === 1 ? '' : 's'}</strong> (not including transit).`
      : 'Production time varies; see Description for supplier notes.';

  return `<div class="space-y-3 text-[13px] leading-relaxed text-neutral-800">
<p>Merchandise is <strong class="text-neutral-900">typically sourced to order</strong>. Stock and availability may vary by supplier and season.</p>
<p>${prod}</p>
<p>Contact the studio for <strong>rush</strong> feasibility, <strong>split shipments</strong>, or <strong>multi-location</strong> drops before placing large orders.</p>
<p class="text-[12px] text-neutral-500">Minimum order quantity: <strong class="text-neutral-800">${escapeHtml(minQty)}</strong> units (per catalog line).</p>
</div>`;
}

function recordToProductBlock(rec) {
  const slug = slugFromLink(rec.Link);
  const id = String(rec.SupplierItemGUID).toLowerCase();
  const handle = `/product/${slug}`;
  const rawDesc = String(rec.Description || '');
  let minP =
    rec.MinRetail != null && rec.MinRetail !== '' ? Number.parseFloat(String(rec.MinRetail)) : 0;
  let maxP =
    rec.MaxRetail != null && rec.MaxRetail !== '' ? Number.parseFloat(String(rec.MaxRetail)) : minP;
  const tiers = rec._quantityPrices && rec._quantityPrices.length ? rec._quantityPrices : null;
  if (tiers) {
    const prices = tiers.map((t) => t.unitPrice);
    minP = Math.min(...prices);
    maxP = Math.max(...prices);
  }
  const sortedTiers = tiers ? [...tiers].sort((a, b) => a.quantity - b.quantity) : [];
  const priceForVariant =
    sortedTiers.length > 0
      ? sortedTiers[0].unitPrice
      : Number.isFinite(maxP) && maxP > 0
        ? maxP
        : minP;
  const minQty = rec.MinQty != null ? Number(rec.MinQty) : 1;
  const prodDays = rec.ProdTime != null ? Number(rec.ProdTime) : undefined;
  const title = String(rec.ItemName);
  const descPlain = stripHtml(rawDesc).slice(0, 20000);
  const descHtml = buildDescriptionHtml(rawDesc);
  const productOptionsHtml = buildProductOptionsHtml(rec, rawDesc, rec._optionsPayload);
  const salesToolsHtml = buildSalesToolsHtml(rec);
  const inventoryHtml = buildInventoryHtml(rec);
  const img = String(rec.ImagePath || '');
  const sku = String(rec.SuplItemNo || rec.SuplDisplayNo || slug);
  const bullets = [rec.bulletPoint1, rec.bulletPoint2, rec.bulletPoint3, rec.bulletPoint4, rec.bulletPoint5].filter(
    Boolean
  );

  const catalogParts = [
    `supportsCustomization: true`,
    `supplierSku: ${j(sku)}`,
    `minQuantity: ${minQty}`,
    `productOptionsHtml: ${j(productOptionsHtml)}`,
    `salesToolsHtml: ${j(salesToolsHtml)}`,
    `inventoryHtml: ${j(inventoryHtml)}`
  ];
  if (prodDays != null && !Number.isNaN(prodDays)) {
    catalogParts.push(`productionDays: ${prodDays}`);
  }
  if (bullets.length) {
    catalogParts.push(`featureBullets: [${bullets.map((b) => j(String(b))).join(', ')}]`);
  }
  if (tiers && tiers.length) {
    catalogParts.push(
      `quantityPrices: [${tiers.map((t) => `{ quantity: ${t.quantity}, unitPrice: ${t.unitPrice} }`).join(', ')}]`
    );
  }

  return `  {
    id: ${j(id)},
    handle: ${j(handle)},
    availableForSale: true,
    title: ${j(title)},
    description: ${j(descPlain)},
    descriptionHtml: ${j(descHtml)},
    options: [],
    priceRange: {
      minVariantPrice: money(${minP}),
      maxVariantPrice: money(${maxP})
    },
    variants: [
      variant(${j(`${id}-default`)}, ${j(title)}, ${priceForVariant})
    ],
    featuredImage: image(${j(img)}, ${j(title)}),
    images: [image(${j(img)}, ${j(title)})],
    seo: { title: ${j(title)}, description: ${j(descPlain.slice(0, 160))} },
    tags: [${(() => {
      const merged = [
        ...new Set([
          'categories',
          'promotional-products',
          'brands',
          'men',
          'women',
          ...(rec._featuredTags || [])
        ])
      ];
      return merged.map((t) => j(t)).join(', ');
    })()}],
    updatedAt: new Date().toISOString(),
    catalog: {
      ${catalogParts.join(',\n      ')}
    }
  }`;
}

async function main() {
  const mergedByGuid = new Map();

  for (const cat of FEATURED_CATALOGS) {
    console.error(`Fetching catalog: ${cat.id} …`);
    const first = await fetchCatalogPage(cat.url, 0);
    const total = extractTotal(first);
    const all = [...parseRecordsArray(first)];
    let offset = all.length;
    while (offset < total) {
      const html = await fetchCatalogPage(cat.url, offset);
      const chunk = parseRecordsArray(html);
      if (!chunk.length) break;
      all.push(...chunk);
      offset += chunk.length;
      console.error(`  ${cat.id}: ${all.length} / ${total}`);
    }

    const seenThisCatalog = new Map();
    for (const r of all) {
      seenThisCatalog.set(String(r.SupplierItemGUID).toLowerCase(), r);
    }
    for (const r of seenThisCatalog.values()) {
      const guid = String(r.SupplierItemGUID).toLowerCase();
      const existing = mergedByGuid.get(guid);
      if (existing) {
        for (const t of cat.tags) existing._featuredTags.add(t);
      } else {
        const tagSet = new Set(cat.tags);
        r._featuredTags = tagSet;
        mergedByGuid.set(guid, r);
      }
    }
    console.error(`  ${cat.id}: unique in merge so far ${mergedByGuid.size}`);
  }

  const records = [...mergedByGuid.values()].map((r) => {
    r._featuredTags = [...r._featuredTags];
    return r;
  });
  console.error(`Total unique products across featured catalogs: ${records.length}`);

  const concurrency = 8;
  for (let i = 0; i < records.length; i += concurrency) {
    const batch = records.slice(i, i + concurrency);
    const tierResults = await Promise.all(batch.map((r) => fetchQuantityPricesForLink(r.Link)));
    batch.forEach((r, j) => {
      r._quantityPrices = tierResults[j];
    });
    console.error(`Quantity pricing ${Math.min(i + concurrency, records.length)} / ${records.length}`);
  }

  for (let i = 0; i < records.length; i += concurrency) {
    const batch = records.slice(i, i + concurrency);
    const optResults = await Promise.all(batch.map((r) => fetchProductOptionsPayload(r.SupplierItemGUID)));
    batch.forEach((r, j) => {
      r._optionsPayload = optResults[j];
    });
    console.error(`Product options API ${Math.min(i + concurrency, records.length)} / ${records.length}`);
  }

  const header = `import type { VercelProduct } from './bigcommerce/types';

const currencyCode = 'USD';

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode };
}

function variant(
  id: string,
  title: string,
  amount: number
) {
  return {
    id,
    title,
    availableForSale: true,
    selectedOptions: [] as { name: string; value: string }[],
    price: money(amount)
  };
}

function image(url: string, altText: string) {
  return { url, altText, width: 1400, height: 1750 };
}

/** Featured collections (PPE, Golf, Workwear/Uniforms, Top Sellers) — mirrored from adesignline.com (${records.length} SKUs). Re-run: \`node scripts/import-featured-collections-catalogs.mjs\` */
export const featuredCollectionsCatalogProducts: VercelProduct[] = [
`;

  const body = records.map(recordToProductBlock).join(',\n');
  const footer = `\n];\n`;

  fs.writeFileSync(OUT, header + body + footer, 'utf8');
  console.error(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
