import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);
  const { t } = useLanguage();

  const faqs = [
    { q: t("faq.1.q"), a: t("faq.1.a") },
    { q: t("faq.2.q"), a: t("faq.2.a") },
    { q: t("faq.3.q"), a: t("faq.3.a") },
    { q: t("faq.4.q"), a: t("faq.4.a") },
    { q: t("faq.5.q"), a: t("faq.5.a") },
    { q: t("faq.6.q"), a: t("faq.6.a") },
    { q: t("faq.7.q"), a: t("faq.7.a") },
    { q: t("faq.8.q"), a: t("faq.8.a") },
  ];

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading subtitle={t("faqPage.subtitle")} title={t("faqPage.title")} description={t("faqPage.desc")} />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury max-w-3xl">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="border-b border-border">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left"
                >
                  <span className="font-display text-lg text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-primary flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${open === i ? "max-h-96 pb-6" : "max-h-0"}`}>
                  <p className="text-muted-foreground font-body leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
