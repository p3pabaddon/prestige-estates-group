import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { STAGES, Stage, stageLabel, stageTone, ACTIVITY_TYPES, formatTRY, formatDateTime } from "@/lib/crm";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Phone, Mail, Plus } from "lucide-react";

const input =
  "w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-primary rounded-sm";
const label = "font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5";

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
  created_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  stage: string | null;
  note: string | null;
  created_at: string;
}

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [c, setC] = useState<Customer | null>(null);
  const [acts, setActs] = useState<Activity[]>([]);
  const [act, setAct] = useState({ activity_type: "Not", note: "", stage: "" });
  const [rem, setRem] = useState({ title: "", remind_at: "" });

  const load = useCallback(async () => {
    if (!id) return;
    const [{ data: cust, error }, { data: a }] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).maybeSingle(),
      supabase.from("customer_activities").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    ]);
    if (error) toast.error(error.message);
    setC(cust as Customer | null);
    setActs((a as Activity[]) ?? []);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (fields: Partial<Customer>) => {
    if (!id) return;
    const { error } = await supabase.from("customers").update(fields).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Güncellendi");
    load();
  };

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!act.note.trim() || !id) return toast.error("Not giriniz");
    const stage = (act.stage || null) as Stage | null;
    const { error } = await supabase.from("customer_activities").insert({
      customer_id: id,
      activity_type: act.activity_type,
      note: act.note.trim(),
      stage,
      created_by: user?.id,
    });
    if (error) return toast.error(error.message);
    if (stage) await supabase.from("customers").update({ stage }).eq("id", id);
    setAct({ activity_type: "Not", note: "", stage: "" });
    load();
  };

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rem.title.trim() || !rem.remind_at || !id) return toast.error("Başlık ve tarih zorunlu");
    const { error } = await supabase.from("reminders").insert({
      customer_id: id,
      title: rem.title.trim(),
      remind_at: new Date(rem.remind_at).toISOString(),
      created_by: user?.id,
      assigned_to: user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Hatırlatma eklendi");
    setRem({ title: "", remind_at: "" });
  };

  const removeCustomer = async () => {
    if (!id || !confirm("Müşteri kartı silinsin mi?")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    navigate("/admin/musteriler");
  };

  if (!c)
    return (
      <AdminLayout title="Müşteri">
        <p className="font-body text-sm text-muted-foreground">Kayıt bulunamadı.</p>
      </AdminLayout>
    );

  return (
    <AdminLayout
      title={c.full_name}
      action={
        <div className="flex gap-2">
          <Link to="/admin/musteriler" className="border border-border px-4 py-2.5 font-body text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary flex items-center gap-2">
            <ArrowLeft size={13} /> Liste
          </Link>
          <button onClick={removeCustomer} className="border border-border px-4 py-2.5 text-muted-foreground hover:text-destructive">
            <Trash2 size={13} />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="space-y-6">
          <div className="luxury-card p-6 space-y-4">
            <span className={`inline-block font-body text-[10px] tracking-wider uppercase px-2 py-1 ${stageTone(c.stage)}`}>{stageLabel(c.stage)}</span>
            <div>
              <label className={label}>Aşama</label>
              <select className={input} value={c.stage} onChange={(e) => patch({ stage: e.target.value as Stage })}>
                {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {c.phone && (
              <a href={`tel:${c.phone}`} className="flex items-center gap-2 font-body text-sm text-foreground hover:text-primary"><Phone size={14} /> {c.phone}</a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 font-body text-sm text-foreground hover:text-primary"><Mail size={14} /> {c.email}</a>
            )}
            <dl className="space-y-2 pt-2 font-body text-xs">
              {[
                ["Kaynak", c.source ?? "—"],
                ["Bütçe", `${formatTRY(c.budget_min)} – ${formatTRY(c.budget_max)}`],
                ["İlgilendiği Tip", c.interested_type ?? "—"],
                ["Bölge", c.interested_district ?? "—"],
                ["Kayıt", formatDateTime(c.created_at)],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-foreground text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <label className={label}>Notlar</label>
              <textarea
                className={`${input} min-h-28`}
                defaultValue={c.notes ?? ""}
                onBlur={(e) => e.target.value !== (c.notes ?? "") && patch({ notes: e.target.value })}
                maxLength={3000}
              />
            </div>
          </div>

          <form onSubmit={addReminder} className="luxury-card p-6 space-y-4">
            <h2 className="font-display text-base text-foreground">Hatırlatma Ekle</h2>
            <input className={input} placeholder="Randevu başlığı" value={rem.title} onChange={(e) => setRem({ ...rem, title: e.target.value })} maxLength={150} />
            <input type="datetime-local" className={input} value={rem.remind_at} onChange={(e) => setRem({ ...rem, remind_at: e.target.value })} />
            <button className="gradient-gold text-primary-foreground w-full py-2.5 text-xs tracking-[0.2em] uppercase font-body flex items-center justify-center gap-2">
              <Plus size={13} /> Ekle
            </button>
          </form>
        </div>

        <div className="space-y-6 min-w-0">
          <form onSubmit={addActivity} className="luxury-card p-6 space-y-4">
            <h2 className="font-display text-base text-foreground">Yeni Etkileşim</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Tür</label>
                <select className={input} value={act.activity_type} onChange={(e) => setAct({ ...act, activity_type: e.target.value })}>
                  {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Aşamayı güncelle</label>
                <select className={input} value={act.stage} onChange={(e) => setAct({ ...act, stage: e.target.value })}>
                  <option value="">Değiştirme</option>
                  {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <textarea className={`${input} min-h-24`} placeholder="Görüşme notu..." value={act.note} onChange={(e) => setAct({ ...act, note: e.target.value })} maxLength={3000} />
            <button className="gradient-gold text-primary-foreground px-8 py-2.5 text-xs tracking-[0.2em] uppercase font-body">Kaydet</button>
          </form>

          <div className="luxury-card p-6">
            <h2 className="font-display text-base text-foreground mb-6">Zaman Çizelgesi</h2>
            {acts.length === 0 && <p className="font-body text-sm text-muted-foreground">Henüz etkileşim kaydı yok.</p>}
            <div className="space-y-5">
              {acts.map((a) => (
                <div key={a.id} className="border-l border-border pl-4 relative">
                  <span className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-body text-xs tracking-wider uppercase text-primary">{a.activity_type}</p>
                    {a.stage && <span className={`font-body text-[9px] tracking-wider uppercase px-1.5 py-0.5 ${stageTone(a.stage)}`}>{stageLabel(a.stage)}</span>}
                    <span className="font-body text-[11px] text-muted-foreground">{formatDateTime(a.created_at)}</span>
                  </div>
                  <p className="font-body text-sm text-foreground mt-1 whitespace-pre-wrap">{a.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerDetail;