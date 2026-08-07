import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

import penthouseInterior from "@/assets/penthouse-interior.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const sold = [
  { image: luxuryInterior, title: "Boğaz Manzaralı Yalı Dairesi", location: "Sarıyer / Yeniköy, İstanbul", price: "₺85.000.000", type: "Yalı Dairesi" },
  { image: villaPool, title: "Marina Manzaralı Müstakil Villa", location: "Beylikdüzü / Yakuplu, İstanbul", price: "₺32.000.000", type: "Lüks Villa" },
  { image: penthouseInterior, title: "Ataköy Sahil 5+2 Penthouse", location: "Bakırköy / Ataköy, İstanbul", price: "₺45.000.000", type: "Penthouse" },
  { image: waterfrontVilla, title: "Vadi Konakları 4+1 Dubleks", location: "Başakşehir, İstanbul", price: "₺18.500.000", type: "Dubleks Daire" },
  { image: luxuryBuilding, title: "Merkez Rezidans 3+1 Panoramik", location: "Bağcılar / Mahmutbey, İstanbul", price: "₺11.250.000", type: "Rezidans" },
  { image: heroVilla, title: "Bahçelievler Konakları 3+1 Daire", location: "Bahçelievler, İstanbul", price: "₺9.800.000", type: "Lüks Daire" },
];

const Sold = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading subtitle={t("soldPage.subtitle")} title={t("soldPage.title")} description={t("soldPage.desc")} />
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
                      {t("sold.tag")}
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
