import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { STAGES, Stage, stageLabel, stageTone, formatTRY, formatDateTime } from "@/lib/crm";
import { useReminderNotifications } from "@/hooks/useReminderNotifications";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, X, Search, Bell, BellRing, Loader2, LayoutGrid, List } from "lucide-react";

interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  stage: Stage;
  budget_min: number | null;
  budget_max: number | null;
  interested_type: string | null;
  interested_district: string | null;
  notes: string | null;
  updated_at: string;
}

const input =
  "w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-primary rounded-sm";
const label = "font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5";

const AdminCustomers = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({ full_name: "", stage: "yeni" });

  const { reminders, reload: reloadReminders, permission, requestPermission } = useReminderNotifications(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("customers").select("*").order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Customer[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((c) => {
    const okStage = stageFilter === "all" || c.stage === stageFilter;
    const t = q.trim().toLowerCase();
    const okQ = !t || [c.full_name, c.phone, c.email, c.interested_district].some((v) => v?.toLowerCase().includes(t));
    return okStage && okQ;
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name?.trim()) return toast.error("Ad soyad zorunlu");
    setBusy(true);
    const { error, data } = await supabase
      .from("customers")
      .insert({ ...form, full_name: form.full_name.trim(), created_by: user?.id, assigned_to: user?.id })
      .select("id")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    await supabase.from("customer_activities").insert({
      customer_id: data.id,
      activity_type: "Not",
      stage: form.stage as Stage,
      note: "Müşteri kartı oluşturuldu.",
      created_by: user?.id,
    });
    toast.success("Müşteri eklendi");
    setOpen(false);
    setForm({ full_name: "", stage: "yeni" });
    load();
  };

  const moveStage = async (c: Customer, stage: Stage) => {
    const { error } = await supabase.from("customers").update({ stage }).eq("id", c.id);
    if (error) return toast.error(error.message);
    await supabase.from("customer_activities").insert({
      customer_id: c.id,
      activity_type: "Not",
      stage,
      note: `Aşama güncellendi: ${stageLabel(stage)}`,
      created_by: user?.id,
    });
    load();
  };

  const completeReminder = async (id: string) => {
    await supabase.from("reminders").update({ done: true }).eq("id", id);
    reloadReminders();
  };

  return (
    <AdminLayout
      title="Müşteriler (CRM)"
      action={
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === "kanban" ? "list" : "kanban")} className="border border-border p-2.5 text-muted-foreground hover:text-primary">
            {view === "kanban" ? <List size={15} /> : <LayoutGrid size={15} />}
          </button>
          <button onClick={() => setOpen(true)} className="gradient-gold text-primary-foreground px-5 py-2.5 text-xs tracking-[0.2em] uppercase font-body flex items-center gap-2">
            <Plus size={14} /> Yeni Müşteri
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className={`${input} pl-9`} placeholder="Müşteri ara..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <select className={`${input} max-w-56`} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
              <option value="all">Tüm aşamalar</option>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {items.length === 0 && (
            <div className="luxury-card p-16 text-center">
              <p className="font-display text-xl text-foreground mb-2">Henüz müşteri yok</p>
              <p className="font-body text-sm text-muted-foreground">"Yeni Müşteri" ile ilk kartı oluşturun.</p>
            </div>
          )}

          {view === "kanban" && items.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map((s) => {
                const col = filtered.filter((c) => c.stage === s.value);
                return (
                  <div key={s.value} className="w-72 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-body text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{s.label}</p>
                      <span className="font-body text-xs text-primary">{col.length}</span>
                    </div>
                    <div className="space-y-3">
                      {col.map((c) => (
                        <div key={c.id} className="luxury-card p-4">
                          <Link to={`/admin/musteriler/${c.id}`} className="font-display text-sm text-foreground hover:text-primary">
                            {c.full_name}
                          </Link>
                          <p className="font-body text-xs text-muted-foreground mt-1">{c.phone ?? "—"}</p>
                          {(c.budget_min || c.budget_max) && (
                            <p className="font-body text-xs text-primary mt-2">
                              {formatTRY(c.budget_min)} – {formatTRY(c.budget_max)}
                            </p>
                          )}
                          <select
                            value={c.stage}
                            onChange={(e) => moveStage(c, e.target.value as Stage)}
                            className="mt-3 w-full bg-secondary border border-border px-2 py-1.5 font-body text-[10px] tracking-wider uppercase text-muted-foreground focus:outline-none focus:border-primary"
                          >
                            {STAGES.map((x) => (
                              <option key={x.value} value={x.value}>{x.label}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "list" && items.length > 0 && (
            <div className="luxury-card overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["Müşteri", "Telefon", "Aşama", "Bütçe", "Güncelleme"].map((h) => (
                      <th key={h} className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4">
                        <Link to={`/admin/musteriler/${c.id}`} className="font-body text-sm text-foreground hover:text-primary">{c.full_name}</Link>
                      </td>
                      <td className="px-5 py-4 font-body text-sm text-muted-foreground">{c.phone ?? "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`font-body text-[10px] tracking-wider uppercase px-2 py-1 ${stageTone(c.stage)}`}>{stageLabel(c.stage)}</span>
                      </td>
                      <td className="px-5 py-4 font-body text-sm text-muted-foreground">
                        {c.budget_max ? formatTRY(c.budget_max) : "—"}
                      </td>
                      <td className="px-5 py-4 font-body text-xs text-muted-foreground">{formatDateTime(c.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reminders panel */}
        <aside className="luxury-card p-5 h-fit xl:sticky xl:top-6">
          <div className="flex items-center gap-2 mb-5">
            <BellRing size={15} className="text-primary" />
            <h2 className="font-display text-base text-foreground">Hatırlatmalar</h2>
          </div>

          {permission !== "granted" && (
            <button onClick={requestPermission} className="w-full border border-primary/40 text-primary font-body text-[10px] tracking-widest uppercase py-2.5 mb-5 flex items-center justify-center gap-2">
              <Bell size={12} /> Masaüstü bildirimlerini aç
            </button>
          )}

          {reminders.length === 0 && <p className="font-body text-sm text-muted-foreground">Bekleyen hatırlatma yok.</p>}

          <div className="space-y-4">
            {reminders.slice(0, 12).map((r) => {
              const soon = new Date(r.remind_at).getTime() - Date.now() < 60 * 60 * 1000;
              return (
                <div key={r.id} className="border-b border-border pb-3 last:border-0">
                  <p className="font-body text-sm text-foreground">{r.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{r.customers?.full_name ?? "Genel"}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`font-body text-xs ${soon ? "text-primary" : "text-muted-foreground"}`}>{formatDateTime(r.remind_at)}</span>
                    <button onClick={() => completeReminder(r.id)} className="font-body text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary">
                      Tamamla
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto p-4 md:p-10">
          <form onSubmit={save} className="luxury-card max-w-2xl mx-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl text-foreground">Yeni Müşteri Kartı</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={label}>Ad Soyad *</label>
                <input className={input} value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={120} required />
              </div>
              <div>
                <label className={label}>Telefon</label>
                <input className={input} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} />
              </div>
              <div>
                <label className={label}>E-posta</label>
                <input type="email" className={input} value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
              </div>
              <div>
                <label className={label}>Aşama</label>
                <select className={input} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}>
                  {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Kaynak</label>
                <select className={input} value={form.source ?? ""} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  <option value="">Seçiniz</option>
                  {["Sahibinden", "Web Sitesi", "Telefon", "WhatsApp", "Instagram", "Referans", "Ofis Ziyareti", "Tabela"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Bütçe (min)</label>
                <input type="number" className={input} value={form.budget_min ?? ""} onChange={(e) => setForm({ ...form, budget_min: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className={label}>Bütçe (max)</label>
                <input type="number" className={input} value={form.budget_max ?? ""} onChange={(e) => setForm({ ...form, budget_max: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className={label}>İlgilendiği Tip</label>
                <input className={input} value={form.interested_type ?? ""} onChange={(e) => setForm({ ...form, interested_type: e.target.value })} placeholder="3+1 Daire" />
              </div>
              <div>
                <label className={label}>İlgilendiği Bölge</label>
                <input className={input} value={form.interested_district ?? ""} onChange={(e) => setForm({ ...form, interested_district: e.target.value })} placeholder="Beylikdüzü, Yakuplu" />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Notlar</label>
                <textarea className={`${input} min-h-28`} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={3000} />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="submit" disabled={busy} className="gradient-gold text-primary-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase font-body flex items-center gap-2 disabled:opacity-60">
                {busy && <Loader2 size={14} className="animate-spin" />} Kaydet
              </button>
              <button type="button" onClick={() => setOpen(false)} className="border border-border px-8 py-3 text-xs tracking-[0.2em] uppercase font-body text-muted-foreground hover:text-foreground">Vazgeç</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCustomers;