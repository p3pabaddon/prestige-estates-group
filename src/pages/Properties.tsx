import { useState, useMemo, useCallback } from "react";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import PropertyCard from "@/components/PropertyCard";
import PropertyCompare, { CompareProperty } from "@/components/PropertyCompare";
import { Slider } from "@/components/ui/slider";

import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import luxuryKitchen from "@/assets/luxury-kitchen.jpg";

const allProperties = [
  { image: penthouseInterior, title: "The Sovereign Penthouse", location: "Monte Carlo, Monaco", price: "€12,500,000", priceNum: 12500000, beds: 4, baths: 5, sqm: 420, tag: "Exclusive", type: "Penthouse", lat: 43.7384, lng: 7.4246 },
  { image: waterfrontVilla, title: "Villa Aquamarine", location: "Cap Ferrat, France", price: "€8,900,000", priceNum: 8900000, beds: 6, baths: 7, sqm: 680, tag: "Waterfront", type: "Villa", lat: 43.6846, lng: 7.3275 },
  { image: luxuryBuilding, title: "Obsidian Tower Residence", location: "Dubai Marina, UAE", price: "$5,200,000", priceNum: 5200000, beds: 3, baths: 4, sqm: 310, tag: "New Listing", type: "Apartment", lat: 25.0804, lng: 55.1403 },
  { image: luxuryInterior, title: "Maison de Lumière", location: "Saint-Tropez, France", price: "€7,400,000", priceNum: 7400000, beds: 5, baths: 6, sqm: 520, tag: "Signature Villa", type: "Villa", lat: 43.2727, lng: 6.6406 },
  { image: villaPool, title: "Horizon Estate", location: "Mykonos, Greece", price: "€4,200,000", priceNum: 4200000, beds: 4, baths: 4, sqm: 380, tag: "Investment", type: "Villa", lat: 37.4467, lng: 25.3289 },
  { image: luxuryKitchen, title: "The Gallery Loft", location: "London, UK", price: "£3,800,000", priceNum: 3800000, beds: 2, baths: 3, sqm: 240, type: "Apartment", lat: 51.5074, lng: -0.1278 },
  { image: penthouseInterior, title: "Pinnacle Sky Suite", location: "New York, USA", price: "$18,500,000", priceNum: 18500000, beds: 5, baths: 6, sqm: 550, tag: "Exclusive", type: "Penthouse", lat: 40.7580, lng: -73.9855 },
  { image: waterfrontVilla, title: "Casa del Mare", location: "Amalfi Coast, Italy", price: "€6,100,000", priceNum: 6100000, beds: 4, baths: 5, sqm: 450, tag: "Waterfront", type: "Villa", lat: 40.6333, lng: 14.6029 },
  { image: luxuryBuilding, title: "The Apex Residence", location: "Singapore", price: "$8,900,000", priceNum: 8900000, beds: 3, baths: 4, sqm: 320, type: "Apartment", lat: 1.2838, lng: 103.8591 },
];

const formatPrice = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  return `${(v / 1000).toFixed(0)}K`;
};

const Properties = () => {
  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [compareList, setCompareList] = useState<CompareProperty[]>([]);
  const types = ["All", "Villa", "Penthouse", "Apartment"];

  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [sqmRange, setSqmRange] = useState([0, 800]);

  const resetFilters = () => {
    setPriceRange([0, 20000000]);
    setMinBeds(0);
    setMinBaths(0);
    setSqmRange([0, 800]);
    setActiveType("All");
    setSearchQuery("");
  };

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 20000000 || minBeds > 0 || minBaths > 0 || sqmRange[0] > 0 || sqmRange[1] < 800;

  const filtered = useMemo(() => {
    let result = activeType === "All" ? allProperties : allProperties.filter(p => p.type === activeType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }
    result = result.filter(p => p.priceNum >= priceRange[0] && p.priceNum <= priceRange[1]);
    result = result.filter(p => p.beds >= minBeds);
    result = result.filter(p => p.baths >= minBaths);
    result = result.filter(p => p.sqm >= sqmRange[0] && p.sqm <= sqmRange[1]);
    return result;
  }, [activeType, searchQuery, priceRange, minBeds, minBaths, sqmRange]);

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
      className={`px-6 py-2.5 text-xs tracking-[0.2em] uppercase font-body transition-all duration-300 ${
        active
          ? "gradient-gold text-primary-foreground"
          : "text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
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
            subtitle="Portfolio"
            title="Exceptional Properties"
            description="Browse our curated collection of the world's most desirable residences."
          />

          {/* Search Bar */}
          <ScrollReveal>
            <div className="max-w-2xl mx-auto mb-10">
              <div className="relative">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, location, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 bg-card border border-border text-foreground font-body text-sm tracking-wide placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors rounded-sm"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Type Filters + Toggles */}
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {types.map((t) => (
                <FilterButton key={t} label={t} active={activeType === t} onClick={() => setActiveType(t)} />
              ))}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-2.5 text-xs tracking-[0.2em] uppercase font-body transition-all duration-300 flex items-center gap-2 ${
                  showFilters
                    ? "gradient-gold text-primary-foreground"
                    : "text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters && "•"}
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-6 py-2.5 text-xs tracking-[0.2em] uppercase font-body transition-all duration-300 flex items-center gap-2 ${
                  showMap
                    ? "gradient-gold text-primary-foreground"
                    : "text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <MapPin size={14} /> Map
              </button>
            </div>
          </ScrollReveal>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <ScrollReveal>
              <div className="luxury-card p-6 md:p-8 mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg text-foreground">Refine Your Search</h3>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="font-body text-xs text-primary hover:text-foreground transition-colors flex items-center gap-1">
                      <X size={12} /> Reset All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Price Range */}
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-4 block">
                      Price Range
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={20000000}
                      step={500000}
                      className="mb-3"
                    />
                    <div className="flex justify-between font-body text-xs text-muted-foreground">
                      <span>${formatPrice(priceRange[0])}</span>
                      <span>${formatPrice(priceRange[1])}</span>
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-4 block">
                      Min Bedrooms
                    </label>
                    <div className="flex gap-2">
                      {[0, 2, 3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          onClick={() => setMinBeds(n)}
                          className={`w-10 h-10 text-xs font-body rounded-sm transition-all duration-300 ${
                            minBeds === n
                              ? "gradient-gold text-primary-foreground"
                              : "border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {n === 0 ? "Any" : n + "+"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-4 block">
                      Min Bathrooms
                    </label>
                    <div className="flex gap-2">
                      {[0, 2, 3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          onClick={() => setMinBaths(n)}
                          className={`w-10 h-10 text-xs font-body rounded-sm transition-all duration-300 ${
                            minBaths === n
                              ? "gradient-gold text-primary-foreground"
                              : "border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {n === 0 ? "Any" : n + "+"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Area Range */}
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-4 block">
                      Area (m²)
                    </label>
                    <Slider
                      value={sqmRange}
                      onValueChange={setSqmRange}
                      min={0}
                      max={800}
                      step={50}
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

          {/* Map View */}
          {showMap && (
            <ScrollReveal>
              <div className="mb-12 luxury-card overflow-hidden">
                <div className="relative w-full h-[400px] md:h-[500px] bg-secondary">
                  <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <rect width="1000" height="500" fill="hsl(30 8% 10%)" />
                    <path d="M450,100 L480,90 L520,95 L540,110 L535,130 L550,140 L545,160 L530,170 L510,165 L490,175 L470,170 L460,155 L445,150 L440,130 L450,115 Z" fill="hsl(30 6% 18%)" stroke="hsl(38 50% 55% / 0.2)" strokeWidth="0.5" />
                    <path d="M440,180 L480,175 L520,180 L540,200 L545,240 L540,280 L520,320 L500,340 L480,335 L460,300 L445,260 L435,220 L440,200 Z" fill="hsl(30 6% 18%)" stroke="hsl(38 50% 55% / 0.2)" strokeWidth="0.5" />
                    <path d="M550,80 L620,75 L700,85 L760,100 L780,130 L770,160 L740,180 L700,190 L660,185 L620,170 L580,160 L555,140 L545,120 Z" fill="hsl(30 6% 18%)" stroke="hsl(38 50% 55% / 0.2)" strokeWidth="0.5" />
                    <path d="M100,80 L180,70 L250,80 L280,100 L290,130 L280,160 L250,180 L220,190 L180,185 L140,170 L110,150 L95,120 Z" fill="hsl(30 6% 18%)" stroke="hsl(38 50% 55% / 0.2)" strokeWidth="0.5" />
                    <path d="M200,220 L240,210 L270,230 L280,270 L275,320 L260,360 L240,380 L220,375 L205,340 L195,300 L190,260 Z" fill="hsl(30 6% 18%)" stroke="hsl(38 50% 55% / 0.2)" strokeWidth="0.5" />
                    <path d="M750,280 L800,270 L840,280 L850,310 L840,340 L810,350 L780,340 L755,320 L745,300 Z" fill="hsl(30 6% 18%)" stroke="hsl(38 50% 55% / 0.2)" strokeWidth="0.5" />
                    {filtered.map((p, i) => {
                      const x = ((p.lng + 180) / 360) * 1000;
                      const y = ((90 - p.lat) / 180) * 500;
                      const isSelected = selectedProperty === i;
                      return (
                        <g key={p.title} className="cursor-pointer" onClick={() => setSelectedProperty(isSelected ? null : i)}>
                          <circle cx={x} cy={y} r={isSelected ? 16 : 10} fill="hsl(38 50% 55% / 0.15)" className="animate-pulse" />
                          <circle cx={x} cy={y} r={isSelected ? 7 : 5} fill="hsl(38 50% 55%)" stroke="hsl(30 10% 6%)" strokeWidth="2" />
                          {isSelected && (
                            <>
                              <rect x={x - 70} y={y - 45} width="140" height="32" rx="2" fill="hsl(30 8% 10%)" stroke="hsl(38 50% 55% / 0.3)" strokeWidth="1" />
                              <text x={x} y={y - 25} textAnchor="middle" fill="hsl(40 20% 92%)" fontSize="9" fontFamily="Inter, sans-serif">{p.title}</text>
                            </>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                  {selectedProperty !== null && filtered[selectedProperty] && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 glass-panel rounded-sm p-4">
                      <div className="flex gap-3">
                        <img src={filtered[selectedProperty].image} alt={filtered[selectedProperty].title} className="w-20 h-20 object-cover rounded-sm" />
                        <div>
                          <h4 className="font-display text-sm text-foreground">{filtered[selectedProperty].title}</h4>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">{filtered[selectedProperty].location}</p>
                          <p className="font-display text-sm text-primary mt-1">{filtered[selectedProperty].price}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Results count */}
          <p className="text-center text-muted-foreground font-body text-xs tracking-wider uppercase mb-8">
            {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 0.08}>
                <PropertyCard
                  {...p}
                  isComparing={!!compareList.find(c => c.title === p.title)}
                  onToggleCompare={() => toggleCompare(p)}
                  compareDisabled={compareList.length >= 4}
                />
              </ScrollReveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-foreground mb-2">No Properties Found</p>
              <p className="font-body text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
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
