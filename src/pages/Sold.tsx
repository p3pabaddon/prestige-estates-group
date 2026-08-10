import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { formatTRY } from "@/lib/crm";
import heroVilla from "@/assets/hero-villa.jpg";

interface SoldProperty {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  images: string[] | null;
  district: string | null;
  city: string | null;
  property_type: string | null;
  rooms: string | null;
  gross_m2: number | null;
}

const Sold = () => {
  const { t } = useLanguage();
  const [soldList, setSoldList] = useState<SoldProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSold = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("id, title, price, currency, images, district, city, property_type, rooms, gross_m2")
          .eq("status", "satildi")
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Sold properties fetch error:", error);
          setSoldList([]);
        } else {
          setSoldList(data || []);
        }
      } catch (e) {
        console.error("Error fetching sold properties:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSold();
  }, []);

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle={t("soldPage.subtitle") || "BAŞARI HİKAYELERİMİZ"}
            title={t("soldPage.title") || "Tamamlanan Satışlar"}
            description={
              t("soldPage.desc") ||
              "Sarraf 34 güvencesiyle başarıyla satış ve devir işlemleri tamamlanmış gayrimenkul portföyümüz."
            }
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="container-luxury">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="luxury-card overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-muted/60" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-muted/70 rounded w-3/4" />
                    <div className="h-4 bg-muted/50 rounded w-1/2" />
                    <div className="h-6 bg-muted/60 rounded w-1/3 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : soldList.length === 0 ? (
            <div className="luxury-card p-12 md:p-16 text-center max-w-2xl mx-auto border border-border/80 rounded-xl shadow-xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-3">
                Henüz Tamamlanan Satış Bulunmuyor
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                Yönetim panelinden portföyünüzdeki gayrimenkulleri <span className="text-primary font-medium">"Satıldı"</span> olarak işaretlediğinizde, başarıyla sonuçlanan tüm satışlar otomatik olarak bu sayfada gururla sergilenecektir.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/properties" className="luxury-btn-primary">
                  Aktif Portföyü İncele <ArrowRight size={14} className="ml-1.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {soldList.map((p, i) => {
                const img = (p.images && p.images[0]) || heroVilla;
                const loc = [p.district, p.city].filter(Boolean).join(", ") || "İstanbul";
                const specs = [p.rooms, p.gross_m2 ? `${p.gross_m2} m²` : null, p.property_type].filter(Boolean).join(" · ");

                return (
                  <ScrollReveal key={p.id} delay={i * 0.08}>
                    <Link to={`/ilan/${p.id}`} className="luxury-card group block overflow-hidden">
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={img}
                          alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* Sold Badge */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] tracking-wider uppercase font-body font-bold bg-amber-500 text-black rounded-sm shadow-lg">
                            <CheckCircle2 size={13} />
                            SATILDI
                          </span>
                        </div>

                        {p.property_type && (
                          <span className="absolute top-3.5 right-3.5 px-2.5 py-1 text-[10px] tracking-wider uppercase font-body font-medium bg-black/60 backdrop-blur-md text-white rounded-sm">
                            {p.property_type}
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-muted-foreground font-body text-xs mt-1.5">
                          <MapPin size={13} className="text-primary/70 shrink-0" />
                          <span className="truncate">{loc}</span>
                        </div>

                        {specs && (
                          <p className="font-body text-xs text-muted-foreground/80 mt-1">
                            {specs}
                          </p>
                        )}

                        <div className="luxury-divider my-4" />
                        <div className="flex items-center justify-between">
                          <p className="font-display text-xl text-primary font-semibold">
                            {formatTRY(p.price, p.currency)}
                          </p>
                          <span className="text-xs font-body text-muted-foreground group-hover:text-foreground flex items-center gap-1 transition-colors">
                            Detay <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Sold;

