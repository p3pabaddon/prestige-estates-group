import { useState, useRef, useEffect } from "react";
import { X, Download, Share2, Instagram, Image, Sparkles, Loader2, Check } from "lucide-react";
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
  useEffect(() => {
    if (isOpen) {
      drawBanner();
    }
  }, [format, selectedImgIndex, accentText, currentImg, isOpen]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);

    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `sarraf34_${format}_${property.title.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsGenerating(false);
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
                    className="text-[11px] font-body px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground border border-border"
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
