import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Building,
  Building2,
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
  LayoutGrid,
  Film,
  Camera,
  Layers,
  Download,
  Loader2,
  BellRing,
  Instagram,
  Calculator,
  Scale,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import PropertyCard from "@/components/PropertyCard";
import PropertyLocationMap from "@/components/PropertyLocationMap";
import MortgageCalculator from "@/components/MortgageCalculator";
import { PriceDropAlertModal, ScheduleTourModal } from "@/components/PropertyInquiryModals";
import SocialPostGenerator from "@/components/SocialPostGenerator";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { formatTRY } from "@/lib/crm";
import { isLegitimatePropertyImage, upgradeToHighResImageUrl } from "@/lib/listingScraper";
import { generatePropertyPDF } from "@/lib/pdfBrochure";
import { sharePropertyOnWhatsApp } from "@/lib/whatsappShare";
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
  lat?: number | null;
  lng?: number | null;
  video_url: string | null;
  virtual_tour_url: string | null;
  featured: boolean;
}

interface SimilarPropertyItem {
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
}

/** Helper to format raw ALL-CAPS Turkish scraper titles into elegant Title Case */
function formatTurkishTitle(text: string | null | undefined): string {
  if (!text) return "";
  const trimmed = text.trim();
  const isAllUpper = trimmed === trimmed.toLocaleUpperCase("tr-TR");
  if (!isAllUpper) return trimmed;

  const acronyms = ["M2", "M²", "DK", "TL", "HD", "KDV", "TOKİ", "DAP", "E-5", "TEM", "AVM", "Site", "Cadde", "Rezidans"];
  return trimmed
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((word) => {
      if (!word) return "";
      const upperWord = word.toLocaleUpperCase("tr-TR");
      if (/^\d+\+\d+$/i.test(word) || acronyms.includes(upperWord)) {
        return upperWord === "M2" ? "m²" : upperWord;
      }
      return word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1);
    })
    .join(" ");
}

const PropertyDetails = () => {
  const { id } = useParams<{ id?: string }>();
  const { t } = useLanguage();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [cleanImages, setCleanImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [galleryMode, setGalleryMode] = useState<"grid" | "slider">("grid");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [similar, setSimilar] = useState<SimilarPropertyItem[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  // New Interactive Feature Modals State
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [isSocialPostOpen, setIsSocialPostOpen] = useState<boolean>(false);

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
      setLoading(true);
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error || !data) {
          setNotFound(true);
          return;
        }

        // Filter junk images AND automatically upgrade to Crystal Clear HD Resolution URLs
        let validImgs = (data.images || [])
          .filter(isLegitimatePropertyImage)
          .map(upgradeToHighResImageUrl);

        if (validImgs.length === 0) {
          validImgs = [heroVilla];
        }

        const formatted: PropertyData = {
          ...data,
          images: validImgs,
        };
        setProperty(formatted);
        setCleanImages(validImgs);
        setCurrentIndex(0);
        setNotFound(false);
      } catch (err) {
        console.error("Failed to load property details:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
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
          const mapped: SimilarPropertyItem[] = (data as Array<Partial<PropertyData> & { id: string; title: string }>).map((item) => {
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
            { id: "1", image: waterfrontVilla, title: "Boğaz Manzaralı Yalı Dairesi", location: "Sarıyer, İstanbul", price: "₺85.000.000", beds: 5, baths: 4, sqm: 420, tag: "Öne Çıkan", type: "Yalı Dairesi" },
            { id: "2", image: penthouseInterior, title: "Ataköy Sahil Penthouse", location: "Bakırköy, İstanbul", price: "₺45.000.000", beds: 4, baths: 3, sqm: 320, tag: "Lüks", type: "Penthouse" },
            { id: "3", image: villaPool, title: "Marina Manzaralı Villa", location: "Beylikdüzü, İstanbul", price: "₺32.000.000", beds: 6, baths: 5, sqm: 500, type: "Villa" },
          ]);
        }
      } catch (err) {
        console.error("Failed to load similar properties", err);
      }
    };

    loadProperty();
    loadSimilar();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <section className="pt-36 pb-28 min-h-[60vh] flex items-center justify-center">
          <div className="container-luxury text-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-body text-sm text-muted-foreground">İlan bilgileri yükleniyor...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (notFound || !property) {
    return (
      <Layout>
        <section className="pt-36 pb-28 min-h-[60vh] flex items-center justify-center">
          <div className="container-luxury max-w-lg text-center luxury-card p-10 md:p-14">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <Building2 size={26} className="text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-foreground mb-3">İlan Bulunamadı</h1>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              Aradığınız gayrimenkul ilanı mevcut değil veya portföy güncellemesi nedeniyle kaldırılmış olabilir.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/properties" className="luxury-btn-primary">
                Tüm İlanlara Göz At
              </Link>
              <Link to="/contact" className="luxury-btn-outline">
                Bize Ulaşın
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const numBeds = parseInt(property.rooms?.split("+")[0] || "3", 10) || 3;
  const numBaths = property.bathrooms || 1;
  const locationLabel = [property.neighborhood, property.district, property.city]
    .filter(Boolean)
    .join(", ") || property.location || "İstanbul";

  const formattedPrice = property.price
    ? property.currency === "TRY"
      ? formatTRY(property.price)
      : `${property.currency === "EUR" ? "€" : "$"}${Number(property.price).toLocaleString("en-US")}`
    : "Fiyat Belirtilmedi";

  const priceNum = Number(property.price) || 0;
  const areaNum = Number(property.gross_m2 || property.net_m2) || 0;
  const unitPriceStr = priceNum > 0 && areaNum > 0 && property.currency === "TRY"
    ? `~${Math.round(priceNum / areaNum).toLocaleString("tr-TR")} ₺/m²`
    : null;

  const displayTitle = formatTurkishTitle(property.title);

  const openLightboxAt = (idx: number) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!property) return;
    setIsPdfGenerating(true);
    toast({
      title: "PDF Hazırlanıyor",
      description: "Lüks portföy sunum broşürü oluşturuluyor...",
    });

    try {
      await generatePropertyPDF({
        id: property.id || id || "",
        title: displayTitle,
        price: property.price,
        currency: property.currency,
        location: property.location || property.address,
        district: property.district,
        city: property.city,
        bedrooms: numBeds,
        bathrooms: numBaths,
        gross_m2: property.gross_m2,
        net_m2: property.net_m2,
        floor: property.floor,
        total_floors: property.total_floors,
        building_age: property.building_age,
        heating: property.heating,
        property_type: property.property_type,
        listing_type: property.listing_type,
        ilan_no: property.ilan_no,
        tapu_durumu: property.tapu_durumu,
        credit_eligible: property.credit_eligible,
        description: property.description,
        images: cleanImages,
        agent_name: "Sarraf 34 Gayrimenkul & Yatırım",
        agent_phone: "+90 532 552 34 34",
      });
      toast({
        title: "PDF İndirildi",
        description: "Portföy sunum broşürü başarıyla cihazınıza kaydedildi.",
      });
    } catch (err: any) {
      toast({
        title: "PDF Oluşturulamadı",
        description: err.message || "Bilinmeyen bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleWhatsAppDirectShare = () => {
    if (!property) return;
    sharePropertyOnWhatsApp({
      id: property.id || id,
      title: displayTitle,
      price: property.price,
      currency: property.currency,
      location: property.location || property.address,
      district: property.district,
      city: property.city,
      gross_m2: property.gross_m2 || property.net_m2,
      bedrooms: numBeds,
      bathrooms: numBaths,
      property_type: property.property_type,
      listing_type: property.listing_type,
      ilan_no: property.ilan_no,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        text: `${displayTitle} - ${locationLabel} | Sarraf 34 Gayrimenkul`,
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
      {/* ===== REFINED LUXURY HERO HEADER ===== */}
      <section className="pt-28 md:pt-32 pb-6 bg-gradient-to-b from-background via-background to-secondary/30 border-b border-border/60">
        <div className="container-luxury">
          {/* Breadcrumb Navigation & Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border/40">
            <nav className="flex items-center gap-2 text-xs font-body text-muted-foreground flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
              <span className="text-border">/</span>
              <Link to="/properties" className="hover:text-primary transition-colors">Gayrimenkuller</Link>
              <span className="text-border">/</span>
              {property.district && (
                <>
                  <span className="text-muted-foreground">{property.district}</span>
                  <span className="text-border">/</span>
                </>
              )}
              <span className="text-foreground font-medium truncate max-w-[220px]">
                {property.ilan_no ? `İlan #${property.ilan_no}` : displayTitle}
              </span>
            </nav>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* WhatsApp Share */}
              <button
                type="button"
                onClick={handleWhatsAppDirectShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/25 transition-colors text-xs font-body"
                title="WhatsApp ile Paylaş"
              >
                <MessageCircle size={13} />
                <span className="hidden sm:inline">WhatsApp</span> Paylaş
              </button>

              {/* PDF Presentation Download */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isPdfGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors text-xs font-body font-medium disabled:opacity-60"
                title="Tek Tıkla PDF Sunum Broşürü İndir"
              >
                {isPdfGenerating ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                <span className="hidden sm:inline">PDF</span> Sunum
              </button>

              {/* Social Media Post & Story Generator */}
              <button
                type="button"
                onClick={() => setIsSocialPostOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-pink-500/10 text-pink-400 border border-pink-500/30 hover:bg-pink-500/20 transition-colors text-xs font-body font-medium"
                title="Instagram Post & Story Görseli Üret"
              >
                <Instagram size={13} />
                <span>İlan Postu</span>
              </button>

              {/* Price Drop Alert Trigger */}
              <button
                type="button"
                onClick={() => setIsPriceAlertOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors text-xs font-body font-medium"
                title="Fiyatı Düşünce Haber Ver"
              >
                <BellRing size={13} />
                <span className="hidden md:inline">Fiyat Takibi</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-card hover:bg-secondary border border-border/80 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                title="Paylaş"
              >
                <Share2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-body transition-colors ${
                  isLiked
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                    : "border-border/80 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title="Favorilere Ekle"
              >
                <Heart size={13} className={isLiked ? "fill-rose-400" : ""} /> {isLiked ? "Favoride" : "Favori"}
              </button>
            </div>
          </div>

          {/* Title, Badges and Price Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-[11px] tracking-[0.2em] uppercase font-body font-semibold gradient-gold text-primary-foreground rounded-sm shadow-sm">
                  {property.tag || (property.listing_type === "satilik" ? "Satılık" : "Kiralık")}
                </span>
                <span className="px-3 py-1 text-[11px] tracking-[0.15em] uppercase font-body font-medium bg-card text-foreground border border-border rounded-sm">
                  {property.property_type}
                </span>
                {property.tapu_durumu && (
                  <span className="px-2.5 py-1 text-[11px] font-body text-primary/90 bg-primary/10 border border-primary/20 rounded-sm">
                    {property.tapu_durumu}
                  </span>
                )}
                {property.ilan_no && (
                  <span className="px-2.5 py-1 text-[11px] font-mono text-muted-foreground bg-secondary/80 border border-border/40 rounded-sm">
                    İlan No: #{property.ilan_no}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-foreground font-medium leading-snug tracking-normal">
                {displayTitle}
              </h1>

              {/* Location & Quick Summary */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground font-body">
                <p className="flex items-center gap-1.5 text-foreground/90 font-medium">
                  <MapPin size={15} className="text-primary flex-shrink-0" />
                  <span>{locationLabel}</span>
                </p>
                {property.rooms && (
                  <>
                    <span className="text-border">•</span>
                    <span>{property.rooms} Oda</span>
                  </>
                )}
                {property.gross_m2 && (
                  <>
                    <span className="text-border">•</span>
                    <span>{property.gross_m2} m² Brüt</span>
                  </>
                )}
                {property.floor && (
                  <>
                    <span className="text-border">•</span>
                    <span>{property.floor}</span>
                  </>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="lg:col-span-4 lg:text-right">
              <div className="inline-block lg:ml-auto p-4 sm:p-5 rounded-lg bg-card/95 border border-primary/30 shadow-lg text-left lg:text-right w-full sm:w-auto">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-1">
                  Portföy Satış Bedeli
                </p>
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight">
                  {formattedPrice}
                </div>
                {unitPriceStr && (
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    Birim Fiyat: <span className="text-foreground/80 font-medium">{unitPriceStr}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MODERN PHOTO SHOWCASE SECTION ===== */}
      <section className="py-6 md:py-8 bg-secondary/20">
        <div className="container-luxury">
          {/* Gallery Toolbar / View Switcher */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                <Camera size={14} className="text-primary" />
                <span><strong className="text-foreground">{cleanImages.length}</strong> Fotoğraf</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20">
                Ultra HD
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Desktop View Mode Switcher */}
              <div className="hidden md:flex items-center p-1 bg-card border border-border/80 rounded-md text-xs font-body">
                <button
                  type="button"
                  onClick={() => setGalleryMode("grid")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
                    galleryMode === "grid"
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid size={13} /> Kolaj
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryMode("slider")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
                    galleryMode === "slider"
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Film size={13} /> Sinema Slayt
                </button>
              </div>

              <button
                type="button"
                onClick={() => openLightboxAt(currentIndex)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card hover:bg-secondary border border-border/80 text-xs font-body text-foreground transition-colors"
              >
                <Maximize2 size={13} className="text-primary" />
                <span className="hidden sm:inline">Tümünü Tam Ekran Gör</span>
                <span className="sm:hidden">Tam Ekran</span>
              </button>
            </div>
          </div>

          {/* ===== 1. BENTO GRID COLLAGE MODE (Desktop Default) ===== */}
          {galleryMode === "grid" ? (
            <div className="space-y-4">
              {/* Desktop Multi-Photo Bento Grid */}
              <div className="hidden md:grid grid-cols-12 gap-3 h-[480px] rounded-xl overflow-hidden bg-card/40 p-2 border border-border/60 shadow-md">
                {/* Main Large Feature Image (7 Cols) */}
                <div
                  onClick={() => openLightboxAt(0)}
                  className="col-span-7 h-full relative rounded-lg overflow-hidden cursor-pointer group bg-muted/60"
                >
                  <img
                    src={cleanImages[0]}
                    alt={`${displayTitle} - Ana Fotoğraf`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = heroVilla;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[11px] font-body border border-white/10">
                    Öne Çıkan Görsel
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="px-4 py-2 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-body border border-white/20 flex items-center gap-2 shadow-xl">
                      <ZoomIn size={14} className="text-primary" /> Büyütmek için tıklayın
                    </span>
                  </div>
                </div>

                {/* Secondary Grid Column (5 Cols, 2x2 Grid) */}
                <div className="col-span-5 grid grid-cols-2 gap-3 h-full">
                  {cleanImages.slice(1, 5).map((img, idx) => {
                    const actualIdx = idx + 1;
                    const isLastVisible = idx === 3 || actualIdx === cleanImages.length - 1;
                    const remainingCount = cleanImages.length - 5;

                    return (
                      <div
                        key={actualIdx}
                        onClick={() => openLightboxAt(actualIdx)}
                        className="relative h-[234px] rounded-lg overflow-hidden cursor-pointer group bg-muted/60 border border-border/40"
                      >
                        <img
                          src={img}
                          alt={`${displayTitle} - Fotoğraf ${actualIdx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = heroVilla;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                        {/* Overlay on the 4th box if more photos exist */}
                        {isLastVisible && remainingCount > 0 && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white p-3 text-center transition-all group-hover:bg-black/65">
                            <Layers size={22} className="text-primary mb-1" />
                            <span className="font-display text-sm font-semibold tracking-wide">
                              +{remainingCount} Fotoğraf
                            </span>
                            <span className="text-[11px] text-white/80 font-body mt-0.5">
                              Tüm Galeriyi Aç
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Swipeable Hero Stage */}
              <div className="md:hidden relative rounded-xl overflow-hidden bg-card border border-border/80 shadow-md">
                <div
                  className="relative h-[340px] w-full flex items-center justify-center bg-black/40 select-none"
                  onClick={() => openLightboxAt(currentIndex)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(nextImage, prevImage)}
                >
                  <img
                    src={currentMainPhoto}
                    alt={`${displayTitle} - ${currentIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = heroVilla;
                    }}
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md text-white text-xs font-mono">
                    {currentIndex + 1} / {cleanImages.length}
                  </div>
                  {cleanImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white backdrop-blur-md"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white backdrop-blur-md"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile Thumbnail Strip */}
                {cleanImages.length > 1 && (
                  <div className="p-2 bg-card border-t border-border/60 overflow-x-auto flex gap-2">
                    {cleanImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        className={`relative flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                          currentIndex === i ? "border-primary scale-95" : "border-transparent opacity-60"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ===== 2. CINEMA SLIDER STAGE (Warm, Balanced, No Huge Pitch-Black Void) ===== */
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-card border border-border/80 shadow-xl">
                {/* Ambient Soft Blur Backdrop */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
                  <img
                    src={currentMainPhoto}
                    alt=""
                    className="w-full h-full object-cover blur-3xl scale-125"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = heroVilla;
                    }}
                  />
                </div>

                {/* Main Stage */}
                <div
                  className="relative h-[360px] sm:h-[440px] md:h-[500px] w-full flex items-center justify-center p-3 sm:p-6 select-none cursor-pointer group"
                  onClick={() => openLightboxAt(currentIndex)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(nextImage, prevImage)}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentIndex}
                      src={currentMainPhoto}
                      alt={`${displayTitle} - Fotoğraf ${currentIndex + 1}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="max-h-full max-w-full object-contain rounded-md shadow-2xl z-10"
                      style={{ imageRendering: "-webkit-optimize-contrast" }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = heroVilla;
                      }}
                    />
                  </AnimatePresence>

                  {/* Hover Prompt */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/85 backdrop-blur-md text-white font-body text-xs tracking-wider uppercase border border-white/20 shadow-xl">
                      <ZoomIn size={15} className="text-primary" /> Tam Ekran HD ({currentIndex + 1} / {cleanImages.length})
                    </span>
                  </div>

                  {/* Top Right Counter & HD Tag */}
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                    <div className="px-3 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-xs font-mono tracking-wider border border-white/15">
                      {currentIndex + 1} / {cleanImages.length}
                    </div>
                  </div>

                  {/* Next / Prev Chevrons */}
                  {cleanImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110 z-30"
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
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110 z-30"
                        aria-label="Sonraki Fotoğraf"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </div>

                {/* Cinema Mode Thumbnail Strip */}
                {cleanImages.length > 1 && (
                  <div className="p-3 bg-card/90 border-t border-border/60 overflow-x-auto flex gap-2.5 scrollbar-thin">
                    {cleanImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                          currentIndex === i
                            ? "border-primary ring-2 ring-primary/40 scale-95 opacity-100"
                            : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = heroVilla;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== FULLSCREEN LIGHTBOX (SWIPE + KEYBOARD ARROWS) ===== */}
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
                  {displayTitle}
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
                  alt={`${displayTitle} - Tam Ekran ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[82vh] max-w-full object-contain rounded-md shadow-2xl"
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
                  <img src={img} alt="" className="w-full h-full object-cover" />
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

              {/* Interactive Location & Transport Section */}
              <ScrollReveal>
                <div className="mb-12">
                  <PropertyLocationMap
                    title={displayTitle}
                    price={formattedPrice}
                    location={property.location || property.address}
                    district={property.district}
                    city={property.city}
                    lat={property.lat}
                    lng={property.lng}
                  />
                </div>
              </ScrollReveal>

              {/* ===== COMPREHENSIVE MORTGAGE & TITLE DEED EXPENSES CALCULATOR ===== */}
              <ScrollReveal>
                <div className="mb-12">
                  <MortgageCalculator
                    initialPrice={Number(property.price) || 5000000}
                    propertyTitle={displayTitle}
                    propertyLocation={locationLabel}
                    ilanNo={property.ilan_no}
                  />
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
                      {/* Schedule Tour / Viewing Button */}
                      <button
                        type="button"
                        onClick={() => setIsTourModalOpen(true)}
                        className="luxury-btn-primary w-full text-center flex items-center justify-center gap-2 py-3.5 shadow-md"
                      >
                        <Calendar size={16} /> Randevu & Yer Gösterme Al
                      </button>

                      {/* WhatsApp Direct */}
                      <a
                        href={`https://wa.me/905302503252?text=${encodeURIComponent(
                          `Merhaba, "${property.title}" (İlan No: ${property.ilan_no || property.id}) ilanı hakkında detaylı bilgi ve randevu talep ediyorum.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center flex items-center justify-center gap-2 py-3 px-4 rounded-sm border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-body text-xs uppercase tracking-wider transition-colors font-medium"
                      >
                        <MessageCircle size={16} /> WhatsApp ile Danış
                      </a>

                      {/* Price Drop Alert */}
                      <button
                        type="button"
                        onClick={() => setIsPriceAlertOpen(true)}
                        className="w-full text-center flex items-center justify-center gap-2 py-3 px-4 rounded-sm border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-body text-xs uppercase tracking-wider transition-colors font-medium"
                      >
                        <BellRing size={15} /> Fiyat Düşünce Haber Ver
                      </button>

                      {/* Social Media Story Generator */}
                      <button
                        type="button"
                        onClick={() => setIsSocialPostOpen(true)}
                        className="w-full text-center flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm border border-pink-500/30 bg-pink-500/5 text-pink-400 hover:bg-pink-500/15 font-body text-xs uppercase tracking-wider transition-colors"
                      >
                        <Instagram size={14} /> Sosyal Medya Postu Hazırla
                      </button>

                      <a
                        href="tel:05302503252"
                        className="luxury-btn-outline w-full text-center flex items-center justify-center gap-2 py-3 text-xs"
                      >
                        <Phone size={14} /> Hemen Ara
                      </a>

                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        disabled={isPdfGenerating}
                        className="w-full text-center flex items-center justify-center gap-2 py-3 px-4 rounded-sm border border-primary/40 bg-primary/5 hover:bg-primary/15 text-primary font-body text-xs uppercase tracking-wider transition-colors disabled:opacity-60 font-medium"
                      >
                        {isPdfGenerating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                        Tek Tıkla PDF Sunumu İndir
                      </button>
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

      {/* ===== INTERACTIVE FEATURE MODALS ===== */}
      <PriceDropAlertModal
        isOpen={isPriceAlertOpen}
        onClose={() => setIsPriceAlertOpen(false)}
        propertyId={property.id}
        propertyTitle={displayTitle}
        propertyPrice={Number(property.price) || null}
        propertyLocation={locationLabel}
        ilanNo={property.ilan_no}
      />

      <ScheduleTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        propertyId={property.id}
        propertyTitle={displayTitle}
        propertyPrice={Number(property.price) || null}
        propertyLocation={locationLabel}
        ilanNo={property.ilan_no}
      />

      <SocialPostGenerator
        isOpen={isSocialPostOpen}
        onClose={() => setIsSocialPostOpen(false)}
        property={{
          title: displayTitle,
          price: Number(property.price) || null,
          location: locationLabel,
          district: property.district,
          city: property.city,
          rooms: property.rooms,
          gross_m2: property.gross_m2,
          property_type: property.property_type,
          listing_type: property.listing_type,
          tag: property.tag,
          images: cleanImages,
          ilan_no: property.ilan_no,
        }}
      />
    </Layout>
  );
};

export default PropertyDetails;
