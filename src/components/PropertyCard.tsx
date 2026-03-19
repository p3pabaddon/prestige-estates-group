import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bed, Bath, Maximize } from "lucide-react";

interface PropertyCardProps {
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

const PropertyCard = ({ image, title, location, price, beds, baths, sqm, tag, type }: PropertyCardProps) => {
  return (
    <Link to="/property-details">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="luxury-card group cursor-pointer"
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={image}
            alt={title}
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
          <h3 className="font-display text-lg text-foreground mb-1">{title}</h3>
          <p className="text-muted-foreground font-body text-xs tracking-wider uppercase mb-4">{location}</p>

          <div className="flex items-center gap-4 text-muted-foreground font-body text-xs mb-4">
            <span className="flex items-center gap-1.5"><Bed size={14} /> {beds}</span>
            <span className="flex items-center gap-1.5"><Bath size={14} /> {baths}</span>
            <span className="flex items-center gap-1.5"><Maximize size={14} /> {sqm} m²</span>
          </div>

          <div className="luxury-divider mb-4" />
          <p className="font-display text-xl text-primary">{price}</p>
        </div>
      </motion.div>
    </Link>
  );
};

export default PropertyCard;
