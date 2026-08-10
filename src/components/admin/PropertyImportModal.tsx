import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X, Sparkles, FileSpreadsheet, Download, UploadCloud, CheckCircle2, Loader2, Clipboard, ArrowRight, Code, Image as ImageIcon, MapPin } from "lucide-react";
import { parsePropertyFromHtml, isLegitimatePropertyImage, upgradeToHighResImageUrl } from "@/lib/listingScraper";

interface PropertyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedListingForm {
  title: string;
  price: number | null;
  currency: string;
  listing_type: string;
  property_type: string;
  city: string;
  district: string;
  location: string;
  gross_m2: number | null;
  net_m2: number | null;
  rooms: string;
  bathrooms: number | null;
  floor: string;
  total_floors: number | null;
  building_age: string;
  heating: string;
  tapu_durumu: string;
  ilan_no: string;
  description: string;
  images: string[];
}

export default function PropertyImportModal({ isOpen, onClose, onSuccess }: PropertyImportModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"html" | "text" | "csv">("html");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);

  // Parsed single property state
  const [parsedProperty, setParsedProperty] = useState<ParsedListingForm | null>(null);

  // CSV parsed properties
  const [csvRows, setCsvRows] = useState<any[]>([]);

  if (!isOpen) return null;

  // Smart Sahibinden / Emlak Portal HTML & Text Parser
  const parsePastedContent = () => {
    if (!rawText.trim()) return toast.error("Lütfen sayfa kaynağını (HTML) veya ilan metnini yapıştırın.");

    try {
      // Use advanced scraper
      const extracted = parsePropertyFromHtml(rawText);

      const cleanImgs = (extracted.images || [])
        .filter(isLegitimatePropertyImage)
        .map(upgradeToHighResImageUrl);

      const title = extracted.title || "Lüks Konut İlanı";
      const price = extracted.price || 4500000;
      const grossM2 = extracted.gross_m2 || 130;
      const netM2 = extracted.net_m2 || Math.round(grossM2 * 0.85);

      setParsedProperty({
        title,
        price,
        currency: extracted.currency || "TRY",
        listing_type: extracted.listing_type || "satilik",
        property_type: extracted.property_type || "Daire",
        city: extracted.city || "İstanbul",
        district: extracted.district || "Beylikdüzü",
        location: extracted.location || (extracted.district ? `${extracted.district} Mah.` : "Yakuplu Mah."),
        gross_m2: grossM2,
        net_m2: netM2,
        rooms: extracted.rooms || "3+1",
        bathrooms: extracted.bathrooms || 1,
        floor: extracted.floor || "3",
        total_floors: extracted.total_floors || 8,
        building_age: extracted.building_age || "0 (Sıfır)",
        heating: extracted.heating || "Kombi (Doğalgaz)",
        tapu_durumu: "Kat Mülkiyetli",
        ilan_no: Math.floor(100000 + Math.random() * 900000).toString(),
        description: extracted.description || rawText.slice(0, 1000),
        images: cleanImgs.length > 0 ? cleanImgs : [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80"
        ],
      });

      toast.success(`İlan başarıyla ayrıştırıldı! ${cleanImgs.length} adet yüksek çözünürlüklü fotoğraf tespit edildi.`);
    } catch (err: any) {
      toast.error(`Ayrıştırma hatası: ${err.message || "Bilinmeyen hata"}`);
    }
  };

  // Submit single parsed property
  const handleSaveParsedProperty = async () => {
    if (!parsedProperty) return;
    setLoading(true);

    try {
      // Direct insert matching exact Supabase properties table schema
      const { error } = await supabase.from("properties").insert({
        title: parsedProperty.title,
        price: parsedProperty.price,
        currency: parsedProperty.currency || "TRY",
        listing_type: parsedProperty.listing_type || "satilik",
        property_type: parsedProperty.property_type || "Daire",
        city: parsedProperty.city || "İstanbul",
        district: parsedProperty.district || "Beylikdüzü",
        location: parsedProperty.location || "",
        gross_m2: parsedProperty.gross_m2,
        net_m2: parsedProperty.net_m2,
        rooms: parsedProperty.rooms || "3+1",
        bathrooms: parsedProperty.bathrooms || 1,
        floor: parsedProperty.floor || "3",
        total_floors: parsedProperty.total_floors || 8,
        building_age: parsedProperty.building_age || "0 (Sıfır)",
        heating: parsedProperty.heating || "Kombi (Doğalgaz)",
        description: parsedProperty.description || "",
        images: parsedProperty.images || [],
        published: true,
        featured: false,
        credit_eligible: true,
        status: "aktif",
        created_by: user?.id || null,
      });

      if (error) throw error;

      toast.success("İlan başarıyla portföye eklendi!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Hata: ${err.message || "İlan eklenemedi"}`);
    } finally {
      setLoading(false);
    }
  };

  // CSV Template download for properties
  const downloadPropertyTemplate = () => {
    const csvContent =
      "\uFEFF" +
      "Başlık;Fiyat;Para Birimi;İlan Türü;Konut Tipi;İl;İlçe;Konum;Brüt m2;Net m2;Oda Sayısı;Banyo;Bina Yaşı;Kat;Açıklama;Resim URL\n" +
      "Beylikdüzü Yakuplu Deniz Manzaralı 3+1 Lüks Daire;5250000;TRY;satilik;Daire;İstanbul;Beylikdüzü;Yakuplu Mah.;145;130;3+1;2;0;4;Site içerisinde güvenlikli kapalı otoparklı;https://images.unsplash.com/photo-1600596542815-ffad4c1539a9\n" +
      "Gürpınar Müstakil Havuzlu Sıfır Villa;18500000;TRY;satilik;Villa;İstanbul;Beylikdüzü;Gürpınar;380;320;5+2;4;0;3;Geniş müstakil bahçe akıllı ev sistemi;https://images.unsplash.com/photo-1613490493576-7fde63acd811";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sarraf34_ilan_sablonu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const rows: any[] = [];
        results.data.forEach((r: any) => {
          const title = r["başlık"] || r["title"] || r["ilan başlığı"];
          if (!title) return;

          const price = Number(String(r["fiyat"] || r["price"] || 0).replace(/[^0-9]/g, ""));
          const grossM2 = Number(String(r["brüt m2"] || r["brüt"] || r["m2"] || 0).replace(/[^0-9]/g, ""));

          rows.push({
            title: String(title).trim(),
            price: price || 0,
            currency: r["para birimi"] || "TRY",
            listing_type: String(r["ilan türü"] || "satilik").toLowerCase(),
            property_type: r["konut tipi"] || "Daire",
            city: r["il"] || "İstanbul",
            district: r["ilçe"] || "Beylikdüzü",
            location: r["konum"] || "",
            gross_m2: grossM2 || 120,
            net_m2: Number(String(r["net m2"] || grossM2 * 0.85).replace(/[^0-9]/g, "")) || 100,
            rooms: r["oda sayısı"] || r["oda"] || "3+1",
            bathrooms: Number(r["banyo"]) || 1,
            building_age: r["bina yaşı"] || "0 (Sıfır)",
            floor: r["kat"] || "2",
            description: r["açıklama"] || "",
            images: r["resim url"] ? [r["resim url"]] : [
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80"
            ],
            published: true,
            featured: false,
            credit_eligible: true,
            status: "aktif",
            created_by: user?.id || null,
          });
        });

        if (rows.length === 0) {
          toast.error("Dosyada geçerli ilan satırı bulunamadı.");
        } else {
          setCsvRows(rows);
          toast.success(`${rows.length} ilan başarıyla okundu.`);
        }
      },
    });
  };

  const handleBatchCsvSave = async () => {
    if (csvRows.length === 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("properties").insert(csvRows);
      if (error) throw error;
      toast.success(`${csvRows.length} adet ilan portföye başarıyla yüklendi!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Aktarım hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="luxury-card max-w-3xl w-full p-6 md:p-8 space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Akıllı İlan İçe Aktarma & Sahibinden Ayrıştırıcı
              </h2>
              <p className="font-body text-xs text-muted-foreground">
                İlan sayfa kaynağını veya metnini yapıştırarak portföyünüze saniyeler içinde ekleyin.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-4 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => { setActiveTab("html"); setParsedProperty(null); }}
            className={`pb-3 font-body text-xs tracking-wider uppercase font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "html" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code size={14} /> Sahibinden / Portal HTML Kaynağı
          </button>
          <button
            onClick={() => { setActiveTab("text"); setParsedProperty(null); }}
            className={`pb-3 font-body text-xs tracking-wider uppercase font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "text" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clipboard size={14} /> Düz İlan Metni / Açıklama
          </button>
          <button
            onClick={() => { setActiveTab("csv"); setParsedProperty(null); }}
            className={`pb-3 font-body text-xs tracking-wider uppercase font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "csv" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet size={14} /> Excel / CSV Toplu Yükleme
          </button>
        </div>

        {/* TAB 1: HTML Source Parser & TAB 2: Text Parser */}
        {(activeTab === "html" || activeTab === "text") && (
          <div className="space-y-4">
            {activeTab === "html" ? (
              <div className="p-3.5 rounded bg-primary/5 border border-primary/20 space-y-1.5">
                <p className="text-xs font-semibold text-primary font-body flex items-center gap-1.5">
                  <Sparkles size={14} /> Sahibinden / Emlakjet Sayfa Kaynağı ile Yükleme
                </p>
                <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                  1. İlan sayfasında sağ tıklayıp <strong>"Sayfa Kaynağını Görüntüle"</strong> (veya <kbd className="px-1 py-0.5 bg-secondary border rounded text-[10px]">Ctrl+U</kbd>) deyin.<br />
                  2. Açılan sayfada <kbd className="px-1 py-0.5 bg-secondary border rounded text-[10px]">Ctrl+A</kbd> ile tümünü seçip kopyalayın ve aşağıdaki alana yapıştırın.
                </p>
              </div>
            ) : null}

            <div>
              <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1.5 font-semibold">
                {activeTab === "html" ? "HTML Sayfa Kaynağı Kodunu Buraya Yapıştırın:" : "İlan Metnini veya Açıklamasını Buraya Yapıştırın:"}
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  activeTab === "html"
                    ? "<!DOCTYPE html><html>... (Kopyalanan sayfa kaynağını buraya yapıştırın)"
                    : "Örn: Beylikdüzü Yakuplu'da satılık lüks 3+1 daire. Fiyat: 5.400.000 TL, Brüt: 145 m², Net: 130 m², Kat: 3, Yaş: 0 Sıfır, Kombili..."
                }
                className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-xs rounded-sm focus:outline-none focus:border-primary min-h-36 font-mono"
              />
              <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground">
                <span>{rawText.length > 0 ? `${rawText.length.toLocaleString("tr-TR")} karakter girildi` : "İçerik bekleniyor"}</span>
                {rawText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRawText("")}
                    className="text-rose-400 hover:underline"
                  >
                    Temizle
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={parsePastedContent}
              className="gradient-gold text-primary-foreground px-6 py-2.5 text-xs tracking-wider uppercase font-body font-semibold flex items-center gap-2 rounded-sm shadow-md"
            >
              <Sparkles size={14} /> {activeTab === "html" ? "HTML'den İlanı & Fotoğrafları Çıkar" : "Metni Otomatik Ayrıştır"}
            </button>

            {/* Parsed Result Card */}
            {parsedProperty && (
              <div className="p-4 bg-secondary/50 rounded-sm border border-primary/40 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Ayrıştırılan İlan Bilgileri
                  </span>
                  <span className="text-sm font-bold text-foreground font-display">
                    {parsedProperty.price?.toLocaleString("tr-TR")} {parsedProperty.currency}
                  </span>
                </div>

                {/* Photo Previews */}
                {parsedProperty.images && parsedProperty.images.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-2 flex items-center gap-1">
                      <ImageIcon size={12} className="text-primary" /> Yakalanan Fotoğraflar ({parsedProperty.images.length} Adet HD Görsel):
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-background/50 rounded border border-border">
                      {parsedProperty.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded overflow-hidden border border-border group">
                          <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const next = parsedProperty.images.filter((_, i) => i !== idx);
                              setParsedProperty({ ...parsedProperty, images: next });
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                            title="Resmi kaldır"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-body">
                  <div className="col-span-2">
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Başlık</span>
                    <input
                      value={parsedProperty.title}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, title: e.target.value })}
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold flex items-center gap-1">
                      <MapPin size={10} className="text-primary" /> İlçe
                    </span>
                    <input
                      value={parsedProperty.district}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, district: e.target.value })}
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Mahalle / Konum</span>
                    <input
                      value={parsedProperty.location}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, location: e.target.value })}
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Fiyat ({parsedProperty.currency})</span>
                    <input
                      type="number"
                      value={parsedProperty.price || ""}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, price: Number(e.target.value) })}
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs font-bold text-primary"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Oda Sayısı</span>
                    <input
                      type="text"
                      value={parsedProperty.rooms}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, rooms: e.target.value })}
                      placeholder="3+1"
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Brüt m²</span>
                    <input
                      type="number"
                      value={parsedProperty.gross_m2 || 120}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, gross_m2: Number(e.target.value) })}
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Net m²</span>
                    <input
                      type="number"
                      value={parsedProperty.net_m2 || 100}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, net_m2: Number(e.target.value) })}
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Kat</span>
                    <input
                      value={parsedProperty.floor}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, floor: e.target.value })}
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Bina Yaşı</span>
                    <input
                      value={parsedProperty.building_age}
                      onChange={(e) => setParsedProperty({ ...parsedProperty, building_age: e.target.value })}
                      className="w-full bg-background border border-border px-2 py-1.5 rounded text-foreground text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveParsedProperty}
                    disabled={loading}
                    className="flex-1 gradient-gold text-primary-foreground py-3 text-xs tracking-wider uppercase font-body font-semibold flex items-center justify-center gap-2 rounded-sm disabled:opacity-60 shadow-lg"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    Bu İlanı Portföye Kaydet <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Batch CSV Upload */}
        {activeTab === "csv" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-sm border border-border">
              <div>
                <p className="text-xs font-semibold text-foreground font-body">İlan Yükleme Şablonu</p>
                <p className="text-[11px] text-muted-foreground font-body">
                  Toplu ilan yüklemek için örnek CSV şablonunu indirin.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadPropertyTemplate}
                className="inline-flex items-center gap-2 px-3 py-2 bg-card hover:bg-secondary border border-border text-foreground font-body text-xs rounded-sm transition-colors"
              >
                <Download size={13} className="text-primary" /> Şablon İndir
              </button>
            </div>

            <div className="border-2 border-dashed border-border hover:border-primary/60 rounded-sm p-6 text-center transition-colors relative cursor-pointer bg-secondary/20">
              <input
                type="file"
                accept=".csv, .txt"
                onChange={handleCsvUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud size={32} className="mx-auto text-primary mb-2" />
              <p className="text-xs font-semibold text-foreground font-body">
                İlan CSV dosyasını buraya sürükleyin veya seçin
              </p>
            </div>

            {csvRows.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-emerald-500 font-body flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {csvRows.length} Adet İlan Yüklemeye Hazır
                </p>
                <button
                  type="button"
                  onClick={handleBatchCsvSave}
                  disabled={loading}
                  className="w-full gradient-gold text-primary-foreground py-3 text-xs tracking-wider uppercase font-body font-semibold flex items-center justify-center gap-2 rounded-sm disabled:opacity-60"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {csvRows.length} İlanı Portföye Aktar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-border text-xs tracking-wider uppercase font-body text-muted-foreground hover:text-foreground rounded-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
