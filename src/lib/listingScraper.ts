export interface ExtractedProperty {
  title?: string;
  description?: string;
  price?: number | null;
  currency?: string;
  property_type?: string;
  listing_type?: string;
  rooms?: string;
  bathrooms?: number | null;
  gross_m2?: number | null;
  net_m2?: number | null;
  floor?: string;
  total_floors?: number | null;
  building_age?: string;
  heating?: string;
  district?: string;
  city?: string;
  tag?: string;
  images: string[];
  external_url?: string;
  source_portal?: "sahibinden" | "emlakjet" | "hepsiemlak" | "generic";
}

function clean(txt: string): string {
  return txt.replace(/\s+/g, " ").trim();
}

/**
 * Extracts a value that follows a label pattern in text.
 * Example: "Oda Sayısı 3+1" → "3+1"
 * Example: "Oda Sayısı\n3+1" → "3+1"
 */
function extractAfterLabel(text: string, labelPattern: RegExp): string | null {
  const match = text.match(labelPattern);
  if (!match) return null;
  // Get the text right after the match
  const afterIdx = (match.index ?? 0) + match[0].length;
  const after = text.substring(afterIdx, afterIdx + 80).trim();
  // Take first meaningful token (up to newline or tab)
  const token = after.split(/[\n\r\t|·]/)[ 0].trim();
  return token || null;
}

/**
 * Parse price text like "5.500.000 TL" or "€ 250.000" or "12,500,000"
 */
export function parsePrice(raw: string): { price: number | null; currency: string } {
  if (!raw) return { price: null, currency: "TRY" };

  let currency = "TRY";
  if (raw.includes("$") || /USD/i.test(raw)) currency = "USD";
  else if (raw.includes("€") || /EUR/i.test(raw)) currency = "EUR";
  else if (raw.includes("£") || /GBP/i.test(raw)) currency = "GBP";

  const numericStr = raw.replace(/[^0-9]/g, "");
  const price = numericStr ? parseInt(numericStr, 10) : null;
  return { price, currency };
}

/**
 * Detects which portal the text likely came from
 */
export function detectPortal(text: string): "sahibinden" | "emlakjet" | "hepsiemlak" | "generic" {
  if (/sahibinden\.com/i.test(text) || /İlan No\s*:/i.test(text) || /classifiedDetail/i.test(text)) return "sahibinden";
  if (/emlakjet\.com/i.test(text) || /emlakjet/i.test(text)) return "emlakjet";
  if (/hepsiemlak\.com/i.test(text) || /hepsiemlak/i.test(text)) return "hepsiemlak";
  return "generic";
}

// ─── Turkish Real Estate Label Patterns ─────────────────────────────────────
const LABEL = {
  rooms:       /(?:Oda\s*Say[ıi]s[ıi]|Oda\s*\+\s*Salon)\s*[:\-]?\s*/i,
  grossM2:     /(?:m[²2]\s*\(?Br[üu]t\)?|Br[üu]t\s*(?:m[²2]|Metrekare|Alan))\s*[:\-]?\s*/i,
  netM2:       /(?:m[²2]\s*\(?Net\)?|Net\s*(?:m[²2]|Metrekare|Alan))\s*[:\-]?\s*/i,
  floor:       /(?:Bulundu[ğg]u\s*Kat)\s*[:\-]?\s*/i,
  totalFloors: /(?:Kat\s*Say[ıi]s[ıi]|Toplam\s*Kat)\s*[:\-]?\s*/i,
  buildingAge: /(?:Bina\s*Ya[şs][ıi])\s*[:\-]?\s*/i,
  heating:     /(?:[Iİıi]s[ıi]tma(?:\s*Tipi)?)\s*[:\-]?\s*/i,
  bathrooms:   /(?:Banyo\s*Say[ıi]s[ıi])\s*[:\-]?\s*/i,
  propertyType:/(?:(?:Emlak|Gayrimenkul|[İi]lan)\s*Tipi|Konut\s*Tipi)\s*[:\-]?\s*/i,
  listingType: /(?:Sat[ıi]l[ıi]k|Kiral[ıi]k)/i,
  city:        /(?:[İi]l|[Şş]ehir)\s*[:\-]?\s*/i,
  district:    /(?:[İi]l[çc]e|Semt)\s*[:\-]?\s*/i,
  price:       /(?:Fiyat[ıi]?|[Üü]cret)\s*[:\-]?\s*/i,
};

export function upgradeToHighResImageUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  let u = url.trim();

  // 1. Sahibinden HD resolution upgrade
  // Replaces thumbnail prefixes (thmb_, x5_, s_, m_, l_, preview_) with big_ or removes them
  if (u.includes("shbdn.com") || u.includes("sahibinden")) {
    u = u.replace(/\/(thmb|x5|s|m|l|preview|thumb|thumbnail)_/gi, "/big_");
    u = u.replace(/\/photos\/([0-9a-zA-Z_\/]+)\/(thmb|x5|s|m|l|preview)_/gi, "/photos/$1/big_");
  }

  // 2. Emlakjet HD resolution upgrade
  // Replaces low-res dimensions with high-res 1920x1440
  if (u.includes("emlakjet.com") || u.includes("ej-") || u.includes("im.emlakjet")) {
    u = u.replace(/\/w_\d+,h_\d+[^/]*\//gi, "/w_1920,h_1440,q_90/");
    u = u.replace(/\/w_\d+\//gi, "/w_1920/");
    u = u.replace(/\/h_\d+\//gi, "/h_1440/");
    u = u.replace(/_thumb\./gi, "_large.");
    u = u.replace(/_small\./gi, "_large.");
    u = u.replace(/_medium\./gi, "_large.");
  }

  // 3. Hepsiemlak / Cloudinary HD resolution upgrade
  if (u.includes("hepsiemlak.com") || u.includes("he.cld") || u.includes("cloudinary.com")) {
    u = u.replace(/\/c_fill,h_\d+,w_\d+[^/]*\//gi, "/c_limit,w_1920,h_1440,q_90/");
    u = u.replace(/\/w_\d+,h_\d+[^/]*\//gi, "/w_1920,h_1440,q_90/");
    u = u.replace(/\/thumb\//gi, "/large/");
    u = u.replace(/\/small\//gi, "/large/");
    u = u.replace(/\/medium\//gi, "/large/");
  }

  // 4. Generic query param dimension upgrades (?width=150, ?w=200, etc.)
  if (u.includes("?") && (u.includes("width=") || u.includes("w=") || u.includes("size="))) {
    try {
      const parsed = new URL(u);
      if (parsed.searchParams.has("width")) parsed.searchParams.set("width", "1920");
      if (parsed.searchParams.has("w")) parsed.searchParams.set("w", "1920");
      if (parsed.searchParams.has("height")) parsed.searchParams.set("height", "1440");
      if (parsed.searchParams.has("h")) parsed.searchParams.set("h", "1440");
      if (parsed.searchParams.has("size")) parsed.searchParams.set("size", "large");
      if (parsed.searchParams.has("q")) parsed.searchParams.set("q", "90");
      u = parsed.toString();
    } catch {
      u = u.replace(/([?&](?:width|w)=\d+)/gi, "$1".replace(/\d+/, "1920"));
    }
  }

  return u;
}

export function isLegitimatePropertyImage(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const u = url.toLowerCase().trim();

  // Reject bad schemes
  if (!u.startsWith("http://") && !u.startsWith("https://") && !u.startsWith("/")) return false;

  // Filter out QR codes, verification badges, portal logos, social icons, ad tracking, pixels
  const junkPatterns = [
    "qr", "qrcode", "karekod", "barcode", "barkod",
    "elektronik", "dogrulama", "eids", "e-ilan", "e_ilan", "e-devlet",
    "logo", "banner", "badge", "watermark", "icon", "favicon",
    "avatar", "sprite", "pixel", "tracking", "tracker", "analytics",
    "button", "social", "reklam", "advert", "blank", "placeholder-icon",
    "emlakjet-logo", "sahibinden-logo", "hepsiemlak-logo", "zingat-logo",
    "1x1", "2x2", "3x3", "share-", "fb-", "tw-", "ig-", "wp-icon",
    "apple-touch", "android-chrome", "mstile", "loading", "spinner",
    "shbdn.com/assets", "emlakjet.com/images/frontend", "hepsiemlak.com/frontend"
  ];

  for (const pattern of junkPatterns) {
    if (u.includes(pattern)) return false;
  }

  // Must end with image extension or have common photo CDN query params
  const hasExt = /\.(jpe?g|webp|png|avif)(\?.*)?$/i.test(u);
  const hasPhotoPath = /\/(images|photos|photos_large|ilan|listing|big|thmb|gallery)\//i.test(u);
  return hasExt || hasPhotoPath;
}

/**
 * Main parser: works with both plain text (Ctrl+A copy) and HTML source
 */
export function parsePropertyFromText(rawInput: string, fallbackUrl = ""): ExtractedProperty {
  const portal = detectPortal(rawInput + " " + fallbackUrl);

  const result: ExtractedProperty = {
    images: [],
    currency: "TRY",
    property_type: "Daire",
    listing_type: "satilik",
    city: "İstanbul",
    external_url: fallbackUrl || undefined,
    source_portal: portal,
  };

  // Helper to add clean HD image
  const addImage = (rawUrl: string | null | undefined) => {
    if (!rawUrl) return;
    if (!isLegitimatePropertyImage(rawUrl)) return;
    const hdUrl = upgradeToHighResImageUrl(rawUrl);
    if (!result.images.includes(hdUrl) && result.images.length < 35) {
      result.images.push(hdUrl);
    }
  };

  // ─── Try HTML parsing first if input looks like HTML ──────────────────
  const isHtml = /<html|<head|<body|<div|<meta|<script/i.test(rawInput);

  if (isHtml && typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(rawInput, "text/html");

      // JSON-LD Schema extraction
      doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        try {
          const data = JSON.parse(script.textContent || "{}");
          const item = Array.isArray(data) ? data[0] : (data["@graph"]?.[0] || data);
          if (item?.name && !result.title) result.title = clean(item.name);
          if (item?.description && !result.description) result.description = clean(item.description);
          if (item?.offers) {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer?.price) result.price = Number(offer.price);
            if (offer?.priceCurrency) result.currency = offer.priceCurrency;
          }
          if (item?.image) {
            const imgs = Array.isArray(item.image)
              ? item.image.map((i: any) => typeof i === "string" ? i : i?.url || i?.contentUrl)
              : [typeof item.image === "string" ? item.image : item.image?.url];
            imgs.forEach(addImage);
          }
        } catch { /* ignore */ }
      });

      // OG Meta tags
      if (!result.title) {
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content")
          || doc.querySelector("title")?.textContent;
        if (ogTitle) result.title = clean(ogTitle.split("|")[0].split(" - ")[0]);
      }
      if (!result.description) {
        const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content")
          || doc.querySelector('meta[name="description"]')?.getAttribute("content");
        if (ogDesc) result.description = clean(ogDesc);
      }

      // OG images
      doc.querySelectorAll('meta[property="og:image"]').forEach((m) => {
        addImage(m.getAttribute("content"));
      });

      // Extract all image URLs from HTML
      doc.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("data-src") || img.getAttribute("src") || img.getAttribute("data-original");
        addImage(src);
      });

      // Also get images from data-source attributes (Sahibinden thumbnail pattern)
      doc.querySelectorAll("[data-source]").forEach((el) => {
        addImage(el.getAttribute("data-source"));
      });

    } catch { /* fallthrough to text parsing */ }
  }

  // ─── Extract all image URLs from raw text (works for both HTML & text) ─
  const imgUrlRegex = /https?:\/\/[^\s"'<>]+\.(?:jpe?g|webp|png|avif)(?:\?[^\s"'<>]*)*/gi;
  let imgMatch;
  while ((imgMatch = imgUrlRegex.exec(rawInput)) !== null) {
    addImage(imgMatch[0]);
  }

  // ─── Plain text parsing (primary method for pasted content) ───────────
  // Normalize text: strip HTML tags if any, collapse whitespace for regex
  const plainText = rawInput
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#\d+;/gi, " ")
    .replace(/\t/g, "  ");

  // ── Title ──
  if (!result.title) {
    // Sahibinden pattern: title is usually the first substantial line
    const lines = plainText.split("\n").map(l => l.trim()).filter(l => l.length > 10 && l.length < 200);
    // Try to find a line that looks like a property title
    for (const line of lines) {
      // Skip navigation, cookie banners, etc.
      if (/cookie|gizlilik|kabul|menü|anasayfa|giriş|kayıt|favoriler|mesajlar/i.test(line)) continue;
      if (/sahibinden|emlakjet|hepsiemlak|©|copyright/i.test(line)) continue;
      // A good title usually contains location or property type keywords
      if (/satılık|kiralık|daire|villa|rezidans|arsa|müstakil|dubleks|kat|oda|m²|metrekare/i.test(line)
        || /cadde|sokak|mahalle|mah\.|bulvar/i.test(line)
        || line.length > 20) {
        result.title = line.substring(0, 150);
        break;
      }
    }
    // Fallback: just take the first substantial line
    if (!result.title && lines.length > 0) {
      result.title = lines[0].substring(0, 150);
    }
  }

  // ── Price ──
  if (!result.price) {
    // Pattern: "5.500.000 TL" or "₺ 5.500.000" or "5,500,000 $"
    const pricePatterns = [
      /(?:Fiyat[ıi]?\s*[:\-]?\s*)([\d\.\,]+)\s*(TL|₺|\$|€|USD|EUR)/i,
      /([\d\.\,]{5,15})\s*(TL|₺|\$|€|USD|EUR)/i,
      /(?:₺|TL|\$|€)\s*([\d\.\,]{5,15})/i,
    ];
    for (const pat of pricePatterns) {
      const m = plainText.match(pat);
      if (m) {
        const { price, currency } = parsePrice(m[0]);
        if (price && price > 1000) {
          result.price = price;
          result.currency = currency;
          break;
        }
      }
    }
  }

  // ── Rooms (Oda Sayısı) ──
  if (!result.rooms) {
    const roomVal = extractAfterLabel(plainText, LABEL.rooms);
    if (roomVal) {
      const roomMatch = roomVal.match(/\d\s*\+\s*\d/);
      if (roomMatch) result.rooms = roomMatch[0].replace(/\s/g, "");
    }
    // Fallback: find X+Y pattern anywhere
    if (!result.rooms) {
      const m = plainText.match(/\b([1-9]\s*\+\s*[0-9])\b/);
      if (m) result.rooms = m[1].replace(/\s/g, "");
    }
  }

  // ── Gross m² ──
  if (!result.gross_m2) {
    const val = extractAfterLabel(plainText, LABEL.grossM2);
    if (val) {
      const m = val.match(/\d+/);
      if (m) result.gross_m2 = parseInt(m[0], 10);
    }
    // Fallback
    if (!result.gross_m2) {
      const m = plainText.match(/(\d{2,4})\s*m[²2]\s*\(?[Bb]r[üu]t/);
      if (m) result.gross_m2 = parseInt(m[1], 10);
    }
  }

  // ── Net m² ──
  if (!result.net_m2) {
    const val = extractAfterLabel(plainText, LABEL.netM2);
    if (val) {
      const m = val.match(/\d+/);
      if (m) result.net_m2 = parseInt(m[0], 10);
    }
    if (!result.net_m2) {
      const m = plainText.match(/(\d{2,4})\s*m[²2]\s*\(?[Nn]et/);
      if (m) result.net_m2 = parseInt(m[1], 10);
    }
  }

  // ── Floor ──
  if (!result.floor) {
    const val = extractAfterLabel(plainText, LABEL.floor);
    if (val) {
      const m = val.match(/\d+|Giriş|Zemin|Bodrum|Çatı/i);
      if (m) result.floor = m[0];
    }
  }

  // ── Total Floors ──
  if (!result.total_floors) {
    const val = extractAfterLabel(plainText, LABEL.totalFloors);
    if (val) {
      const m = val.match(/\d+/);
      if (m) result.total_floors = parseInt(m[0], 10);
    }
  }

  // ── Building Age ──
  if (!result.building_age) {
    const val = extractAfterLabel(plainText, LABEL.buildingAge);
    if (val) {
      result.building_age = val.match(/[\d\-]+\s*(?:Yıl)?|Sıfır|Yeni/i)?.[0] || val.substring(0, 20);
    }
  }

  // ── Heating ──
  if (!result.heating) {
    const val = extractAfterLabel(plainText, LABEL.heating);
    if (val) {
      result.heating = val.substring(0, 40);
    }
  }

  // ── Bathrooms ──
  if (!result.bathrooms) {
    const val = extractAfterLabel(plainText, LABEL.bathrooms);
    if (val) {
      const m = val.match(/\d+/);
      if (m) result.bathrooms = parseInt(m[0], 10);
    }
  }

  // ── Listing Type (Satılık / Kiralık) ──
  if (/kiralık/i.test(plainText)) result.listing_type = "kiralik";
  if (/satılık/i.test(plainText)) result.listing_type = "satilik";

  // ── Property Type ──
  if (/villa/i.test(plainText)) result.property_type = "Villa";
  else if (/rezidans/i.test(plainText)) result.property_type = "Rezidans";
  else if (/dubleks/i.test(plainText)) result.property_type = "Dubleks";
  else if (/müstakil/i.test(plainText)) result.property_type = "Müstakil Ev";
  else if (/arsa/i.test(plainText)) result.property_type = "Arsa";
  else if (/işyeri|ofis|dükk[aâ]n/i.test(plainText)) result.property_type = "İşyeri";

  // ── City & District ──
  // Sahibinden breadcrumb pattern: "İstanbul > Kadıköy > Caferağa"
  const breadcrumbMatch = plainText.match(/(?:İstanbul|Ankara|İzmir|Bursa|Antalya|Konya|Adana|Mersin|Kocaeli|Trabzon|Muğla|Eskişehir|Gaziantep|Samsun|Denizli|Kayseri|Diyarbakır|Sakarya|Tekirdağ|Aydın|Balıkesir|Edirne|Bolu|Düzce|Manisa)\s*[>\/,\-]\s*([A-Za-zÇçĞğİıÖöŞşÜü\s]+?)(?:\s*[>\/,\-]\s*([A-Za-zÇçĞğİıÖöŞşÜü\s]+))?/i);
  if (breadcrumbMatch) {
    result.city = breadcrumbMatch[0].split(/[>\/,\-]/)[0].trim();
    if (breadcrumbMatch[1]) result.district = breadcrumbMatch[1].trim();
  }

  // Fallback city/district from label patterns
  if (!result.district) {
    const val = extractAfterLabel(plainText, LABEL.district);
    if (val && val.length > 1 && val.length < 40) result.district = val;
  }

  // ── Description ──
  if (!result.description) {
    // Look for "Açıklama" section
    const descMatch = plainText.match(/(?:Açıklama|Detaylı Bilgi|İlan Açıklaması)\s*[:\-]?\s*([\s\S]{20,2000}?)(?=(?:İletişim|Konum|Harita|İlan No|Özellikler|Benzer İlanlar|Paylaş|Şikayet)|\n{3,}|$)/i);
    if (descMatch) {
      result.description = descMatch[1].replace(/\n{2,}/g, "\n").trim().substring(0, 2000);
    }
  }

  // ── Deduplicate images ──
  result.images = [...new Set(result.images.filter(u => typeof u === "string" && u.startsWith("http")))];

  return result;
}

// Keep backward compat alias
export const parsePropertyFromHtml = parsePropertyFromText;

/**
 * Attempt to fetch a listing URL via CORS proxies.
 * These rarely work for Turkish portals due to bot protection.
 */
export async function fetchPropertyFromUrl(targetUrl: string): Promise<ExtractedProperty> {
  const url = targetUrl.trim();
  if (!url) throw new Error("Lütfen geçerli bir ilan URL'si girin.");

  const proxyEndpoints = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  let htmlContent = "";

  for (const proxy of proxyEndpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(proxy, {
        signal: controller.signal,
        headers: { Accept: "text/html,application/xhtml+xml,*/*" },
      });
      clearTimeout(timeout);
      if (res.ok) {
        htmlContent = await res.text();
        if (htmlContent.length > 500) break;
      }
    } catch {
      // try next proxy
    }
  }

  if (!htmlContent || htmlContent.length < 500) {
    throw new Error(
      "Portal bot koruması nedeniyle link üzerinden çekilemedi. Lütfen 2. yöntemi kullanın:\n\n" +
      "1) İlan sayfasını tarayıcıda açın\n" +
      "2) Sayfada sağ tık → 'Sayfa Kaynağını Görüntüle' (veya Ctrl+U)\n" +
      "3) Açılan sayfada Ctrl+A → Ctrl+C ile tümünü kopyalayın\n" +
      "4) Buraya yapıştırın"
    );
  }

  return parsePropertyFromText(htmlContent, url);
}
