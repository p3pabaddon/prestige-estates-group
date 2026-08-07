import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useReminderNotifications } from "@/hooks/useReminderNotifications";
import { formatDateTime } from "@/lib/crm";
import { toast } from "sonner";
import { Bell, Check, Trash2, Plus } from "lucide-react";

const input =
  "w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-primary rounded-sm";
const label = "font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5";

const AdminReminders = () => {
  const { user } = useAuth();
  const { reminders, reload, permission, requestPermission } = useReminderNotifications(true);
  const [done, setDone] = useState<{ id: string; title: string; remind_at: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; full_name: string }[]>([]);
  const [form, setForm] = useState({ title: "", note: "", remind_at: "", customer_id: "" });

  const loadDone = useCallback(async () => {
    const { data } = await supabase.from("reminders").select("id,title,remind_at").eq("done", true).order("remind_at", { ascending: false }).limit(30);
    setDone(data ?? []);
  }, []);

  useEffect(() => {
    supabase.from("customers").select("id,full_name").order("full_name").then(({ data }) => setCustomers(data ?? []));
    loadDone();
  }, [loadDone]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.remind_at) return toast.error("Başlık ve tarih zorunlu");
    const { error } = await supabase.from("reminders").insert({
      title: form.title.trim(),
      note: form.note || null,
      remind_at: new Date(form.remind_at).toISOString(),
      customer_id: form.customer_id || null,
      created_by: user?.id,
      assigned_to: user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Hatırlatma eklendi");
    setForm({ title: "", note: "", remind_at: "", customer_id: "" });
    reload();
  };

  const complete = async (id: string) => {
    await supabase.from("reminders").update({ done: true }).eq("id", id);
    reload();
    loadDone();
  };

  const remove = async (id: string) => {
    await supabase.from("reminders").delete().eq("id", id);
    reload();
    loadDone();
  };

  return (
    <AdminLayout title="Hatırlatmalar">
      {permission !== "granted" && (
        <button onClick={requestPermission} className="mb-6 border border-primary/40 text-primary font-body text-[10px] tracking-widest uppercase px-5 py-2.5 flex items-center gap-2">
          <Bell size={12} /> Masaüstü bildirimlerini etkinleştir
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <form onSubmit={add} className="luxury-card p-6 h-fit space-y-4">
          <h2 className="font-display text-lg text-foreground mb-2">Yeni Hatırlatma</h2>
          <div>
            <label className={label}>Başlık *</label>
            <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ofis randevusu" maxLength={150} required />
          </div>
          <div>
            <label className={label}>Müşteri</label>
            <select className={input} value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Genel</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Tarih & Saat *</label>
            <input type="datetime-local" className={input} value={form.remind_at} onChange={(e) => setForm({ ...form, remind_at: e.target.value })} required />
          </div>
          <div>
            <label className={label}>Not</label>
            <textarea className={`${input} min-h-24`} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={1000} />
          </div>
          <button type="submit" className="gradient-gold text-primary-foreground w-full py-3 text-xs tracking-[0.2em] uppercase font-body flex items-center justify-center gap-2">
            <Plus size={14} /> Ekle
          </button>
          <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
            Hatırlatma saatine 15 dakika kala masaüstü bildirimi gönderilir. Panel açık bir sekmede olmalıdır.
          </p>
        </form>

        <div className="space-y-6">
          <div className="luxury-card p-6">
            <h2 className="font-display text-lg text-foreground mb-5">Bekleyenler ({reminders.length})</h2>
            {reminders.length === 0 && <p className="font-body text-sm text-muted-foreground">Bekleyen hatırlatma yok.</p>}
            <div className="space-y-4">
              {reminders.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0">
                  <div>
                    <p className="font-body text-sm text-foreground">{r.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{r.customers?.full_name ?? "Genel"}{r.note ? ` · ${r.note}` : ""}</p>
                    <p className="font-body text-xs text-primary mt-1">{formatDateTime(r.remind_at)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => complete(r.id)} className="border border-border p-2 text-muted-foreground hover:text-primary"><Check size={13} /></button>
                    <button onClick={() => remove(r.id)} className="border border-border p-2 text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {done.length > 0 && (
            <div className="luxury-card p-6">
              <h2 className="font-display text-lg text-foreground mb-5">Tamamlananlar</h2>
              <div className="space-y-3">
                {done.map((r) => (
                  <div key={r.id} className="flex justify-between gap-4 font-body text-xs text-muted-foreground">
                    <span className="line-through">{r.title}</span>
                    <span>{formatDateTime(r.remind_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReminders;