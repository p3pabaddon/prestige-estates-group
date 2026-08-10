import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatTRY } from "@/lib/crm";
import { toast } from "sonner";
import { fetchPropertyFromUrl, parsePropertyFromHtml, isLegitimatePropertyImage } from "@/lib/listingScraper";
import LocationPickerMap from "@/components/LocationPickerMap";
import { generatePropertyPDF } from "@/lib/pdfBrochure";
import { sharePropertyOnWhatsApp } from "@/lib/whatsappShare";
import PropertyImportModal from "@/components/admin/PropertyImportModal";
import { Plus, Pencil, Trash2, X, Loader2, Sparkles, FileText, Globe, ArrowRight, MapPin, MessageCircle, Download } from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  district: string | null;
  city: string | null;
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
  credit_eligible: boolean;
  status: string;
  tag: string | null;
  images: string[];
  lat: number | null;
  lng: number | null;
  featured: boolean;
  published: boolean;
  external_url: string | null;
}

const empty: Partial<Property> = {
  title: "",
  description: "",
  location: "",
  district: "Esenyurt",
  city: "İstanbul",
  price: null,
  currency: "TRY",
  property_type: "Daire",
  listing_type: "satilik",
  rooms: "3+1",
  bathrooms: 1,
  gross_m2: null,
  net_m2: null,
  floor: "",
  total_floors: null,
  building_age: "",
  heating: "Kombi Doğalgaz",
  credit_eligible: true,
  status: "aktif",
  tag: "",
  images: [],
  lat: 41.0342,
  lng: 28.6801,
  featured: false,
  published: true,
  external_url: "",
};

const input =
  "w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-primary rounded-sm";
const label = "font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5";

const AdminProperties = () => {
  const [items, setItems] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Property>>(empty);
  const [imagesText, setImagesText] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Property[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (propertyId: string, newStatus: string) => {
    const { error } = await supabase
      .from("properties")
      .update({ status: newStatus })
      .eq("id", propertyId);

    if (error) {
      toast.error("Durum güncellenemedi: " + error.message);
    } else {
      const label = newStatus === "satildi" ? "Satıldı (Tamamlanan Projeler sayfasına aktarıldı)" : newStatus === "aktif" ? "Aktif (Yayında)" : newStatus;
      toast.success(`İlan durumu "${label}" olarak güncellendi.`);
      load();
    }
  };

  const edit = (p: Property) => {
    setForm(p);
    setImagesText((p.images ?? []).join("\n"));
    setOpen(true);
  };

  const create = () => {
    setForm(empty);
    setImagesText("");
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return toast.error("Başlık zorunlu");
    setBusy(true);
    const validImgs = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter(isLegitimatePropertyImage);

    const payload = {
      ...form,
      title: form.title.trim(),
      images: validImgs,
    } as Property;
    const { id, ...rest } = payload;
    const { error } = id
      ? await supabase.from("properties").update(rest).eq("id", id)
      : await supabase.from("properties").insert(rest);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(id ? "İlan güncellendi" : "İlan eklendi");
    setOpen(false);
    load();
  };

  const remove = async (p: Property) => {
    if (!confirm(`"${p.title}" ilanı silinsin mi?`)) return;
    const { error } = await supabase.from("properties").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("İlan silindi");
    load();
  };

  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importRawText, setImportRawText] = useState("");
  const [importBusy, setImportBusy] = useState(false);

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return toast.error("Lütfen bir ilan linki girin");
    setImportBusy(true);
    try {
      const { source_portal: _sp, ...data } = await fetchPropertyFromUrl(importUrl);
      const cleanImgs = (data.images || []).filter(isLegitimatePropertyImage);
      setForm({
        ...empty,
        ...data,
        images: cleanImgs,
        published: true,
      });
      setImagesText(cleanImgs.join("\n"));
      setImportOpen(false);
      setOpen(true);
      toast.success("İlan verileri başarıyla çekildi! İnceleyip kaydedebilirsiniz.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "İlan çekilemedi";
      toast.error(msg);
    } finally {
      setImportBusy(false);
    }
  };

  const handleTextImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importRawText.trim()) return toast.error("Lütfen sayfa içeriğini yapıştırın");
    try {
      const { source_portal: _sp2, ...data } = parsePropertyFromHtml(importRawText, importUrl);
      const cleanImgs = (data.images || []).filter(isLegitimatePropertyImage);
      setForm({
        ...empty,
        ...data,
        images: cleanImgs,
        published: true,
      });
      setImagesText(cleanImgs.join("\n"));
      setImportOpen(false);
      setOpen(true);
      toast.success("İlan içeriği ayrıştırıldı! Lütfen bilgileri kontrol edip kaydedin.");
    } catch {
      toast.error("İçerik ayrıştırılırken hata oluştu");
    }
  };

  const [smartImportOpen, setSmartImportOpen] = useState(false);
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);

  const handleDownloadPDF = async (p: Property) => {
    setPdfGeneratingId(p.id);
    toast.info(`"${p.title}" için PDF sunumu hazırlanıyor...`);
    try {
      await generatePropertyPDF({
        id: p.id,
        title: p.title,
        price: p.price,
        currency: p.currency,
        location: p.location,
        district: p.district,
        city: p.city,
        bedrooms: p.rooms ? parseInt(p.rooms.split("+")[0], 10) || 3 : 3,
        bathrooms: p.bathrooms,
        gross_m2: p.gross_m2,
        net_m2: p.net_m2,
        floor: p.floor,
        total_floors: p.total_floors,
        building_age: p.building_age,
        heating: p.heating,
        property_type: p.property_type,
        listing_type: p.listing_type,
        credit_eligible: p.credit_eligible,
        description: p.description,
        images: p.images,
      });
      toast.success("PDF sunumu başarıyla indirildi!");
    } catch (e: any) {
      toast.error(`PDF oluşturma hatası: ${e.message || "Bilinmeyen hata"}`);
    } finally {
      setPdfGeneratingId(null);
    }
  };

  const handleWhatsAppShare = (p: Property) => {
    sharePropertyOnWhatsApp({
      id: p.id,
      title: p.title,
      price: p.price,
      currency: p.currency,
      location: p.location,
      district: p.district,
      city: p.city,
      gross_m2: p.gross_m2,
      bedrooms: p.rooms ? parseInt(p.rooms.split("+")[0], 10) || 3 : 3,
      bathrooms: p.bathrooms,
      property_type: p.property_type,
      listing_type: p.listing_type,
    });
    toast.success("WhatsApp paylaşım mesajı hazırlandı!");
  };

  return (
    <AdminLayout
      title="İlan & Portföy Yönetimi"
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSmartImportOpen(true)}
            className="border border-primary/50 text-primary hover:bg-primary/10 px-3.5 py-2.5 text-xs tracking-wider uppercase font-body flex items-center gap-1.5 transition-colors rounded-sm font-medium"
            title="Sahibinden metni veya CSV ile hızlı ilan yükle"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Akıllı İçe Aktar (Sahibinden & CSV)</span>
            <span className="sm:hidden">İçe Aktar</span>
          </button>
          
          <button
            onClick={() => {
              setImportUrl("");
              setImportRawText("");
              setImportOpen(true);
            }}
            className="border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground px-3 py-2.5 text-xs tracking-wider uppercase font-body flex items-center gap-1.5 transition-colors rounded-sm hidden md:flex"
          >
            <Globe size={13} /> Linkten Çek
          </button>

          <button onClick={create} className="gradient-gold text-primary-foreground px-4 py-2.5 text-xs tracking-[0.15em] uppercase font-body flex items-center gap-1.5 rounded-sm font-semibold">
            <Plus size={14} /> Yeni İlan
          </button>
        </div>
      }
    >
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 font-body text-xs">
        {[
          { id: "all", label: "Tüm İlanlar", count: items.length },
          { id: "aktif", label: "Aktif Portföy", count: items.filter((i) => (i.status || "aktif") === "aktif").length },
          { id: "satildi", label: "Satılanlar (Tamamlanan)", count: items.filter((i) => i.status === "satildi").length },
          { id: "rezerve", label: "Rezerve", count: items.filter((i) => i.status === "rezerve").length },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-sm whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? "bg-primary/15 text-primary border-primary/40 font-semibold shadow-sm"
                  : "bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {items.filter((p) => (statusFilter === "all" ? true : (p.status || "aktif") === statusFilter)).length === 0 ? (
        <div className="luxury-card p-16 text-center">
          <p className="font-display text-xl text-foreground mb-2">
            {statusFilter === "satildi"
              ? "Henüz satıldı olarak işaretlenmiş ilan yok"
              : statusFilter === "rezerve"
              ? "Rezerve ilan bulunamadı"
              : "Henüz ilan yok"}
          </p>
          <p className="font-body text-sm text-muted-foreground">
            {statusFilter === "satildi"
              ? "İlanlarınız satıldığında kart üzerinden 'Satıldı' seçeneğini işaretleyerek buraya ve /sold sayfasına aktarabilirsiniz."
              : '"Yeni İlan" veya "Akıllı İçe Aktar" ile portföyünüzü eklemeye başlayın.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items
            .filter((p) => (statusFilter === "all" ? true : (p.status || "aktif") === statusFilter))
            .map((p) => (
            <div key={p.id} className="luxury-card overflow-hidden flex flex-col justify-between">
              <div>
                <div className="aspect-[4/3] bg-secondary overflow-hidden relative group">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-body text-xs text-muted-foreground">Görsel yok</div>
                  )}
                  
                  {/* Status Badge (Top Left) */}
                  <span
                    className={`absolute top-2.5 left-2.5 font-body text-[9px] tracking-wider uppercase px-2 py-1 rounded-sm shadow-md font-bold ${
                      p.status === "satildi"
                        ? "bg-amber-500 text-black shadow-amber-500/30"
                        : p.status === "rezerve"
                        ? "bg-blue-600 text-white"
                        : p.status === "kiralandi"
                        ? "bg-cyan-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {p.status === "satildi" ? "✓ SATILDI" : p.status === "rezerve" ? "REZERVE" : p.status === "kiralandi" ? "KİRALANDI" : "AKTİF"}
                  </span>

                  <span className={`absolute top-2.5 right-2.5 font-body text-[9px] tracking-wider uppercase px-2 py-1 rounded-sm shadow-sm backdrop-blur-md ${p.published ? "bg-primary/85 text-primary-foreground font-semibold" : "bg-card/90 text-muted-foreground"}`}>
                    {p.published ? "Yayında" : "Taslak"}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-base text-foreground truncate">{p.title}</h3>
                      <p className="font-body text-xs text-muted-foreground truncate">{[p.district, p.city].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                  <p className="font-display text-lg text-primary mt-2.5 font-semibold">{formatTRY(p.price, p.currency)}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{[p.rooms, p.gross_m2 ? `${p.gross_m2} m²` : null, p.floor].filter(Boolean).join(" · ")}</span>
                    {p.lat && p.lng && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        <MapPin size={11} /> Konumlu
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="p-5 pt-0 space-y-2.5">
                {/* Quick Status Selector */}
                <div className="flex items-center justify-between gap-2 py-2 px-2.5 rounded bg-secondary/70 border border-border/80 text-xs font-body">
                  <span className="text-muted-foreground text-[11px] font-medium">Satış Durumu:</span>
                  <select
                    value={p.status || "aktif"}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded font-semibold border transition-colors cursor-pointer focus:outline-none ${
                      p.status === "satildi"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40"
                        : p.status === "rezerve"
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40"
                        : "bg-background text-foreground border-border"
                    }`}
                  >
                    <option value="aktif">Aktif (Yayında)</option>
                    <option value="satildi">✓ Satıldı (Sold Sayfasına Düşsün)</option>
                    <option value="rezerve">Rezerve</option>
                    <option value="kiralandi">Kiralandı</option>
                  </select>
                </div>

                {/* PDF and WhatsApp Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppShare(p)}
                    className="border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-1.5 font-body text-[10px] tracking-wider uppercase font-semibold flex items-center justify-center gap-1 rounded-sm transition-colors"
                    title="Müşteriye WhatsApp Formatında Paylaş"
                  >
                    <MessageCircle size={12} /> WhatsApp Paylaş
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(p)}
                    disabled={pdfGeneratingId === p.id}
                    className="border border-primary/40 bg-primary/5 hover:bg-primary/15 text-primary py-1.5 font-body text-[10px] tracking-wider uppercase font-semibold flex items-center justify-center gap-1 rounded-sm transition-colors disabled:opacity-60"
                    title="Tek Tıkla PDF Portföy Broşürü İndir"
                  >
                    {pdfGeneratingId === p.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Download size={12} />
                    )}
                    PDF Sunum
                  </button>
                </div>

                {/* Edit and Delete Actions */}
                <div className="flex gap-2">
                  <button onClick={() => edit(p)} className="flex-1 border border-border py-1.5 font-body text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center gap-1.5 rounded-sm">
                    <Pencil size={12} /> Düzenle
                  </button>
                  <button onClick={() => remove(p)} className="px-3 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 rounded-sm">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto p-4 md:p-10">
          <form onSubmit={save} className="luxury-card max-w-3xl mx-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl text-foreground">{form.id ? "İlanı Düzenle" : "Yeni İlan"}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={label}>İlan Başlığı *</label>
                <input className={input} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={200} required />
              </div>
              <div>
                <label className={label}>İlan Tipi</label>
                <select className={input} value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value })}>
                  <option value="satilik">Satılık</option>
                  <option value="kiralik">Kiralık</option>
                </select>
              </div>
              <div>
                <label className={label}>Gayrimenkul Tipi</label>
                <select className={input} value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
                  {["Daire", "Villa", "Rezidans", "Dubleks", "Müstakil Ev", "Arsa", "İşyeri"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Fiyat</label>
                <input type="number" className={input} value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className={label}>Para Birimi</label>
                <select className={input} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="TRY">TL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <LocationPickerMap
                  lat={form.lat}
                  lng={form.lng}
                  district={form.district}
                  onChange={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
                />
              </div>

              <div>
                <label className={label}>İlçe / Semt</label>
                <input className={input} value={form.district ?? ""} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Esenyurt, Beylikdüzü vb." />
              </div>
              <div>
                <label className={label}>Şehir</label>
                <input className={input} value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className={label}>Açık Adres / Mahalle / Site</label>
                <input className={input} value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Örn: Barbaros Hayrettin Paşa Mah. 1993. Sokak No:8" />
              </div>
              <div>
                <label className={label}>Oda Sayısı</label>
                <input className={input} value={form.rooms ?? ""} onChange={(e) => setForm({ ...form, rooms: e.target.value })} placeholder="3+1" />
              </div>
              <div>
                <label className={label}>Banyo Sayısı</label>
                <input type="number" className={input} value={form.bathrooms ?? ""} onChange={(e) => setForm({ ...form, bathrooms: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className={label}>Brüt m²</label>
                <input type="number" className={input} value={form.gross_m2 ?? ""} onChange={(e) => setForm({ ...form, gross_m2: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className={label}>Net m²</label>
                <input type="number" className={input} value={form.net_m2 ?? ""} onChange={(e) => setForm({ ...form, net_m2: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className={label}>Bulunduğu Kat</label>
                <input className={input} value={form.floor ?? ""} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              </div>
              <div>
                <label className={label}>Kat Sayısı</label>
                <input type="number" className={input} value={form.total_floors ?? ""} onChange={(e) => setForm({ ...form, total_floors: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className={label}>Bina Yaşı</label>
                <input className={input} value={form.building_age ?? ""} onChange={(e) => setForm({ ...form, building_age: e.target.value })} />
              </div>
              <div>
                <label className={label}>Isıtma</label>
                <input className={input} value={form.heating ?? ""} onChange={(e) => setForm({ ...form, heating: e.target.value })} />
              </div>
              <div>
                <label className={label}>Etiket (Fırsat, Yeni vb.)</label>
                <input className={input} value={form.tag ?? ""} onChange={(e) => setForm({ ...form, tag: e.target.value })} maxLength={40} />
              </div>
              <div>
                <label className={label}>Satış Durumu</label>
                <select className={input} value={form.status || "aktif"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="aktif">Aktif Portföy (Sitede Listelenir)</option>
                  <option value="satildi">✓ Satıldı (Tamamlanan Satışlar Sayfasına Düşer)</option>
                  <option value="rezerve">Rezerve / Opsiyonlu</option>
                  <option value="kiralandi">Kiralandı</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={label}>Açıklama</label>
                <textarea className={`${input} min-h-32`} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={5000} />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Fotoğraf Bağlantıları (her satıra bir URL)</label>
                <textarea className={`${input} min-h-24`} value={imagesText} onChange={(e) => setImagesText(e.target.value)} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Orijinal İlan Bağlantısı</label>
                <input className={input} value={form.external_url ?? ""} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://www.sahibinden.com/ilan/..." />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                  <input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Sitede yayınla
                </label>
                <label className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                  <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Ana sayfada öne çıkar
                </label>
                <label className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                  <input type="checkbox" checked={!!form.credit_eligible} onChange={(e) => setForm({ ...form, credit_eligible: e.target.checked })} /> Krediye / katılıma uygun
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="submit" disabled={busy} className="gradient-gold text-primary-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase font-body flex items-center gap-2 disabled:opacity-60">
                {busy && <Loader2 size={14} className="animate-spin" />} Kaydet
              </button>
              <button type="button" onClick={() => setOpen(false)} className="border border-border px-8 py-3 text-xs tracking-[0.2em] uppercase font-body text-muted-foreground hover:text-foreground">
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}

      {importOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto p-4 md:p-10 flex items-start justify-center pt-[5vh]">
          <div className="luxury-card max-w-2xl w-full p-6 md:p-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="font-display text-lg text-foreground">İlanı Portaldan Aktar</h2>
                  <p className="font-body text-xs text-muted-foreground">Sahibinden · Hepsiemlak · Emlakjet</p>
                </div>
              </div>
              <button type="button" onClick={() => setImportOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              {/* PRIMARY: Paste Method */}
              <div className="p-5 rounded border border-primary/30 bg-primary/[0.03] space-y-4">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-primary" />
                  <span className="font-body text-sm font-semibold text-foreground">Sayfa İçeriğini Yapıştır</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-body ml-auto">Önerilen</span>
                </div>

                <div className="font-body text-xs text-muted-foreground space-y-2.5 bg-background/60 p-3.5 rounded border border-border/50">
                  <p className="font-semibold text-foreground text-[11px] mb-2">📋 Nasıl Yapılır? (3 Adım)</p>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold min-w-[18px]">1.</span>
                    <span>İlan sayfasını tarayıcıda açın (Sahibinden, Hepsiemlak veya Emlakjet)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold min-w-[18px]">2.</span>
                    <span>Sayfada sağ tık → <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Sayfa Kaynağını Görüntüle</kbd> (veya <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Ctrl + U</kbd>)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold min-w-[18px]">3.</span>
                    <span><kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Ctrl + A</kbd> ile tümünü seç → <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Ctrl + C</kbd> ile kopyala → Aşağıya yapıştır</span>
                  </div>
                </div>

                <form onSubmit={handleTextImport} className="space-y-3">
                  <textarea
                    className={`${input} min-h-28 font-mono text-xs leading-relaxed`}
                    placeholder="Kopyaladığınız sayfa kaynağını veya sayfa metnini buraya yapıştırın..."
                    value={importRawText}
                    onChange={(e) => setImportRawText(e.target.value)}
                    rows={6}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-body">
                      {importRawText.length > 0 ? `${importRawText.length.toLocaleString("tr-TR")} karakter yapıştırıldı` : "Henüz içerik yapıştırılmadı"}
                    </span>
                    <button
                      type="submit"
                      disabled={!importRawText.trim()}
                      className="gradient-gold text-primary-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase font-body flex items-center gap-2 disabled:opacity-40"
                    >
                      <Sparkles size={13} /> Ayrıştır ve Doldur
                    </button>
                  </div>
                </form>
              </div>

              {/* SECONDARY: URL Fetch (with honest warning) */}
              <details className="group">
                <summary className="cursor-pointer font-body text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 select-none py-1">
                  <Globe size={13} />
                  <span>Alternatif: Doğrudan link ile dene</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600">Bot koruması nedeniyle çoğunlukla çalışmaz</span>
                </summary>
                <form onSubmit={handleUrlImport} className="mt-3 p-4 rounded border border-border/60 bg-secondary/30 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      className={input}
                      placeholder="https://www.sahibinden.com/ilan/..."
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={importBusy}
                      className="border border-primary/40 text-primary hover:bg-primary/10 px-5 py-2 text-xs tracking-[0.15em] uppercase font-body flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      {importBusy ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                      {importBusy ? "Deneniyor..." : "Dene"}
                    </button>
                  </div>
                </form>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Smart Property Import Modal (Sahibinden & CSV) */}
      <PropertyImportModal
        isOpen={smartImportOpen}
        onClose={() => setSmartImportOpen(false)}
        onSuccess={load}
      />
    </AdminLayout>
  );
};

export default AdminProperties;