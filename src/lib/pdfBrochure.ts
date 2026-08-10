import jsPDF from "jspdf";
import { formatTRY } from "@/lib/crm";

export interface PropertyBrochureData {
  id: string;
  title: string;
  price: number | string | null;
  currency?: string | null;
  location?: string | null;
  district?: string | null;
  city?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  gross_m2?: number | null;
  net_m2?: number | null;
  floor?: string | null;
  total_floors?: number | null;
  building_age?: string | null;
  heating?: string | null;
  property_type?: string | null;
  listing_type?: string | null;
  ilan_no?: string | null;
  tapu_durumu?: string | null;
  credit_eligible?: boolean | null;
  description?: string | null;
  images?: string[];
  agent_name?: string | null;
  agent_phone?: string | null;
}

/**
 * Loads an image from URL and converts to base64 for jsPDF embedding
 */
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // Limit max resolution for PDF performance and quality
        const maxWidth = 1200;
        let width = img.naturalWidth || 800;
        let height = img.naturalHeight || 600;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

/**
 * Generates an ultra-luxurious, printable A4 Real Estate PDF Brochure.
 */
export async function generatePropertyPDF(property: PropertyBrochureData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryGold = [197, 160, 89]; // #C5A059
  const darkBg = [15, 23, 42]; // #0F172A
  const textDark = [30, 41, 59]; // #1E293B
  const textMuted = [100, 116, 139]; // #64748B
  const lightGray = [248, 250, 252]; // #F8FAFC

  // 1. Header Bar (Dark & Gold Luxury Header)
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, 26, "F");

  // Top Accent Gold Line
  doc.setFillColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.rect(0, 0, pageWidth, 2.5, "F");

  // Brand Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text("SARRAF 34", margin, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("GAYRİMENKUL & YAPI", margin + 34, 14);

  // Listing Type / Date in Header
  doc.setFontSize(8);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  const dateStr = new Date().toLocaleDateString("tr-TR");
  doc.text(`PORTFÖY BROŞÜRÜ | ${dateStr}`, pageWidth - margin, 14, { align: "right" });

  let y = 34;

  // 2. Property Title & Location
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  
  // Wrap title if long
  const titleLines = doc.splitTextToSize(property.title || "Lüks Gayrimenkul Portföyü", contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 1;

  // Location string
  const locStr = [property.location, property.district, property.city].filter(Boolean).join(" / ") || "İstanbul";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Konum: ${locStr} ${property.ilan_no ? `• İlan No: #${property.ilan_no}` : ""}`, margin, y);
  y += 6;

  // 3. Main Property Image
  const mainImgUrl = property.images?.[0];
  let imgLoaded = false;

  if (mainImgUrl) {
    try {
      const base64 = await getBase64ImageFromUrl(mainImgUrl);
      if (base64) {
        doc.addImage(base64, "JPEG", margin, y, contentWidth, 75, undefined, "FAST");
        imgLoaded = true;
      }
    } catch (e) {
      console.warn("Could not load image for PDF", e);
    }
  }

  if (!imgLoaded) {
    // Placeholder box if image fails
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(margin, y, contentWidth, 50, "F");
    doc.setFontSize(10);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Fotoğraf Yüklenemedi", pageWidth / 2, y + 25, { align: "center" });
    y += 54;
  } else {
    y += 79;
  }

  // 4. Price & Tag Banner
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
  doc.setDrawColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "S");

  // Price formatting
  let priceStr = "Fiyat Belirtilmedi";
  if (property.price) {
    const numPrice = Number(property.price);
    if (!isNaN(numPrice) && numPrice > 0) {
      if (property.currency === "USD") priceStr = `$${numPrice.toLocaleString("tr-TR")}`;
      else if (property.currency === "EUR") priceStr = `€${numPrice.toLocaleString("tr-TR")}`;
      else priceStr = formatTRY(numPrice);
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text(priceStr, margin + 6, y + 9.5);

  const listingBadge = (property.listing_type === "kiralik" ? "KİRALIK" : "SATILIK") + " " + (property.property_type || "KONUT").toUpperCase();
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(listingBadge, pageWidth - margin - 6, y + 9.5, { align: "right" });

  y += 20;

  // 5. Key Specifications Grid (Table)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("GAYRİMENKUL ÖZELLİKLERİ", margin, y);
  y += 5;

  const specs = [
    ["Brüt / Net Alan", `${property.gross_m2 || property.net_m2 || "—"} m²`],
    ["Oda Sayısı", property.bedrooms ? `${property.bedrooms} Oda` : "—"],
    ["Banyo Sayısı", property.bathrooms ? `${property.bathrooms} Banyo` : "—"],
    ["Bulunduğu Kat", property.floor ? `${property.floor}. Kat` : "—"],
    ["Bina Yaşı", property.building_age || "0 (Sıfır)"],
    ["Isıtma Tipi", property.heating || "Kombi (Doğalgaz)"],
    ["Tapu Durumu", property.tapu_durumu || "Kat Mülkiyetli"],
    ["Krediye Uygunluk", property.credit_eligible !== false ? "Evet / Uygun" : "Hayır"],
  ];

  const colWidth = contentWidth / 4;
  const rowHeight = 12;

  specs.forEach(([k, v], idx) => {
    const colIdx = idx % 4;
    const rowIdx = Math.floor(idx / 4);
    const cellX = margin + colIdx * colWidth;
    const cellY = y + rowIdx * rowHeight;

    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(cellX, cellY, colWidth - 2, rowHeight - 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(k, cellX + 3, cellY + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(v, cellX + 3, cellY + 8.5);
  });

  y += Math.ceil(specs.length / 4) * rowHeight + 6;

  // 6. Property Description
  if (property.description) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("PORTFÖY AÇIKLAMASI", margin, y);
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    // Strip HTML tags if description has any
    const cleanDesc = property.description.replace(/<[^>]*>?/gm, "").trim();
    const descLines = doc.splitTextToSize(cleanDesc, contentWidth);
    // Limit lines to fit page
    const maxDescLines = 14;
    const printedLines = descLines.slice(0, maxDescLines);
    doc.text(printedLines, margin, y);
    y += printedLines.length * 3.8 + 6;
  }

  // 7. Footer Contact & Agency Signature Box (Bottom of Page)
  const footerY = pageHeight - 34;
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, footerY, pageWidth, 34, "F");

  // Top Accent Gold Line for Footer
  doc.setFillColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.rect(0, footerY, pageWidth, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text("SARRAF 34 GAYRİMENKUL & YAPI", margin, footerY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Adres: Yakuplu Mah. Hürriyet Bulvarı No:12/A Beylikdüzü / İSTANBUL", margin, footerY + 14);
  doc.text("Web: www.sarraf34.com | E-posta: info@sarraf34.com", margin, footerY + 19);

  // Agent Contact Details on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  const agentName = property.agent_name || "Yetkili Portföy Danışmanı";
  doc.text(agentName, pageWidth - margin, footerY + 8, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  const phone = property.agent_phone || "+90 532 552 34 34";
  doc.text(`Tel / WhatsApp: ${phone}`, pageWidth - margin, footerY + 14, { align: "right" });
  doc.setTextColor(200, 200, 200);
  doc.text("Randevu & Portföy Sunumu İçin Arayınız", pageWidth - margin, footerY + 19, { align: "right" });

  // Save the PDF
  const filename = `Sarraf34_${(property.title || "Ilan").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}.pdf`;
  doc.save(filename);
}
