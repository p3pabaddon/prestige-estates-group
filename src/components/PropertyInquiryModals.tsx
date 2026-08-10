import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, BellRing, Calendar, Clock, CheckCircle2, Loader2, Sparkles, Phone, Mail, User } from "lucide-react";
import { formatTRY } from "@/lib/crm";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: number | null;
  propertyLocation?: string;
  ilanNo?: string;
}

/**
 * 1. Fiyatı Düşünce Haber Ver Modalı
 */
export function PriceDropAlertModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyPrice,
  ilanNo,
}: BaseModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email">("whatsapp");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      return toast.error("Lütfen adınızı ve telefon numaranızı girin.");
    }

    setLoading(true);
    try {
      const message = `[Fiyat Düşüş Bildirimi Talebi] İlan: "${propertyTitle}" (İlan No: ${ilanNo || propertyId}). Mevcut Fiyat: ${
        propertyPrice ? formatTRY(propertyPrice) : "Belirtilmedi"
      }. ${targetPrice ? `Hedef Bütçe: ${targetPrice} TL.` : ""} Bildirim Kanalı: ${channel.toUpperCase()}`;

      // 1. Save to contact_requests
      const { error: reqError } = await supabase.from("contact_requests").insert({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        property_id: propertyId,
        subject: `Fiyat Bildirimi: ${propertyTitle}`,
        message: message,
        status: "yeni",
      });

      // 2. Also register in customers for CRM tracking
      await supabase.from("customers").insert({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        source: "Fiyat Takip Formu",
        stage: "yeni",
        property_id: propertyId,
        notes: message,
      });

      if (reqError) {
        console.warn("Contact request record created with note:", reqError.message);
      }

      setSuccess(true);
      toast.success("Talebiniz alındı! Fiyat güncellendiğinde ilk sizin haberiniz olacak.");
    } catch (err: any) {
      toast.error("Bir hata oluştu. Lütfen doğrudan WhatsApp üzerinden ulaşın.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="luxury-card max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Fiyatı Düşünce Haber Ver</h3>
              <p className="font-body text-xs text-muted-foreground">
                Portföy fiyatında indirim olduğunda ilk siz haberdar olun.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
            <h4 className="font-display text-xl text-foreground font-semibold">Talebiniz Başarıyla Kaydedildi!</h4>
            <p className="font-body text-xs text-muted-foreground max-w-sm mx-auto">
              "{propertyTitle}" ilanının fiyatında herhangi bir değişiklik olduğunda {phone} numaralı hattınıza anında bildirim gönderilecektir.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="gradient-gold text-primary-foreground px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider font-body"
            >
              Tamam
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-secondary/60 rounded border border-border/60 text-xs font-body">
              <span className="text-muted-foreground">İlgilenilen Portföy: </span>
              <strong className="text-foreground">{propertyTitle}</strong>
              {propertyPrice && (
                <div className="text-primary font-bold mt-1 font-display text-sm">
                  Güncel Fiyat: {formatTRY(propertyPrice)}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                  Ad Soyad *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full bg-secondary border border-border px-3 py-2.5 pl-9 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
                  />
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                    Telefon (WhatsApp) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full bg-secondary border border-border px-3 py-2.5 pl-9 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
                    />
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                    Hedef Bütçeniz (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="Örn: 4.500.000 TL"
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                  Bildirim Kanalı
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "whatsapp", label: "WhatsApp" },
                    { id: "sms", label: "SMS" },
                    { id: "email", label: "E-Posta" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChannel(c.id as any)}
                      className={`py-2 text-xs font-body rounded border transition-colors ${
                        channel === c.id
                          ? "bg-primary text-primary-foreground font-bold border-primary"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 gradient-gold text-primary-foreground py-3 text-xs tracking-wider uppercase font-body font-semibold rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} />}
                Fiyat Takibi Başlat
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-border text-xs tracking-wider uppercase font-body text-muted-foreground hover:text-foreground rounded"
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * 2. Yer Gösterme & Randevu Talep Et Modalı
 */
export function ScheduleTourModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyPrice,
  propertyLocation,
  ilanNo,
}: BaseModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("13:00 - 16:00 (Öğleden Sonra)");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !date) {
      return toast.error("Lütfen ad, telefon ve randevu tarihini seçin.");
    }

    setLoading(true);
    try {
      const message = `[Yer Gösterme Randevu Talebi] Tarih: ${date} / Saat: ${timeSlot}. İlan: "${propertyTitle}" (No: ${
        ilanNo || propertyId
      }). Müşteri Notu: ${notes || "Yok"}`;

      // 1. Insert contact request
      await supabase.from("contact_requests").insert({
        full_name: fullName.trim(),
        phone: phone.trim(),
        property_id: propertyId,
        subject: `Yer Gösterme Randevusu: ${propertyTitle}`,
        message: message,
        status: "yeni",
      });

      // 2. Insert into CRM customer with new stage
      const { data: customerData } = await supabase
        .from("customers")
        .insert({
          full_name: fullName.trim(),
          phone: phone.trim(),
          source: "Web Randevu Formu",
          stage: "yeni",
          property_id: propertyId,
          notes: message,
        })
        .select("id")
        .single();

      // 3. Create a reminder for the staff
      if (customerData?.id) {
        await supabase.from("reminders").insert({
          customer_id: customerData.id,
          title: `Randevu: ${fullName} - ${propertyTitle}`,
          note: `Talep edilen zaman: ${date} (${timeSlot})`,
          remind_at: new Date(date).toISOString(),
        });
      }

      setSuccess(true);
      toast.success("Randevu talebiniz danışmanımıza iletildi! En kısa sürede teyit için aranacaksınız.");
    } catch (err: any) {
      toast.error("Bir hata oluştu. WhatsApp üzerinden doğrudan randevu alabilirsiniz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="luxury-card max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Yer Gösterme Randevusu Al</h3>
              <p className="font-body text-xs text-muted-foreground">
                Gayrimenkulü uzman danışmanımız eşliğinde yerinde inceleyin.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
            <h4 className="font-display text-xl text-foreground font-semibold">Randevu Talebiniz Alındı!</h4>
            <p className="font-body text-xs text-muted-foreground max-w-sm mx-auto">
              {date} günü {timeSlot} saat aralığında yer gösterimi için danışmanımız {phone} numaranızdan sizi arayarak teyit sağlayacaktır.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="gradient-gold text-primary-foreground px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider font-body"
            >
              Tamam
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-secondary/60 rounded border border-border/60 text-xs font-body">
              <span className="text-muted-foreground">İncelenecek İlan: </span>
              <strong className="text-foreground">{propertyTitle}</strong>
              <div className="text-muted-foreground mt-0.5 text-[11px]">{propertyLocation || "İstanbul"}</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                    Tercih Edilen Gün *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                    Saat Aralığı
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
                  >
                    <option value="10:00 - 12:00 (Sabah)">10:00 - 12:00 (Sabah)</option>
                    <option value="13:00 - 16:00 (Öğleden Sonra)">13:00 - 16:00 (Öğle)</option>
                    <option value="16:00 - 19:00 (Akşam)">16:00 - 19:00 (Akşam)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1 font-semibold">
                  Ek Not / Sorularınız
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Araçla geleceğiz, otopark durumu nedir?"
                  className="w-full bg-secondary border border-border px-3 py-2 text-foreground font-body text-xs rounded focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 gradient-gold text-primary-foreground py-3 text-xs tracking-wider uppercase font-body font-semibold rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                Randevu Talebi Gönder
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-border text-xs tracking-wider uppercase font-body text-muted-foreground hover:text-foreground rounded"
              >
                Kapat
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
