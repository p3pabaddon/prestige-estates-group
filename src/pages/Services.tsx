import { Link } from "react-router-dom";
import { ArrowRight, Building2, Key, TrendingUp, Megaphone, UserCheck, Briefcase, Search, BarChart3 } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import ParallaxImage from "@/components/ParallaxImage";
import heroVilla from "@/assets/hero-villa.jpg";

const services = [
  { icon: Building2, title: "Luxury Property Sales", desc: "Strategic positioning and marketing of premium residences to attract qualified buyers from our global network." },
  { icon: Key, title: "Premium Rentals", desc: "Securing exceptional tenants for your luxury property with comprehensive management and tenant screening." },
  { icon: TrendingUp, title: "Investment Consultancy", desc: "Data-driven guidance on high-yield real estate investments across the world's most dynamic luxury markets." },
  { icon: Megaphone, title: "Property Marketing", desc: "Cinematic visuals, editorial content, and premium channel distribution that transforms listings into desire." },
  { icon: UserCheck, title: "Private Buyer Advisory", desc: "Dedicated search and acquisition services for discerning buyers seeking off-market and exclusive opportunities." },
  { icon: Briefcase, title: "Portfolio Guidance", desc: "Holistic management of your real estate portfolio to optimize value, diversification, and long-term returns." },
  { icon: Search, title: "Project Sales", desc: "Complete sales strategy and execution for new luxury developments, from pre-launch to final handover." },
  { icon: BarChart3, title: "Market Intelligence", desc: "Proprietary research and analysis empowering informed decisions in an ever-evolving luxury property landscape." },
];

const Services = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle="What We Do"
            title="Bespoke Real Estate Services"
            description="A comprehensive suite of services designed for clients who expect nothing less than extraordinary. Every engagement is tailored, every outcome is measured by excellence."
          />
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

      {/* CTA */}
      <section className="relative overflow-hidden">
        <ParallaxImage src={heroVilla} alt="Contact" className="h-[50vh]" speed={0.15} />
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-center">
          <ScrollReveal className="container-luxury">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">Let's Discuss Your Requirements</h2>
            <Link to="/contact" className="luxury-btn-primary">
              Book Consultation <ArrowRight size={16} className="ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
