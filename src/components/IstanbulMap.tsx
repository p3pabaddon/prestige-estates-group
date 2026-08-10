import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Maximize2, ExternalLink, Bed, Bath, Maximize, Building2 } from "lucide-react";
import { PropertyItem } from "@/pages/Properties";
import { getPropertyDetailUrl } from "@/lib/propertyUrl";

// Approximate coordinates for Istanbul districts to ensure every listing accurately appears in Istanbul
const ISTANBUL_DISTRICT_COORDS: Record<string, [number, number]> = {
  esenyurt: [41.0342, 28.6801],
  beylikdüzü: [41.0028, 28.6439],
  beylikduzu: [41.0028, 28.6439],
  avcılar: [40.9798, 28.7217],
  avcilar: [40.9798, 28.7217],
  büyükçekmece: [41.0219, 28.5838],
  buyukcekmece: [41.0219, 28.5838],
  küçükçekmece: [41.0011, 28.7844],
  kucukcekmece: [41.0011, 28.7844],
  bahçelievler: [40.9996, 28.8587],
  bahcelievler: [40.9996, 28.8587],
  bakırköy: [40.9791, 28.8719],
  bakirkoy: [40.9791, 28.8719],
  zeytinburnu: [40.9902, 28.9038],
  fatih: [41.0182, 28.9497],
  beşiktaş: [41.0428, 29.0077],
  besiktas: [41.0428, 29.0077],
  sarıyer: [41.1688, 29.0573],
  sariyer: [41.1688, 29.0573],
  şişli: [41.0602, 28.9877],
  sisli: [41.0602, 28.9877],
  kadıköy: [40.9910, 29.0270],
  kadikoy: [40.9910, 29.0270],
  üsküdar: [41.0267, 29.0152],
  uskudar: [41.0267, 29.0152],
  başakşehir: [41.0964, 28.8021],
  basaksehir: [41.0964, 28.8021],
  eyüpsultan: [41.0480, 28.9341],
  eyupsultan: [41.0480, 28.9341],
  kağıthane: [41.0812, 28.9734],
  kagithane: [41.0812, 28.9734],
  maltepe: [40.9248, 29.1309],
  kartal: [40.8886, 29.1856],
  pendik: [40.8791, 29.2333],
  ataşehir: [40.9847, 29.1067],
  atasehir: [40.9847, 29.1067],
  çekmeköy: [41.0353, 29.1738],
  cekmekoy: [41.0353, 29.1738],
  beykoz: [41.1176, 29.0988],
  silivri: [41.0742, 28.2464],
  ümraniye: [41.0256, 29.1167],
  umraniye: [41.0256, 29.1167],
  bağcılar: [41.0345, 28.8572],
  bagcilar: [41.0345, 28.8572],
  arnavutköy: [41.1850, 28.7408],
  arnavutkoy: [41.1850, 28.7408],
  sultangazi: [41.1044, 28.8681],
  gaziosmanpaşa: [41.0577, 28.9157],
  gaziosmanpasa: [41.0577, 28.9157],
  esenler: [41.0381, 28.8876],
  güngören: [41.0212, 28.8722],
  gungoren: [41.0212, 28.8722],
  tuzla: [40.8167, 29.3000],
  sancaktepe: [40.9911, 29.2294],
  sultanbeyli: [40.9667, 29.2667],
  şile: [41.1764, 29.6133],
  sile: [41.1764, 29.6133],
  adalar: [40.8753, 29.1294],
  çatalca: [41.1442, 28.4608],
  catalca: [41.1442, 28.4608],
};

function getPropertyCoordinates(property: PropertyItem, index: number): [number, number] {
  // If property already has accurate Istanbul lat/lng in valid ranges
  if (
    property.lat &&
    property.lng &&
    property.lat >= 40.7 &&
    property.lat <= 41.6 &&
    property.lng >= 28.0 &&
    property.lng <= 29.9 &&
    !(Math.abs(property.lat - 41.0082) < 0.0001 && Math.abs(property.lng - 28.9784) < 0.0001)
  ) {
    return [property.lat, property.lng];
  }

  // Determine district from location or title
  const textToScan = `${property.location} ${property.title}`.toLowerCase();
  for (const [district, coords] of Object.entries(ISTANBUL_DISTRICT_COORDS)) {
    if (textToScan.includes(district)) {
      // Add subtle deterministic jitter so multiple properties in same district don't stack directly on top
      const jitterLat = ((index % 5) - 2) * 0.004;
      const jitterLng = (((index * 3) % 5) - 2) * 0.004;
      return [coords[0] + jitterLat, coords[1] + jitterLng];
    }
  }

  // Default to Esenyurt / Beylikdüzü center (Sarraf 34 primary hub) with offset
  const baseLat = 41.0182;
  const baseLng = 28.6620;
  const jitterLat = ((index % 7) - 3) * 0.006;
  const jitterLng = (((index * 5) % 7) - 3) * 0.006;
  return [baseLat + jitterLat, baseLng + jitterLng];
}

interface IstanbulMapProps {
  properties: PropertyItem[];
  selectedProperty: PropertyItem | null;
  onSelectProperty: (property: PropertyItem | null) => void;
}

export default function IstanbulMap({
  properties,
  selectedProperty,
  onSelectProperty,
}: IstanbulMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  // Extract unique districts present in current properties
  const districts = Array.from(
    new Set(
      properties
        .map((p) => {
          const parts = p.location.split(",");
          return (parts[0] || "").trim();
        })
        .filter(Boolean)
    )
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Istanbul (Esenyurt / Beylikdüzü / Bosphorus view)
    const map = L.map(mapContainerRef.current, {
      center: [41.0150, 28.7500],
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false,
    });

    // Luxury Dark CartoDB Matter Tile Layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Sarraf 34 Haritası',
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    // Custom positioned zoom control
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    mapInstanceRef.current = map;

    // Trigger invalidateSize to ensure tiles render immediately after mounting
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when properties or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    properties.forEach((property, idx) => {
      const coords = getPropertyCoordinates(property, idx);
      bounds.extend(coords);

      const isSelected = selectedProperty?.id === property.id || selectedProperty?.title === property.title;

      // Extract short price for badge
      const shortPrice = property.price.split("₺")[1]?.trim().split(" ")[0] || property.price;

      // Create Custom Luxury Gold Pin Icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-gold-pin",
        html: `
          <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
            isSelected ? "scale-125 z-50" : "hover:scale-115 z-10"
          }">
            <div class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-tight shadow-2xl flex items-center gap-1.5 border transition-all ${
              isSelected
                ? "bg-amber-400 text-black border-amber-300 ring-4 ring-amber-400/40 shadow-amber-500/50"
                : "bg-stone-900/95 text-amber-300 border-amber-500/50 hover:bg-amber-500 hover:text-black hover:border-amber-400"
            }">
              <span class="w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black animate-ping" : "bg-amber-400"}"></span>
              <span>${shortPrice}</span>
            </div>
            <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] ${
              isSelected ? "border-t-amber-400" : "border-t-stone-900/95"
            }"></div>
          </div>
        `,
        iconSize: [80, 32],
        iconAnchor: [40, 30],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        onSelectProperty(property);
        map.setView(coords, Math.max(map.getZoom(), 13), { animate: true });
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have valid coordinates
    if (properties.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [properties, selectedProperty, onSelectProperty]);

  const [activeRegion, setActiveRegion] = useState<"all" | "avrupa" | "esenyurt">("esenyurt");

  // Quick Zoom Helper functions
  const zoomToEsenyurt = () => {
    setActiveRegion("esenyurt");
    mapInstanceRef.current?.setView([41.0182, 28.6620], 13, { animate: true });
  };

  const zoomToAvrupa = () => {
    setActiveRegion("avrupa");
    mapInstanceRef.current?.setView([41.0450, 28.7500], 11, { animate: true });
  };

  const zoomToIstanbul = () => {
    setActiveRegion("all");
    mapInstanceRef.current?.setView([41.0150, 28.9500], 10, { animate: true });
  };

  const getRegionBtnClass = (region: "all" | "avrupa" | "esenyurt") => {
    return activeRegion === region
      ? "px-2.5 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary transition-colors border border-primary/40 font-semibold shadow-sm"
      : "px-2.5 py-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/60 font-normal";
  };

  return (
    <div className="luxury-card overflow-hidden border border-border/80 rounded-xl shadow-2xl relative">
      {/* Top Map Action & Filter Toolbar */}
      <div className="p-3 sm:p-4 bg-card/95 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs font-body">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/10 text-primary">
            <MapPin size={16} />
          </div>
          <div>
            <span className="font-semibold text-foreground tracking-wide">İstanbul Gayrimenkul Haritası</span>
            <p className="text-[11px] text-muted-foreground">
              {properties.length} Aktif İlan Konumlandırıldı
            </p>
          </div>
        </div>

        {/* Quick Region Jump Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">Hızlı Odaklan:</span>
          <button
            type="button"
            onClick={zoomToIstanbul}
            className={getRegionBtnClass("all")}
          >
            Tüm İstanbul
          </button>
          <button
            type="button"
            onClick={zoomToAvrupa}
            className={getRegionBtnClass("avrupa")}
          >
            Avrupa Yakası
          </button>
          <button
            type="button"
            onClick={zoomToEsenyurt}
            className={getRegionBtnClass("esenyurt")}
          >
            Esenyurt & Beylikdüzü
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[450px] sm:h-[550px] bg-zinc-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Property Popup Card (Floating on Map) */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="luxury-card bg-card/95 backdrop-blur-xl p-3.5 border border-primary/40 shadow-2xl rounded-lg">
              <div className="flex gap-3">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden flex-shrink-0 bg-muted border border-border/40">
                  <img
                    src={selectedProperty.image}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary text-primary-foreground">
                    {selectedProperty.type}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] font-medium text-primary uppercase tracking-wider">
                        {selectedProperty.listingType === "satilik" ? "Satılık" : "Kiralık"}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectProperty(null)}
                        className="text-muted-foreground hover:text-foreground text-xs p-0.5"
                      >
                        ✕
                      </button>
                    </div>
                    <h4 className="font-display text-sm font-semibold text-foreground truncate mt-0.5" title={selectedProperty.title}>
                      {selectedProperty.title}
                    </h4>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 truncate">
                      <MapPin size={11} className="text-primary flex-shrink-0" />
                      <span>{selectedProperty.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
                    <div>
                      <p className="font-display text-sm sm:text-base text-primary font-bold">
                        {selectedProperty.price}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{selectedProperty.beds} Oda</span>
                        <span>•</span>
                        <span>{selectedProperty.sqm} m²</span>
                      </div>
                    </div>

                    <Link
                      to={getPropertyDetailUrl({ id: selectedProperty.id, title: selectedProperty.title, property_type: selectedProperty.property_type, listing_type: selectedProperty.listing_type })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      <span>İncele</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Legend Overlay */}
        <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-body text-white">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>İlan Konumu (Tıklayarak İnceleyin)</span>
        </div>
      </div>
    </div>
  );
}
