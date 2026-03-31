import type { VercelProduct } from './bigcommerce/types';
import type { PlacementProfileId } from './placement-types';

/**
 * Maps a product to a placement profile using title, description, tags, and optional catalog hints.
 * Order is intentional: more specific product families are checked before broad ones (e.g. backpack before generic “bag”).
 * When signals conflict or are weak, falls back to `generic`.
 */
export function resolveProductPlacementProfile(product: VercelProduct): PlacementProfileId {
  const title = (product.title ?? '').toLowerCase();
  const desc = (product.description ?? '').toLowerCase();
  const tags = product.tags.map((t) => t.toLowerCase());
  const hay = [title, desc, ...tags].join(' \n ');
  const hayFlat = hay.replace(/\s+/g, ' ');

  const cat = (product.catalog as { category?: string; subcategory?: string; productType?: string } | undefined);
  const metaBits = [cat?.category, cat?.subcategory, cat?.productType].filter(Boolean).map((s) => String(s).toLowerCase());
  const meta = metaBits.join(' ');

  const combined = `${hayFlat} ${meta}`;

  const has = (re: RegExp) => re.test(combined);

  // Drinkware (before “bottle” matches bags)
  if (has(/\b(mug|tumbler|bottle|drinkware|stemware|coaster|can cooler|wine glass|pint glass|shot glass|stem)\b/)) {
    return 'drinkware';
  }

  // Headwear
  if (has(/\b(hat|cap|beanie|visor|bucket hat|knit cap|trucker|snapback|fitted cap)\b/)) {
    return 'hat';
  }

  // Cooler / insulated (before generic lunch tote)
  if (has(/\b(cooler|cooler bag|ice chest|insulated bag|soft cooler|lunch bag)\b/)) {
    return 'cooler';
  }

  // Backpack / laptop pack
  if (has(/\b(backpack|back pack|daypack|rucksack|sling bag|computer backpack|laptop backpack|book bag)\b/)) {
    return 'backpack';
  }

  // Duffel / gym barrel
  if (has(/\b(duffel|duffle|gym bag|barrel bag)\b/)) {
    return 'duffel_bag';
  }

  // Tote / shopper (after backpack/duffel)
  if (has(/\b(tote|tote bag|carryall|shopper|reusable bag|grocery bag)\b/) && !has(/\bbackpack\b/)) {
    return 'tote_bag';
  }

  // Office / paper
  if (has(/\b(notebook|journal|padfolio|portfolio|planner|desk set|memo pad|calendar book|binder)\b/)) {
    return 'office_item';
  }

  // Small hard promo (avoid matching “backpack” strings)
  if (
    has(
      /\b(pen|pens|usb|flash drive|thumb drive|power bank|charger|keychain|multi-tool|flashlight|tool kit|tech accessory)\b/
    )
  ) {
    return 'hard_goods';
  }

  // Apparel
  if (
    has(
      /\b(polo|tee|t-shirt|tshirt|shirt|hoodie|fleece|jacket|sweatshirt|quarter zip|pullover|vest|shorts|jogger|legging|apparel|uniform)\b/
    )
  ) {
    return 'apparel';
  }

  // Weak bag signal → generic (not enough to pick backpack vs tote)
  if (has(/\b(bag|bags)\b/) && !has(/\b(backpack|tote|duffel|cooler|lunch)\b/)) {
    return 'generic';
  }

  return 'generic';
}
