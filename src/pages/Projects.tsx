import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";

import projectTower from "@/assets/project-tower.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const projects = [
  { image: projectTower, title: "The Aurum Tower", location: "Dubai, UAE", type: "Branded Residences", status: "Under Construction", units: "82 Residences" },
  { image: luxuryBuilding, title: "Marina Prestige", location: "Monaco", type: "Waterfront Apartments", status: "Pre-Launch", units: "24 Units" },
  { image: waterfrontVilla, title: "Côte d'Or Villas", location: "Saint-Tropez, France", type: "Signature Villas", status: "Selling Now", units: "12 Villas" },
  { image: heroVilla, title: "The Sovereign Collection", location: "Marbella, Spain", type: "Luxury Residences", status: "Completed", units: "36 Homes" },
];

const Projects = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle="Developments"
            title="Signature Projects"
            description="Exclusive developments from the world's most visionary architects and prestige developers. Each project represents an exceptional investment in the future of luxury living."
          />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury space-y-16">
          {projects.map((p, i) => (
            <ScrollReveal key={p.title}>
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 ? "lg:direction-rtl" : ""}`}>
                <div className={i % 2 ? "lg:order-2" : ""}>
                  <ParallaxImage src={p.image} alt={p.title} className="aspect-[4/3] rounded-sm" speed={0.1} />
                </div>
                <div className={i % 2 ? "lg:order-1" : ""}>
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-primary">{p.status}</span>
                  <h3 className="font-display text-3xl md:text-4xl text-foreground mt-2 mb-2">{p.title}</h3>
                  <p className="text-muted-foreground font-body text-sm tracking-wider uppercase mb-6">{p.location} · {p.type} · {p.units}</p>
                  <p className="text-muted-foreground font-body leading-relaxed mb-6">
                    A landmark development redefining expectations in {p.location}. Designed for discerning buyers who seek architectural distinction, premium finishes, and an address that speaks volumes.
                  </p>
                  <Link to="/contact" className="luxury-btn-outline">
                    Explore Project <ArrowRight size={14} className="ml-2" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Projects;
