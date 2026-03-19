import { Link } from "react-router-dom";
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Car, Shield, Waves, Sun, Wind, Home, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import PropertyCard from "@/components/PropertyCard";
import { useLanguage } from "@/contexts/LanguageContext";

import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import luxuryKitchen from "@/assets/luxury-kitchen.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const gallery = [penthouseInterior, luxuryInterior, luxuryKitchen, villaPool];

const PropertyDetails = () => {
  const { t } = useLanguage();

  const highlights = [
    { icon: Waves, label: t("propDetail.panoramic") },
    { icon: Sun, label: t("propDetail.pool") },
    { icon: Shield, label: t("propDetail.concierge") },
    { icon: Car, label: t("propDetail.garage") },
    { icon: Wind, label: t("propDetail.smart") },
    { icon: Home, label: t("propDetail.designer") },
  ];

  return (
    <Layout>
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <img src={heroVilla} alt="The Sovereign Penthouse" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 pb-12 md:pb-16">
          <div className="container-luxury">
            <Link to="/properties" className="inline-flex items-center gap-2 text-muted-foreground font-body text-sm hover:text-primary transition-colors mb-6">
              <ArrowLeft size={16} /> {t("propDetail.back")}
            </Link>
            <span className="block px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-body font-medium gradient-gold text-primary-foreground w-fit mb-4">Exclusive</span>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mb-3">The Sovereign Penthouse</h1>
            <p className="flex items-center gap-2 text-muted-foreground font-body text-sm tracking-wider uppercase">
              <MapPin size={14} /> Monte Carlo, Monaco
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="flex flex-wrap gap-8 mb-12 pb-8 border-b border-border">
                  {[
                    { icon: Bed, val: "4", label: t("propDetail.bedrooms") },
                    { icon: Bath, val: "5", label: t("propDetail.bathrooms") },
                    { icon: Maximize, val: "420 m²", label: t("propDetail.area") },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <s.icon size={20} className="text-primary" />
                      <div>
                        <p className="font-display text-lg text-foreground">{s.val}</p>
                        <p className="text-muted-foreground font-body text-xs uppercase tracking-wider">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <h2 className="font-display text-2xl text-foreground mb-6">{t("propDetail.aboutTitle")}</h2>
                <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
                  <p>
                    Perched atop one of Monte Carlo's most coveted addresses, The Sovereign Penthouse commands unobstructed panoramic views of the Mediterranean coastline and the principality's glittering skyline.
                  </p>
                  <p>
                    Spanning 420 square meters across a single floor, the interiors have been meticulously designed by internationally acclaimed architects, featuring Calacatta marble surfaces, bespoke Italian cabinetry, and floor-to-ceiling glass.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <h3 className="font-display text-xl text-foreground mt-12 mb-6">{t("propDetail.highlights")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {highlights.map((h) => (
                    <div key={h.label} className="luxury-card p-4 flex items-center gap-3">
                      <h.icon size={18} className="text-primary" />
                      <span className="font-body text-sm text-foreground">{h.label}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <h3 className="font-display text-xl text-foreground mt-12 mb-6">{t("propDetail.gallery")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {gallery.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-sm aspect-[4/3]">
                      <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-1">
              <ScrollReveal delay={0.2}>
                <div className="glass-panel p-8 sticky top-28">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">{t("propDetail.price")}</p>
                  <p className="font-display text-3xl text-primary mb-8">€12,500,000</p>
                  <div className="luxury-divider mb-8" />
                  <Link to="/contact" className="luxury-btn-primary w-full text-center mb-4">
                    {t("propDetail.viewing")}
                  </Link>
                  <Link to="/contact" className="luxury-btn-outline w-full text-center">
                    {t("propDetail.inquire")}
                  </Link>
                  <div className="luxury-divider my-8" />
                  <div className="space-y-3 text-muted-foreground font-body text-sm">
                    <p><span className="text-foreground">{t("propDetail.type")}:</span> Penthouse</p>
                    <p><span className="text-foreground">{t("propDetail.year")}:</span> 2024</p>
                    <p><span className="text-foreground">{t("propDetail.floor")}:</span> {t("propDetail.topFloor")}</p>
                    <p><span className="text-foreground">{t("propDetail.parking")}:</span> 3 {t("propDetail.spaces")}</p>
                    <p><span className="text-foreground">{t("propDetail.status")}:</span> {t("propDetail.available")}</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <ScrollReveal>
            <h2 className="font-display text-3xl text-foreground text-center mb-12">{t("propDetail.similar")}</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { image: waterfrontVilla, title: "Villa Aquamarine", location: "Cap Ferrat, France", price: "€8,900,000", beds: 6, baths: 7, sqm: 680, tag: "Waterfront", type: "Villa" },
              { image: penthouseInterior, title: "Pinnacle Sky Suite", location: "New York, USA", price: "$18,500,000", beds: 5, baths: 6, sqm: 550, tag: "Exclusive", type: "Penthouse" },
              { image: villaPool, title: "Horizon Estate", location: "Mykonos, Greece", price: "€4,200,000", beds: 4, baths: 4, sqm: 380, type: "Villa" },
            ].map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 0.1}>
                <PropertyCard {...p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PropertyDetails;
