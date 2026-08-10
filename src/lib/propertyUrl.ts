import { supabase } from "@/integrations/supabase/client";

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
 * Generates a clean 7-digit numeric listing number for properties that don't have an explicit ilan_no,
 * preventing long UUIDs from ever appearing in public URLs.
 */
export function getCleanListingNumber(p: { id?: string; ilan_no?: string | null } | null | undefined): string {
  if (!p) return "1000000";
  if (p.ilan_no && String(p.ilan_no).trim()) {
    return String(p.ilan_no).trim();
  }
  if (p.id) {
    const hex = p.id.replace(/[^0-9a-f]/gi, "").slice(0, 7);
    const num = parseInt(hex, 16);
    if (!isNaN(num)) {
      return String((num % 9000000) + 1000000);
    }
  }
  return "1000000";
}

/**
 * Builds a Sahibinden-style clean URL for a property:
 * e.g. /ilan/emlak-konut-satilik-sarraf-tan-firsat-yakupluda-gercek-3-plus1-daire-videolu-5718313/detay
 */
export function getPropertyDetailUrl(property: {
  id?: string;
  ilan_no?: string | null;
  title?: string | null;
  property_type?: string | null;
  listing_type?: string | null;
} | null | undefined): string {
  if (!property) return "/ilanlar";

  const propType = (property.property_type || "").toLowerCase();
  const category = propType.includes("arsa") || propType.includes("tarla") ? "emlak-arsa" : "emlak-konut";
  const action = property.listing_type === "kiralik" ? "kiralik" : "satilik";
  const titleSlug = slugifyTurkish(property.title);
  const listingNum = getCleanListingNumber(property);

  return `/ilan/${category}-${action}-${titleSlug}-${listingNum}/detay`;
}

/**
 * Robustly finds a property in Supabase using any incoming route parameter:
 * - Clean 7-digit listing number (e.g. 5718313)
 * - Sahibinden ilan_no (e.g. 1328101220)
 * - Legacy UUID (e.g. 7414629c-9f65-431c-af5c-f98864496d92)
 */
export async function findPropertyByRouteParam(param: string | undefined): Promise<any | null> {
  if (!param) return null;
  const cleaned = decodeURIComponent(param).trim();

  try {
    // 1. Check for full UUID in string
    const uuidMatch = cleaned.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) {
      const { data } = await supabase.from("properties").select("*").eq("id", uuidMatch[0]).maybeSingle();
      if (data) return data;
    }

    // 2. Check for trailing numeric listing number (6 to 12 digits, e.g. 5718313 or 1328101220)
    const numMatch = cleaned.match(/(\d{6,12})/);
    if (numMatch) {
      const targetNum = numMatch[1];
      // A. Direct ilan_no match
      const { data: ilanData } = await supabase.from("properties").select("*").eq("ilan_no", targetNum).maybeSingle();
      if (ilanData) return ilanData;

      // B. Match clean listing number or ID prefix
      const { data: allProps } = await supabase.from("properties").select("*");
      if (allProps && allProps.length > 0) {
        const match = allProps.find(
          (p) => getCleanListingNumber(p) === targetNum || p.id.startsWith(targetNum) || String(p.ilan_no) === targetNum
        );
        if (match) return match;
      }
    }

    // 3. Fallback direct match attempt
    const { data: directData } = await supabase
      .from("properties")
      .select("*")
      .or(`id.eq.${cleaned},ilan_no.eq.${cleaned}`)
      .maybeSingle();

    return directData || null;
  } catch (err) {
    console.error("Error finding property by route param:", err);
    return null;
  }
}
