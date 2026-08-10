import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bed, Bath, Maximize, Plus, Check, MapPin } from "lucide-react";

interface PropertyCardProps {
  id?: string;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqm: number;
  tag?: string;
  type: string;
  isComparing?: boolean;
  onToggleCompare?: () => void;
  compareDisabled?: boolean;
}

const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  beds,
  baths,
  sqm,
  tag,
  type,
  isComparing,
  onToggleCompare,
  compareDisabled,
}: PropertyCardProps) => {
  const detailLink = id ? `/property-details/${id}` : "/property-details";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="luxury-card group cursor-pointer relative flex flex-col h-full bg-card"
    >
      <Link to={detailLink} className="flex flex-col h-full">
        {/* Card Media Container */}
        <div className="relative overflow-hidden aspect-[4/3] bg-muted/60">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          />

          {/* Consistent Dark Vignette for Crisp Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 pointer-events-none" />

          {/* Top Left: Tag Badge */}
          {tag && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2.5 py-1 text-[10px] tracking-wider uppercase font-body font-bold rounded bg-amber-500 text-black shadow-lg">
                {tag}
              </span>
            </div>
          )}

          {/* Top Right: Type Badge & Compare Button */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            {type && (
              <span className="px-2.5 py-1 text-[10px] tracking-wider uppercase font-body font-medium rounded bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-sm">
                {type}
              </span>
            )}

            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCompare();
                }}
                disabled={compareDisabled && !isComparing}
                className={`w-7 h-7 flex items-center justify-center rounded transition-all duration-200 shadow-md ${
                  isComparing
                    ? "bg-amber-400 text-black font-bold ring-2 ring-amber-400/50"
                    : compareDisabled
                    ? "bg-black/40 text-white/30 cursor-not-allowed"
                    : "bg-black/60 hover:bg-black/80 text-white border border-white/15"
                }`}
                title={isComparing ? "Karşılaştırmadan Çıkar" : "Karşılaştırmaya Ekle"}
              >
                {isComparing ? <Check size={13} strokeWidth={3} /> : <Plus size={13} />}
              </button>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="font-display text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
              {title}
            </h3>

            <p className="flex items-center gap-1.5 text-muted-foreground font-body text-xs tracking-wide uppercase line-clamp-1 mb-4">
              <MapPin size={13} className="text-primary flex-shrink-0" />
              <span>{location}</span>
            </p>

            {/* Structured Specs Pill */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-md bg-secondary/50 border border-border/50 text-foreground font-body text-xs mb-4">
              <div className="flex items-center justify-center gap-1.5">
                <Bed size={14} className="text-primary" />
                <span>{beds} Oda</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 border-x border-border/40">
                <Bath size={14} className="text-primary" />
                <span>{baths} Banyo</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Maximize size={14} className="text-primary" />
                <span>{sqm} m²</span>
              </div>
            </div>
          </div>

          <div>
            <div className="luxury-divider mb-3.5" />
            <div className="flex items-baseline justify-between">
              <p className="font-display text-xl font-bold text-amber-700 dark:text-primary tracking-tight">
                {price}
              </p>
              <span className="text-[11px] font-body text-muted-foreground group-hover:text-foreground transition-colors">
                Detayları Gör →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
