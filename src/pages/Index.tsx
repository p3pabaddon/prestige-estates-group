import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Eye, Shield, Star, TrendingUp } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";
import PropertyCard from "@/components/PropertyCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { formatTRY } from "@/lib/crm";

import heroVilla from "@/assets/hero-villa.jpg";
import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import lifestyle from "@/assets/lifestyle.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import projectTower from "@/assets/project-tower.jpg";
import office from "@/assets/office.jpg";

interface DisplayProperty {
  id?: string;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqm: number;
  tag?: string;
  type: string;
}

const defaultFeaturedProperties: DisplayProperty[] = [
  { image: penthouseInterior, title: "The Sovereign Penthouse", location: "Monte Carlo, Monaco", price: "€12,500,000", beds: 4, baths: 5, sqm: 420, tag: "Exclusive", type: "Penthouse" },
  { image: waterfrontVilla, title: "Villa Aquamarine", location: "Cap Ferrat, France", price: "€8,900,000", beds: 6, baths: 7, sqm: 680, tag: "Waterfront", type: "Villa" },
  { image: luxuryBuilding, title: "Obsidian Tower Residence", location: "Dubai Marina, UAE", price: "$5,200,000", beds: 3, baths: 4, sqm: 310, tag: "New Listing", type: "Apartment" },
];

const Index = () => {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const [properties, setProperties] = useState<DisplayProperty[]>(defaultFeaturedProperties);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("published", true)
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) {
          console.error("Error fetching properties:", error);
          return;
        }

        if (data && data.length > 0) {
          const mapped: DisplayProperty[] = data.map((item: any) => {
            const numBeds = parseInt(item.rooms?.split("+")[0] || "3", 10) || 3;
            const formattedPrice = item.price
              ? item.currency === "TRY"
                ? formatTRY(item.price)
                : `${item.currency === "EUR" ? "€" : "$"}${Number(item.price).toLocaleString("en-US")}`
              : "Fiyat Belirtilmedi";

            const primaryImg =
              (item.images && item.images.length > 0 && item.images[0]) ||
              heroVilla;

            const loc = [item.neighborhood, item.district, item.city]
              .filter(Boolean)
              .join(", ") || item.location || "İstanbul";

            return {
              id: item.id,
              image: primaryImg,
              title: item.title,
              location: loc,
              price: formattedPrice,
              beds: numBeds,
              baths: item.bathrooms || 1,
              sqm: item.gross_m2 || item.net_m2 || 120,
              tag: item.tag || (item.featured ? "Öne Çıkan" : item.listing_type === "satilik" ? "Satılık" : "Kiralık"),
              type: item.property_type || "Daire",
            };
          });
          setProperties(mapped);
        }
      } catch (err) {
        console.error("Failed to load featured properties", err);
      }
    };

    fetchFeatured();
  }, []);

  const stats = [
    { value: "€2.4B+", label: t("hero.portfolio") },
    { value: "340+", label: t("hero.sold") },
    { value: "12", label: t("hero.markets") },
    { value: "98%", label: t("hero.satisfaction") },
  ];

  const pillars = [
    { icon: Eye, title: t("why.pillar1.title"), desc: t("why.pillar1.desc") },
    { icon: Star, title: t("why.pillar2.title"), desc: t("why.pillar2.desc") },
    { icon: Shield, title: t("why.pillar3.title"), desc: t("why.pillar3.desc") },
    { icon: TrendingUp, title: t("why.pillar4.title"), desc: t("why.pillar4.desc") },
  ];

  return (
    <Layout>
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img src={heroVilla} alt="Luxury villa at twilight" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative h-full flex items-end pb-24 md:pb-32">
          <div className="container-luxury">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <p className="font-body text-xs tracking-[0.4em] uppercase text-primary mb-6">{t("hero.subtitle")}</p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[0.95] max-w-4xl mb-8"
            >
              {t("hero.title1")}
              <br />
              <span className="gradient-gold-text italic">{t("hero.title2")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-base md:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              {t("hero.desc")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/properties" className="luxury-btn-primary">
                {t("hero.explore")} <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to="/contact" className="luxury-btn-outline">
                {t("hero.consult")}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="flex flex-wrap gap-8 md:gap-12 mt-16 pt-8 border-t border-border/30"
            >
              {stats.map((stat) => (
                <AnimatedCounter key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <ParallaxImage src={office} alt="Sarraf 34 İnşaat Ofisi" className="aspect-[4/3] rounded-sm" speed={0.15} />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-primary/20" />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">{t("about.subtitle")}</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-8">
                {t("about.title1")}<span className="italic gradient-gold-text">{t("about.title2")}</span>
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">{t("about.p1")}</p>
              <p className="text-muted-foreground font-body leading-relaxed mb-8">{t("about.p2")}</p>
              <Link to="/about" className="luxury-btn-outline">
                {t("about.cta")} <ArrowRight size={14} className="ml-2" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROPERTIES ===== */}
      <section className="section-padding">
        <div className="container-luxury">
          <SectionHeading subtitle={t("featured.subtitle")} title={t("featured.title")} description={t("featured.desc")} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p, i) => (
              <ScrollReveal key={p.id || p.title + i} delay={i * 0.15}>
                <PropertyCard {...p} />
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <div className="text-center mt-12">
              <Link to="/properties" className="luxury-btn-outline">
                {t("featured.viewAll")} <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <SectionHeading subtitle={t("why.subtitle")} title={t("why.title")} description={t("why.desc")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 0.1}>
                <div className="luxury-card p-8 md:p-10 h-full">
                  <p.icon size={28} className="text-primary mb-6" />
                  <h3 className="font-display text-xl text-foreground mb-4">{p.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIFESTYLE ===== */}
      <section className="relative overflow-hidden">
        <ParallaxImage src={lifestyle} alt="Luxury Mediterranean lifestyle" className="h-[70vh] md:h-[80vh]" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20 flex items-end">
          <div className="container-luxury pb-20 md:pb-28">
            <ScrollReveal>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">{t("life.subtitle")}</p>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-tight max-w-2xl mb-6">
                {t("life.title1")}<span className="italic gradient-gold-text">{t("life.title2")}</span>
              </h2>
              <p className="text-muted-foreground font-body text-base max-w-xl mb-8 leading-relaxed">{t("life.desc")}</p>
              <Link to="/lifestyle" className="luxury-btn-primary">
                {t("life.cta")} <ArrowRight size={16} className="ml-2" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== PROJECTS PREVIEW ===== */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">{t("proj.subtitle")}</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-6">
                {t("proj.title1")}<span className="italic gradient-gold-text">{t("proj.title2")}</span>
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">{t("proj.desc")}</p>
              <Link to="/projects" className="luxury-btn-outline">
                {t("proj.cta")} <ArrowRight size={14} className="ml-2" />
              </Link>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <ParallaxImage src={projectTower} alt="Luxury development project" className="aspect-[3/4] rounded-sm" speed={0.15} />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== SOLD PREVIEW ===== */}
      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <SectionHeading subtitle={t("sold.subtitle")} title={t("sold.title")} description={t("sold.desc")} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { image: luxuryInterior, title: "Villa Serenità", location: "Lake Como, Italy", price: "€6,800,000" },
              { image: villaPool, title: "Horizon Estate", location: "Mykonos, Greece", price: "€4,200,000" },
              { image: penthouseInterior, title: "The Pinnacle Suite", location: "London, UK", price: "£9,500,000" },
            ].map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 0.1}>
                <Link to="/sold" className="luxury-card group block">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-background/40" />
                    <span className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-body font-medium bg-primary text-primary-foreground">{t("sold.tag")}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg text-foreground">{p.title}</h3>
                    <p className="text-muted-foreground font-body text-xs tracking-wider uppercase mt-1">{p.location}</p>
                    <p className="font-display text-lg text-primary mt-3">{p.price}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <div className="text-center mt-12">
              <Link to="/sold" className="luxury-btn-outline">
                {t("sold.cta")} <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative overflow-hidden">
        <ParallaxImage src={heroVilla} alt="Luxury property" className="h-[60vh] md:h-[70vh]" speed={0.15} />
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-center">
          <ScrollReveal className="container-luxury">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-6">{t("cta.subtitle")}</p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-tight max-w-3xl mx-auto mb-8">
              {t("cta.title1")}<span className="italic gradient-gold-text">{t("cta.title2")}</span>
            </h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto mb-10 leading-relaxed">{t("cta.desc")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="luxury-btn-primary">
                {t("cta.viewing")} <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to="/properties" className="luxury-btn-outline">
                {t("cta.discover")}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
