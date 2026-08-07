import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

import office from "@/assets/office.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const About = () => {
  const { t } = useLanguage();

  const values = [
    { title: t("aboutPage.v1"), desc: t("aboutPage.v1d") },
    { title: t("aboutPage.v2"), desc: t("aboutPage.v2d") },
    { title: t("aboutPage.v3"), desc: t("aboutPage.v3d") },
    { title: t("aboutPage.v4"), desc: t("aboutPage.v4d") },
  ];

  return (
    <Layout>
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <ParallaxImage src={office} alt="Sarraf 34 İnşaat Yapı Gayrimenkul" className="h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex items-end">
          <div className="container-luxury pb-16">
            <ScrollReveal>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">{t("aboutPage.subtitle")}</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground">
                {t("aboutPage.title1")}<span className="italic gradient-gold-text">{t("aboutPage.title2")}</span>{t("aboutPage.title3")}
              </h1>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-luxury max-w-4xl">
          <ScrollReveal>
            <div className="space-y-6 text-muted-foreground font-body leading-relaxed text-lg">
              <p>{t("aboutPage.p1")}</p>
              <p>{t("aboutPage.p2")}</p>
              <p>{t("aboutPage.p3")}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <SectionHeading subtitle={t("aboutPage.values")} title={t("aboutPage.valuesTitle")} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 0.1}>
                <div className="text-center">
                  <h3 className="font-display text-2xl text-primary mb-4">{v.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <ParallaxImage src={heroVilla} alt="Sarraf 34 İletişim" className="h-[50vh]" speed={0.15} />
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-center">
          <ScrollReveal className="container-luxury">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">{t("aboutPage.cta")}</h2>
            <Link to="/contact" className="luxury-btn-primary">
              {t("aboutPage.ctaBtn")} <ArrowRight size={16} className="ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default About;
