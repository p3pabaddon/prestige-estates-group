import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bed, Bath, Maximize, Plus, Check } from "lucide-react";

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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="luxury-card group cursor-pointer relative"
    >
      {/* Compare button */}
      {onToggleCompare && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleCompare();
          }}
          disabled={compareDisabled && !isComparing}
          className={`absolute top-4 right-14 z-10 w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-300 ${
            isComparing
              ? "gradient-gold text-primary-foreground"
              : compareDisabled
                ? "bg-background/60 backdrop-blur-sm text-muted-foreground/40 cursor-not-allowed"
                : "bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background/80"
          }`}
          title={isComparing ? "Remove from comparison" : "Add to comparison"}
        >
          {isComparing ? <Check size={14} /> : <Plus size={14} />}
        </button>
      )}

      <Link to={detailLink}>
        <div className="relative overflow-hidden aspect-[4/3] bg-secondary">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          {tag && (
            <span className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-body font-medium gradient-gold text-primary-foreground">
              {tag}
            </span>
          )}
          <span className="absolute top-4 right-4 px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-body text-muted-foreground bg-background/60 backdrop-blur-sm">
            {type}
          </span>
        </div>

        <div className="p-6">
          <h3 className="font-display text-lg text-foreground mb-1 line-clamp-1">{title}</h3>
          <p className="text-muted-foreground font-body text-xs tracking-wider uppercase mb-4 line-clamp-1">{location}</p>

          <div className="flex items-center gap-4 text-muted-foreground font-body text-xs mb-4">
            <span className="flex items-center gap-1.5"><Bed size={14} /> {beds}</span>
            <span className="flex items-center gap-1.5"><Bath size={14} /> {baths}</span>
            <span className="flex items-center gap-1.5"><Maximize size={14} /> {sqm} m²</span>
          </div>

          <div className="luxury-divider mb-4" />
          <p className="font-display text-xl text-primary">{price}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
