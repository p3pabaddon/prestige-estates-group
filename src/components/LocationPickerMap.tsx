import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Compass, CheckCircle2 } from "lucide-react";

// Predefined center coordinates for Istanbul districts
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
  "Kağıthane": [41.0812, 28.9734],
  "Eyüpsultan": [41.0480, 28.9341],
  "Kadıköy": [40.9910, 29.0270],
  "Üsküdar": [41.0267, 29.0152],
  "Ataşehir": [40.9847, 29.1067],
  "Maltepe": [40.9248, 29.1309],
  "Kartal": [40.8886, 29.1856],
  "Pendik": [40.8791, 29.2333],
  "Ümraniye": [41.0256, 29.1167],
  "Çekmeköy": [41.0353, 29.1738],
  "Beykoz": [41.1176, 29.0988],
  "Silivri": [41.0742, 28.2464],
  "Çatalca": [41.1442, 28.4608],
  "Arnavutköy": [41.1850, 28.7408],
};

interface LocationPickerMapProps {
  lat?: number | null;
  lng?: number | null;
  district?: string | null;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({
  lat,
  lng,
  district,
  onChange,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default coordinate if none provided (Esenyurt / Beylikdüzü hub)
  const currentLat = lat && lat >= 40.5 && lat <= 41.8 ? lat : 41.0342;
  const currentLng = lng && lng >= 28.0 && lng <= 29.9 ? lng : 28.6801;

  // Custom Gold Draggable Pin Icon
  const createPinIcon = () => {
    return L.divIcon({
      className: "custom-picker-gold-pin",
      html: `
        <div class="relative flex flex-col items-center cursor-grab active:cursor-grabbing group">
          <div class="px-2.5 py-1 rounded-full bg-amber-500 text-black font-bold text-[10px] tracking-wider uppercase shadow-xl flex items-center gap-1 border-2 border-amber-300 ring-4 ring-amber-500/30">
            <span class="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>
            <span>İlan Konumu</span>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-500 -mt-0.5"></div>
          <div class="w-2.5 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5"></div>
        </div>
      `,
      iconSize: [90, 42],
      iconAnchor: [45, 40],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: 13,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: true,
    });

    // Dark Map Tile Layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Sarraf 34 Konum Belirleyici',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Initial Marker
    const marker = L.marker([currentLat, currentLng], {
      draggable: true,
      icon: createPinIcon(),
    }).addTo(map);

    // Handle Drag End
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
    });

    // Handle Map Click (moves marker)
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      const formattedLat = Number(clickLat.toFixed(6));
      const formattedLng = Number(clickLng.toFixed(6));
      marker.setLatLng([formattedLat, formattedLng]);
      onChange(formattedLat, formattedLng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position when lat/lng props change externally
  useEffect(() => {
    if (markerRef.current && lat && lng) {
      const markerPos = markerRef.current.getLatLng();
      if (Math.abs(markerPos.lat - lat) > 0.0001 || Math.abs(markerPos.lng - lng) > 0.0001) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current?.setView([lat, lng], mapInstanceRef.current.getZoom(), { animate: true });
      }
    }
  }, [lat, lng]);

  const setDistrictPosition = (districtName: string) => {
    const coords = DISTRICT_COORDS[districtName];
    if (coords && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng(coords);
      mapInstanceRef.current.setView(coords, 14, { animate: true });
      onChange(coords[0], coords[1]);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-card p-4 shadow-sm">
      {/* Header with Quick District Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/10 text-primary">
            <MapPin size={15} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Harita Üzerinden Konum Seçin</h4>
            <p className="text-[11px] text-muted-foreground">
              Haritada ilanın bulunduğu noktaya tıklayın veya iğneyi sürükleyin.
            </p>
          </div>
        </div>

        {/* District Quick Jumper */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">İlçeye Git:</span>
          <select
            value={district || ""}
            onChange={(e) => {
              if (e.target.value) setDistrictPosition(e.target.value);
            }}
            className="bg-secondary border border-border rounded px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">İlçe Seçin...</option>
            {Object.keys(DISTRICT_COORDS).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[280px] rounded-md overflow-hidden border border-border/60">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {/* Floating Hint Overlay */}
        <div className="absolute top-2 right-2 z-[400] px-2.5 py-1 rounded bg-black/75 backdrop-blur-sm text-white text-[10px] font-body flex items-center gap-1.5 shadow-md border border-white/10">
          <Compass size={12} className="text-amber-400" />
          <span>Noktayı belirlemek için haritaya tıklayın</span>
        </div>
      </div>

      {/* Coordinate Display & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-secondary/70 px-3 py-1.5 rounded border border-border/60 text-foreground">
            <span className="text-muted-foreground font-sans text-[11px]">Enlem (Lat):</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{lat ? lat.toFixed(6) : currentLat.toFixed(6)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary/70 px-3 py-1.5 rounded border border-border/60 text-foreground">
            <span className="text-muted-foreground font-sans text-[11px]">Boylam (Lng):</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{lng ? lng.toFixed(6) : currentLng.toFixed(6)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDistrictPosition("Esenyurt")}
            className="px-2.5 py-1 rounded text-xs bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
          >
            Esenyurt Merkez
          </button>
          <button
            type="button"
            onClick={() => setDistrictPosition("Beylikdüzü")}
            className="px-2.5 py-1 rounded text-xs bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
          >
            Beylikdüzü
          </button>
        </div>
      </div>
    </div>
  );
}
