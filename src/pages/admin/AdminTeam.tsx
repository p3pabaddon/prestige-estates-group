import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Users, UserPlus, Shield, ShieldCheck, Mail, Phone, Calendar, Loader2, Sparkles, Building2 } from "lucide-react";

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "admin" | "agent";
  created_at: string;
  customer_count?: number;
}

export default function AdminTeam() {
  const { user, role } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Form for inviting/adding new staff member
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "agent">("agent");

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, created_at");

      if (pErr) throw pErr;

      // 2. Fetch roles
      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rErr) throw rErr;

      // 3. Fetch customer counts per assigned_to
      const { data: customers } = await supabase
        .from("customers")
        .select("assigned_to");

      const countMap: Record<string, number> = {};
      (customers || []).forEach((c) => {
        if (c.assigned_to) {
          countMap[c.assigned_to] = (countMap[c.assigned_to] || 0) + 1;
        }
      });

      const roleMap: Record<string, "admin" | "agent"> = {};
      (roles || []).forEach((r) => {
        roleMap[r.user_id] = r.role as "admin" | "agent";
      });

      const list: TeamMember[] = (profiles || []).map((p) => ({
        id: p.id,
        full_name: p.full_name || p.email?.split("@")[0] || "İsimsiz Personel",
        email: p.email,
        phone: p.phone,
        role: roleMap[p.id] || "agent",
        created_at: p.created_at,
        customer_count: countMap[p.id] || 0,
      }));

      setMembers(list);
    } catch (err: any) {
      toast.error(err.message || "Personel listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleRoleChange = async (memberId: string, targetRole: "admin" | "agent") => {
    if (memberId === user?.id) {
      return toast.error("Kendi rolünüzü buradan değiştiremezsiniz.");
    }
    try {
      // 1. Update user_roles
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: memberId, role: targetRole }, { onConflict: "user_id" });

      if (error) throw error;

      // 2. Also update profiles is_admin & role for direct dashboard convenience
      await supabase
        .from("profiles")
        .update({ role: targetRole, is_admin: targetRole === "admin" })
        .eq("id", memberId);

      toast.success("Personel yetkisi güncellendi.");
      loadTeam();
    } catch (err: any) {
      toast.error(err.message || "Rol güncellenirken hata oluştu.");
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      return toast.error("Lütfen tüm alanları doldurun.");
    }
    if (password.length < 6) {
      return toast.error("Şifre en az 6 karakter olmalıdır.");
    }

    setBusy(true);
    try {
      // Create user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Explicitly set role if different
        await supabase
          .from("user_roles")
          .upsert({ user_id: data.user.id, role: newRole }, { onConflict: "user_id" });

        toast.success(`Personel (${fullName}) başarıyla oluşturuldu!`);
        setOpenModal(false);
        setEmail("");
        setPassword("");
        setFullName("");
        setNewRole("agent");
        loadTeam();
      }
    } catch (err: any) {
      toast.error(err.message || "Personel oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  };

  if (role !== "admin") {
    return (
      <AdminLayout title="Yetkisiz Erişim">
        <div className="luxury-card p-8 text-center max-w-lg mx-auto">
          <Shield className="mx-auto text-amber-500 mb-4" size={40} />
          <h2 className="font-display text-lg text-foreground mb-2">Yönetici Yetkisi Gerekli</h2>
          <p className="text-muted-foreground text-xs font-body">
            Personel ve danışman yönetimi yalnızca ofis yöneticilerine (Admin) açıktır.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Personel & Danışman Yönetimi"
      action={
        <button
          onClick={() => setOpenModal(true)}
          className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-sm font-body text-xs tracking-wider uppercase flex items-center gap-2 hover:opacity-90 shadow-sm"
        >
          <UserPlus size={15} /> Yeni Personel Ekle
        </button>
      }
    >
      {/* Intro Banner */}
      <div className="p-5 bg-card border border-border rounded-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg text-foreground font-medium flex items-center gap-2">
            <Users className="text-primary" size={20} />
            <span>Ofis Danışman & Yetki İzolasyonu</span>
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Her danışman sadece kendi zimmetli müşterilerini görür. Admin tüm ofis verilerini ve danışman performanslarını yönetir.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded bg-secondary border border-border text-center">
            <span className="text-lg font-bold font-display text-primary">{members.length}</span>
            <span className="block text-[10px] uppercase font-body text-muted-foreground">Toplam Personel</span>
          </div>
          <div className="px-3.5 py-2 rounded bg-secondary border border-border text-center">
            <span className="text-lg font-bold font-display text-emerald-400">
              {members.filter((m) => m.role === "agent").length}
            </span>
            <span className="block text-[10px] uppercase font-body text-muted-foreground">Aktif Danışman</span>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : members.length === 0 ? (
        <div className="luxury-card p-12 text-center">
          <Users className="mx-auto text-muted-foreground mb-3 opacity-50" size={36} />
          <p className="font-display text-lg text-foreground mb-1">Henüz kayıtlı personel yok</p>
          <p className="text-xs text-muted-foreground font-body">Yeni Personel Ekle butonuyla danışmanlarınızı sisteme davet edebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {members.map((m) => {
            const isCurrentUser = m.id === user?.id;
            return (
              <div key={m.id} className="luxury-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold font-display text-base">
                        {m.full_name ? m.full_name[0].toUpperCase() : "P"}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-1.5">
                          {m.full_name}
                          {isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase font-body">
                              Siz
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground font-body">{m.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded font-body font-semibold flex items-center gap-1 ${
                        m.role === "admin"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {m.role === "admin" ? <ShieldCheck size={12} /> : <Shield size={12} />}
                      {m.role === "admin" ? "Yönetici" : "Danışman"}
                    </span>
                  </div>

                  <div className="space-y-2 py-3 border-t border-b border-border text-xs font-body text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users size={13} className="text-primary" /> Üzerindeki Müşteri:
                      </span>
                      <span className="font-bold text-foreground">{m.customer_count || 0} Müşteri</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-muted-foreground" /> Kayıt Tarihi:
                      </span>
                      <span>{new Date(m.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                </div>

                {/* Role Toggle Selector */}
                <div className="mt-5 pt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-body text-muted-foreground">Yetki Seviyesi:</span>
                  <select
                    disabled={isCurrentUser}
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value as "admin" | "agent")}
                    className="bg-secondary border border-border text-foreground font-body text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="agent">Danışman (Sadece Kendi CRM'i)</option>
                    <option value="admin">Yönetici (Tüm Ofis CRM'i)</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Staff Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateStaff}
            className="luxury-card max-w-md w-full p-6 sm:p-8 space-y-5 relative animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-lg text-foreground font-semibold flex items-center gap-2">
                <UserPlus size={18} className="text-primary" /> Yeni Personel / Danışman Ekle
              </h3>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                Ad Soyad
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full bg-secondary border border-border px-3.5 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-primary rounded-sm"
              />
            </div>

            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                E-Posta Adresi
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="danisman@sarraf34.com"
                className="w-full bg-secondary border border-border px-3.5 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-primary rounded-sm"
              />
            </div>

            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                Giriş Şifresi
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="w-full bg-secondary border border-border px-3.5 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-primary rounded-sm"
              />
            </div>

            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                Yetki Rolü
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "admin" | "agent")}
                className="w-full bg-secondary border border-border px-3.5 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-primary rounded-sm"
              >
                <option value="agent">Danışman (Sadece Kendi Müşterilerini Görür)</option>
                <option value="admin">Yönetici / Admin (Tüm Ofis Müşterilerini Görür)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 gradient-gold text-primary-foreground py-3 text-xs tracking-wider uppercase font-body font-semibold flex items-center justify-center gap-2 rounded-sm disabled:opacity-50"
              >
                {busy && <Loader2 size={14} className="animate-spin" />} Kaydet ve Yetkilendir
              </button>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="px-5 py-3 border border-border text-xs tracking-wider uppercase font-body text-muted-foreground hover:text-foreground rounded-sm"
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
