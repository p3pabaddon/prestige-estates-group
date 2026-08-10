import { useState, useRef, useEffect, useCallback } from "react";
import { X, Download, Instagram, Image, Sparkles, Loader2, Check } from "lucide-react";
import { formatTRY } from "@/lib/crm";

interface SocialPostGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    title: string;
    price?: number | null;
    currency?: string;
    location?: string;
    district?: string;
    city?: string;
    rooms?: string;
    gross_m2?: number;
    property_type?: string;
    listing_type?: string;
    tag?: string;
    images?: string[];
    ilan_no?: string;
  };
}

export default function SocialPostGenerator({
  isOpen,
  onClose,
  property,
}: SocialPostGeneratorProps) {
  const [format, setFormat] = useState<"post" | "story">("post"); // 1080x1080 vs 1080x1920
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);
  const [accentText, setAccentText] = useState<string>("FIRSAT PORTFÖY");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const validImages = property.images && property.images.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85"];

  const currentImg = validImages[selectedImgIndex] || validImages[0];

  const priceText = property.price ? formatTRY(property.price) : "Fiyat Sorunuz";
  const locationText = [property.district, property.city || "İstanbul"].filter(Boolean).join(" / ");
  const specsText = [
    property.rooms ? `${property.rooms} Oda` : null,
    property.gross_m2 ? `${property.gross_m2} m²` : null,
    property.property_type || "Daire",
  ].filter(Boolean).join("  •  ");

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = (text || "").split(" ");
    const lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  // Render to canvas
  const drawBanner = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = format === "post" ? 1080 : 1920;

    canvas.width = width;
    canvas.height = height;

    const renderElements = (loadedImg?: HTMLImageElement | null) => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (loadedImg && loadedImg.naturalWidth > 0) {
        // 1. Draw Image centered with cover fit
        const scale = Math.max(width / loadedImg.naturalWidth, height / loadedImg.naturalHeight);
        const x = width / 2 - (loadedImg.naturalWidth / 2) * scale;
        const y = height / 2 - (loadedImg.naturalHeight / 2) * scale;
        ctx.drawImage(loadedImg, x, y, loadedImg.naturalWidth * scale, loadedImg.naturalHeight * scale);

        // 2. Luxury Dark Gradient Overlay over image
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "rgba(5, 5, 12, 0.85)");
        grad.addColorStop(0.25, "rgba(5, 5, 12, 0.45)");
        grad.addColorStop(0.65, "rgba(5, 5, 12, 0.65)");
        grad.addColorStop(1, "rgba(5, 5, 12, 0.95)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Fallback luxury dark golden gradient background if image fails/loads slow
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, "#0F0F1A");
        bgGrad.addColorStop(0.5, "#1A1829");
        bgGrad.addColorStop(1, "#0B0B12");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Decorative background gold accent circle
        const circleGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 400);
        circleGrad.addColorStop(0, "rgba(212, 175, 55, 0.15)");
        circleGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = circleGrad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 400, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Top Header: Sarraf 34 Branding
      ctx.fillStyle = "#D4AF37"; // Gold
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SARRAF 34", width / 2, format === "post" ? 80 : 140);

      ctx.fillStyle = "#E5E7EB";
      ctx.font = "600 16px sans-serif";
      ctx.fillText("İNŞAAT & GAYRİMENKUL", width / 2, format === "post" ? 115 : 175);

      // 4. Accent Tag Badge
      if (accentText.trim()) {
        ctx.font = "bold 16px sans-serif";
        const badgeText = accentText.trim().toUpperCase();
        const textMetrics = ctx.measureText(badgeText);
        const tagWidth = Math.max(220, textMetrics.width + 48);
        const tagHeight = 44;
        const tagX = width / 2 - tagWidth / 2;
        const tagY = format === "post" ? 145 : 210;

        ctx.fillStyle = "#D4AF37";
        ctx.fillRect(tagX, tagY, tagWidth, tagHeight);
        ctx.fillStyle = "#090A0F";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, width / 2, tagY + 28);
      }

      // 5. Bottom Info Box
      const boxY = format === "post" ? height - 350 : height - 540;
      const boxHeight = format === "post" ? 290 : 460;

      // Inner Gold Border Line
      ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(50, boxY, width - 100, boxHeight);

      // Semi-transparent background for text box
      ctx.fillStyle = "rgba(10, 10, 18, 0.88)";
      ctx.fillRect(52, boxY + 2, width - 104, boxHeight - 4);

      // Property Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      const titleLines = wrapText(ctx, property.title || "", width - 140);
      titleLines.slice(0, 2).forEach((line, index) => {
        ctx.fillText(line, width / 2, boxY + 60 + index * 42);
      });

      // Location & Specs
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "20px sans-serif";
      ctx.fillText(locationText.toUpperCase(), width / 2, boxY + 145);

      ctx.fillStyle = "#D1D5DB";
      ctx.font = "600 22px sans-serif";
      ctx.fillText(specsText, width / 2, boxY + 180);

      // Gold Price Banner
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(priceText, width / 2, boxY + 245);

      // Contact & Footer for Story
      if (format === "story") {
        ctx.fillStyle = "#E5E7EB";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("📞 0532 552 34 34", width / 2, boxY + 335);

        ctx.fillStyle = "#9CA3AF";
        ctx.font = "16px sans-serif";
        ctx.fillText("www.sarraf34.com", width / 2, boxY + 370);
      }
    };

    // First render text and layout immediately (prevents pitch black canvas)
    renderElements(null);

    // Now attempt to load image
    if (currentImg) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        renderElements(img);
      };

      img.onerror = () => {
        // Retry without crossOrigin if CORS failed
        const retryImg = new window.Image();
        retryImg.onload = () => {
          renderElements(retryImg);
        };
        retryImg.onerror = () => {
          renderElements(null);
        };
        retryImg.src = currentImg;
      };

      img.src = currentImg;

      if (img.complete && img.naturalWidth > 0) {
        renderElements(img);
      }
    }
  }, [format, currentImg, accentText, property.title, locationText, specsText, priceText]);

  useEffect(() => {
    if (isOpen) {
      drawBanner();
    }
  }, [isOpen, drawBanner]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);

    setTimeout(() => {
      try {
        const link = document.createElement("a");
        link.download = `sarraf34_${format}_${(property.title || "ilan").substring(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        console.error("Canvas export error:", err);
        // Fallback if canvas is tainted by CORS: render without image and export
        drawBanner();
        alert("Görsel indirildi. (Güvenlik engeli nedeniyle arka plan şablonuyla kaydedildi)");
      } finally {
        setIsGenerating(false);
      }
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="luxury-card max-w-4xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Instagram size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Sosyal Medya İlan Postu Üretici
              </h3>
              <p className="font-body text-xs text-muted-foreground">
                Instagram Post ve Story için tek tıkla yüksek çözünürlüklü marka görseli hazırlayın.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings & Customization */}
          <div className="lg:col-span-5 space-y-5">
            {/* Format Switcher */}
            <div>
              <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-2 font-semibold">
                Görsel Formatı
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat("post")}
                  className={`py-3 px-4 rounded text-xs font-body font-semibold border flex items-center justify-center gap-2 transition-all ${
                    format === "post"
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <Image size={15} /> Instagram Post (1:1)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("story")}
                  className={`py-3 px-4 rounded text-xs font-body font-semibold border flex items-center justify-center gap-2 transition-all ${
                    format === "story"
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <Sparkles size={15} /> Story / Durum (9:16)
                </button>
              </div>
            </div>

            {/* Select Image */}
            {validImages.length > 1 && (
              <div>
                <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-2 font-semibold">
                  Fotoğraf Seçimi ({validImages.length} Görsel)
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {validImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImgIndex(i)}
                      className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImgIndex === i ? "border-primary ring-2 ring-primary/40" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      {selectedImgIndex === i && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check size={14} className="text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Tag / Badge */}
            <div>
              <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1.5 font-semibold">
                Vurgu Rozeti Metni
              </label>
              <div className="flex gap-2 flex-wrap mb-2">
                {["FIRSAT PORTFÖY", "ACİL SATILIK", "LÜKS YAŞAM", "YATIRIMLIK", "KELEPİR"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAccentText(t)}
                    className={`text-[11px] font-body px-2.5 py-1 rounded border transition-all ${
                      accentText === t
                        ? "bg-primary text-primary-foreground font-bold border-primary shadow-sm"
                        : "bg-secondary hover:bg-secondary/80 text-muted-foreground border-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={accentText}
                onChange={(e) => setAccentText(e.target.value)}
                placeholder="Örn: FIRSAT PORTFÖY"
                className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
              />
            </div>

            {/* Download CTA */}
            <div className="pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full gradient-gold text-primary-foreground py-3.5 text-xs tracking-wider uppercase font-body font-semibold rounded flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Görseli İndir (Ultra HD PNG)
              </button>
            </div>
          </div>

          {/* Live Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/40 p-4 sm:p-6 rounded-lg border border-border">
            <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider mb-3">
              Canlı Önizleme ({format === "post" ? "1080 x 1080 px" : "1080 x 1920 px"})
            </p>
            <div
              className={`relative overflow-hidden rounded shadow-2xl border border-primary/30 max-h-[480px] ${
                format === "post" ? "aspect-square w-full max-w-[400px]" : "aspect-[9/16] h-[480px]"
              }`}
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
