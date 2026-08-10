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
  location?: string;
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
  const token = after.split(/[\n\r\t|·]/)[0].trim();
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
  rooms:       /(?:Oda\s*Say[ıi]s[ıi]|Oda\s*\+\s*Salon)\s*[:-]?\s*/i,
  grossM2:     /(?:m[²2]\s*\(?Br[üu]t\)?|Br[üu]t\s*(?:m[²2]|Metrekare|Alan))\s*[:-]?\s*/i,
  netM2:       /(?:m[²2]\s*\(?Net\)?|Net\s*(?:m[²2]|Metrekare|Alan))\s*[:-]?\s*/i,
  floor:       /(?:Bulundu[ğg]u\s*Kat)\s*[:-]?\s*/i,
  totalFloors: /(?:Kat\s*Say[ıi]s[ıi]|Toplam\s*Kat)\s*[:-]?\s*/i,
  buildingAge: /(?:Bina\s*Ya[şs][ıi])\s*[:-]?\s*/i,
  heating:     /(?:[Iİıi]s[ıi]tma(?:\s*Tipi)?)\s*[:-]?\s*/i,
  bathrooms:   /(?:Banyo\s*Say[ıi]s[ıi])\s*[:-]?\s*/i,
  propertyType:/(?:(?:Emlak|Gayrimenkul|[İi]lan)\s*Tipi|Konut\s*Tipi)\s*[:-]?\s*/i,
  listingType: /(?:Sat[ıi]l[ıi]k|Kiral[ıi]k)/i,
  city:        /(?:[İi]l|[Şş]ehir)\s*[:-]?\s*/i,
  district:    /(?:[İi]l[çc]e|Semt)\s*[:-]?\s*/i,
  price:       /(?:Fiyat[ıi]?|[Üü]cret)\s*[:-]?\s*/i,
};

export function upgradeToHighResImageUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  let u = url.trim();

  // 1. Sahibinden HD resolution upgrade
  if (u.includes("shbdn.com") || u.includes("sahibinden")) {
    u = u.replace(/\/(thmb|x5|s|m|l|preview|thumb|thumbnail)_/gi, "/big_");
    u = u.replace(/\/photos\/([0-9a-zA-Z_/]+)\/(thmb|x5|s|m|l|preview)_/gi, "/photos/$1/big_");
  }

  // 2. Emlakjet HD resolution upgrade
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

  // 4. Generic query param dimension upgrades
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

  // Filter out QR codes, verification badges, portal logos, social icons, ad tracking, pixels, static assets
  const junkPatterns = [
    "qr", "qrcode", "karekod", "barcode", "barkod",
    "elektronik", "dogrulama", "eids", "e-ilan", "e_ilan", "e-devlet",
    "logo", "banner", "badge", "watermark", "icon", "favicon",
    "avatar", "sprite", "pixel", "tracking", "tracker", "analytics",
    "button", "social", "reklam", "advert", "blank", "placeholder",
    "emlakjet-logo", "sahibinden-logo", "hepsiemlak-logo", "zingat-logo",
    "1x1", "2x2", "3x3", "share-", "fb-", "tw-", "ig-", "wp-icon",
    "apple-touch", "android-chrome", "mstile", "loading", "spinner",
    "shbdn.com/assets", "static.sahibinden.com", "s0.shbdn.com", "blob/",
    "ilan_konum_pin", "pin", "map", "profile", "expert", "danisman",
    "emlakjet.com/images", "hepsiemlak.com/frontend", "recaptcha", "gpt.js"
  ];

  for (const pattern of junkPatterns) {
    if (u.includes(pattern)) return false;
  }

  // Must end with image extension or have common photo CDN query params
  const hasExt = /\.(jpe?g|webp|png|avif)(\?.*)?$/i.test(u);
  const hasPhotoPath = /\/(photos|photos_large|ilan|listing|big|gallery)\//i.test(u);
  return hasExt || hasPhotoPath;
}

// ─── Turkish Real Estate Districts & Neighborhoods Knowledge Base ──────────
export const ISTANBUL_DISTRICTS: Record<string, string[]> = {
  "Beylikdüzü": ["Yakuplu", "Beykent", "Gürpınar", "Kavaklı", "Adnan Kahveci", "Barış", "Cumhuriyet", "Dereağzı", "Marmara", "Sahil", "Büyükşehir"],
  "Esenyurt": ["Yeşilkent", "Mehterçeşme", "Güzelyurt", "Pınar", "Kıraç", "İncirtepe", "Talatpaşa", "Akçaburgaz", "Saadetdere", "Haramidere", "Balıkyolu", "Sultaniye", "Örnek", "Çınar", "Bağlarçeşme", "Ardıçlı", "Akevler"],
  "Büyükçekmece": ["Mimaroba", "Sinanoba", "Ekinoba", "Kumburgaz", "Kamiloba", "Celaliye", "Tepekent", "Alkent 2000", "Batıköy", "Muratçeşme", "Ulus", "Türkoba", "Pınartepe", "Hürriyet", "Karasuna", "Güzelce", "Mimarsinan"],
  "Avcılar": ["Ambarlı", "Cihangir", "Denizköşkler", "Firuzköy", "Gümüşpala", "Mustafa Kemal Paşa", "Tahtakale", "Üniversite", "Yeşilkent"],
  "Başakşehir": ["Bahçeşehir", "Ispartakule", "Başak", "Kayabaşı", "Ziya Gökalp", "Güvercintepe", "Şahintepe", "Altınşehir"],
  "Bakırköy": ["Ataköy", "Yeşilköy", "Florya", "Zuhuratbaba", "Zeytinlik", "Kartaltepe", "Osmaniye", "Sakızağacı", "Şenlikköy", "Yenimahalle"],
  "Küçükçekmece": ["Atakent", "Halkalı", "Sefaköy", "Cennet", "İnönü", "Fevzi Çakmak", "Kanarya", "Tevfik Bey", "Yarımburgaz"],
  "Bahçelievler": ["Şirinevler", "Yenibosna", "Kocasinan", "Siyavuşpaşa", "Soğanlı", "Zafer", "Cumhuriyet", "Hürriyet"],
  "Kadıköy": ["Caddebostan", "Suadiye", "Fenerbahçe", "Bostancı", "Erenköy", "Göztepe", "Moda", "Caferağa", "Acıbadem", "Kozyatağı", "Fikirtepe", "Feneryolu"],
  "Beşiktaş": ["Bebek", "Etiler", "Levent", "Ulus", "Ortaköy", "Arnavutköy", "Akatlar", "Gayrettepe", "Balmumcu", "Abbasağa", "Kuruçeşme"],
  "Sarıyer": ["Tarabya", "Yeniköy", "İstinye", "Emirgan", "Maslak", "Zekeriyaköy", "Kilyos", "Baltalimanı", "Rumelihisarı", "Reşitpaşa", "Ayazağa"],
  "Şişli": ["Nişantaşı", "Mecidiyeköy", "Fulya", "Bomonti", "Feriköy", "Teşvikiye", "Kurtuluş", "Halaskargazi", "Esentepe", "Gülbahar"],
  "Üsküdar": ["Kuzguncuk", "Beylerbeyi", "Çengelköy", "Kandilli", "Altunizade", "Acıbadem", "Bağlarbaşı", "Küçüksu", "Kuleli", "Salacak"],
  "Ataşehir": ["Batı Ataşehir", "Atatürk", "İçerenköy", "Küçükbakkalköy", "Kayışdağı", "Barbaros", "Örnek", "Yenisahra"],
  "Maltepe": ["Bağlarbaşı", "Küçükyalı", "İdealtepe", "Altayçeşme", "Cevizli", "Feyzullah", "Zümrütevler", "Başıbüyük", "Gülsuyu"],
  "Kartal": ["Atalar", "Kordonboyu", "Petrol İş", "Rahmanlar", "Soğanlık", "Uğur Mumcu", "Yakacık", "Cevizli", "Karlıktepe"],
  "Pendik": ["Kurtköy", "Yenişehir", "Batı", "Doğu", "Kaynarca", "Güzelyalı", "Esenyalı", "Çamlık", "Harmandere", "Fevzi Çakmak"],
  "Tuzla": ["Aydınlı", "İstasyon", "Postane", "Cami", "Evliya Çelebi", "Yayla", "İçmeler", "Tepeören", "Akfırat"],
  "Zeytinburnu": ["Kazlıçeşme", "Merkezefendi", "Seyitnizam", "Sümer", "Telsiz", "Veliefendi", "Gökalp"],
  "Fatih": ["Aksaray", "Balat", "Fener", "Cankurtaran", "Eminönü", "Karagümrük", "Kocamustafapaşa", "Sultanahmet"],
  "Eyüpsultan": ["Göktürk", "Kemerburgaz", "Alibeyköy", "Yeşilpınar", "Rami", "Silahtarağa"],
  "Kağıthane": ["Seyrantepe", "Çeliktepe", "Emniyetevleri", "Gültepe", "Hamidiye", "Merkez", "Şirintepe"],
  "Ümraniye": ["Armağanevler", "Atakent", "Çakmak", "Ihlamurkuyu", "İnkılap", "Madenler", "Site", "Tantan"],
  "Çekmeköy": ["Taşdelen", "Alemdağ", "Mimar Sinan", "Merkez", "Ömerli", "Soğukpınar"],
  "Sancaktepe": ["Samandıra", "Sarıgazi", "Yenidoğan", "Abdurrahmangazi", "Meclis", "Emek"],
  "Beykoz": ["Acarlar", "Anadolu Hisarı", "Kanlıca", "Kavacık", "Paşabahçe", "Riva", "Çubuklu", "Görele"],
  "Silivri": ["Selimpaşa", "Gümüşyaka", "Değirmenköy", "Çanta", "Ortaköy", "Kavaklı", "Alibey", "Piri Mehmet Paşa"],
  "Çatalca": ["Binkılıç", "Karacaköy", "Kestanelik", "Muratbey", "Örcünlü", "Ferhatpaşa"],
  "Şile": ["Ağva", "Balibey", "Çavuş", "Kumbaba", "Sahilköy"],
};

export const OTHER_TURKISH_CITIES: Record<string, string[]> = {
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Gölbaşı", "Pursaklar", "Altındağ"],
  "İzmir": ["Karşıyaka", "Bornova", "Konak", "Buca", "Çiğli", "Balçova", "Gaziemir", "Urla", "Çeşme", "Menemen", "Torbalı", "Seferihisar", "Karabağlar", "Bayraklı", "Narlıdere", "Güzelbahçe", "Aliağa", "Foça", "Dikili"],
  "Antalya": ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat", "Kaş", "Kemer", "Serik", "Döşemealtı", "Aksu", "Gazipaşa", "Kumluca", "Finike"],
  "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gemlik", "İnegöl", "Gürsu", "Kestel"],
  "Kocaeli": ["İzmit", "Gebze", "Darıca", "Körfez", "Gölcük", "Kartepe", "Başiskele", "Çayırova", "Derince", "Kandıra", "Karamürsel"],
  "Tekirdağ": ["Çorlu", "Süleymanpaşa", "Çerkezköy", "Kapaklı", "Ergene", "Marmaraereğlisi", "Şarköy", "Sarays"],
  "Muğla": ["Bodrum", "Fethiye", "Marmaris", "Menteşe", "Milas", "Datça", "Ortaca", "Dalaman", "Köyceğiz", "Ula", "Yatağan"],
  "Aydın": ["Kuşadası", "Didim", "Efeler", "Nazilli", "Söke", "İncirliova", "Germencik"],
  "Sakarya": ["Adapazarı", "Serdivan", "Erenler", "Sapanca", "Hendek", "Akyazı", "Karasu", "Arifiye"],
  "Balıkesir": ["Ayvalık", "Edremit", "Bandırma", "Altıeylül", "Karesi", "Burhaniye", "Erdek", "Akçay", "Altınoluk"],
};

export function findDistrictAndCityFromText(text: string): { district?: string; city?: string; location?: string } {
  if (!text) return {};
  const normalized = text.toLowerCase();

  // 1. Check neighborhood occurrences in Istanbul first (highest precision)
  for (const [dist, neighborhoods] of Object.entries(ISTANBUL_DISTRICTS)) {
    for (const neigh of neighborhoods) {
      const neighRegex = new RegExp(`\\b${neigh.toLowerCase()}(?:da|de|ta|te|'da|'de|'ta|'te|\\s*mah|\\s*mahallesi)?\\b`, "i");
      if (neighRegex.test(normalized)) {
        return {
          city: "İstanbul",
          district: dist,
          location: `${neigh} Mah.`,
        };
      }
    }
  }

  // 2. Check Istanbul district names
  for (const dist of Object.keys(ISTANBUL_DISTRICTS)) {
    const distRegex = new RegExp(`\\b${dist.toLowerCase()}(?:'de|'da|'te|'ta|de|da|te|ta)?\\b`, "i");
    if (distRegex.test(normalized)) {
      return {
        city: "İstanbul",
        district: dist,
        location: `${dist} Merkez`,
      };
    }
  }

  // 3. Check other cities and their districts
  for (const [cityName, districts] of Object.entries(OTHER_TURKISH_CITIES)) {
    for (const d of districts) {
      const dRegex = new RegExp(`\\b${d.toLowerCase()}(?:'de|'da|'te|'ta|de|da|te|ta)?\\b`, "i");
      if (dRegex.test(normalized)) {
        return {
          city: cityName,
          district: d,
          location: `${d} Merkez`,
        };
      }
    }
    if (new RegExp(`\\b${cityName.toLowerCase()}\\b`, "i").test(normalized)) {
      return {
        city: cityName,
        district: districts[0],
        location: `${districts[0]} Merkez`,
      };
    }
  }

  return {};
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
    district: "Beylikdüzü",
    location: "Yakuplu Mah.",
    rooms: "3+1",
    bathrooms: 1,
    floor: "3",
    total_floors: 5,
    building_age: "0 (Sıfır)",
    heating: "Kombi (Doğalgaz)",
    external_url: fallbackUrl || undefined,
    source_portal: portal,
  };

  // Helper to add clean HD image
  const addImage = (rawUrl: string | null | undefined) => {
    if (!rawUrl) return;
    if (!isLegitimatePropertyImage(rawUrl)) return;
    const hdUrl = upgradeToHighResImageUrl(rawUrl);
    if (!result.images.includes(hdUrl) && result.images.length < 40) {
      result.images.push(hdUrl);
    }
  };

  // ─── 1. Advanced HTML DOM Extraction (if input is HTML) ────────────────
  const isHtml = /<html|<head|<body|<div|<meta|<script|<table|<ul/i.test(rawInput);

  if (isHtml && typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(rawInput, "text/html");

      // ── JSON-LD Schema extraction ──
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
              ? item.image.map((i: unknown) => typeof i === "string" ? i : (i as { url?: string; contentUrl?: string })?.url || (i as { url?: string; contentUrl?: string })?.contentUrl)
              : [typeof item.image === "string" ? item.image : (item.image as { url?: string })?.url];
            imgs.forEach(addImage);
          }
        } catch { /* ignore */ }
      });

      // ── Title from DOM ──
      if (!result.title) {
        const domTitle =
          doc.querySelector(".classifiedDetailTitle h1")?.textContent ||
          doc.querySelector("h1.classified-title")?.textContent ||
          doc.querySelector(".classified-detail-title h1")?.textContent ||
          doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
          doc.querySelector("title")?.textContent;
        if (domTitle) {
          result.title = clean(domTitle.split("|")[0].split(" - ")[0]);
        }
      }

      // ── Price from DOM ──
      if (!result.price) {
        const priceEl =
          doc.querySelector(".classified-price-wrapper") ||
          doc.querySelector(".classifiedInfo h3") ||
          doc.querySelector(".classified-price") ||
          doc.querySelector('span[class*="price"]') ||
          doc.querySelector('div[class*="price"]');
        if (priceEl?.textContent) {
          const { price, currency } = parsePrice(priceEl.textContent);
          if (price && price > 1000) {
            result.price = price;
            result.currency = currency;
          }
        }
      }

      // ── Sahibinden & Portal Breadcrumbs (Search Result BC) ──
      const bcLinks: string[] = [];
      doc.querySelectorAll(".search-result-bc a, .search-result-bc li, .classifiedBreadCrumb a, .classifiedBreadCrumb li, nav[aria-label='breadcrumb'] a").forEach((el) => {
        const txt = clean(el.textContent || "");
        if (txt && !/anasayfa|emlak|konut|satılık|kiralık|daire|villa|arsa/i.test(txt)) {
          bcLinks.push(txt);
        }
      });
      if (bcLinks.length >= 2) {
        result.city = bcLinks[0];
        result.district = bcLinks[1];
        if (bcLinks[2]) result.location = bcLinks[2];
      } else if (bcLinks.length === 1) {
        result.district = bcLinks[0];
      }

      // Also check .classifiedInfo h2 / h3 (e.g. "İstanbul / Beylikdüzü / Yakuplu Mah.")
      const locHeader = doc.querySelector(".classifiedInfo h2, .classifiedInfo h3.classifiedLocation, h2.classifiedLocation");
      if (locHeader?.textContent) {
        const parts = locHeader.textContent.split(/[/\\>,-]/).map(s => clean(s)).filter(Boolean);
        if (parts.length >= 2) {
          result.city = parts[0];
          result.district = parts[1];
          if (parts[2]) result.location = parts[2];
        }
      }

      // ── Classified Info List (Sahibinden / Portal Key-Value Table) ──
      doc.querySelectorAll(".classifiedInfoList li, ul.classified-specifications li, .classified-detail-list li").forEach((li) => {
        const strong = clean(li.querySelector("strong, label, span.label")?.textContent || "");
        const span = clean(li.querySelector("span:not(.label), div.value, p")?.textContent || li.textContent?.replace(strong, "") || "");
        if (!strong || !span) return;

        if (LABEL.rooms.test(strong)) {
          const rm = span.match(/\d\s*\+\s*\d/);
          if (rm) result.rooms = rm[0].replace(/\s/g, "");
          else result.rooms = span;
        } else if (LABEL.grossM2.test(strong)) {
          const m = span.match(/\d+/);
          if (m) result.gross_m2 = parseInt(m[0], 10);
        } else if (LABEL.netM2.test(strong)) {
          const m = span.match(/\d+/);
          if (m) result.net_m2 = parseInt(m[0], 10);
        } else if (LABEL.floor.test(strong)) {
          result.floor = span;
        } else if (LABEL.totalFloors.test(strong)) {
          const m = span.match(/\d+/);
          if (m) result.total_floors = parseInt(m[0], 10);
        } else if (LABEL.buildingAge.test(strong)) {
          result.building_age = span;
        } else if (LABEL.heating.test(strong)) {
          result.heating = span;
        } else if (LABEL.bathrooms.test(strong)) {
          const m = span.match(/\d+/);
          if (m) result.bathrooms = parseInt(m[0], 10);
        } else if (LABEL.propertyType.test(strong)) {
          result.property_type = span;
        } else if (LABEL.city.test(strong)) {
          result.city = span;
        } else if (LABEL.district.test(strong)) {
          result.district = span;
        }
      });

      // ── Description from DOM ──
      if (!result.description) {
        const descEl =
          doc.querySelector("#classifiedDescription") ||
          doc.querySelector(".classifiedDescription") ||
          doc.querySelector(".uiBoxContainer") ||
          doc.querySelector('meta[property="og:description"]');
        if (descEl) {
          const text = descEl.getAttribute("content") || descEl.textContent || "";
          result.description = clean(text).substring(0, 2500);
        }
      }

      // ── Images from DOM ──
      doc.querySelectorAll('meta[property="og:image"]').forEach((m) => {
        addImage(m.getAttribute("content"));
      });
      doc.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("data-src") || img.getAttribute("src") || img.getAttribute("data-original") || img.getAttribute("data-source");
        addImage(src);
      });
      doc.querySelectorAll("[data-source]").forEach((el) => {
        addImage(el.getAttribute("data-source"));
      });
      doc.querySelectorAll("label#megaPhotoImg img, .mega-photo-container img, #classifiedDetailThumbs img").forEach((el) => {
        const src = el.getAttribute("data-src") || el.getAttribute("src");
        addImage(src);
      });

    } catch { /* fallthrough to text parsing */ }
  }

  // ─── 2. Extract image URLs from raw text ──────────────────────────────
  const imgUrlRegex = /https?:\/\/[^\s"'<>]+\.(?:jpe?g|webp|png|avif)(?:\?[^\s"'<>]*)*/gi;
  let imgMatch;
  while ((imgMatch = imgUrlRegex.exec(rawInput)) !== null) {
    addImage(imgMatch[0]);
  }

  // ─── 3. Plain Text Normalization & Regex Extraction ───────────────────
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

  // ── Title fallback ──
  if (!result.title) {
    const lines = plainText.split("\n").map(l => l.trim()).filter(l => l.length > 10 && l.length < 200);
    for (const line of lines) {
      if (/cookie|gizlilik|kabul|menü|anasayfa|giriş|kayıt|favoriler|mesajlar/i.test(line)) continue;
      if (/sahibinden|emlakjet|hepsiemlak|©|copyright/i.test(line)) continue;
      if (
        /satılık|kiralık|daire|villa|rezidans|arsa|müstakil|dubleks|kat|oda|m²|metrekare/i.test(line) ||
        /cadde|sokak|mahalle|mah\.|bulvar/i.test(line) ||
        line.length > 20
      ) {
        result.title = line.substring(0, 150);
        break;
      }
    }
    if (!result.title && lines.length > 0) {
      result.title = lines[0].substring(0, 150);
    }
  }

  // ── Price fallback ──
  if (!result.price) {
    const pricePatterns = [
      /(?:Fiyat[ıi]?\s*[:-]?\s*)([\d.,]+)\s*(TL|₺|\$|€|USD|EUR)/i,
      /([\d.,]{5,15})\s*(TL|₺|\$|€|USD|EUR)/i,
      /(?:₺|TL|\$|€)\s*([\d.,]{5,15})/i,
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

  // ── Rooms (Oda Sayısı) fallback ──
  if (!result.rooms || result.rooms === "3+1") {
    const roomVal = extractAfterLabel(plainText, LABEL.rooms);
    if (roomVal) {
      const roomMatch = roomVal.match(/\d\s*\+\s*\d/);
      if (roomMatch) result.rooms = roomMatch[0].replace(/\s/g, "");
    }
    if (!result.rooms || result.rooms === "3+1") {
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
      const m = val.match(/\d+|Giriş|Zemin|Bodrum|Çatı|Yüksek Giriş|Bahçe Katı/i);
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
  if (!result.building_age || result.building_age === "0 (Sıfır)") {
    const val = extractAfterLabel(plainText, LABEL.buildingAge);
    if (val) {
      result.building_age = val.match(/[\d-]+\s*(?:Yıl)?|Sıfır|Yeni/i)?.[0] || val.substring(0, 20);
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
  if (/kiralık/i.test(plainText) || /kiralik/i.test(result.title || "")) result.listing_type = "kiralik";
  if (/satılık/i.test(plainText) || /satilik/i.test(result.title || "")) result.listing_type = "satilik";

  // ── Property Type ──
  if (/villa/i.test(plainText) || /villa/i.test(result.title || "")) result.property_type = "Villa";
  else if (/rezidans/i.test(plainText) || /rezidans/i.test(result.title || "")) result.property_type = "Rezidans";
  else if (/dubleks/i.test(plainText) || /dubleks/i.test(result.title || "")) result.property_type = "Dubleks";
  else if (/müstakil/i.test(plainText) || /müstakil/i.test(result.title || "")) result.property_type = "Müstakil Ev";
  else if (/arsa/i.test(plainText) || /arsa/i.test(result.title || "")) result.property_type = "Arsa";
  else if (/işyeri|ofis|dükk[aâ]n/i.test(plainText)) result.property_type = "İşyeri";

  // ── 4. Intelligent District & Location Identification ──────────────────
  // Check if current district is invalid (e.g. single letter like "B" or empty)
  const isDistrictInvalid = !result.district || result.district.trim().length <= 2;

  if (isDistrictInvalid) {
    // 4A: Check intelligent district matcher across title and entire text
    const foundFromText = findDistrictAndCityFromText((result.title || "") + " " + plainText.substring(0, 3000));
    if (foundFromText.district) {
      result.district = foundFromText.district;
      if (foundFromText.city) result.city = foundFromText.city;
      if (foundFromText.location) result.location = foundFromText.location;
    }
  }

  // 4B: Robust Breadcrumb Regex (Strict 3+ characters, no single letter bug)
  if (!result.district || result.district.trim().length <= 2) {
    const breadcrumbRegex = /(?:İstanbul|Ankara|İzmir|Bursa|Antalya|Kocaeli|Tekirdağ|Aydın|Muğla|Adana|Mersin|Gaziantep|Konya|Samsun|Kayseri|Eskişehir|Trabzon|Balıkesir|Sakarya|Diyarbakır|Denizli|Edirne|Bolu|Düzce|Manisa)\s*[/\\>-]\s*([A-Za-zÇçĞğİıÖöŞşÜü\s]{3,30})(?:\s*[/\\>-]\s*([A-Za-zÇçĞğİıÖöŞşÜü\s]{3,40}))?/i;
    const bMatch = plainText.match(breadcrumbRegex);
    if (bMatch && bMatch[1]) {
      const candidateDist = clean(bMatch[1]);
      if (candidateDist.length >= 3) {
        result.district = candidateDist;
        if (bMatch[2]) result.location = clean(bMatch[2]);
      }
    }
  }

  // Ensure fallback district is never single letter
  if (!result.district || result.district.trim().length <= 2) {
    result.district = "Beylikdüzü";
    result.location = "Yakuplu Mah.";
  }

  // ── Description fallback ──
  if (!result.description) {
    const descMatch = plainText.match(/(?:Açıklama|Detaylı Bilgi|İlan Açıklaması)\s*[:-]?\s*([\s\S]{20,2000}?)(?=(?:İletişim|Konum|Harita|İlan No|Özellikler|Benzer İlanlar|Paylaş|Şikayet)|\n{3,}|$)/i);
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
