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
 * Convert image URL to base64 data URI for embedding in PDF
 */
async function imageToBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxW = 1200;
        let w = img.naturalWidth || 800;
        let h = img.naturalHeight || 600;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.88));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates a premium, fully Turkish-compatible PDF brochure using HTML→print approach.
 * This avoids jsPDF's broken Helvetica Turkish character support entirely.
 */
export async function generatePropertyPDF(property: PropertyBrochureData): Promise<void> {
  // Format price
  let priceStr = "Fiyat Belirtilmedi";
  if (property.price) {
    const numPrice = Number(property.price);
    if (!isNaN(numPrice) && numPrice > 0) {
      if (property.currency === "USD") priceStr = `$${numPrice.toLocaleString("tr-TR")}`;
      else if (property.currency === "EUR") priceStr = `€${numPrice.toLocaleString("tr-TR")}`;
      else priceStr = formatTRY(numPrice);
    }
  }

  const locStr = [property.location, property.district, property.city].filter(Boolean).join(" / ") || "İstanbul";
  const dateStr = new Date().toLocaleDateString("tr-TR");
  const listingBadge = (property.listing_type === "kiralik" ? "Kiralık" : "Satılık") + " " + (property.property_type || "Konut");
  const cleanDesc = (property.description || "").replace(/<[^>]*>?/gm, "").trim();

  // Images (direct URLs with no-referrer policy to avoid CORS/hotlinking blocks)
  const fallbackImg = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80";
  const rawImages = (property.images || []).filter(u => u && typeof u === "string");
  const mainImgUrl = rawImages[0] || fallbackImg;
  const galleryUrls = rawImages.slice(1, 5);

  const specs = [
    { label: "Brüt Alan", value: property.gross_m2 ? `${property.gross_m2} m²` : "—" },
    { label: "Net Alan", value: property.net_m2 ? `${property.net_m2} m²` : "—" },
    { label: "Oda Sayısı", value: property.bedrooms ? `${property.bedrooms} Oda` : "—" },
    { label: "Banyo", value: property.bathrooms ? `${property.bathrooms} Banyo` : "—" },
    { label: "Bulunduğu Kat", value: property.floor ? `${property.floor}. Kat` : "—" },
    { label: "Toplam Kat", value: property.total_floors ? `${property.total_floors} Kat` : "—" },
    { label: "Bina Yaşı", value: property.building_age || "Sıfır" },
    { label: "Isıtma Tipi", value: property.heating || "Kombi (Doğalgaz)" },
    { label: "Tapu Durumu", value: property.tapu_durumu || "Kat Mülkiyetli" },
    { label: "Krediye Uygunluk", value: property.credit_eligible !== false ? "Evet / Uygun" : "Hayır" },
  ];

  const galleryHtml = galleryUrls.length > 0 ? `
    <div style="display:grid;grid-template-columns:repeat(${Math.min(galleryUrls.length, 4)},1fr);gap:8px;margin-top:14px;">
      ${galleryUrls.map(u => `<img src="${escapeHtml(u)}" referrerpolicy="no-referrer" onerror="this.src='${fallbackImg}'" style="width:100%;height:120px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;" />`).join("")}
    </div>
  ` : "";

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin:0; padding:0; box-sizing:border-box; }
    
    @page { 
      size: A4; 
      margin: 0; 
    }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1e293b; 
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      position: relative;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      position: relative;
      padding-bottom: 50mm;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #c5a059;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: #c5a059;
      letter-spacing: 1px;
    }
    .brand-sub {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .header-right {
      text-align: right;
      font-size: 9px;
      color: #c5a059;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    /* Content */
    .content { padding: 20px 24px; }

    .title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
      margin-bottom: 4px;
    }
    .location {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .location strong { color: #c5a059; }

    /* Main Image */
    .main-image-container {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      margin-bottom: 14px;
    }
    .main-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .no-image {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
      font-size: 12px;
    }

    /* Price Banner */
    .price-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 2px solid #c5a059;
      border-radius: 8px;
      padding: 12px 18px;
      margin: 16px 0;
    }
    .price-text {
      font-size: 22px;
      font-weight: 700;
      color: #92400e;
    }
    .listing-badge {
      font-size: 11px;
      font-weight: 600;
      color: #0f172a;
      background: #fff;
      padding: 5px 12px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      border: 1px solid #e2e8f0;
    }

    /* Specs Grid */
    .specs-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 2px solid #c5a059;
      letter-spacing: 0.5px;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 18px;
    }
    .spec-cell {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .spec-label {
      font-size: 8px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 3px;
    }
    .spec-value {
      font-size: 11px;
      color: #0f172a;
      font-weight: 600;
    }

    /* Description */
    .desc-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 2px solid #c5a059;
    }
    .desc-text {
      font-size: 10px;
      color: #475569;
      line-height: 1.6;
    }

    /* Footer */
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-top: 3px solid #c5a059;
    }
    .footer-left { }
    .footer-brand {
      font-size: 13px;
      font-weight: 700;
      color: #c5a059;
      margin-bottom: 4px;
    }
    .footer-info {
      font-size: 8.5px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer-right { text-align: right; }
    .footer-agent {
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 3px;
    }
    .footer-phone {
      font-size: 10px;
      color: #c5a059;
      font-weight: 500;
    }
    .footer-cta {
      font-size: 8px;
      color: #94a3b8;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- HEADER -->
    <div class="header">
      <div class="brand">
        <div>
          <div class="brand-name">SARRAF 34</div>
          <div class="brand-sub">Gayrimenkul &amp; Yapı</div>
        </div>
      </div>
      <div class="header-right">
        PORTFÖY BROŞÜRÜ<br>${dateStr}
      </div>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <div class="title">${escapeHtml(property.title || "Lüks Gayrimenkul")}</div>
      <div class="location">
        <strong>📍 Konum:</strong> ${escapeHtml(locStr)}
        ${property.ilan_no ? ` &nbsp;•&nbsp; <strong>İlan No:</strong> #${escapeHtml(property.ilan_no)}` : ""}
      </div>

      <!-- Main Image -->
      <div class="main-image-container">
        <img src="${escapeHtml(mainImgUrl)}" referrerpolicy="no-referrer" onerror="this.src='${fallbackImg}'" alt="Ana Fotoğraf" />
      </div>

      ${galleryHtml}

      <!-- Price Banner -->
      <div class="price-banner">
        <div class="price-text">${escapeHtml(priceStr)}</div>
        <div class="listing-badge">${escapeHtml(listingBadge)}</div>
      </div>

      <!-- Specifications -->
      <div class="specs-title">GAYRİMENKUL ÖZELLİKLERİ</div>
      <div class="specs-grid">
        ${specs.map(s => `
          <div class="spec-cell">
            <div class="spec-label">${escapeHtml(s.label)}</div>
            <div class="spec-value">${escapeHtml(s.value)}</div>
          </div>
        `).join("")}
      </div>

      ${cleanDesc ? `
        <div class="desc-title">PORTFÖY AÇIKLAMASI</div>
        <div class="desc-text">${escapeHtml(cleanDesc.slice(0, 1200))}</div>
      ` : ""}
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-left">
        <div class="footer-brand">SARRAF 34 GAYRİMENKUL &amp; YAPI</div>
        <div class="footer-info">
          Yakuplu Mah. Hürriyet Bulvarı No:12/A Beylikdüzü / İSTANBUL<br>
          Web: www.sarraf34.com &nbsp;|&nbsp; E-posta: info@sarraf34.com
        </div>
      </div>
      <div class="footer-right">
        <div class="footer-agent">${escapeHtml(property.agent_name || "Yetkili Portföy Danışmanı")}</div>
        <div class="footer-phone">Tel / WhatsApp: ${escapeHtml(property.agent_phone || "+90 532 552 34 34")}</div>
        <div class="footer-cta">Randevu &amp; Portföy Sunumu İçin Arayınız</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Open print dialog which generates a proper PDF with full Turkish support
  const printWindow = window.open("", "_blank", "width=794,height=1123");
  if (!printWindow) {
    throw new Error("Pop-up penceresi engellenmiş olabilir. Lütfen pop-up izni verin.");
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for images and fonts to load
  await new Promise<void>((resolve) => {
    printWindow.onload = () => resolve();
    // Fallback in case onload doesn't fire
    setTimeout(resolve, 2000);
  });

  // Additional wait for font rendering
  await new Promise(resolve => setTimeout(resolve, 500));

  printWindow.focus();
  printWindow.print();
}

/** Escape HTML special characters */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
