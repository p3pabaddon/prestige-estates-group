import { useState } from "react";
import { Link } from "react-router-dom";
import { Bed, Bath, Maximize, Search, SlidersHorizontal } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import PropertyCard from "@/components/PropertyCard";

import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import luxuryKitchen from "@/assets/luxury-kitchen.jpg";

const allProperties = [
  { image: penthouseInterior, title: "The Sovereign Penthouse", location: "Monte Carlo, Monaco", price: "€12,500,000", beds: 4, baths: 5, sqm: 420, tag: "Exclusive", type: "Penthouse" },
  { image: waterfrontVilla, title: "Villa Aquamarine", location: "Cap Ferrat, France", price: "€8,900,000", beds: 6, baths: 7, sqm: 680, tag: "Waterfront", type: "Villa" },
  { image: luxuryBuilding, title: "Obsidian Tower Residence", location: "Dubai Marina, UAE", price: "$5,200,000", beds: 3, baths: 4, sqm: 310, tag: "New Listing", type: "Apartment" },
  { image: luxuryInterior, title: "Maison de Lumière", location: "Saint-Tropez, France", price: "€7,400,000", beds: 5, baths: 6, sqm: 520, tag: "Signature Villa", type: "Villa" },
  { image: villaPool, title: "Horizon Estate", location: "Mykonos, Greece", price: "€4,200,000", beds: 4, baths: 4, sqm: 380, tag: "Investment", type: "Villa" },
  { image: luxuryKitchen, title: "The Gallery Loft", location: "London, UK", price: "£3,800,000", beds: 2, baths: 3, sqm: 240, type: "Apartment" },
  { image: penthouseInterior, title: "Pinnacle Sky Suite", location: "New York, USA", price: "$18,500,000", beds: 5, baths: 6, sqm: 550, tag: "Exclusive", type: "Penthouse" },
  { image: waterfrontVilla, title: "Casa del Mare", location: "Amalfi Coast, Italy", price: "€6,100,000", beds: 4, baths: 5, sqm: 450, tag: "Waterfront", type: "Villa" },
  { image: luxuryBuilding, title: "The Apex Residence", location: "Singapore", price: "$8,900,000", beds: 3, baths: 4, sqm: 320, type: "Apartment" },
];

const Properties = () => {
  const [activeType, setActiveType] = useState("All");
  const types = ["All", "Villa", "Penthouse", "Apartment"];

  const filtered = activeType === "All" ? allProperties : allProperties.filter(p => p.type === activeType);

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle="Portfolio"
            title="Exceptional Properties"
            description="Browse our curated collection of the world's most desirable residences. Each property has been personally selected for its architectural distinction, premium location, and investment potential."
          />

          {/* Filters */}
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`px-6 py-2.5 text-xs tracking-[0.2em] uppercase font-body transition-all duration-300 ${
                    activeType === t
                      ? "gradient-gold text-primary-foreground"
                      : "text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 0.08}>
                <PropertyCard {...p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Properties;
