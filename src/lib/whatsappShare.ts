import { formatTRY } from "@/lib/crm";
import { getPropertyDetailUrl } from "./propertyUrl";

export interface PropertyShareData {
  id?: string;
  title: string;
  price?: number | string | null;
  currency?: string | null;
  location?: string | null;
  district?: string | null;
  city?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  gross_m2?: number | null;
  property_type?: string | null;
  listing_type?: string | null;
  ilan_no?: string | null;
}

/**
 * Generates an ultra-professional, formatted WhatsApp message for real estate listing sharing.
 */
export function generateWhatsAppPropertyMessage(property: PropertyShareData, customAgentName?: string): string {
  const title = property.title?.trim() || "Özel Gayrimenkul Portföyü";
  const location = [property.location, property.district, property.city].filter(Boolean).join(" / ") || "İstanbul";
  
  let priceStr = "Fiyat Belirtilmedi";
  if (property.price) {
    const numPrice = Number(property.price);
    if (!isNaN(numPrice) && numPrice > 0) {
      if (property.currency === "USD") priceStr = `$${numPrice.toLocaleString("tr-TR")}`;
      else if (property.currency === "EUR") priceStr = `€${numPrice.toLocaleString("tr-TR")}`;
      else priceStr = formatTRY(numPrice);
    }
  }

  const type = property.property_type || "Konut";
  const listingType = property.listing_type === "kiralik" ? "Kiralık" : "Satılık";
  const m2 = property.gross_m2 || property.area_sqm || 0;
  const m2Str = m2 > 0 ? `${m2} m²` : "";
  const rooms = property.bedrooms ? `${property.bedrooms} Oda` : "";
  const baths = property.bathrooms ? `${property.bathrooms} Banyo` : "";
  const specs = [rooms, baths, m2Str].filter(Boolean).join(" | ");

  const propertyUrl = `${window.location.origin}${getPropertyDetailUrl({ 
    id: property.id, 
    ilan_no: property.ilan_no, 
    title: property.title, 
    property_type: property.property_type, 
    listing_type: property.listing_type 
  })}`;

  const agent = customAgentName || "Sarraf 34 Gayrimenkul & Yatırım Danışmanlığı";

  return `🏛️ *SARRAF 34 GAYRİMENKUL & YAPI*
✨ *PORTFÖY SUNUMU (${listingType.toUpperCase()})*

🏡 *İlan:* ${title}
📍 *Konum:* ${location}
💰 *Fiyat:* ${priceStr}
🏷️ *Tür:* ${type} ${specs ? `(${specs})` : ""}
${property.ilan_no ? `🔢 *İlan No:* #${property.ilan_no}` : ""}

🔗 *Fotoğraflar & Detaylı İnceleme:*
${propertyUrl}

📞 *Detaylı Bilgi & Randevu Talebi:*
${agent}
📱 Tel: +90 530 250 32 52
🌐 Web: sarraf34.com`;
}

/**
 * Directly opens WhatsApp web or app with formatted property text.
 */
export function sharePropertyOnWhatsApp(property: PropertyShareData, phone?: string, customAgentName?: string) {
  const message = generateWhatsAppPropertyMessage(property, customAgentName);
  const encoded = encodeURIComponent(message);
  
  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const targetPhone = cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;
    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, "_blank");
  } else {
    // Open general share
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  }
}
