import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, ExternalLink, Bus, School, ShoppingBag, HeartPulse, Building2, CheckCircle2 } from "lucide-react";

// District fallback coordinates in Istanbul
const DISTRICT_COORDS: Record<string, [number, number]> = {
  "Esenyurt": [41.0342, 28.6801],
  "Beylikdüzü": [41.0028, 28.6439],
  "Avcılar": [40.9798, 28.7217],
  "Büyükçekmece": [41.0219, 28.5838],
  "Küçükçekmece": [41.0011, 28.7844],
  "Başakşehir": [41.0964, 28.8021],
  "Bahçelievler": [40.9996, 28.8587],
  "Bakırköy": [40.9791, 28.8719],
  "Zeytinburnu": [40.9902, 28.9038],
  "Fatih": [41.0182, 28.9497],
  "Şişli": [41.0602, 28.9877],
  "Beşiktaş": [41.0428, 29.0077],
  "Sarıyer": [41.1688, 29.0573],
  "Kadıköy": [40.9910, 29.0270],
  "Üsküdar": [41.0267, 29.0152],
  "Ataşehir": [40.9847, 29.1067],
  "Maltepe": [40.9248, 29.1309],
  "Kartal": [40.8886, 29.1856],
  "Pendik": [40.8791, 29.2333],
};

interface PropertyLocationMapProps {
  title: string;
  price?: string;
  location?: string | null;
  district?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export default function PropertyLocationMap({
  title,
  price,
  location,
  district = "Esenyurt",
  city = "İstanbul",
  lat,
  lng,
}: PropertyLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Determine actual coordinates
  let propertyLat = lat;
  let propertyLng = lng;

  if (!propertyLat || !propertyLng || propertyLat < 40.5 || propertyLat > 41.8) {
    const fallback = (district && DISTRICT_COORDS[district]) || DISTRICT_COORDS["Esenyurt"];
    propertyLat = fallback[0];
    propertyLng = fallback[1];
  }

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [propertyLat, propertyLng],
      zoom: 14,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      scrollWheelZoom: false, // Prevent page scroll hijack
    });

    // High contrast tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Sarraf 34 Gayrimenkul',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Luxury Golden Pin
    const goldPin = L.divIcon({
      className: "property-detail-gold-pin",
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer">
          <div class="px-3 py-1.5 rounded-md bg-amber-500 text-black font-bold text-[11px] tracking-wider uppercase shadow-2xl flex items-center gap-1.5 border-2 border-amber-300 ring-4 ring-amber-500/30">
            <span class="w-2 h-2 rounded-full bg-black animate-pulse"></span>
            <span>${price || "SARRAF 34"}</span>
          </div>
          <div class="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-amber-500 -mt-0.5"></div>
          <div class="w-4 h-1.5 bg-black/40 rounded-full blur-[1px] mt-0.5"></div>
        </div>
      `,
      iconSize: [110, 48],
      iconAnchor: [55, 46],
    });

    const marker = L.marker([propertyLat, propertyLng], { icon: goldPin }).addTo(map);
    
    // Popup
    const popupContent = `
      <div style="font-family: inherit; padding: 4px; max-width: 200px;">
        <h4 style="font-weight: 700; font-size: 13px; margin: 0 0 4px; color: #1a1a1a;">${title}</h4>
        <p style="font-size: 11px; margin: 0 0 6px; color: #666;">${location || [district, city].filter(Boolean).join(", ")}</p>
        <span style="font-weight: 700; color: #b45309; font-size: 13px;">${price || ""}</span>
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [propertyLat, propertyLng, title, price, location, district, city]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${propertyLat},${propertyLng}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${propertyLat},${propertyLng}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <h3 className="font-display text-xl sm:text-2xl text-foreground font-semibold flex items-center gap-2">
            <MapPin className="text-primary" size={22} />
            <span>Konum ve Çevre Bilgisi</span>
          </h3>
          <p className="text-muted-foreground font-body text-xs mt-1">
            {[location, district, city].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-body font-medium transition-colors shadow-sm"
          >
            <Navigation size={14} className="text-primary" />
            <span>Google Haritalar</span>
            <ExternalLink size={11} className="text-muted-foreground" />
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-body font-medium transition-colors shadow-sm"
          >
            <span>Apple Maps</span>
            <ExternalLink size={11} className="text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative w-full h-[360px] md:h-[420px] rounded-lg overflow-hidden border border-border shadow-md">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Location Advantage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="p-4 rounded-md bg-card border border-border/80 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bus size={17} />
          </div>
          <h4 className="font-display text-sm font-semibold text-foreground">Toplu Taşıma & E-5</h4>
          <p className="text-muted-foreground font-body text-xs leading-relaxed">
            Metrobüs, otobüs durakları ve ana arterlere yürüme ve kısa sürüş mesafesinde.
          </p>
        </div>

        <div className="p-4 rounded-md bg-card border border-border/80 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <School size={17} />
          </div>
          <h4 className="font-display text-sm font-semibold text-foreground">Eğitim Kurumları</h4>
          <p className="text-muted-foreground font-body text-xs leading-relaxed">
            Devlet okulları, seçkin özel kolejler ve üniversite kampüslerine yakın konum.
          </p>
        </div>

        <div className="p-4 rounded-md bg-card border border-border/80 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShoppingBag size={17} />
          </div>
          <h4 className="font-display text-sm font-semibold text-foreground">Alışveriş & Sosyal</h4>
          <p className="text-muted-foreground font-body text-xs leading-relaxed">
            Zincir marketler, semt pazarları, popüler AVM'ler ve sosyal alanlar çevresinde.
          </p>
        </div>

        <div className="p-4 rounded-md bg-card border border-border/80 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HeartPulse size={17} />
          </div>
          <h4 className="font-display text-sm font-semibold text-foreground">Sağlık Merkezleri</h4>
          <p className="text-muted-foreground font-body text-xs leading-relaxed">
            Devlet ve özel hastaneler, poliklinikler ile eczanelere çok rahat erişim imkanı.
          </p>
        </div>
      </div>
    </div>
  );
}
