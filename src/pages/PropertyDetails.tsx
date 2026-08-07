import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Building,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Share2,
  Heart,
  Check,
  Calendar,
  Sparkles,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import PropertyCard from "@/components/PropertyCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { formatTRY } from "@/lib/crm";
import { isLegitimatePropertyImage, upgradeToHighResImageUrl } from "@/lib/listingScraper";
import { toast } from "@/hooks/use-toast";

import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import luxuryKitchen from "@/assets/luxury-kitchen.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

interface PropertyData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  neighborhood: string | null;
  district: string | null;
  city: string | null;
  address: string | null;
  price: number | null;
  currency: string;
  property_type: string;
  listing_type: string;
  rooms: string | null;
  bathrooms: number | null;
  gross_m2: number | null;
  net_m2: number | null;
  floor: string | null;
  total_floors: number | null;
  building_age: string | null;
  heating: string | null;
  furnished: boolean;
  credit_eligible: boolean;
  swap_eligible: boolean;
  balcony: boolean;
  elevator: boolean | null;
  parking: string | null;
  site_adi: string | null;
  tapu_durumu: string | null;
  ilan_no: string | null;
  status: string;
  tag: string | null;
  images: string[];
  video_url: string | null;
  virtual_tour_url: string | null;
  featured: boolean;
}

const defaultFallbackImages = [
  heroVilla,
  penthouseInterior,
  luxuryInterior,
  luxuryKitchen,
  villaPool,
  waterfrontVilla,
];

const defaultProperty: PropertyData = {
  id: "demo-penthouse",
  title: "The Sovereign Penthouse",
  description:
    "Perched atop one of the most coveted addresses, The Sovereign Penthouse commands unobstructed panoramic views of the coastline and the glittering skyline. Spanning across a single floor, the interiors have been meticulously designed with bespoke finishes, luxury surfaces, and floor-to-ceiling glass.",
  location: "Monte Carlo, Monaco",
  neighborhood: "Carré d'Or",
  district: "Monte Carlo",
  city: "Monaco",
  address: "Boulevard Princesse Charlotte",
  price: 12500000,
  currency: "EUR",
  property_type: "Penthouse",
  listing_type: "satilik",
  rooms: "4+1",
  bathrooms: 5,
  gross_m2: 420,
  net_m2: 380,
  floor: "24",
  total_floors: 24,
  building_age: "0 (Yeni)",
  heating: "Yerden Isıtma & VRF",
  furnished: true,
  credit_eligible: true,
  swap_eligible: false,
  balcony: true,
  elevator: true,
  parking: "Kapalı Otopark (3 Araç)",
  site_adi: "Sovereign Residences",
  tapu_durumu: "Kat Mülkiyeti",
  ilan_no: "PE-88492",
  status: "aktif",
  tag: "Exclusive",
  images: defaultFallbackImages,
  video_url: null,
  virtual_tour_url: null,
  featured: true,
};

const PropertyDetails = () => {
  const { id } = useParams<{ id?: string }>();
  const { t } = useLanguage();
  const [property, setProperty] = useState<PropertyData>(defaultProperty);
  const [cleanImages, setCleanImages] = useState<string[]>(defaultFallbackImages);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  // Touch swipe state for mobile gestures
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) {
      onSwipeLeft();
    } else if (distance < -minSwipeDistance) {
      onSwipeRight();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const nextImage = useCallback(() => {
    if (cleanImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % cleanImages.length);
  }, [cleanImages.length]);

  const prevImage = useCallback(() => {
    if (cleanImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + cleanImages.length) % cleanImages.length);
  }, [cleanImages.length]);

  const nextLightbox = useCallback(() => {
    if (cleanImages.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % cleanImages.length);
  }, [cleanImages.length]);

  const prevLightbox = useCallback(() => {
    if (cleanImages.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + cleanImages.length) % cleanImages.length);
  }, [cleanImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, nextLightbox, prevLightbox]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadProperty = async () => {
      if (!id) {
        setProperty(defaultProperty);
        setCleanImages(defaultFallbackImages);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching property details:", error);
          return;
        }

        if (data) {
          // Filter junk images AND automatically upgrade to Crystal Clear HD Resolution URLs
          let validImgs = (data.images || [])
            .filter(isLegitimatePropertyImage)
            .map(upgradeToHighResImageUrl);

          if (validImgs.length === 0) {
            validImgs = defaultFallbackImages;
          }

          const formatted: PropertyData = {
            ...data,
            images: validImgs,
          };
          setProperty(formatted);
          setCleanImages(validImgs);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("Failed to load property details:", err);
      }
    };

    const loadSimilar = async () => {
      try {
        const query = supabase
          .from("properties")
          .select("*")
          .eq("published", true)
          .limit(3);

        if (id) {
          query.neq("id", id);
        }

        const { data } = await query;
        if (data && data.length > 0) {
          const mapped = data.map((item: any) => {
            const numBeds = parseInt(item.rooms?.split("+")[0] || "3", 10) || 3;
            const priceVal = Number(item.price) || 0;
            const formattedPrice = item.price
              ? item.currency === "TRY"
                ? formatTRY(item.price)
                : `${item.currency === "EUR" ? "€" : "$"}${priceVal.toLocaleString("en-US")}`
              : "Fiyat Belirtilmedi";

            const validImgs = (item.images || [])
              .filter(isLegitimatePropertyImage)
              .map(upgradeToHighResImageUrl);

            const primaryImg = validImgs[0] || heroVilla;

            const loc = [item.neighborhood, item.district, item.city]
              .filter(Boolean)
              .join(", ") || item.location || "İstanbul";

            return {
              id: item.id,
              image: primaryImg,
              title: item.title,
              location: loc,
              price: formattedPrice,
              beds: numBeds,
              baths: item.bathrooms || 1,
              sqm: item.gross_m2 || item.net_m2 || 120,
              tag: item.tag || (item.featured ? "Öne Çıkan" : item.listing_type === "satilik" ? "Satılık" : "Kiralık"),
              type: item.property_type || "Daire",
            };
          });
          setSimilar(mapped);
        } else {
          setSimilar([
            { id: "1", image: waterfrontVilla, title: "Villa Aquamarine", location: "Cap Ferrat, France", price: "€8,900,000", beds: 6, baths: 7, sqm: 680, tag: "Waterfront", type: "Villa" },
            { id: "2", image: penthouseInterior, title: "Pinnacle Sky Suite", location: "New York, USA", price: "$18,500,000", beds: 5, baths: 6, sqm: 550, tag: "Exclusive", type: "Penthouse" },
            { id: "3", image: villaPool, title: "Horizon Estate", location: "Mykonos, Greece", price: "€4,200,000", beds: 4, baths: 4, sqm: 380, type: "Villa" },
          ]);
        }
      } catch (err) {
        console.error("Failed to load similar properties", err);
      }
    };

    loadProperty();
    loadSimilar();
  }, [id]);

  const numBeds = parseInt(property.rooms?.split("+")[0] || "3", 10) || 3;
  const locationLabel = [property.neighborhood, property.district, property.city]
    .filter(Boolean)
    .join(", ") || property.location || "İstanbul";

  const formattedPrice = property.price
    ? property.currency === "TRY"
      ? formatTRY(property.price)
      : `${property.currency === "EUR" ? "€" : "$"}${Number(property.price).toLocaleString("en-US")}`
    : "Fiyat Belirtilmedi";

  const openLightboxAt = (idx: number) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - ${locationLabel}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Bağlantı Kopyalandı",
        description: "İlan bağlantısı panoya kopyalandı.",
      });
    }
  };

  const currentMainPhoto = cleanImages[currentIndex] || heroVilla;

  return (
    <Layout>
      {/* ===== CLEAN HEADER (NO BACKGROUND IMAGE BEHIND TEXT) ===== */}
      <section className="pt-28 pb-6 bg-background border-b border-border/40">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-body tracking-wider"
            >
              <ArrowLeft size={16} /> Gayrimenkullere Dön
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border/60 text-xs font-body text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                title="Paylaş"
              >
                <Share2 size={14} /> Paylaş
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-body transition-colors ${
                  isLiked
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
                title="Favorilere Ekle"
              >
                <Heart size={14} className={isLiked ? "fill-rose-400" : ""} /> {isLiked ? "Favoride" : "Favori"}
              </button>
            </div>
          </div>

          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 text-[11px] tracking-[0.2em] uppercase font-body font-semibold gradient-gold text-primary-foreground rounded-sm">
              {property.tag || (property.listing_type === "satilik" ? "Satılık" : "Kiralık")}
            </span>
            <span className="px-3 py-1 text-[11px] tracking-[0.15em] uppercase font-body font-medium bg-secondary text-foreground border border-border/60 rounded-sm">
              {property.property_type}
            </span>
            {property.ilan_no && (
              <span className="px-3 py-1 text-[11px] tracking-[0.1em] font-mono text-muted-foreground bg-secondary/50 border border-border/30 rounded-sm">
                İlan No: #{property.ilan_no}
              </span>
            )}
          </div>

          {/* Title & Price Row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="max-w-4xl">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground font-semibold leading-tight tracking-tight mb-2">
                {property.title}
              </h1>
              <p className="flex items-center gap-1.5 text-muted-foreground font-body text-sm tracking-wide">
                <MapPin size={15} className="text-primary flex-shrink-0" />
                <span>{locationLabel}</span>
              </p>
            </div>

            <div className="lg:text-right flex-shrink-0">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1">
                Fiyat
              </p>
              <p className="font-display text-2xl sm:text-3xl md:text-4xl text-primary font-bold">
                {formattedPrice}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HD THEATER GALLERY (UNCOMPRESSED, CRISP, NO CROPPING/DISTORTION) ===== */}
      <section className="py-8 bg-zinc-950/80">
        <div className="container-luxury">
          {/* Main Photo Cinema Stage */}
          <div className="relative rounded-sm overflow-hidden bg-black border border-white/10 shadow-2xl">
            {/* Ambient Blurred Backdrop for Luxury Depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
              <img
                src={currentMainPhoto}
                alt=""
                className="w-full h-full object-cover blur-3xl scale-125"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = heroVilla;
                }}
              />
            </div>

            {/* Foreground Main Image Stage - Natural Aspect Ratio (Never stretched) */}
            <div
              className="relative h-[420px] sm:h-[500px] md:h-[600px] w-full flex items-center justify-center p-2 sm:p-4 select-none cursor-pointer group"
              onClick={() => openLightboxAt(currentIndex)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(nextImage, prevImage)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={currentMainPhoto}
                  alt={`${property.title} - HD Görsel ${currentIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-full max-w-full object-contain rounded-sm shadow-2xl z-10"
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = heroVilla;
                  }}
                />
              </AnimatePresence>

              {/* Hover Zoom Prompt */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20 pointer-events-none">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/80 backdrop-blur-md text-white font-body text-xs tracking-wider uppercase border border-white/20 shadow-xl">
                  <ZoomIn size={16} className="text-primary" /> Tam Ekran HD Görüntüle ({currentIndex + 1} / {cleanImages.length})
                </span>
              </div>

              {/* Top Right Counter & HD Badge */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-sm bg-primary/90 text-primary-foreground font-body text-[10px] font-bold tracking-widest uppercase">
                  Ultra HD
                </span>
                <div className="px-3 py-1 rounded-sm bg-black/75 backdrop-blur-md text-white text-xs font-mono tracking-wider border border-white/10">
                  {currentIndex + 1} / {cleanImages.length}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightboxAt(currentIndex);
                  }}
                  className="p-1.5 rounded-sm bg-black/75 backdrop-blur-md text-white hover:text-primary transition-colors border border-white/10"
                  title="Tam Ekran Aç"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Mobile Swipe Badge */}
              <div className="md:hidden absolute bottom-3 left-3 z-30 px-2.5 py-1 rounded-sm bg-black/70 backdrop-blur-sm text-[10px] text-white/80 font-body">
                Kaydırarak Gezin ↔
              </div>

              {/* Next / Prev Navigation Buttons */}
              {cleanImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/95 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110 z-30"
                    aria-label="Önceki Fotoğraf"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/95 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110 z-30"
                    aria-label="Sonraki Fotoğraf"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Strip */}
            {cleanImages.length > 1 && (
              <div className="p-3 bg-zinc-900/90 border-t border-white/10 overflow-x-auto flex gap-2.5 scrollbar-thin scrollbar-thumb-primary/40">
                {cleanImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-sm overflow-hidden border-2 bg-black transition-all duration-200 ${
                      currentIndex === i
                        ? "border-primary ring-2 ring-primary/40 scale-95 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Küçük Resim ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = heroVilla;
                      }}
                    />
                    {currentIndex === i && (
                      <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== FULLSCREEN LIGHTBOX (MOBILE SWIPE + KEYBOARD ARROWS) ===== */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl flex flex-col justify-between select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Lightbox Bar */}
            <div
              className="p-4 sm:p-6 flex items-center justify-between text-white border-b border-white/10 bg-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm tracking-wider px-3 py-1 rounded bg-white/10">
                  {lightboxIndex + 1} / {cleanImages.length}
                </span>
                <span className="font-body text-xs sm:text-sm text-white/80 hidden sm:inline truncate max-w-md">
                  {property.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Kapat (ESC)"
              >
                <X size={24} />
              </button>
            </div>

            {/* Center Stage with Mobile Touch Swipe */}
            <div
              className="relative flex-1 flex items-center justify-center p-2 sm:p-6"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(nextLightbox, prevLightbox)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  src={cleanImages[lightboxIndex] || heroVilla}
                  alt={`${property.title} - Tam Ekran ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[82vh] max-w-full object-contain rounded-sm shadow-2xl"
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = heroVilla;
                  }}
                />
              </AnimatePresence>

              {/* Lightbox Navigation Chevrons */}
              {cleanImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevLightbox();
                    }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110"
                    aria-label="Önceki"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextLightbox();
                    }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110"
                    aria-label="Sonraki"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Lightbox Thumbnail Ribbon */}
            <div
              className="p-3 bg-black/80 border-t border-white/10 overflow-x-auto flex justify-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {cleanImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-sm overflow-hidden border-2 transition-all ${
                    lightboxIndex === i
                      ? "border-primary scale-105"
                      : "border-transparent opacity-40 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Küçük ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PROPERTY DETAILS & SPECIFICATIONS ===== */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              {/* Quick Stat Pill Grid */}
              <ScrollReveal>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-card border border-border rounded-sm mb-10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-sm bg-primary/10 text-primary">
                      <Bed size={22} />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">
                        {property.rooms || `${numBeds}+1`}
                      </p>
                      <p className="text-muted-foreground font-body text-xs uppercase tracking-wider">
                        Oda Sayısı
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-sm bg-primary/10 text-primary">
                      <Bath size={22} />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">
                        {property.bathrooms ?? 1}
                      </p>
                      <p className="text-muted-foreground font-body text-xs uppercase tracking-wider">
                        Banyo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-sm bg-primary/10 text-primary">
                      <Maximize size={22} />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">
                        {property.gross_m2 || property.net_m2 || 120} m²
                      </p>
                      <p className="text-muted-foreground font-body text-xs uppercase tracking-wider">
                        Brüt Alan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-sm bg-primary/10 text-primary">
                      <Building size={22} />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">
                        {property.floor || "Ara Kat"}
                      </p>
                      <p className="text-muted-foreground font-body text-xs uppercase tracking-wider">
                        Bulunduğu Kat
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Description */}
              <ScrollReveal>
                <div className="mb-12">
                  <h2 className="font-display text-2xl text-foreground font-semibold mb-5 pb-3 border-b border-border">
                    İlan Açıklaması
                  </h2>
                  <div className="text-muted-foreground font-body leading-relaxed whitespace-pre-line text-sm sm:text-base space-y-4">
                    {property.description ||
                      "Bu gayrimenkul için detaylı açıklama metni portföy yöneticisi tarafından düzenlenmektedir."}
                  </div>
                </div>
              </ScrollReveal>

              {/* Detailed Specs Table */}
              <ScrollReveal>
                <div className="mb-12">
                  <h3 className="font-display text-xl text-foreground font-semibold mb-5 pb-3 border-b border-border">
                    Gayrimenkul Özellikleri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 p-6 bg-card border border-border rounded-sm">
                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">İlan Türü</span>
                      <span className="font-body font-medium text-foreground uppercase">
                        {property.listing_type}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Konut Tipi</span>
                      <span className="font-body font-medium text-foreground">
                        {property.property_type}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Net Alan</span>
                      <span className="font-body font-medium text-foreground">
                        {property.net_m2 ? `${property.net_m2} m²` : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Brüt Alan</span>
                      <span className="font-body font-medium text-foreground">
                        {property.gross_m2 ? `${property.gross_m2} m²` : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Bina Yaşı</span>
                      <span className="font-body font-medium text-foreground">
                        {property.building_age || "Sıfır Bina"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Isıtma Tipi</span>
                      <span className="font-body font-medium text-foreground">
                        {property.heating || "Kombi Doğalgaz"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Krediye Uygunluk</span>
                      <span className="font-body font-medium text-emerald-400 flex items-center gap-1">
                        <Check size={14} /> {property.credit_eligible ? "Evet (Uygun)" : "Hayır"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Takasa Uygun</span>
                      <span className="font-body font-medium text-foreground">
                        {property.swap_eligible ? "Evet" : "Hayır"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Tapu Durumu</span>
                      <span className="font-body font-medium text-foreground">
                        {property.tapu_durumu || "Kat Mülkiyeti"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Otopark</span>
                      <span className="font-body font-medium text-foreground">
                        {property.parking || "Mevcut"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Balkon</span>
                      <span className="font-body font-medium text-foreground">
                        {property.balcony ? "Var" : "Yok"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground font-body">Asansör</span>
                      <span className="font-body font-medium text-foreground">
                        {property.elevator ? "Var" : "Yok"}
                      </span>
                    </div>

                    {property.site_adi && (
                      <div className="flex justify-between py-2 border-b border-border/50 text-sm sm:col-span-2">
                        <span className="text-muted-foreground font-body">Site / Proje</span>
                        <span className="font-body font-medium text-foreground">
                          {property.site_adi}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* Extra HD Photo Grid */}
              <ScrollReveal>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                    <h3 className="font-display text-xl text-foreground font-semibold">
                      Tüm Fotoğraflar ({cleanImages.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => openLightboxAt(0)}
                      className="text-xs font-body tracking-wider uppercase text-primary hover:underline flex items-center gap-1"
                    >
                      <Maximize2 size={13} /> Pop-Up Galeriyi Aç
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cleanImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => openLightboxAt(i)}
                        className="group relative aspect-[4/3] rounded-sm overflow-hidden cursor-pointer border border-border/50 bg-black"
                      >
                        <img
                          src={img}
                          alt={`${property.title} - Fotoğraf ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ imageRendering: "-webkit-optimize-contrast" }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = heroVilla;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Maximize2
                            size={18}
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* ===== STICKY SIDEBAR: CONTACT & INQUIRY ===== */}
            <div className="lg:col-span-1">
              <ScrollReveal delay={0.15}>
                <div className="sticky top-28 space-y-6">
                  {/* Pricing & Call to Action Card */}
                  <div className="p-6 md:p-8 bg-card border border-border rounded-sm shadow-lg">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-1">
                      Fiyat
                    </p>
                    <p className="font-display text-3xl font-bold text-primary mb-6">
                      {formattedPrice}
                    </p>

                    <div className="space-y-3 mb-6">
                      <Link
                        to={`/contact?property=${encodeURIComponent(property.title)}&id=${property.id}`}
                        className="luxury-btn-primary w-full text-center flex items-center justify-center gap-2 py-3.5"
                      >
                        <Calendar size={16} /> Randevu & Detaylı Bilgi
                      </Link>

                      <a
                        href={`https://wa.me/905320000000?text=${encodeURIComponent(
                          `Merhaba, "${property.title}" (İlan No: ${property.ilan_no || property.id}) ilanı hakkında detaylı bilgi ve randevu talep ediyorum.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center flex items-center justify-center gap-2 py-3 px-4 rounded-sm border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-body text-xs uppercase tracking-wider transition-colors"
                      >
                        <MessageCircle size={16} /> WhatsApp ile Danış
                      </a>

                      <a
                        href="tel:+905320000000"
                        className="luxury-btn-outline w-full text-center flex items-center justify-center gap-2 py-3 text-xs"
                      >
                        <Phone size={14} /> Hemen Ara
                      </a>
                    </div>

                    <div className="pt-6 border-t border-border/60 space-y-2.5 text-xs text-muted-foreground font-body">
                      <div className="flex justify-between">
                        <span>Konum:</span>
                        <span className="text-foreground font-medium">{property.district || property.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durum:</span>
                        <span className="text-emerald-400 font-medium">Satışa Hazır</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tapu:</span>
                        <span className="text-foreground font-medium">{property.tapu_durumu || "Kat Mülkiyeti"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kredi:</span>
                        <span className="text-foreground font-medium">{property.credit_eligible ? "Uygun" : "Değil"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security & Assistance Note */}
                  <div className="p-5 bg-secondary/40 border border-border/40 rounded-sm text-xs font-body text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Sparkles size={14} className="text-primary" /> Kurumsal Gayrimenkul Güvencesi
                    </div>
                    <p className="leading-relaxed">
                      Tüm portföyümüz yetki sözleşmeli ve tapu kayıtları doğrulanmış gayrimenkullerden oluşmaktadır.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SIMILAR PROPERTIES CAROUSEL / GRID ===== */}
      <section className="section-padding bg-secondary/40 border-t border-border/40">
        <div className="container-luxury">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-body mb-2">
                Portföy
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-foreground font-semibold">
                Benzer Seçkin Gayrimenkuller
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similar.map((p, i) => (
              <ScrollReveal key={p.id || p.title + i} delay={i * 0.1}>
                <PropertyCard {...p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PropertyDetails;
