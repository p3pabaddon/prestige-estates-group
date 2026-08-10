import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/crm";
import {
  Inbox,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  UserPlus,
  Trash2,
  ExternalLink,
  Eye,
  X,
  Building2,
  RefreshCw,
  PhoneCall
} from "lucide-react";
import { toast } from "sonner";

interface ContactRequest {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  property_id: string | null;
  source: string | null;
  status: "yeni" | "okundu" | "arandi" | "tamamlandi" | "iptal";
  assigned_to: string | null;
  created_at: string;
  properties?: {
    title: string;
    location: string;
    price: number | null;
  } | null;
}

const statusBadges: Record<string, { label: string; bg: string; text: string; border: string }> = {
  yeni: { label: "Yeni Talep", bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  okundu: { label: "Okundu", bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  arandi: { label: "İletişime Geçildi", bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
  tamamlandi: { label: "Tamamlandı", bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  iptal: { label: "İptal Edildi", bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

const AdminContactRequests = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReq, setSelectedReq] = useState<ContactRequest | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_requests")
        .select(`
          *,
          properties:property_id (
            title,
            location,
            price
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data as unknown as ContactRequest[]) || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Talepler yüklenirken hata oluştu";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: ContactRequest["status"]) => {
    try {
      const { error } = await supabase
        .from("contact_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Durum "${statusBadges[newStatus]?.label}" olarak güncellendi.`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (selectedReq?.id === id) {
        setSelectedReq((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Durum güncellenemedi";
      toast.error(message);
    }
  };

  const convertToCustomer = async (req: ContactRequest) => {
    setActionBusy(true);
    try {
      // 1. Check if customer already exists by phone or email
      const { data: existing } = await supabase
        .from("customers")
        .select("id, full_name")
        .or(`phone.eq.${req.phone},email.eq.${req.email}`)
        .limit(1);

      if (existing && existing.length > 0) {
        toast.info(`Bu kişi (${existing[0].full_name}) zaten CRM müşterilerinizde kayıtlı.`);
      } else {
        // 2. Insert into customers
        const { data: newCust, error: insertError } = await supabase
          .from("customers")
          .insert({
            full_name: req.full_name,
            phone: req.phone || null,
            email: req.email || null,
            source: "Web İletişim Formu",
            stage: "yeni",
            property_id: req.property_id || null,
            notes: `Web sitesi iletişim formundan aktarıldı.\nMesaj: ${req.message || "Mesaj yok"}`
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // 3. Add activity
        if (newCust?.id) {
          await supabase.from("customer_activities").insert({
            customer_id: newCust.id,
            activity_type: "not",
            stage: "yeni",
            note: `İletişim formundan otomatik müşteri kartı oluşturuldu. Talep mesajı: "${req.message || ""}"`
          });
        }

        toast.success(`${req.full_name} CRM Müşterilerine başarıyla eklendi!`);
      }

      // Mark request as processed
      await updateStatus(req.id, "arandi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Müşteriye dönüştürülürken hata oluştu";
      toast.error(message);
    } finally {
      setActionBusy(false);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Bu iletişim talebini silmek istediğinize emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("contact_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Talep silindi.");
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (selectedReq?.id === id) setSelectedReq(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Silinemedi";
      toast.error(message);
    }
  };

  // Filtered requests
  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      r.full_name.toLowerCase().includes(q) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.message && r.message.toLowerCase().includes(q)) ||
      (r.properties?.title && r.properties.title.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    yeni: requests.filter((r) => r.status === "yeni").length,
    arandi: requests.filter((r) => r.status === "arandi").length,
    tamamlandi: requests.filter((r) => r.status === "tamamlandi").length,
  };

  return (
    <AdminLayout
      title="Gelen Formlar & İletişim Talepleri"
      action={
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="luxury-btn-outline flex items-center gap-2 text-xs py-2 px-3"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Yenile
        </button>
      }
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="luxury-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">Toplam Talep</span>
            <Inbox size={18} className="text-primary" />
          </div>
          <p className="font-display text-2xl text-foreground">{stats.total}</p>
        </div>
        <div className="luxury-card p-5 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-xs uppercase tracking-wider text-amber-500 font-medium">Bekleyen (Yeni)</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="font-display text-2xl text-amber-500">{stats.yeni}</p>
        </div>
        <div className="luxury-card p-5 border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-xs uppercase tracking-wider text-purple-400">İletişime Geçildi</span>
            <PhoneCall size={18} className="text-purple-400" />
          </div>
          <p className="font-display text-2xl text-purple-400">{stats.arandi}</p>
        </div>
        <div className="luxury-card p-5 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-xs uppercase tracking-wider text-emerald-500">Tamamlandı</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="font-display text-2xl text-emerald-500">{stats.tamamlandi}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, telefon, e-posta veya mesajda ara..."
            className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter size={15} className="text-muted-foreground ml-1" />
          {[
            { key: "all", label: `Tümü (${requests.length})` },
            { key: "yeni", label: `Yeni (${stats.yeni})` },
            { key: "arandi", label: `İletişime Geçildi (${stats.arandi})` },
            { key: "tamamlandi", label: `Tamamlandı (${stats.tamamlandi})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-sm font-body text-xs tracking-wider transition-colors whitespace-nowrap ${
                statusFilter === f.key
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="luxury-card p-12 text-center text-muted-foreground">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-primary" />
          <p className="font-body text-sm">Gelen talepler yükleniyor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="luxury-card p-16 text-center">
          <Inbox size={36} className="mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-display text-lg text-foreground mb-2">Henüz Talep Bulunmuyor</h3>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
            {search || statusFilter !== "all"
              ? "Arama kriterlerinize uygun form başvurusu bulunamadı."
              : "Web sitenizdeki iletişim formundan henüz bir mesaj gönderilmedi."}
          </p>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="bg-secondary/80 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Tarih</th>
                  <th className="py-3.5 px-4 font-medium">Gönderen</th>
                  <th className="py-3.5 px-4 font-medium">İletişim</th>
                  <th className="py-3.5 px-4 font-medium">İlan / Konu</th>
                  <th className="py-3.5 px-4 font-medium">Mesaj Özeti</th>
                  <th className="py-3.5 px-4 font-medium">Durum</th>
                  <th className="py-3.5 px-4 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((req) => {
                  const badge = statusBadges[req.status] || statusBadges.yeni;
                  const isUnread = req.status === "yeni";

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-secondary/30 transition-colors ${
                        isUnread ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-primary/70" />
                          {formatDateTime(req.created_at)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className={`font-medium text-foreground ${isUnread ? "font-bold" : ""}`}>
                          {req.full_name}
                        </p>
                        {req.source && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {req.source}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {req.phone && (
                            <a
                              href={`tel:${req.phone}`}
                              className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors"
                            >
                              <Phone size={12} className="text-primary" /> {req.phone}
                            </a>
                          )}
                          {req.email && (
                            <a
                              href={`mailto:${req.email}`}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Mail size={12} className="text-primary/70" /> {req.email}
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {req.properties ? (
                          <div className="max-w-[180px]">
                            <div className="flex items-center gap-1 text-xs text-primary font-medium truncate">
                              <Building2 size={13} className="shrink-0" />
                              <span className="truncate">{req.properties.title}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{req.properties.location}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Genel İletişim</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {req.message || "Mesaj içeriği girilmemiş."}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={req.status}
                          onChange={(e) => updateStatus(req.id, e.target.value as ContactRequest["status"])}
                          className={`text-xs px-2.5 py-1 rounded-sm border font-medium bg-background cursor-pointer focus:outline-none ${badge.text} ${badge.border}`}
                        >
                          <option value="yeni">Yeni</option>
                          <option value="okundu">Okundu</option>
                          <option value="arandi">İletişime Geçildi</option>
                          <option value="tamamlandi">Tamamlandı</option>
                          <option value="iptal">İptal</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Quick Link */}
                          {req.phone && (
                            <a
                              href={`https://wa.me/${req.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp'tan Yaz"
                              className="p-1.5 text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-sm transition-colors"
                            >
                              <MessageSquare size={15} />
                            </a>
                          )}

                          {/* View Detail Modal */}
                          <button
                            onClick={() => setSelectedReq(req)}
                            title="Talebi İncele"
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Convert to CRM Customer */}
                          <button
                            onClick={() => convertToCustomer(req)}
                            disabled={actionBusy}
                            title="CRM Müşterilerine Ekle"
                            className="p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-sm transition-colors"
                          >
                            <UserPlus size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteRequest(req.id)}
                            title="Sil"
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReq && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedReq(null)}
        >
          <div
            className="luxury-card max-w-xl w-full p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span
                  className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-sm border font-medium inline-block mb-2 ${
                    statusBadges[selectedReq.status]?.text
                  } ${statusBadges[selectedReq.status]?.border} ${statusBadges[selectedReq.status]?.bg}`}
                >
                  {statusBadges[selectedReq.status]?.label}
                </span>
                <h3 className="font-display text-xl text-foreground">{selectedReq.full_name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar size={12} /> {formatDateTime(selectedReq.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-sm border border-border/50 text-xs">
              <div>
                <span className="text-muted-foreground block mb-1">Telefon Numarası</span>
                {selectedReq.phone ? (
                  <a
                    href={`tel:${selectedReq.phone}`}
                    className="font-medium text-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    <Phone size={13} className="text-primary" /> {selectedReq.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">E-posta Adresi</span>
                {selectedReq.email ? (
                  <a
                    href={`mailto:${selectedReq.email}`}
                    className="font-medium text-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    <Mail size={13} className="text-primary" /> {selectedReq.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>

            {/* Related Property if any */}
            {selectedReq.properties && (
              <div className="border border-primary/30 bg-primary/5 p-4 rounded-sm">
                <span className="text-[10px] uppercase tracking-wider text-primary font-medium block mb-1">
                  İlgilenilen İlan
                </span>
                <p className="font-display text-base text-foreground">{selectedReq.properties.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedReq.properties.location}</p>
              </div>
            )}

            {/* Message Body */}
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium block mb-2">
                Talep / Mesaj İçeriği
              </span>
              <div className="bg-secondary/50 p-4 rounded-sm border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedReq.message || "Mesaj içeriği bulunmuyor."}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {selectedReq.phone && (
                  <a
                    href={`https://wa.me/${selectedReq.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-btn-outline text-xs py-2 px-3 flex items-center gap-1.5 text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </a>
                )}
                {selectedReq.phone && (
                  <a
                    href={`tel:${selectedReq.phone}`}
                    className="luxury-btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    <Phone size={14} /> Ara
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => convertToCustomer(selectedReq)}
                  disabled={actionBusy}
                  className="luxury-btn text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <UserPlus size={14} /> CRM Müşterisine Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminContactRequests;
