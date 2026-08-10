/**
 * Converts Turkish characters and title into a clean SEO-friendly slug
 */
export function slugifyTurkish(text: string | null | undefined): string {
  if (!text) return "portfoy";
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

/**
 * Builds a Sahibinden-style clean URL for a property:
 * e.g. /ilan/emlak-konut-satilik-sarraf-tan-firsat-yakupluda-gercek-3-plus1-daire-videolu-1328101220/detay
 */
export function getPropertyDetailUrl(property: {
  id?: string;
  ilan_no?: string | null;
  title?: string | null;
  property_type?: string | null;
  listing_type?: string | null;
} | null | undefined): string {
  if (!property) return "/ilanlar";
  const idOrNo = property.ilan_no || property.id;
  if (!idOrNo) return "/ilanlar";

  const propType = (property.property_type || "").toLowerCase();
  const category = propType.includes("arsa") || propType.includes("tarla") ? "emlak-arsa" : "emlak-konut";
  const action = property.listing_type === "kiralik" ? "kiralik" : "satilik";
  const titleSlug = slugifyTurkish(property.title);

  return `/ilan/${category}-${action}-${titleSlug}-${idOrNo}/detay`;
}

/**
 * Parses any incoming route parameter (whether it's a Sahibinden URL slug, UUID, or ilan_no)
 * and returns query criteria to fetch from Supabase.
 */
export function parsePropertyParam(param: string | undefined): {
  id?: string;
  ilan_no?: string;
  raw?: string;
} {
  if (!param) return {};
  const cleaned = decodeURIComponent(param).trim();

  // 1. Check for full UUID in string
  const uuidMatch = cleaned.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuidMatch) {
    return { id: uuidMatch[0] };
  }

  // 2. Check for numeric ilan_no (6 to 12 digits, e.g. 1328101220)
  const ilanNoMatch = cleaned.match(/(\d{6,12})/);
  if (ilanNoMatch) {
    return { ilan_no: ilanNoMatch[1] };
  }

  // 3. Fallback raw string
  return { raw: cleaned };
}
