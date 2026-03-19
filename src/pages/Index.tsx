import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { ArrowRight, MapPin, Shield, Star, TrendingUp, Building2, Eye, Gem } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";
import PropertyCard from "@/components/PropertyCard";
import AnimatedCounter from "@/components/AnimatedCounter";

import heroVilla from "@/assets/hero-villa.jpg";
import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import lifestyle from "@/assets/lifestyle.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import projectTower from "@/assets/project-tower.jpg";
import office from "@/assets/office.jpg";

const featuredProperties = [
  { image: penthouseInterior, title: "The Sovereign Penthouse", location: "Monte Carlo, Monaco", price: "€12,500,000", beds: 4, baths: 5, sqm: 420, tag: "Exclusive", type: "Penthouse" },
  { image: waterfrontVilla, title: "Villa Aquamarine", location: "Cap Ferrat, France", price: "€8,900,000", beds: 6, baths: 7, sqm: 680, tag: "Waterfront", type: "Villa" },
  { image: luxuryBuilding, title: "Obsidian Tower Residence", location: "Dubai Marina, UAE", price: "$5,200,000", beds: 3, baths: 4, sqm: 310, tag: "New Listing", type: "Apartment" },
];

const stats = [
  { value: "€2.4B+", label: "Portfolio Value" },
  { value: "340+", label: "Properties Sold" },
  { value: "12", label: "Global Markets" },
  { value: "98%", label: "Client Satisfaction" },
];

const pillars = [
  { icon: Eye, title: "Unmatched Presentation", desc: "Every property is presented through cinematic visuals and editorial storytelling that elevates perception and accelerates desire." },
  { icon: Star, title: "Elite Marketing", desc: "Strategic positioning across premium channels ensures your property reaches the most qualified, high-net-worth audience globally." },
  { icon: Shield, title: "Discreet Service", desc: "Confidential advisory tailored to discerning clients who value privacy, precision, and a relationship built on trust." },
  { icon: TrendingUp, title: "Premium Negotiations", desc: "Our market intelligence and negotiation expertise consistently deliver results that exceed expectations." },
];

const Index = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

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
              <p className="font-body text-xs tracking-[0.4em] uppercase text-primary mb-6">Luxury Real Estate Redefined</p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[0.95] max-w-4xl mb-8"
            >
              Where Prestige
              <br />
              <span className="gradient-gold-text italic">Finds Its Address</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-base md:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              Curating extraordinary residences for those who demand more than a home — a statement of legacy, taste, and elevated living.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/properties" className="luxury-btn-primary">
                Explore Properties <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to="/contact" className="luxury-btn-outline">
                Private Consultation
              </Link>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="flex flex-wrap gap-8 md:gap-12 mt-16 pt-8 border-t border-border/30"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl md:text-3xl text-primary">{stat.value}</p>
                  <p className="font-body text-xs tracking-wider uppercase text-muted-foreground mt-1">{stat.label}</p>
                </div>
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
                <ParallaxImage src={office} alt="Aurum Estates office" className="aspect-[4/3] rounded-sm" speed={0.15} />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-primary/20" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">The Aurum Standard</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-8">
                A Legacy of <span className="italic gradient-gold-text">Distinction</span>
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                Aurum Estates was founded on a singular conviction: that exceptional properties deserve extraordinary presentation. We don't simply list homes — we architect desire, orchestrate narratives, and position every residence as the irreplaceable asset it truly is.
              </p>
              <p className="text-muted-foreground font-body leading-relaxed mb-8">
                Our advisors bring decades of experience across the world's most prestigious markets, combining deep local expertise with a global perspective that attracts the most qualified buyers and investors.
              </p>
              <Link to="/about" className="luxury-btn-outline">
                Discover Our Story <ArrowRight size={14} className="ml-2" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROPERTIES ===== */}
      <section className="section-padding">
        <div className="container-luxury">
          <SectionHeading
            subtitle="Curated Collection"
            title="Featured Properties"
            description="Hand-selected residences that represent the pinnacle of luxury living — each one a masterpiece of architecture, design, and location."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 0.15}>
                <PropertyCard {...p} />
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <div className="text-center mt-12">
              <Link to="/properties" className="luxury-btn-outline">
                View All Properties <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <SectionHeading
            subtitle="Our Distinction"
            title="Why Aurum Estates"
            description="In a market saturated with brokerages, we stand apart through uncompromising standards and a reputation built on results."
          />
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
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Beyond Property</p>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-tight max-w-2xl mb-6">
                Invest in a <span className="italic gradient-gold-text">Lifestyle</span>
              </h2>
              <p className="text-muted-foreground font-body text-base max-w-xl mb-8 leading-relaxed">
                Our properties open doors to world-class dining, pristine coastlines, exclusive marinas, and neighborhoods where prestige is the standard — not the exception.
              </p>
              <Link to="/lifestyle" className="luxury-btn-primary">
                Explore the Lifestyle <ArrowRight size={16} className="ml-2" />
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
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">New Developments</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-6">
                Signature <span className="italic gradient-gold-text">Projects</span>
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                Discover exclusive developments from visionary architects and prestige developers. From branded residences to waterfront towers, each project represents a rare opportunity to invest in the future of luxury.
              </p>
              <Link to="/projects" className="luxury-btn-outline">
                View Projects <ArrowRight size={14} className="ml-2" />
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
          <SectionHeading
            subtitle="Track Record"
            title="Recently Closed"
            description="A selection of our recently concluded transactions — each one a testament to our expertise, discretion, and unwavering commitment to premium results."
          />
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
                    <span className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-body font-medium bg-primary text-primary-foreground">Sold</span>
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
                View Full Portfolio <ArrowRight size={14} className="ml-2" />
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
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-6">Begin Your Journey</p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-tight max-w-3xl mx-auto mb-8">
              Your Next Chapter Starts with a <span className="italic gradient-gold-text">Conversation</span>
            </h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto mb-10 leading-relaxed">
              Whether you're seeking your dream residence or positioning a premium property for the market, our advisors are ready to craft a bespoke strategy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="luxury-btn-primary">
                Schedule a Private Viewing <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to="/properties" className="luxury-btn-outline">
                Discover Properties
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
