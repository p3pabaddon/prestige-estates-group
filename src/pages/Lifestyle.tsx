import { Link } from "react-router-dom";
import { ArrowRight, Anchor, Wine, GraduationCap, Building, Palette, TreePine } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";

import lifestyle from "@/assets/lifestyle.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const amenities = [
  { icon: Anchor, title: "Marinas & Yachting", desc: "World-class marinas steps from your door, where Mediterranean lifestyle meets ocean freedom." },
  { icon: Wine, title: "Fine Dining", desc: "Michelin-starred restaurants and exclusive clubs that define the art of elevated gastronomy." },
  { icon: GraduationCap, title: "International Schools", desc: "Top-tier educational institutions ensuring families thrive in their new environment." },
  { icon: Building, title: "Business Districts", desc: "Proximity to global financial centers and premium business infrastructure." },
  { icon: Palette, title: "Arts & Culture", desc: "Galleries, opera houses, and cultural events that enrich every dimension of living." },
  { icon: TreePine, title: "Nature & Wellness", desc: "Pristine coastlines, mountain retreats, and world-class spa destinations at your doorstep." },
];

const Lifestyle = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <ParallaxImage src={lifestyle} alt="Luxury lifestyle" className="h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent flex items-end">
          <div className="container-luxury pb-16">
            <ScrollReveal>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Experience</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground max-w-2xl">
                The Art of <span className="italic gradient-gold-text">Elevated Living</span>
              </h1>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-luxury max-w-4xl text-center">
          <ScrollReveal>
            <p className="font-editorial text-xl md:text-2xl text-muted-foreground leading-relaxed italic">
              "A home is not defined by its walls alone, but by the world that surrounds it — the views that greet you at dawn, the culture that inspires your evenings, the prestige that accompanies your address."
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Amenities */}
      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <SectionHeading subtitle="Your World" title="A Life Without Compromise" />
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

      {/* Immersive section */}
      <section className="relative overflow-hidden">
        <ParallaxImage src={villaPool} alt="Villa pool sunset" className="h-[60vh]" speed={0.2} />
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center text-center">
          <ScrollReveal className="container-luxury">
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
              Where Every Sunset Is <span className="italic gradient-gold-text">Yours</span>
            </h2>
            <Link to="/properties" className="luxury-btn-primary">
              Find Your Address <ArrowRight size={16} className="ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Lifestyle;
