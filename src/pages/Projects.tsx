import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

import projectTower from "@/assets/project-tower.jpg";
import luxuryBuilding from "@/assets/luxury-building.jpg";
import waterfrontVilla from "@/assets/waterfront-villa.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const projects = [
  { image: projectTower, title: "Sarraf 34 Rezidans Kuleleri", location: "İstanbul / Başakşehir", type: "Rezidans & Ticari Alanlar", status: "İnşaat Devam Ediyor", units: "120 Konut" },
  { image: luxuryBuilding, title: "Sarraf 34 Prestij Konakları", location: "İstanbul / Bağcılar", type: "Kentsel Dönüşüm & Yaşam", status: "Satışta", units: "48 Daire" },
  { image: waterfrontVilla, title: "Sarraf 34 Marina Villaları", location: "İstanbul / Beylikdüzü", type: "Müstakil Lüks Villa", status: "Lansman Aşamasında", units: "16 Villa" },
  { image: heroVilla, title: "Sarraf 34 Panorama Evleri", location: "İstanbul / Bahçelievler", type: "Aile Konsepti Lüks Konut", status: "Tamamlandı / Teslime Hazır", units: "64 Daire" },
];

const Projects = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading subtitle={t("projPage.subtitle")} title={t("projPage.title")} description={t("projPage.desc")} />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury space-y-16">
          {projects.map((p, i) => (
            <ScrollReveal key={p.title}>
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
                <div className={i % 2 ? "lg:order-2" : ""}>
                  <ParallaxImage src={p.image} alt={p.title} className="aspect-[4/3] rounded-sm" speed={0.1} />
                </div>
                <div className={i % 2 ? "lg:order-1" : ""}>
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-primary">{p.status}</span>
                  <h3 className="font-display text-3xl md:text-4xl text-foreground mt-2 mb-2">{p.title}</h3>
                  <p className="text-muted-foreground font-body text-sm tracking-wider uppercase mb-6">{p.location} · {p.type} · {p.units}</p>
                  <p className="text-muted-foreground font-body leading-relaxed mb-6">{t("projPage.p.desc")}</p>
                  <Link to="/contact" className="luxury-btn-outline">
                    {t("projPage.explore")} <ArrowRight size={14} className="ml-2" />
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
