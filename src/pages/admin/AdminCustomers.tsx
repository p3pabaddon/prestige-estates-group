import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { STAGES, Stage, stageLabel, stageTone, formatTRY, formatDateTime } from "@/lib/crm";
import { useReminderNotifications } from "@/hooks/useReminderNotifications";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, X, Search, Bell, BellRing, Loader2, LayoutGrid, List, UserCheck, Shield, FileSpreadsheet } from "lucide-react";
import CustomerImportModal from "@/components/admin/CustomerImportModal";

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
  assigned_to: string | null;
  created_by: string | null;
  updated_at: string;
}

interface StaffProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

const input =
  "w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-primary rounded-sm";
const label = "font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5";

const AdminCustomers = () => {
  const { user, role } = useAuth();
  const [items, setItems] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [open, setOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({ full_name: "", stage: "yeni" });

  const { reminders, reload: reloadReminders, permission, requestPermission } = useReminderNotifications(true);

  const load = useCallback(async () => {
    // 1. Fetch staff profiles for name mapping and admin assignment
    const { data: staffData } = await supabase.from("profiles").select("id, full_name, email");
    setStaffList(staffData ?? []);

    // 2. Fetch customers based on role
    let query = supabase.from("customers").select("*").order("updated_at", { ascending: false });

    // If agent (not admin), only fetch own customers
    if (role === "agent" && user?.id) {
      query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
    }

    const { data, error } = await query;
    if (error) toast.error(error.message);
    setItems((data as Customer[]) ?? []);
  }, [role, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const staffMap: Record<string, string> = {};
  staffList.forEach((s) => {
    staffMap[s.id] = s.full_name || s.email?.split("@")[0] || "Danışman";
  });

  const filtered = items.filter((c) => {
    const okStage = stageFilter === "all" || c.stage === stageFilter;
    const okAgent =
      agentFilter === "all" ||
      (agentFilter === "unassigned" ? !c.assigned_to : c.assigned_to === agentFilter);
    const t = q.trim().toLowerCase();
    const okQ = !t || [c.full_name, c.phone, c.email, c.interested_district].some((v) => v?.toLowerCase().includes(t));
    return okStage && okAgent && okQ;
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name?.trim()) return toast.error("Ad soyad zorunlu");
    setBusy(true);

    const assignedTo = role === "admin" ? form.assigned_to || user?.id : user?.id;

    const { error, data } = await supabase
      .from("customers")
      .insert({
        ...form,
        full_name: form.full_name.trim(),
        created_by: user?.id,
        assigned_to: assignedTo,
      })
      .select("id")
      .single();

    setBusy(false);
    if (error) return toast.error(error.message);

    await supabase.from("customer_activities").insert({
      customer_id: data.id,
      activity_type: "Not",
      stage: form.stage as Stage,
      note: `Müşteri kartı oluşturuldu. ${assignedTo ? `Atanan: ${staffMap[assignedTo] || "Danışman"}` : ""}`,
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
      title={role === "admin" ? "Müşteriler & Portföy (Ofis CRM)" : "Müşterilerim (Kişisel CRM)"}
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === "kanban" ? "list" : "kanban")}
            className="border border-border p-2.5 text-muted-foreground hover:text-primary rounded-sm transition-colors"
            title={view === "kanban" ? "Liste Görünümü" : "Kanban Görünümü"}
          >
            {view === "kanban" ? <List size={15} /> : <LayoutGrid size={15} />}
          </button>
          
          <button
            onClick={() => setImportModalOpen(true)}
            className="border border-border hover:border-primary/50 text-foreground px-4 py-2.5 text-xs tracking-wider uppercase font-body flex items-center gap-2 rounded-sm transition-colors"
            title="Excel veya CSV dosyasından toplu müşteri yükle"
          >
            <FileSpreadsheet size={14} className="text-primary" />
            <span className="hidden sm:inline">Excel/CSV İçe Aktar</span>
          </button>

          <button
            onClick={() => {
              setForm({ full_name: "", stage: "yeni", assigned_to: user?.id });
              setOpen(true);
            }}
            className="gradient-gold text-primary-foreground px-5 py-2.5 text-xs tracking-[0.2em] uppercase font-body flex items-center gap-2 rounded-sm hover:opacity-90 transition-opacity font-semibold"
          >
            <Plus size={14} /> Yeni Müşteri
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="min-w-0">
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={`${input} pl-9`}
                placeholder="Müşteri adı, telefon, bölge ara..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            
            <select className={`${input} max-w-44`} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
              <option value="all">Tüm Aşamalar</option>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Admin Only Agent Filter */}
            {role === "admin" && (
              <select className={`${input} max-w-52`} value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
                <option value="all">Tüm Danışmanlar ({staffList.length})</option>
                <option value="unassigned">Atanmamış Müşteriler</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {items.length === 0 && (
            <div className="luxury-card p-16 text-center">
              <p className="font-display text-xl text-foreground mb-2">
                {role === "admin" ? "Henüz kayıtlı müşteri yok" : "Portföyünüzde henüz müşteri bulunmuyor"}
              </p>
              <p className="font-body text-sm text-muted-foreground">
                "Yeni Müşteri" butonu ile ilk müşteri kartınızı oluşturabilirsiniz.
              </p>
            </div>
          )}

          {/* Kanban View */}
          {view === "kanban" && items.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map((s) => {
                const col = filtered.filter((c) => c.stage === s.value);
                return (
                  <div key={s.value} className="w-72 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3 bg-secondary/50 px-3 py-2 rounded-sm border border-border">
                      <p className="font-body text-[10px] tracking-[0.18em] uppercase font-semibold text-foreground">{s.label}</p>
                      <span className="font-body text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{col.length}</span>
                    </div>
                    <div className="space-y-3">
                      {col.map((c) => (
                        <div key={c.id} className="luxury-card p-4 hover:border-primary/40 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <Link to={`/admin/musteriler/${c.id}`} className="font-display text-sm font-semibold text-foreground hover:text-primary line-clamp-1">
                              {c.full_name}
                            </Link>
                            {role === "admin" && c.assigned_to && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground font-body whitespace-nowrap" title="Atanan Danışman">
                                {staffMap[c.assigned_to] || "Danışman"}
                              </span>
                            )}
                          </div>
                          
                          <p className="font-body text-xs text-muted-foreground mt-1">{c.phone ?? "—"}</p>
                          
                          {c.interested_district && (
                            <p className="font-body text-[11px] text-muted-foreground mt-1">📍 {c.interested_district}</p>
                          )}

                          {(c.budget_min || c.budget_max) && (
                            <p className="font-body text-xs text-primary font-semibold mt-2">
                              {formatTRY(c.budget_min)} – {formatTRY(c.budget_max)}
                            </p>
                          )}
                          
                          <select
                            value={c.stage}
                            onChange={(e) => moveStage(c, e.target.value as Stage)}
                            className="mt-3 w-full bg-secondary border border-border px-2 py-1.5 font-body text-[10px] tracking-wider uppercase text-muted-foreground focus:outline-none focus:border-primary rounded-sm"
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

          {/* List View */}
          {view === "list" && items.length > 0 && (
            <div className="luxury-card overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground px-5 py-4">Müşteri</th>
                    <th className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground px-5 py-4">Telefon</th>
                    <th className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground px-5 py-4">Aşama</th>
                    {role === "admin" && (
                      <th className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground px-5 py-4">Danışman</th>
                    )}
                    <th className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground px-5 py-4">Bütçe</th>
                    <th className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground px-5 py-4">Güncelleme</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="px-5 py-4">
                        <Link to={`/admin/musteriler/${c.id}`} className="font-body text-sm font-semibold text-foreground hover:text-primary">
                          {c.full_name}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-body text-sm text-muted-foreground">{c.phone ?? "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`font-body text-[10px] tracking-wider uppercase px-2 py-1 rounded-sm font-semibold ${stageTone(c.stage)}`}>
                          {stageLabel(c.stage)}
                        </span>
                      </td>
                      {role === "admin" && (
                        <td className="px-5 py-4 font-body text-xs text-foreground">
                          {c.assigned_to ? staffMap[c.assigned_to] || "Danışman" : "—"}
                        </td>
                      )}
                      <td className="px-5 py-4 font-body text-sm text-primary font-semibold">
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

        {/* Reminders Panel */}
        <aside className="luxury-card p-5 h-fit xl:sticky xl:top-24">
          <div className="flex items-center gap-2 mb-5">
            <BellRing size={15} className="text-primary" />
            <h2 className="font-display text-base text-foreground font-semibold">Hatırlatmalar</h2>
          </div>

          {permission !== "granted" && (
            <button
              onClick={requestPermission}
              className="w-full border border-primary/40 text-primary font-body text-[10px] tracking-widest uppercase py-2.5 mb-5 flex items-center justify-center gap-2 rounded-sm hover:bg-primary/5"
            >
              <Bell size={12} /> Masaüstü Bildirimlerini Aç
            </button>
          )}

          {reminders.length === 0 && (
            <p className="font-body text-xs text-muted-foreground">Bekleyen hatırlatma bulunmuyor.</p>
          )}

          <div className="space-y-4">
            {reminders.slice(0, 12).map((r) => {
              const soon = new Date(r.remind_at).getTime() - Date.now() < 60 * 60 * 1000;
              return (
                <div key={r.id} className="border-b border-border pb-3 last:border-0">
                  <p className="font-body text-sm font-medium text-foreground">{r.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{r.customers?.full_name ?? "Genel"}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`font-body text-xs ${soon ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                      {formatDateTime(r.remind_at)}
                    </span>
                    <button
                      onClick={() => completeReminder(r.id)}
                      className="font-body text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary font-semibold"
                    >
                      Tamamla
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* New Customer Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto p-4 md:p-10 flex items-center justify-center">
          <form onSubmit={save} className="luxury-card max-w-2xl w-full p-6 md:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-xl text-foreground font-semibold">Yeni Müşteri Kartı</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={label}>Ad Soyad *</label>
                <input
                  className={input}
                  value={form.full_name ?? ""}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  maxLength={120}
                  placeholder="Müşteri Adı Soyadı"
                  required
                />
              </div>

              <div>
                <label className={label}>Telefon</label>
                <input
                  className={input}
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={30}
                  placeholder="0532 000 0000"
                />
              </div>

              <div>
                <label className={label}>E-posta</label>
                <input
                  type="email"
                  className={input}
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  placeholder="musteri@ornek.com"
                />
              </div>

              {/* Admin assign to staff */}
              {role === "admin" && (
                <div>
                  <label className={label}>Zimmetli Danışman</label>
                  <select
                    className={input}
                    value={form.assigned_to ?? user?.id ?? ""}
                    onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || s.email} {s.id === user?.id ? "(Siz)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={label}>Aşama</label>
                <select
                  className={input}
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={label}>Kaynak</label>
                <select
                  className={input}
                  value={form.source ?? ""}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                >
                  <option value="">Seçiniz</option>
                  {["Sahibinden", "Web Sitesi", "Telefon", "WhatsApp", "Instagram", "Referans", "Ofis Ziyareti", "Tabela"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={label}>Bütçe (min)</label>
                <input
                  type="number"
                  className={input}
                  value={form.budget_min ?? ""}
                  onChange={(e) => setForm({ ...form, budget_min: e.target.value ? Number(e.target.value) : null })}
                  placeholder="2.000.000"
                />
              </div>

              <div>
                <label className={label}>Bütçe (max)</label>
                <input
                  type="number"
                  className={input}
                  value={form.budget_max ?? ""}
                  onChange={(e) => setForm({ ...form, budget_max: e.target.value ? Number(e.target.value) : null })}
                  placeholder="5.000.000"
                />
              </div>

              <div>
                <label className={label}>İlgilendiği Tip</label>
                <input
                  className={input}
                  value={form.interested_type ?? ""}
                  onChange={(e) => setForm({ ...form, interested_type: e.target.value })}
                  placeholder="3+1 Daire, Villa..."
                />
              </div>

              <div>
                <label className={label}>İlgilendiği Bölge</label>
                <input
                  className={input}
                  value={form.interested_district ?? ""}
                  onChange={(e) => setForm({ ...form, interested_district: e.target.value })}
                  placeholder="Beylikdüzü, Esenyurt, Yakuplu..."
                />
              </div>

              <div className="md:col-span-2">
                <label className={label}>Özel Notlar</label>
                <textarea
                  className={`${input} min-h-24`}
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  maxLength={3000}
                  placeholder="Müşteri talepleri ve özel görüşme notları..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 gradient-gold text-primary-foreground py-3 text-xs tracking-[0.2em] uppercase font-body font-semibold flex items-center justify-center gap-2 rounded-sm disabled:opacity-60"
              >
                {busy && <Loader2 size={14} className="animate-spin" />} Kaydet ve Başlat
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-3 border border-border text-xs tracking-[0.2em] uppercase font-body text-muted-foreground hover:text-foreground rounded-sm"
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer CSV/Excel Import Modal */}
      <CustomerImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={load}
        staffList={staffList}
      />
    </AdminLayout>
  );
};

export default AdminCustomers;