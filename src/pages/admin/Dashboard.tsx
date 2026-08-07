import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { STAGES, stageLabel, formatDateTime } from "@/lib/crm";
import { Building2, Users, Bell, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [counts, setCounts] = useState({ properties: 0, customers: 0, reminders: 0, sales: 0 });
  const [byStage, setByStage] = useState<Record<string, number>>({});
  const [upcoming, setUpcoming] = useState<{ id: string; title: string; remind_at: string; customers?: { full_name: string } | null }[]>([]);

  useEffect(() => {
    (async () => {
      const [p, c, r, stages, up] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("reminders").select("id", { count: "exact", head: true }).eq("done", false),
        supabase.from("customers").select("stage"),
        supabase
          .from("reminders")
          .select("id,title,remind_at,customers(full_name)")
          .eq("done", false)
          .order("remind_at", { ascending: true })
          .limit(6),
      ]);
      const map: Record<string, number> = {};
      (stages.data ?? []).forEach((row: { stage: string }) => {
        map[row.stage] = (map[row.stage] ?? 0) + 1;
      });
      setByStage(map);
      setCounts({
        properties: p.count ?? 0,
        customers: c.count ?? 0,
        reminders: r.count ?? 0,
        sales: map["satis"] ?? 0,
      });
      setUpcoming((up.data as typeof upcoming) ?? []);
    })();
  }, []);

  const cards = [
    { label: "Toplam İlan", value: counts.properties, icon: Building2, to: "/admin/ilanlar" },
    { label: "Toplam Müşteri", value: counts.customers, icon: Users, to: "/admin/musteriler" },
    { label: "Açık Hatırlatma", value: counts.reminders, icon: Bell, to: "/admin/hatirlatmalar" },
    { label: "Satış Yapıldı", value: counts.sales, icon: TrendingUp, to: "/admin/musteriler" },
  ];

  return (
    <AdminLayout title="Genel Bakış">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="luxury-card p-6 hover:border-primary/40 transition-colors">
            <c.icon size={18} className="text-primary mb-4" />
            <p className="font-display text-3xl text-foreground">{c.value}</p>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="luxury-card p-6">
          <h2 className="font-display text-lg text-foreground mb-6">Satış Hunisi</h2>
          <div className="space-y-3">
            {STAGES.map((s) => {
              const v = byStage[s.value] ?? 0;
              const max = Math.max(1, ...Object.values(byStage));
              return (
                <div key={s.value}>
                  <div className="flex justify-between font-body text-xs text-muted-foreground mb-1">
                    <span>{s.label}</span>
                    <span className="text-foreground">{v}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-sm overflow-hidden">
                    <div className="h-full gradient-gold" style={{ width: `${(v / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="luxury-card p-6">
          <h2 className="font-display text-lg text-foreground mb-6">Yaklaşan Hatırlatmalar</h2>
          {upcoming.length === 0 && <p className="font-body text-sm text-muted-foreground">Bekleyen hatırlatma yok.</p>}
          <div className="space-y-4">
            {upcoming.map((r) => (
              <div key={r.id} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-body text-sm text-foreground">{r.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{r.customers?.full_name ?? "Genel"}</p>
                </div>
                <p className="font-body text-xs text-primary whitespace-nowrap">{formatDateTime(r.remind_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only">{stageLabel("yeni")}</p>
    </AdminLayout>
  );
};

export default Dashboard;