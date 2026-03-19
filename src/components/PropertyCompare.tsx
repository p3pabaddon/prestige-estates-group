import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bed, Bath, Maximize, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface CompareProperty {
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqm: number;
  tag?: string;
  type: string;
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
      {/* Floating bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-primary/20"
      >
        <div className="container-luxury py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto flex-1">
            {items.map((p) => (
              <div key={p.title} className="flex items-center gap-2 bg-secondary rounded-sm px-3 py-2 min-w-fit">
                <img src={p.image} alt={p.title} className="w-8 h-8 rounded-sm object-cover" />
                <span className="font-body text-xs text-foreground whitespace-nowrap">{p.title}</span>
                <button onClick={() => onRemove(p.title)} className="text-muted-foreground hover:text-foreground ml-1">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-xs text-muted-foreground whitespace-nowrap">{items.length}/4</span>
            <button
              onClick={() => setExpanded(true)}
              disabled={items.length < 2}
              className={`luxury-btn-primary text-xs py-2.5 px-5 whitespace-nowrap ${items.length < 2 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Compare <ArrowRight size={12} className="ml-1" />
            </button>
            <button onClick={onClear} className="text-muted-foreground hover:text-foreground text-xs font-body uppercase tracking-wider">
              Clear
            </button>
          </div>
        </div>
      </motion.div>

      {/* Expanded comparison modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm overflow-y-auto"
          >
            <div className="container-luxury py-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-2">Side by Side</p>
                  <h2 className="font-display text-3xl text-foreground">Property Comparison</h2>
                </div>
                <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground p-2">
                  <X size={24} />
                </button>
              </div>

              {/* Comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="text-left py-4 pr-6 font-body text-xs tracking-wider uppercase text-muted-foreground w-32"></th>
                      {items.map((p) => (
                        <th key={p.title} className="py-4 px-4 text-center">
                          <div className="luxury-card overflow-hidden">
                            <img src={p.image} alt={p.title} className="w-full aspect-[4/3] object-cover" />
                            <div className="p-4">
                              <h4 className="font-display text-sm text-foreground">{p.title}</h4>
                              <p className="font-body text-[10px] text-muted-foreground tracking-wider uppercase mt-1">{p.location}</p>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Price", render: (p: CompareProperty) => <span className="font-display text-primary">{p.price}</span> },
                      { label: "Type", render: (p: CompareProperty) => p.type },
                      { label: "Bedrooms", render: (p: CompareProperty) => <span className="flex items-center justify-center gap-1"><Bed size={14} /> {p.beds}</span> },
                      { label: "Bathrooms", render: (p: CompareProperty) => <span className="flex items-center justify-center gap-1"><Bath size={14} /> {p.baths}</span> },
                      { label: "Area", render: (p: CompareProperty) => <span className="flex items-center justify-center gap-1"><Maximize size={14} /> {p.sqm} m²</span> },
                      { label: "Tag", render: (p: CompareProperty) => p.tag || "—" },
                    ].map((row) => (
                      <tr key={row.label} className="border-t border-border/30">
                        <td className="py-4 pr-6 font-body text-xs tracking-wider uppercase text-muted-foreground">{row.label}</td>
                        {items.map((p) => (
                          <td key={p.title} className="py-4 px-4 text-center font-body text-sm text-foreground">
                            {row.render(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-10">
                <button onClick={() => setExpanded(false)} className="luxury-btn-outline text-xs">
                  Close Comparison
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
