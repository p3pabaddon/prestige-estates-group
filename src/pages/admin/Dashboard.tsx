import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { STAGES, stageLabel, formatDateTime } from "@/lib/crm";
import { Building2, Users, Bell, TrendingUp, Inbox, UserCheck, ArrowUpRight, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user, role } = useAuth();
  const [counts, setCounts] = useState({
    properties: 0,
    customers: 0,
    reminders: 0,
    sales: 0,
    forms: 0,
    unreadForms: 0,
    staff: 0,
  });
  const [byStage, setByStage] = useState<Record<string, number>>({});
  const [upcoming, setUpcoming] = useState<{ id: string; title: string; remind_at: string; customers?: { full_name: string } | null }[]>([]);
  const [recentForms, setRecentForms] = useState<{ id: string; full_name: string; phone: string | null; created_at: string; status: string }[]>([]);
  const [staffStats, setStaffStats] = useState<{ name: string; count: number; email: string }[]>([]);

  useEffect(() => {
    (async () => {
      // Role-dependent customer & reminder query
      let customerQuery = supabase.from("customers").select("stage, assigned_to, created_by");
      let reminderQuery = supabase.from("reminders").select("id,title,remind_at,customers(full_name)").eq("done", false).order("remind_at", { ascending: true }).limit(6);

      if (role === "agent" && user?.id) {
        customerQuery = customerQuery.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
        reminderQuery = reminderQuery.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
      }

      const [p, c, r, stagesData, up, forms, unreadForms, recForms, profiles] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        role === "admin"
          ? supabase.from("customers").select("id", { count: "exact", head: true })
          : supabase.from("customers").select("id", { count: "exact", head: true }).or(`assigned_to.eq.${user?.id},created_by.eq.${user?.id}`),
        role === "admin"
          ? supabase.from("reminders").select("id", { count: "exact", head: true }).eq("done", false)
          : supabase.from("reminders").select("id", { count: "exact", head: true }).eq("done", false).or(`assigned_to.eq.${user?.id},created_by.eq.${user?.id}`),
        customerQuery,
        reminderQuery,
        supabase.from("contact_requests").select("id", { count: "exact", head: true }),
        supabase.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "yeni"),
        supabase.from("contact_requests").select("id, full_name, phone, created_at, status").order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("id, full_name, email"),
      ]);

      const map: Record<string, number> = {};
      const agentCustMap: Record<string, number> = {};

      (stagesData.data ?? []).forEach((row: any) => {
        map[row.stage] = (map[row.stage] ?? 0) + 1;
        if (row.assigned_to) {
          agentCustMap[row.assigned_to] = (agentCustMap[row.assigned_to] || 0) + 1;
        }
      });

      const staffList = (profiles.data ?? []).map((prof: any) => ({
        name: prof.full_name || prof.email?.split("@")[0] || "Danışman",
        email: prof.email,
        count: agentCustMap[prof.id] || 0,
      }));

      setStaffStats(staffList);
      setByStage(map);
      setCounts({
        properties: p.count ?? 0,
        customers: c.count ?? 0,
        reminders: r.count ?? 0,
        sales: map["satis"] ?? 0,
        forms: forms.count ?? 0,
        unreadForms: unreadForms.count ?? 0,
        staff: profiles.data?.length ?? 1,
      });
      setUpcoming((up.data as typeof upcoming) ?? []);
      setRecentForms((recForms.data as typeof recentForms) ?? []);
    })();
  }, [role, user?.id]);

  const cards = [
    {
      label: "Gelen Talepler",
      value: counts.forms,
      badge: counts.unreadForms > 0 ? `${counts.unreadForms} Yeni` : undefined,
      icon: Inbox,
      to: "/admin/formlar",
    },
    {
      label: "Portföy İlanları",
      value: counts.properties,
      icon: Building2,
      to: "/admin/ilanlar",
    },
    {
      label: role === "admin" ? "Toplam Müşteri (Ofis)" : "Müşterilerim (Kişisel)",
      value: counts.customers,
      icon: Users,
      to: "/admin/musteriler",
    },
    {
      label: "Açık Hatırlatma",
      value: counts.reminders,
      icon: Bell,
      to: "/admin/hatirlatmalar",
    },
    ...(role === "admin"
      ? [
          {
            label: "Ofis Danışmanları",
            value: counts.staff,
            icon: UserCheck,
            to: "/admin/personel",
          },
        ]
      : [
          {
            label: "Kapanan Satışlar",
            value: counts.sales,
            icon: TrendingUp,
            to: "/admin/musteriler",
          },
        ]),
  ];

  return (
    <AdminLayout title={role === "admin" ? "Yönetici Genel Bakış" : "Danışman Çalışma Masası"}>
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="luxury-card p-5 hover:border-primary/40 transition-colors relative group"
          >
            <div className="flex items-center justify-between mb-3">
              <c.icon size={18} className="text-primary" />
              {c.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  {c.badge}
                </span>
              )}
            </div>
            <p className="font-display text-2xl font-semibold text-foreground">{c.value}</p>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 group-hover:text-primary transition-colors">
              {c.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Funnel */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-base font-semibold text-foreground">
              {role === "admin" ? "Ofis Satış Hunisi" : "Müşteri Aşamalarım"}
            </h2>
            <Link to="/admin/musteriler" className="text-xs text-primary font-body flex items-center gap-1 hover:underline">
              Tümünü Gör <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {STAGES.map((s) => {
              const v = byStage[s.value] ?? 0;
              const max = Math.max(1, ...Object.values(byStage));
              return (
                <div key={s.value}>
                  <div className="flex justify-between font-body text-xs text-muted-foreground mb-1">
                    <span>{s.label}</span>
                    <span className="text-foreground font-semibold">{v}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-sm overflow-hidden border border-border/50">
                    <div
                      className="h-full gradient-gold transition-all duration-500"
                      style={{ width: `${(v / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Performance or Upcoming Reminders */}
        {role === "admin" ? (
          <div className="luxury-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <Users size={16} className="text-primary" /> Danışman Müşteri Dağılımı
              </h2>
              <Link to="/admin/personel" className="text-xs text-primary font-body flex items-center gap-1 hover:underline">
                Personel Yönetimi <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {staffStats.map((s) => (
                <div key={s.email} className="flex items-center justify-between p-3 rounded-sm bg-secondary/40 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground font-body">{s.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{s.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary font-display">{s.count}</span>
                    <span className="block text-[10px] text-muted-foreground uppercase font-body">Müşteri</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="luxury-card p-6">
            <h2 className="font-display text-base font-semibold text-foreground mb-6">
              Yaklaşan Randevu & Hatırlatıcılarım
            </h2>
            {upcoming.length === 0 ? (
              <p className="font-body text-xs text-muted-foreground">Planlanmış açık hatırlatıcı bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((u) => (
                  <div key={u.id} className="p-3 bg-secondary/40 rounded border border-border flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{u.title}</p>
                      <p className="font-body text-xs text-muted-foreground">{u.customers?.full_name || "Genel"}</p>
                    </div>
                    <span className="font-body text-xs text-amber-500 font-semibold">{formatDateTime(u.remind_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Web Inquiries */}
      <div className="luxury-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <Inbox size={16} className="text-primary" /> Web Sitesinden Gelen Son Talepler
          </h2>
          <Link to="/admin/formlar" className="text-xs text-primary font-body flex items-center gap-1 hover:underline">
            Tüm Formları İncele <ArrowUpRight size={13} />
          </Link>
        </div>

        {recentForms.length === 0 ? (
          <p className="font-body text-xs text-muted-foreground">Henüz web sitesinden form talebi gelmedi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-body text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Talep Sahibi</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentForms.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="py-3 px-4 font-body text-xs font-semibold text-foreground">{f.full_name}</td>
                    <td className="py-3 px-4 font-body text-xs text-muted-foreground">{f.phone || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-semibold ${f.status === "yeni" ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-body text-xs text-muted-foreground">{formatDateTime(f.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}