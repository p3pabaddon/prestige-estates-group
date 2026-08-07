import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatTRY } from "@/lib/crm";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

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
  featured: boolean;
  published: boolean;
  external_url: string | null;
}

const empty: Partial<Property> = {
  title: "",
  description: "",
  location: "",
  district: "",
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

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Property[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    const payload = {
      ...form,
      title: form.title.trim(),
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
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

  return (
    <AdminLayout
      title="İlanlar"
      action={
        <button onClick={create} className="gradient-gold text-primary-foreground px-5 py-2.5 text-xs tracking-[0.2em] uppercase font-body flex items-center gap-2">
          <Plus size={14} /> Yeni İlan
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="luxury-card p-16 text-center">
          <p className="font-display text-xl text-foreground mb-2">Henüz ilan yok</p>
          <p className="font-body text-sm text-muted-foreground">"Yeni İlan" ile portföyünüzü eklemeye başlayın.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((p) => (
            <div key={p.id} className="luxury-card overflow-hidden">
              <div className="aspect-[4/3] bg-secondary overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-body text-xs text-muted-foreground">Görsel yok</div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-base text-foreground truncate">{p.title}</h3>
                    <p className="font-body text-xs text-muted-foreground truncate">{[p.district, p.city].filter(Boolean).join(", ")}</p>
                  </div>
                  <span className={`font-body text-[9px] tracking-wider uppercase px-2 py-1 ${p.published ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.published ? "Yayında" : "Taslak"}
                  </span>
                </div>
                <p className="font-display text-lg text-primary mt-3">{formatTRY(p.price, p.currency)}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {[p.rooms, p.gross_m2 ? `${p.gross_m2} m²` : null, p.floor].filter(Boolean).join(" · ")}
                </p>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => edit(p)} className="flex-1 border border-border py-2 font-body text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center gap-1.5">
                    <Pencil size={12} /> Düzenle
                  </button>
                  <button onClick={() => remove(p)} className="px-3 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40">
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
              <div>
                <label className={label}>İlçe / Semt</label>
                <input className={input} value={form.district ?? ""} onChange={(e) => setForm({ ...form, district: e.target.value })} />
              </div>
              <div>
                <label className={label}>Şehir</label>
                <input className={input} value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
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
                <label className={label}>Durum</label>
                <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="aktif">Aktif</option>
                  <option value="rezerve">Rezerve</option>
                  <option value="satildi">Satıldı</option>
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
    </AdminLayout>
  );
};

export default AdminProperties;