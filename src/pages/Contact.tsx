import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Contact = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const propertyName = searchParams.get("property");
  const propertyId = searchParams.get("id");

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", intent: "Alıcı / Yatırımcı", message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // URL parametresinden gelen ilan bilgisini mesaja otomatik işle
  useEffect(() => {
    if (propertyName && !formData.message) {
      setFormData((prev) => ({
        ...prev,
        message: `"${propertyName}" ilanı hakkında detaylı bilgi ve randevu talep ediyorum.`,
      }));
    }
  }, [propertyName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("Ad soyad ve mesaj alanları zorunludur.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("contact_requests").insert({
        full_name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        message: formData.message.trim(),
        property_id: propertyId || null,
        source: "website",
      });
      if (error) throw error;
      toast.success(t("contactPage.thanks"));
      setSent(true);
      setFormData({ name: "", email: "", phone: "", intent: "Alıcı / Yatırımcı", message: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bir hata oluştu";
      if (message.includes("Çok fazla istek")) {
        toast.error("Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.");
      } else {
        toast.error(message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading subtitle={t("contactPage.subtitle")} title={t("contactPage.title")} description={t("contactPage.desc")} />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                {sent ? (
                  <div className="luxury-card p-12 text-center">
                    <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
                      <Send size={28} className="text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground mb-3">Mesajınız İletildi</h3>
                    <p className="text-muted-foreground font-body leading-relaxed max-w-md mx-auto">
                      {t("contactPage.thanks")}
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="luxury-btn-outline mt-8"
                    >
                      Yeni Mesaj Gönder
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {propertyName && (
                      <div className="p-4 border border-primary/30 bg-primary/5 rounded-sm mb-2">
                        <p className="font-body text-xs tracking-wider uppercase text-primary mb-1">İlan Hakkında Bilgi Talebi</p>
                        <p className="font-display text-base text-foreground">{propertyName}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.name")} *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" required maxLength={120} />
                      </div>
                      <div>
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.email")}</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" maxLength={255} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.phone")}</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" maxLength={30} />
                      </div>
                      <div>
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.iam")}</label>
                        <select value={formData.intent} onChange={(e) => setFormData({ ...formData, intent: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors">
                          <option>{t("contactPage.buyer")}</option>
                          <option>{t("contactPage.seller")}</option>
                          <option>{t("contactPage.investor")}</option>
                          <option>{t("contactPage.developer")}</option>
                          <option>{t("contactPage.other")}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.message")} *</label>
                      <textarea rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors resize-none" required maxLength={3000} />
                    </div>
                    <button type="submit" disabled={busy} className="luxury-btn-primary disabled:opacity-60 flex items-center gap-2">
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      {t("contactPage.send")}
                    </button>
                  </form>
                )}
              </ScrollReveal>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.2}>
                <div className="glass-panel p-8 space-y-8">
                  <div className="flex items-start gap-4">
                    <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">{t("contactPage.office")}</h4>
                      <p className="text-muted-foreground font-body text-sm leading-relaxed">
                        Güzelyurt, Ertuğrul Gazi Cd. 59 A,<br />34515 Esenyurt / İstanbul
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">{t("contactPage.phone")}</h4>
                      <p className="text-muted-foreground font-body text-sm">
                        <a href="tel:05302503252" className="hover:text-primary transition-colors text-foreground font-medium">
                          0530 250 32 52
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">{t("contactPage.email")}</h4>
                      <p className="text-muted-foreground font-body text-sm">
                        <a href="mailto:info@sarraf34.com" className="hover:text-primary transition-colors">
                          info@sarraf34.com
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">{t("contactPage.hours")}</h4>
                      <p className="text-muted-foreground font-body text-sm">{t("contactPage.monFri")}<br />{t("contactPage.sat")}<br />{t("contactPage.sun")}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Social Media */}
              <ScrollReveal delay={0.3}>
                <div className="glass-panel p-6 mt-6">
                  <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-4">Sosyal Medya</h4>
                  <div className="flex gap-4">
                    <a href="https://www.instagram.com/sarraf34insaat" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors" title="Instagram">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a href="https://www.facebook.com/sarraf34insaat" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors" title="Facebook">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="https://wa.me/905302503252" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-[#25D366] hover:border-[#25D366]/40 transition-colors" title="WhatsApp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Google Maps */}
          <ScrollReveal>
            <div className="mt-16 overflow-hidden rounded-sm border border-border">
              <iframe
                src="https://maps.google.com/maps?q=G%C3%BCzelyurt%2C%20Ertu%C4%9Frul%20Gazi%20Cd.%2059%20A%2C%2034515%20Esenyurt%2F%C4%B0stanbul&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sarraf 34 Ofis Lokasyonu - Esenyurt İstanbul"
                className="w-full"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
