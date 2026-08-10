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
    const trimmed = String(p.ilan_no).trim();
    // If it's a UUID, ignore it and fall back to hash generation
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
    if (!isUUID) {
      return trimmed;
    }
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
 * - Title slug
 */
export async function findPropertyByRouteParam(param: string | undefined): Promise<any | null> {
  if (!param) return null;
  const cleaned = decodeURIComponent(param).trim();

  try {
    // 1. Check for full UUID match in parameter
    const uuidMatch = cleaned.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) {
      const targetUuid = uuidMatch[0];
      // Directly query by ID (ID column is guaranteed to exist)
      const { data } = await supabase.from("properties").select("*").eq("id", targetUuid).maybeSingle();
      if (data) return data;
    }

    // 2. Fetch all properties safely to do in-memory matching (avoids missing SQL column 400 errors)
    const { data: allProps, error } = await supabase.from("properties").select("*");
    if (error || !allProps || allProps.length === 0) {
      console.error("Supabase property fetch error in findPropertyByRouteParam:", error);
      return null;
    }

    // Extract any 6 to 12 digit number sequence from parameter
    const numMatch = cleaned.match(/(\d{6,12})/);
    const targetNum = numMatch ? numMatch[1] : null;

    // 3. Match against loaded properties
    const match = allProps.find((p: any) => {
      // Direct ID match
      if (p.id === cleaned) return true;
      
      // UUID match
      if (uuidMatch && p.id === uuidMatch[0]) return true;

      // Safe ilan_no check
      if (p.ilan_no && String(p.ilan_no).trim() === cleaned) return true;

      // Numeric matches
      if (targetNum) {
        if (p.ilan_no && String(p.ilan_no).trim() === targetNum) return true;
        if (getCleanListingNumber(p) === targetNum) return true;
        if (p.id && p.id.replace(/-/g, "").startsWith(targetNum)) return true;
        if (p.id && p.id.replace(/-/g, "").endsWith(targetNum)) return true;
      }

      return false;
    });

    if (match) return match;

    // 4. Fallback match by Title Slug
    const titleMatch = allProps.find((p: any) => {
      const slug = slugifyTurkish(p.title);
      return slug && slug.length > 5 && cleaned.includes(slug);
    });

    return titleMatch || null;
  } catch (err) {
    console.error("Error finding property by route param:", err);
    return null;
  }
}
