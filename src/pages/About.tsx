import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";

import office from "@/assets/office.jpg";
import heroVilla from "@/assets/hero-villa.jpg";
import lifestyle from "@/assets/lifestyle.jpg";

const values = [
  { title: "Precision", desc: "Every recommendation, every strategy, every detail is calibrated with meticulous care." },
  { title: "Discretion", desc: "We understand that privacy is not a preference — it is a prerequisite at this level." },
  { title: "Excellence", desc: "Mediocrity has no place in our vocabulary. We pursue the exceptional in everything." },
  { title: "Integrity", desc: "Trust is earned through transparency, consistency, and unwavering ethical standards." },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <ParallaxImage src={office} alt="Aurum Estates" className="h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex items-end">
          <div className="container-luxury pb-16">
            <ScrollReveal>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">About Us</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground">
                The <span className="italic gradient-gold-text">Aurum</span> Standard
              </h1>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="container-luxury max-w-4xl">
          <ScrollReveal>
            <div className="space-y-6 text-muted-foreground font-body leading-relaxed text-lg">
              <p>
                Aurum Estates was born from a conviction that the world's finest properties deserve a level of representation that matches their caliber. Founded by a collective of seasoned real estate strategists, luxury brand architects, and market visionaries, we set out to redefine what a premium real estate agency could be.
              </p>
              <p>
                We don't operate like a traditional brokerage. Our approach is rooted in the principles of luxury brand management — where perception, positioning, and presentation are as critical as the property itself. Every listing we take on becomes a campaign. Every client relationship becomes a partnership.
              </p>
              <p>
                Today, Aurum Estates operates across twelve of the world's most prestigious markets, with a portfolio exceeding €2.4 billion. Our team of elite advisors combines deep local knowledge with a global network of qualified buyers, investors, and developers.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <SectionHeading subtitle="Our Pillars" title="Defining Values" />
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

      {/* CTA */}
      <section className="relative overflow-hidden">
        <ParallaxImage src={heroVilla} alt="Contact Aurum" className="h-[50vh]" speed={0.15} />
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-center">
          <ScrollReveal className="container-luxury">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">Ready to Experience the Difference?</h2>
            <Link to="/contact" className="luxury-btn-primary">
              Get in Touch <ArrowRight size={16} className="ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default About;
