import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X, Building2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import PropertyCard from "@/components/PropertyCard";
import PropertyCompare, { CompareProperty } from "@/components/PropertyCompare";
import IstanbulMap from "@/components/IstanbulMap";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { formatTRY } from "@/lib/crm";

import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import luxuryKitchen from "@/assets/luxury-kitchen.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

export interface PropertyDbRow {
  id: string;
  title: string;
  rooms?: string | null;
  price?: number | null;
  currency?: string | null;
  images?: string[] | null;
  neighborhood?: string | null;
  district?: string | null;
  city?: string | null;
  location?: string | null;
  bathrooms?: number | null;
  gross_m2?: number | null;
  net_m2?: number | null;
  tag?: string | null;
  featured?: boolean | null;
  listing_type?: string | null;
  property_type?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface PropertyItem {
  id?: string;
  ilan_no?: string;
  image: string;
  title: string;
  location: string;
  price: string;
  priceNum: number;
  beds: number;
  baths: number;
  sqm: number;
  tag?: string;
  type: string;
  listingType?: string;
  lat: number;
  lng: number;
}

const formatPrice = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M ₺`;
  return `${(v / 1000).toFixed(0)}K ₺`;
};

const Properties = () => {
  const [propertiesList, setPropertiesList] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMapProperty, setSelectedMapProperty] = useState<PropertyItem | null>(null);
  const [compareList, setCompareList] = useState<CompareProperty[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("published", true)
          .neq("status", "satildi")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase properties error:", error);
          return;
        }

        if (data && data.length > 0) {
          const mapped: PropertyItem[] = (data as PropertyDbRow[]).map((item) => {
            const numBeds = parseInt(item.rooms?.split("+")[0] || "3", 10) || 3;
            const priceVal = Number(item.price) || 0;
            const formattedPrice = item.price
              ? item.currency === "TRY" || !item.currency
                ? formatTRY(item.price)
                : `${item.currency === "EUR" ? "€" : "$"}${priceVal.toLocaleString("en-US")}`
              : "Fiyat Belirtilmedi";

            const primaryImg =
              (item.images && item.images.length > 0 && item.images[0]) ||
              heroVilla;

            const loc = [item.neighborhood, item.district, item.city]
              .filter(Boolean)
              .join(", ") || item.location || "Esenyurt, İstanbul";

            return {
              id: item.id,
              ilan_no: (item as any).ilan_no || undefined,
              image: primaryImg,
              title: item.title,
              location: loc,
              price: formattedPrice,
              priceNum: priceVal,
              beds: numBeds,
              baths: item.bathrooms || 1,
              sqm: item.gross_m2 || item.net_m2 || 120,
              tag: item.tag || (item.featured ? "Öne Çıkan" : item.listing_type === "satilik" ? "Satılık" : "Kiralık"),
              type: item.property_type || "Daire",
              listingType: item.listing_type || "satilik",
              lat: item.lat || 41.0182,
              lng: item.lng || 28.6620,
            };
          });
          setPropertiesList(mapped);
        } else {
          setPropertiesList([]);
        }
      } catch (err) {
        console.error("Failed to load properties", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const types = useMemo(() => {
    const set = new Set(["Tümü"]);
    propertiesList.forEach((p) => {
      if (p.type) set.add(p.type);
    });
    return Array.from(set);
  }, [propertiesList]);

  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [sqmRange, setSqmRange] = useState([0, 2000]);

  const resetFilters = () => {
    setPriceRange([0, 100000000]);
    setMinBeds(0);
    setMinBaths(0);
    setSqmRange([0, 2000]);
    setActiveType("Tümü");
    setSearchQuery("");
  };

  const hasActiveFilters =
    priceRange[0] > 0 ||
    priceRange[1] < 100000000 ||
    minBeds > 0 ||
    minBaths > 0 ||
    sqmRange[0] > 0 ||
    sqmRange[1] < 2000;

  const filtered = useMemo(() => {
    let result =
      activeType === "Tümü"
        ? propertiesList
        : propertiesList.filter((p) => p.type.toLowerCase() === activeType.toLowerCase());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }
    if (priceRange[1] < 100000000 || priceRange[0] > 0) {
      result = result.filter(
        (p) => p.priceNum >= priceRange[0] && (priceRange[1] >= 100000000 || p.priceNum <= priceRange[1])
      );
    }
    if (minBeds > 0) {
      result = result.filter((p) => p.beds >= minBeds);
    }
    if (minBaths > 0) {
      result = result.filter((p) => p.baths >= minBaths);
    }
    if (sqmRange[0] > 0 || sqmRange[1] < 2000) {
      result = result.filter((p) => p.sqm >= sqmRange[0] && p.sqm <= sqmRange[1]);
    }
    return result;
  }, [propertiesList, activeType, searchQuery, priceRange, minBeds, minBaths, sqmRange]);

  const toggleCompare = useCallback((property: CompareProperty) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.title === property.title);
      if (exists) return prev.filter(p => p.title !== property.title);
      if (prev.length >= 4) return prev;
      return [...prev, property];
    });
  }, []);

  const FilterButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-xs tracking-[0.18em] uppercase font-body transition-all duration-300 rounded-md shadow-sm ${
        active
          ? "gradient-gold text-primary-foreground font-semibold shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
          : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground hover:bg-secondary/40"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle="Portföy"
            title="Öne Çıkan Gayrimenkuller"
            description="Sarraf 34 güvencesiyle İstanbul'un en seçkin konut ve yatırım fırsatlarını keşfedin."
          />

          {/* Search Bar */}
          <ScrollReveal>
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="İlan başlığı, ilçe veya konut tipine göre arayın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 bg-card border border-border text-foreground font-body text-sm tracking-wide placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all rounded-lg shadow-sm"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Type Filters + Toggles */}
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
              {types.map((t) => (
                <FilterButton key={t} label={t} active={activeType === t} onClick={() => setActiveType(t)} />
              ))}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-2.5 text-xs tracking-[0.18em] uppercase font-body transition-all duration-300 flex items-center gap-2 rounded-md shadow-sm ${
                  showFilters
                    ? "gradient-gold text-primary-foreground font-semibold shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <SlidersHorizontal size={14} /> Filtreler {hasActiveFilters && "•"}
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-5 py-2.5 text-xs tracking-[0.18em] uppercase font-body transition-all duration-300 flex items-center gap-2 rounded-md shadow-sm ${
                  showMap
                    ? "gradient-gold text-primary-foreground font-semibold shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <MapPin size={14} /> Harita {showMap ? "(Açık)" : ""}
              </button>
            </div>
          </ScrollReveal>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <ScrollReveal>
              <div className="luxury-card p-6 md:p-8 mb-10 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg text-foreground">Aramayı Detaylandır</h3>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="font-body text-xs text-primary hover:text-foreground transition-colors flex items-center gap-1">
                      <X size={12} /> Tümünü Sıfırla
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Price Range */}
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-4 block">
                      Fiyat Aralığı
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={50000000}
                      step={500000}
                      className="mb-3"
                    />
                    <div className="flex justify-between font-body text-xs text-muted-foreground">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-4 block">
                      Oda Sayısı
                    </label>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setMinBeds(n)}
                          className={`w-10 h-10 text-xs font-body rounded-sm transition-all duration-300 ${
                            minBeds === n
                              ? "gradient-gold text-primary-foreground font-bold"
                              : "border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {n === 0 ? "Tümü" : n + "+"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-4 block">
                      Banyo Sayısı
                    </label>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          onClick={() => setMinBaths(n)}
                          className={`w-10 h-10 text-xs font-body rounded-sm transition-all duration-300 ${
                            minBaths === n
                              ? "gradient-gold text-primary-foreground font-bold"
                              : "border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {n === 0 ? "Tümü" : n + "+"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Area Range */}
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-4 block">
                      Alan (m²)
                    </label>
                    <Slider
                      value={sqmRange}
                      onValueChange={setSqmRange}
                      min={0}
                      max={600}
                      step={25}
                      className="mb-3"
                    />
                    <div className="flex justify-between font-body text-xs text-muted-foreground">
                      <span>{sqmRange[0]} m²</span>
                      <span>{sqmRange[1]} m²</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Interactive Istanbul Map View */}
          {showMap && (
            <ScrollReveal>
              <div className="mb-12">
                <IstanbulMap
                  properties={filtered}
                  selectedProperty={selectedMapProperty}
                  onSelectProperty={setSelectedMapProperty}
                />
              </div>
            </ScrollReveal>
          )}

          {loading ? (
            <div className="text-center py-24 text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-body text-sm">Gayrimenkul portföyü yükleniyor...</p>
            </div>
          ) : propertiesList.length === 0 ? (
            <ScrollReveal>
              <div className="luxury-card p-12 md:p-16 text-center max-w-2xl mx-auto border-primary/30 bg-secondary/30 my-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                  <Building2 size={28} className="text-primary" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                  Portföyümüz Güncelleniyor
                </h3>
                <p className="text-muted-foreground font-body text-sm md:text-base leading-relaxed mb-8">
                  Sarraf 34 güncel gayrimenkul ve konut portföyü sisteme aktarılmaktadır. Çok yakında seçkin yeni ilanlarımızla yayındayız.
                  Aradığınız kriterlerdeki konut veya ticari mülk taleplerinizi iletmek için bizimle iletişime geçebilirsiniz.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/contact" className="luxury-btn-primary">
                    Özel Mülk Talebi İletin
                  </Link>
                  <a
                    href="https://wa.me/905302503252"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-btn-outline"
                  >
                    WhatsApp ile Danışın
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <>
              {/* Results count */}
              <p className="text-center text-muted-foreground font-body text-xs tracking-wider uppercase mb-8">
                {filtered.length} {filtered.length === 1 ? "ilan bulundu" : "ilan bulundu"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((p, i) => (
                  <ScrollReveal key={p.id || p.title + i} delay={i * 0.08}>
                    <PropertyCard
                      {...p}
                      isComparing={!!compareList.find((c) => c.title === p.title)}
                      onToggleCompare={() => toggleCompare(p)}
                      compareDisabled={compareList.length >= 4}
                    />
                  </ScrollReveal>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20 luxury-card p-8 max-w-lg mx-auto mt-6">
                  <p className="font-display text-2xl text-foreground mb-2">İlan Bulunamadı</p>
                  <p className="font-body text-sm text-muted-foreground mb-6">
                    Arama kriterlerinize veya seçilen filtrelere uygun ilan bulunamadı.
                  </p>
                  <button onClick={resetFilters} className="luxury-btn-outline text-xs">
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Compare bar */}
      <AnimatePresence>
        <PropertyCompare
          items={compareList}
          onRemove={(title) => setCompareList(prev => prev.filter(p => p.title !== title))}
          onClear={() => setCompareList([])}
        />
      </AnimatePresence>
    </Layout>
  );
};

export default Properties;
