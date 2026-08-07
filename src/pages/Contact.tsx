import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", intent: "Buyer", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t("contactPage.thanks"));
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.name")}</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" required />
                    </div>
                    <div>
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.email")}</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.phone")}</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
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
                    <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">{t("contactPage.message")}</label>
                    <textarea rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors resize-none" required />
                  </div>
                  <button type="submit" className="luxury-btn-primary">
                    {t("contactPage.send")} <Send size={14} className="ml-2" />
                  </button>
                </form>
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
                      <p className="text-muted-foreground font-body text-sm">Sarraf 34 Plaza, Merkez Mah.<br />İstanbul, Türkiye</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">{t("contactPage.phone")}</h4>
                      <p className="text-muted-foreground font-body text-sm">+90 (212) 650 34 34</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">{t("contactPage.email")}</h4>
                      <p className="text-muted-foreground font-body text-sm">info@sarraf34.com</p>
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
            </div>
          </div>

          {/* Google Maps */}
          <ScrollReveal>
            <div className="mt-16 overflow-hidden rounded-sm border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d192697.8885055268!2d28.871954573199853!3d41.0053702157774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1710000000000!5m2!1str!2str"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sarraf 34 Ofis Lokasyonu"
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
