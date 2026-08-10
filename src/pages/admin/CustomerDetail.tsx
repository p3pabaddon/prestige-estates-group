import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { STAGES, Stage, stageLabel, stageTone, ACTIVITY_TYPES, formatTRY, formatDateTime } from "@/lib/crm";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Phone, Mail, Plus, MessageCircle, Building2, UserCheck, Sparkles, ExternalLink, Download, Loader2 } from "lucide-react";
import { generatePropertyPDF } from "@/lib/pdfBrochure";
import { sharePropertyOnWhatsApp } from "@/lib/whatsappShare";
import { getPropertyDetailUrl } from "@/lib/propertyUrl";

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
  assigned_to: string | null;
  created_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  stage: string | null;
  note: string | null;
  created_at: string;
}

interface StaffProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface ScoredProperty {
  id: string;
  title: string;
  price: number | null;
  currency?: string | null;
  location?: string | null;
  district: string | null;
  city?: string | null;
  property_type: string | null;
  listing_type?: string | null;
  rooms?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  gross_m2?: number | null;
  net_m2?: number | null;
  floor?: string | null;
  total_floors?: number | null;
  building_age?: string | null;
  heating?: string | null;
  ilan_no?: string | null;
  description?: string | null;
  images: string[] | null;
  matchScore: number;
  matchReasons: string[];
}

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [c, setC] = useState<Customer | null>(null);
  const [acts, setActs] = useState<Activity[]>([]);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [matchingProps, setMatchingProps] = useState<ScoredProperty[]>([]);
  const [act, setAct] = useState({ activity_type: "Not", note: "", stage: "" });
  const [rem, setRem] = useState({ title: "", remind_at: "" });

  const load = useCallback(async () => {
    if (!id) return;

    // Fetch staff
    const { data: staffData } = await supabase.from("profiles").select("id, full_name, email");
    setStaffList(staffData ?? []);

    const [{ data: cust, error }, { data: a }] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).maybeSingle(),
      supabase.from("customer_activities").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    ]);

    if (error) toast.error(error.message);
    const customerObj = cust as Customer | null;
    setC(customerObj);
    setActs((a as Activity[]) ?? []);

    // Advanced Portfolio Matching Engine
    if (customerObj) {
      const { data: allProps } = await supabase
        .from("properties")
        .select("*")
        .eq("published", true)
        .neq("status", "satildi");

      if (allProps && allProps.length > 0) {
        const scored: ScoredProperty[] = allProps.map((p: any) => {
          let score = 0;
          const reasons: string[] = [];

          // 1. District match (40 pts)
          if (customerObj.interested_district && p.district) {
            const reqDist = customerObj.interested_district.toLowerCase().trim();
            const propDist = p.district.toLowerCase().trim();
            if (propDist.includes(reqDist) || reqDist.includes(propDist)) {
              score += 40;
              reasons.push(`${p.district} Bölgesi`);
            }
          } else {
            score += 15;
          }

          // 2. Budget match (40 pts)
          const price = Number(p.price) || 0;
          const minB = customerObj.budget_min || 0;
          const maxB = customerObj.budget_max || Infinity;
          if (price > 0 && (minB > 0 || maxB < Infinity)) {
            if (price >= minB && price <= maxB) {
              score += 40;
              reasons.push("Bütçeye Tam Uygun");
            } else if (price <= maxB * 1.15 && price >= minB * 0.85) {
              score += 25;
              reasons.push("Bütçe Yakın (%15)");
            }
          } else {
            score += 20;
          }

          // 3. Property Type match (20 pts)
          if (customerObj.interested_type && p.property_type) {
            if (p.property_type.toLowerCase() === customerObj.interested_type.toLowerCase()) {
              score += 20;
              reasons.push(p.property_type);
            }
          } else {
            score += 10;
          }

          return {
            ...p,
            matchScore: Math.min(100, Math.round(score)),
            matchReasons: reasons,
          };
        });

        scored.sort((a, b) => b.matchScore - a.matchScore);
        // Show top 6 matches
        setMatchingProps(scored.slice(0, 6));
      } else {
        setMatchingProps([]);
      }
    }
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

  const handleReassign = async (newAssignee: string) => {
    if (!id) return;
    const { error } = await supabase.from("customers").update({ assigned_to: newAssignee }).eq("id", id);
    if (error) return toast.error(error.message);

    const staffName = staffList.find((s) => s.id === newAssignee)?.full_name || "Danışman";
    await supabase.from("customer_activities").insert({
      customer_id: id,
      activity_type: "Not",
      note: `Müşteri yeni danışmana zimmetlendi: ${staffName}`,
      created_by: user?.id,
    });

    toast.success(`Müşteri ${staffName} adlı personele atandı.`);
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
      assigned_to: c?.assigned_to || user?.id,
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

  if (!c) {
    return (
      <AdminLayout title="Müşteri Detayı">
        <p className="font-body text-sm text-muted-foreground">Kayıt bulunamadı.</p>
      </AdminLayout>
    );
  }

  // Format clean whatsapp link
  const cleanPhone = c.phone?.replace(/[^0-9]/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`}?text=Merhaba%20${encodeURIComponent(
        c.full_name
      )}%20Bey,%20Sarraf%2034%20Gayrimenkul'den%20yazıyorum.`
    : null;

  return (
    <AdminLayout
      title={c.full_name}
      action={
        <div className="flex gap-2">
          <Link
            to="/admin/musteriler"
            className="border border-border px-4 py-2.5 font-body text-xs tracking-wider uppercase text-muted-foreground hover:text-primary flex items-center gap-2 rounded-sm"
          >
            <ArrowLeft size={13} /> Müşteri Listesi
          </Link>
          {role === "admin" && (
            <button
              onClick={removeCustomer}
              className="border border-border px-4 py-2.5 text-muted-foreground hover:text-destructive rounded-sm"
              title="Müşteriyi Sil"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Left Column: Details & Quick Contact */}
        <div className="space-y-6">
          <div className="luxury-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`inline-block font-body text-[10px] tracking-wider uppercase px-2.5 py-1 rounded font-semibold ${stageTone(c.stage)}`}>
                {stageLabel(c.stage)}
              </span>
              <span className="text-[11px] font-body text-muted-foreground">
                Kayıt: {formatDateTime(c.created_at)}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {c.phone && (
                <a
                  href={`tel:${c.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-secondary border border-border text-foreground hover:text-primary rounded-sm font-body text-xs font-semibold"
                >
                  <Phone size={13} /> Ara
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 rounded-sm font-body text-xs font-semibold"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
              )}
            </div>

            {/* Stage Selector */}
            <div>
              <label className={label}>Aşama Değiştir</label>
              <select
                className={input}
                value={c.stage}
                onChange={(e) => patch({ stage: e.target.value as Stage })}
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Staff Assignment (Admin only or display) */}
            {role === "admin" ? (
              <div>
                <label className={label}>Zimmetli Danışman (Ofis İçi Atama)</label>
                <select
                  className={input}
                  value={c.assigned_to ?? ""}
                  onChange={(e) => handleReassign(e.target.value)}
                >
                  <option value="">Atanmamış</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-secondary/50 rounded-sm border border-border">
                <span className="text-[10px] uppercase font-body text-muted-foreground block mb-0.5">Zimmetli Danışman</span>
                <span className="text-xs font-semibold text-foreground font-body">
                  {staffList.find((s) => s.id === c.assigned_to)?.full_name || "Size Zimmetli"}
                </span>
              </div>
            )}

            {/* Specs list */}
            <dl className="space-y-2.5 pt-2 border-t border-border font-body text-xs">
              {[
                ["Telefon", c.phone ?? "—"],
                ["E-posta", c.email ?? "—"],
                ["Kaynak", c.source ?? "—"],
                ["Bütçe Aralığı", `${formatTRY(c.budget_min)} – ${formatTRY(c.budget_max)}`],
                ["İlgilendiği Tip", c.interested_type ?? "—"],
                ["Bölge Talebi", c.interested_district ?? "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-foreground text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Notes */}
            <div className="pt-2 border-t border-border">
              <label className={label}>Müşteri Notları (Otomatik Kaydedilir)</label>
              <textarea
                className={`${input} min-h-24`}
                defaultValue={c.notes ?? ""}
                onBlur={(e) => e.target.value !== (c.notes ?? "") && patch({ notes: e.target.value })}
                maxLength={3000}
                placeholder="Görüşme ve detay notları..."
              />
            </div>
          </div>

          {/* Matching Properties Box (Smart CRM Recommendation Engine) */}
          <div className="luxury-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="text-primary" size={15} />
                  <span>Akıllı Portföy Eşleşmeleri ({matchingProps.length})</span>
                </h2>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                  Bölge, bütçe ve konut tipi kriterlerine göre otomatik hesaplanan öneriler.
                </p>
              </div>
            </div>

            {matchingProps.length === 0 ? (
              <p className="text-xs font-body text-muted-foreground">
                Müşterinin belirttiği kriterlere uyan aktif portföy bulunamadı.
              </p>
            ) : (
              <div className="space-y-3">
                {matchingProps.map((p) => {
                  const isHighScore = p.matchScore >= 75;
                  const isMediumScore = p.matchScore >= 50 && p.matchScore < 75;

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-sm bg-secondary/40 border border-border space-y-2.5 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-12 rounded bg-muted overflow-hidden flex-shrink-0 border border-border/50">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Building2 size={16} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`text-[10px] font-body font-bold px-1.5 py-0.5 rounded ${
                                isHighScore
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : isMediumScore
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              %{p.matchScore} Uyum
                            </span>
                            {p.district && (
                              <span className="text-[10px] font-body text-muted-foreground truncate">
                                {p.district}
                              </span>
                            )}
                          </div>

                          <Link
                            to={getPropertyDetailUrl({ id: p.id, ilan_no: p.ilan_no, title: p.title, property_type: p.property_type, listing_type: p.listing_type })}
                            className="text-xs font-semibold text-foreground truncate hover:text-primary block font-body"
                          >
                            {p.title}
                          </Link>
                          <p className="text-xs text-primary font-bold font-body mt-0.5">
                            {formatTRY(p.price)}
                          </p>
                        </div>

                        <Link
                          to={getPropertyDetailUrl({ id: p.id, ilan_no: p.ilan_no, title: p.title, property_type: p.property_type, listing_type: p.listing_type })}
                          className="text-muted-foreground hover:text-foreground p-1"
                          title="İlanı Yeni Sekmede Aç"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>

                      {/* Match reasons tags */}
                      {p.matchReasons.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.matchReasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-body px-1.5 py-0.5 rounded bg-card/60 text-muted-foreground border border-border/40"
                            >
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quick Proposal Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        {/* WhatsApp Custom Proposal */}
                        <button
                          type="button"
                          onClick={async () => {
                            const clientPhone = c.phone?.replace(/[^0-9]/g, "");
                            const formattedPhone = clientPhone
                              ? clientPhone.startsWith("90")
                                ? clientPhone
                                : `90${clientPhone}`
                              : "";

                            const propertyUrl = `${window.location.origin}${getPropertyDetailUrl({ id: p.id, ilan_no: p.ilan_no, title: p.title, property_type: p.property_type, listing_type: p.listing_type })}`;
                            const msg = `Sayın *${c.full_name}*,\n\nSarraf 34 Gayrimenkul olarak aradığınız kriterlere özel (%${p.matchScore} Uyumlu) portföy önerimiz:\n\n🏠 *${p.title}*\n📍 *Konum:* ${p.district || p.city || "İstanbul"}\n💰 *Fiyat:* ${formatTRY(p.price)}\n\nİlan Detayları ve Fotoğraflar:\n🔗 ${propertyUrl}\n\nİnceleyip randevu oluşturmak isterseniz bize buradan dilediğiniz an yazabilirsiniz.`;

                            const waLink = formattedPhone
                              ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
                              : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

                            window.open(waLink, "_blank");

                            // Auto log presentation activity
                            if (id) {
                              await supabase.from("customer_activities").insert({
                                customer_id: id,
                                activity_type: "Portföy Sunumu",
                                note: `Müşteriye "${p.title}" ilanı WhatsApp üzerinden teklif olarak gönderildi (%${p.matchScore} Uyum).`,
                                created_by: user?.id,
                              });
                              load();
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-sm bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/25 text-[11px] font-body font-medium transition-colors"
                          title="Müşteriye Özel Teklif Mesajı ile WhatsApp'tan Gönder"
                        >
                          <MessageCircle size={12} /> WhatsApp Teklifi
                        </button>

                        {/* PDF Download */}
                        <button
                          type="button"
                          onClick={async () => {
                            toast.info("PDF Broşür Hazırlanıyor...");
                            await generatePropertyPDF({
                              id: p.id,
                              title: p.title,
                              price: p.price,
                              currency: p.currency,
                              location: p.location,
                              district: p.district,
                              city: p.city,
                              bedrooms: p.bedrooms,
                              bathrooms: p.bathrooms,
                              gross_m2: p.gross_m2,
                              net_m2: p.net_m2,
                              floor: p.floor,
                              total_floors: p.total_floors,
                              building_age: p.building_age,
                              heating: p.heating,
                              property_type: p.property_type,
                              listing_type: p.listing_type,
                              ilan_no: p.ilan_no,
                              description: p.description,
                              images: p.images || [],
                              agent_name: "Sarraf 34 Gayrimenkul",
                              agent_phone: "+90 532 552 34 34",
                            });
                            toast.success("PDF İndirildi");
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-sm bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 text-[11px] font-body font-medium transition-colors"
                          title="İlanın PDF Broşürünü İndir"
                        >
                          <Download size={12} /> PDF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Reminder */}
          <form onSubmit={addReminder} className="luxury-card p-6 space-y-4">
            <h2 className="font-display text-base text-foreground font-semibold">Hatırlatma / Randevu Ekle</h2>
            <input
              className={input}
              placeholder="Örn: Portföy sunumu için aranacak"
              value={rem.title}
              onChange={(e) => setRem({ ...rem, title: e.target.value })}
              maxLength={150}
              required
            />
            <input
              type="datetime-local"
              className={input}
              value={rem.remind_at}
              onChange={(e) => setRem({ ...rem, remind_at: e.target.value })}
              required
            />
            <button className="gradient-gold text-primary-foreground w-full py-2.5 text-xs tracking-wider uppercase font-body font-semibold flex items-center justify-center gap-2 rounded-sm">
              <Plus size={13} /> Hatırlatıcı Oluştur
            </button>
          </form>
        </div>

        {/* Right Column: Interactions / Timeline */}
        <div className="space-y-6 min-w-0">
          <form onSubmit={addActivity} className="luxury-card p-6 space-y-4">
            <h2 className="font-display text-base text-foreground font-semibold">Yeni Etkileşim / Görüşme Kaydı</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Etkileşim Türü</label>
                <select
                  className={input}
                  value={act.activity_type}
                  onChange={(e) => setAct({ ...act, activity_type: e.target.value })}
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Aşamayı Otomatik Güncelle</label>
                <select
                  className={input}
                  value={act.stage}
                  onChange={(e) => setAct({ ...act, stage: e.target.value })}
                >
                  <option value="">Aşama Değişmesin</option>
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              className={`${input} min-h-24`}
              placeholder="Müşteriyle yapılan telefon, WhatsApp veya ofis görüşmesi notları..."
              value={act.note}
              onChange={(e) => setAct({ ...act, note: e.target.value })}
              maxLength={3000}
              required
            />
            <button className="gradient-gold text-primary-foreground px-8 py-2.5 text-xs tracking-wider uppercase font-body font-semibold rounded-sm">
              Kaydet
            </button>
          </form>

          {/* Timeline */}
          <div className="luxury-card p-6">
            <h2 className="font-display text-base text-foreground font-semibold mb-6">Müşteri Geçmişi & Zaman Çizelgesi</h2>
            {acts.length === 0 && (
              <p className="font-body text-xs text-muted-foreground">Henüz kaydedilmiş etkileşim bulunmuyor.</p>
            )}
            <div className="space-y-5">
              {acts.map((a) => (
                <div key={a.id} className="border-l-2 border-primary/40 pl-4 relative">
                  <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-body text-xs font-bold tracking-wider uppercase text-primary">
                      {a.activity_type}
                    </p>
                    {a.stage && (
                      <span className={`font-body text-[9px] tracking-wider uppercase px-2 py-0.5 rounded font-semibold ${stageTone(a.stage)}`}>
                        {stageLabel(a.stage)}
                      </span>
                    )}
                    <span className="font-body text-[11px] text-muted-foreground ml-auto">
                      {formatDateTime(a.created_at)}
                    </span>
                  </div>
                  <p className="font-body text-sm text-foreground mt-1.5 whitespace-pre-wrap bg-secondary/30 p-3 rounded-sm border border-border/50">
                    {a.note}
                  </p>
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