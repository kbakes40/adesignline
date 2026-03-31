import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

type HtmlLookup = Record<string, {
  productOptionsHtml?: string;
  salesToolsHtml?: string;
  inventoryHtml?: string;
}>;

let fcHtml: HtmlLookup | null = null;
let pcHtml: HtmlLookup | null = null;

function loadFeatured(): HtmlLookup {
  if (fcHtml) return fcHtml;
  const filePath = path.join(process.cwd(), 'lib/data/featured-collections-html.json');
  if (!fs.existsSync(filePath)) return {};
  fcHtml = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as HtmlLookup;
  return fcHtml;
}

function loadPatches(): HtmlLookup {
  if (pcHtml) return pcHtml;
  const filePath = path.join(process.cwd(), 'lib/data/patches-catalog-html.json');
  if (!fs.existsSync(filePath)) return {};
  pcHtml = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as HtmlLookup;
  return pcHtml;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const featured = loadFeatured();
  const entry = featured[id] ?? loadPatches()[id];

  if (!entry) {
    return NextResponse.json({}, { status: 200 });
  }

  return NextResponse.json(entry, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' }
  });
}
