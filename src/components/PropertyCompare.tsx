import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bed, Bath, Maximize, ArrowRight, Check, Sparkles, MessageCircle, ExternalLink, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { formatTRY } from "@/lib/crm";
import { getPropertyDetailUrl } from "@/lib/propertyUrl";

export interface CompareProperty {
  id?: string;
  image: string;
  title: string;
  location: string;
  district?: string;
  city?: string;
  price: string;
  rawPrice?: number | null;
  beds: number;
  baths: number;
  sqm: number;
  netSqm?: number;
  tag?: string;
  type: string;
  floor?: string;
  buildingAge?: string;
  heating?: string;
  creditEligible?: boolean;
  tapuDurumu?: string;
  balcony?: boolean;
  parking?: string;
  elevator?: boolean;
}

interface PropertyCompareProps {
  items: CompareProperty[];
  onRemove: (title: string) => void;
  onClear: () => void;
}

const PropertyCompare = ({ items, onRemove, onClear }: PropertyCompareProps) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Comparison Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-primary/30 shadow-2xl bg-card/95 backdrop-blur-md"
      >
        <div className="container-luxury py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto flex-1 py-1">
            <div className="flex items-center gap-1.5 text-primary text-xs font-body font-bold uppercase tracking-wider pl-1 hidden sm:flex">
              <Scale size={15} /> Karşılaştırma:
            </div>
            {items.map((p) => (
              <div
                key={p.title}
                className="flex items-center gap-2 bg-secondary/80 border border-border/70 rounded-md px-3 py-1.5 min-w-fit shadow-sm"
              >
                <img src={p.image} alt={p.title} className="w-9 h-9 rounded object-cover" />
                <div className="max-w-[150px] truncate">
                  <p className="font-display text-xs text-foreground font-medium truncate">{p.title}</p>
                  <p className="font-body text-[10px] text-primary font-bold">{p.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(p.title)}
                  className="text-muted-foreground hover:text-rose-400 ml-1 p-0.5"
                  title="Listeden Çıkar"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-body text-xs text-muted-foreground whitespace-nowrap font-medium">
              {items.length}/4 İlan
            </span>
            <button
              onClick={() => setExpanded(true)}
              disabled={items.length < 2}
              className={`gradient-gold text-primary-foreground text-xs font-body font-bold py-2.5 px-4 rounded uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                items.length < 2 ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              Karşılaştır <ArrowRight size={13} />
            </button>
            <button
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground text-xs font-body uppercase tracking-wider font-medium"
            >
              Temizle
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full Screen Luxury Comparison Modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="container-luxury py-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs tracking-[0.25em] uppercase text-primary font-body font-bold mb-1">
                    <Scale size={14} /> Detaylı Kıyaslama Raporu
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground font-bold">
                    Gayrimenkul Karşılaştırma Tablosu
                  </h2>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-2xl">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border">
                      <th className="text-left py-4 px-5 font-body text-xs tracking-wider uppercase text-muted-foreground w-48 font-bold">
                        Özellik
                      </th>
                      {items.map((p) => (
                        <th key={p.title} className="py-4 px-4 text-center w-72 align-top">
                          <div className="space-y-3">
                            <div className="relative aspect-[4/3] rounded overflow-hidden border border-border">
                              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                              <button
                                onClick={() => onRemove(p.title)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white hover:bg-rose-600 flex items-center justify-center transition-colors"
                                title="Kaldır"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <div>
                              <h4 className="font-display text-sm text-foreground font-bold line-clamp-2">
                                {p.title}
                              </h4>
                              <p className="font-body text-[11px] text-muted-foreground uppercase tracking-wider mt-1">
                                {p.location}
                              </p>
                              <div className="font-display text-lg font-bold text-primary mt-1.5">
                                {p.price}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {p.id && (
                                <Link
                                  to={getPropertyDetailUrl({ id: p.id, title: p.title, property_type: p.type })}
                                  target="_blank"
                                  className="flex-1 py-1.5 text-[11px] font-body font-semibold rounded bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center justify-center gap-1"
                                >
                                  İlanı Gör <ExternalLink size={11} />
                                </Link>
                              )}
                              <a
                                href={`https://wa.me/905302503252?text=${encodeURIComponent(
                                  `Merhaba, "${p.title}" ilanı hakkında karşılaştırma bilgisi almak istiyorum.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/25"
                                title="WhatsApp Danış"
                              >
                                <MessageCircle size={14} />
                              </a>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs font-body">
                    {[
                      { label: "Fiyat", render: (p: CompareProperty) => <span className="font-bold text-primary font-display text-base">{p.price}</span> },
                      { label: "Konut Tipi", render: (p: CompareProperty) => p.type || "Daire" },
                      { label: "Oda Sayısı", render: (p: CompareProperty) => <span className="flex items-center justify-center gap-1"><Bed size={14} className="text-primary" /> {p.beds} Oda</span> },
                      { label: "Banyo Sayısı", render: (p: CompareProperty) => <span className="flex items-center justify-center gap-1"><Bath size={14} className="text-primary" /> {p.baths} Banyo</span> },
                      { label: "Brüt Alan", render: (p: CompareProperty) => <span className="flex items-center justify-center gap-1"><Maximize size={14} className="text-primary" /> {p.sqm} m²</span> },
                      { label: "Net Alan", render: (p: CompareProperty) => p.netSqm ? `${p.netSqm} m²` : "—" },
                      { label: "Bulunduğu Kat", render: (p: CompareProperty) => p.floor || "Ara Kat" },
                      { label: "Bina Yaşı", render: (p: CompareProperty) => p.buildingAge || "Sıfır" },
                      { label: "Isıtma Tipi", render: (p: CompareProperty) => p.heating || "Kombi Doğalgaz" },
                      { label: "Krediye Uygunluk", render: (p: CompareProperty) => p.creditEligible !== false ? <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1"><Check size={13} /> Uygun</span> : "Uygun Değil" },
                      { label: "Tapu Durumu", render: (p: CompareProperty) => p.tapuDurumu || "Kat Mülkiyeti" },
                      { label: "Balkon", render: (p: CompareProperty) => p.balcony ? "Var" : "Yok" },
                      { label: "Otopark", render: (p: CompareProperty) => p.parking || "Mevcut" },
                      { label: "Asansör", render: (p: CompareProperty) => p.elevator !== false ? "Var" : "Yok" },
                    ].map((row) => (
                      <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-5 font-bold uppercase tracking-wider text-muted-foreground bg-secondary/20">
                          {row.label}
                        </td>
                        {items.map((p) => (
                          <td key={p.title} className="py-3 px-4 text-center text-foreground">
                            {row.render(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setExpanded(false)}
                  className="px-8 py-3 rounded gradient-gold text-primary-foreground font-body text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  Kıyaslamayı Kapat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyCompare;
