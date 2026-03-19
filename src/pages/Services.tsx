import { Link } from "react-router-dom";
import { ArrowRight, Building2, Key, TrendingUp, Megaphone, UserCheck, Briefcase, Search, BarChart3 } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import ParallaxImage from "@/components/ParallaxImage";
import { useLanguage } from "@/contexts/LanguageContext";
import heroVilla from "@/assets/hero-villa.jpg";

const Services = () => {
  const { t } = useLanguage();

  const services = [
    { icon: Building2, title: t("servPage.s1"), desc: t("servPage.s1d") },
    { icon: Key, title: t("servPage.s2"), desc: t("servPage.s2d") },
    { icon: TrendingUp, title: t("servPage.s3"), desc: t("servPage.s3d") },
    { icon: Megaphone, title: t("servPage.s4"), desc: t("servPage.s4d") },
    { icon: UserCheck, title: t("servPage.s5"), desc: t("servPage.s5d") },
    { icon: Briefcase, title: t("servPage.s6"), desc: t("servPage.s6d") },
    { icon: Search, title: t("servPage.s7"), desc: t("servPage.s7d") },
    { icon: BarChart3, title: t("servPage.s8"), desc: t("servPage.s8d") },
  ];

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading subtitle={t("servPage.subtitle")} title={t("servPage.title")} description={t("servPage.desc")} />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 0.08}>
                <div className="luxury-card p-8 md:p-10 h-full">
                  <s.icon size={28} className="text-primary mb-6" />
                  <h3 className="font-display text-xl text-foreground mb-4">{s.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <ParallaxImage src={heroVilla} alt="Contact" className="h-[50vh]" speed={0.15} />
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-center">
          <ScrollReveal className="container-luxury">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">{t("servPage.cta")}</h2>
            <Link to="/contact" className="luxury-btn-primary">
              {t("servPage.ctaBtn")} <ArrowRight size={16} className="ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
