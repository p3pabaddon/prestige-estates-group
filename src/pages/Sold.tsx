import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import { Link } from "react-router-dom";

import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const sold = [
  { image: luxuryInterior, title: "Villa Serenità", location: "Lake Como, Italy", price: "€6,800,000", type: "Villa" },
  { image: villaPool, title: "Horizon Estate", location: "Mykonos, Greece", price: "€4,200,000", type: "Villa" },
  { image: penthouseInterior, title: "The Pinnacle Suite", location: "London, UK", price: "£9,500,000", type: "Penthouse" },
  { image: waterfrontVilla, title: "Casa Celeste", location: "Sardinia, Italy", price: "€5,600,000", type: "Villa" },
  { image: luxuryBuilding, title: "Sky Loft One", location: "Miami, USA", price: "$7,200,000", type: "Apartment" },
  { image: heroVilla, title: "La Maison Dorée", location: "Cannes, France", price: "€11,400,000", type: "Villa" },
];

const Sold = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle="Track Record"
            title="Sold Portfolio"
            description="A curated showcase of our recently concluded transactions. Each represents our commitment to achieving premium results with discretion and expertise."
          />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sold.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 0.08}>
                <div className="luxury-card group">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-background/30" />
                    <span className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-body font-medium bg-primary text-primary-foreground">
                      Sold
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg text-foreground">{p.title}</h3>
                    <p className="text-muted-foreground font-body text-xs tracking-wider uppercase mt-1">{p.location} · {p.type}</p>
                    <div className="luxury-divider my-4" />
                    <p className="font-display text-xl text-primary">{p.price}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Sold;
