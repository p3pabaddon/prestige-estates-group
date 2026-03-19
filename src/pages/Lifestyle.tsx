import { Link } from "react-router-dom";
import { ArrowRight, Anchor, Wine, GraduationCap, Building, Palette, TreePine } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

import lifestyle from "@/assets/lifestyle.jpg";
import villaPool from "@/assets/villa-pool.jpg";

const Lifestyle = () => {
  const { t } = useLanguage();

  const amenities = [
    { icon: Anchor, title: t("lifePage.a1"), desc: t("lifePage.a1d") },
    { icon: Wine, title: t("lifePage.a2"), desc: t("lifePage.a2d") },
    { icon: GraduationCap, title: t("lifePage.a3"), desc: t("lifePage.a3d") },
    { icon: Building, title: t("lifePage.a4"), desc: t("lifePage.a4d") },
    { icon: Palette, title: t("lifePage.a5"), desc: t("lifePage.a5d") },
    { icon: TreePine, title: t("lifePage.a6"), desc: t("lifePage.a6d") },
  ];

  return (
    <Layout>
      <section className="relative h-[60vh] overflow-hidden">
        <ParallaxImage src={lifestyle} alt="Luxury lifestyle" className="h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent flex items-end">
          <div className="container-luxury pb-16">
            <ScrollReveal>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">{t("lifePage.subtitle")}</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground max-w-2xl">
                {t("lifePage.title1")}<span className="italic gradient-gold-text">{t("lifePage.title2")}</span>
              </h1>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-luxury max-w-4xl text-center">
          <ScrollReveal>
            <p className="font-editorial text-xl md:text-2xl text-muted-foreground leading-relaxed italic">
              {t("lifePage.quote")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <SectionHeading subtitle={t("lifePage.amenities")} title={t("lifePage.amenTitle")} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {amenities.map((a, i) => (
              <ScrollReveal key={a.title} delay={i * 0.08}>
                <div className="luxury-card p-8 h-full text-center">
                  <a.icon size={32} className="text-primary mx-auto mb-6" />
                  <h3 className="font-display text-xl text-foreground mb-3">{a.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">{a.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <ParallaxImage src={villaPool} alt="Villa pool sunset" className="h-[60vh]" speed={0.2} />
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center text-center">
          <ScrollReveal className="container-luxury">
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
              {t("lifePage.sunset1")}<span className="italic gradient-gold-text">{t("lifePage.sunset2")}</span>
            </h2>
            <Link to="/properties" className="luxury-btn-primary">
              {t("lifePage.findAddress")} <ArrowRight size={16} className="ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Lifestyle;
