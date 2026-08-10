import { useState, useMemo } from "react";
import { ChevronDown, Search, HelpCircle, Phone, MessageCircle, ArrowRight, ShieldCheck, Home, HardHat, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQItem {
  q: string;
  a: string;
  category: "all" | "brokerage" | "selling" | "construction" | "legal";
}

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { t } = useLanguage();

  const faqs: FAQItem[] = [
    {
      category: "brokerage",
      q: "Gayrimenkul gösterme ve yerinde inceleme süreci nasıl işler?",
      a: "İlgilendiğiniz gayrimenkul için danışmanlarımızla iletişime geçtiğinizde, size uygun gün ve saatte özel yerinde sunum yapılır. Taşınmazın fiziki durumu, mimari özellikleri, lokasyon avantajları ve resmi ekspertiz verileri hakkında kapsamlı bilgi sunulur.",
    },
    {
      category: "selling",
      q: "Mülkümü Sarraf 34 ile satmak veya kiralamak istiyorum, ne yapmalıyım?",
      a: "Bize telefon, WhatsApp veya iletişim formu aracılığıyla ulaştığınızda, saha ekspertiz uzmanlarımız mülkünüzü yerinde inceler. Bölgesel emsal analiziyle gerçek piyasa değerini belirler, profesyonel Ultra HD fotoğraf/video çekimlerini gerçekleştirir ve mülkünüzü en doğru alıcı kitlesiyle buluşturur.",
    },
    {
      category: "construction",
      q: "Kentsel dönüşüm için binamızı yenilemek istiyoruz, süreç nasıl başlar?",
      a: "Binanızın tapu ve mevcut imar durumunu inceleyerek kat maliklerine özel mimari taslak ve teklif hazırlıyoruz. Deprem yönetmeliğine tam uyumlu, C35+ hazır beton ve yüksek statik standartlarla noter onaylı sözleşmeler çerçevesinde güvenli inşaat sürecini başlatıyoruz.",
    },
    {
      category: "legal",
      q: "Tapu ve konut kredisi işlemlerinde danışmanlık sağlıyor musunuz?",
      a: "Evet. Anlaşmalı kamu ve özel bankalarımızla en avantajlı konut kredisi oranlarının belirlenmesi, resmi eksper takibi, belediye rayiç bedeli ve Tapu Müdürlüğü'ndeki resmi devir randevularınızın koordinasyonu uzman ekibimiz tarafından eksiksiz yürütülür.",
    },
    {
      category: "brokerage",
      q: "Sarraf 34'ü diğer gayrimenkul firmalarından ayıran temel fark nedir?",
      a: "Sarraf 34, hem inşaat müteahhitliği ve proje geliştirme hem de gayrimenkul danışmanlığı gücünü tek çatı altında birleştirir. Gayrimenkullere sadece aracı gözüyle değil, teknik mühendislik, malzeme kalitesi ve uzun vadeli yatırım potansiyeli perspektifinden yaklaşırız.",
    },
    {
      category: "legal",
      q: "Satış sözleşmeleri ve ödemeler nasıl güvence altına alınır?",
      a: "Tüm alım-satım işlemleri resmi sözleşmeler, banka transferleri ve Tapu ve Kadastro Genel Müdürlüğü (TKGM) ile Takasbank güvencesindeki 'Tapu Güvenli Ödeme' sistemi üzerinden %100 riskten arındırılmış şekilde yürütülür.",
    },
    {
      category: "legal",
      q: "Gayrimenkul alım-satımında yasal komisyon ve tapu harçları nelerdir?",
      a: "T.C. Ticaret Bakanlığı Taşınmaz Ticareti Yönetmeliği uyarınca; satış bedeli üzerinden %2 + KDV alıcıdan, %2 + KDV satıcıdan olmak üzere aracılık hizmet bedeli uygulanır. Tapu harcı ise %2 alıcı, %2 satıcı olmak üzere toplamda %4'tür. Tüm masraflar işlem öncesinde şeffaf bir döküm halinde sunulur.",
    },
    {
      category: "construction",
      q: "İnşaat projelerinizin deprem ve zemin güvenliği standartları nasıldır?",
      a: "Tüm inşaat projelerimiz güncel Türkiye Deprem Tehlike Haritası ve Bina Deprem Yönetmeliği'ne uygun zemin etütleri yapılarak inşa edilir. Radye temel sistemi, C35/C40 sınıfı yüksek mukavemetli beton ve nervürlü demir donatısı kullanılmaktadır.",
    },
    {
      category: "selling",
      q: "Portföyümün satış süresi ortalama ne kadardır?",
      a: "Doğru piyasa fiyatlandırması ve profesyonel dijital pazarlama stratejilerimiz sayesinde konut portföylerimiz ortalama 30-45 gün içerisinde değerinde satışa ulaşmaktadır.",
    },
    {
      category: "brokerage",
      q: "Ofisinizi randevusuz ziyaret edebilir miyim?",
      a: "Elbette! Esenyurt / Beylikdüzü bölgesinde yer alan merkez ofisimizde haftanın 6 günü sizleri ağırlamaktan ve kahve eşliğinde gayrimenkul planlarınızı değerlendirmekten memnuniyet duyarız.",
    },
  ];

  const categories = [
    { id: "all", label: "Tümü", icon: HelpCircle },
    { id: "brokerage", label: "Danışmanlık", icon: Home },
    { id: "selling", label: "Satış & Kiralama", icon: FileText },
    { id: "construction", label: "İnşaat & Dönüşüm", icon: HardHat },
    { id: "legal", label: "Hukuk & Tapu", icon: ShieldCheck },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  return (
    <Layout>
      {/* Header */}
      <section className="pt-32 pb-14 bg-secondary/40 border-b border-border/40">
        <div className="container-luxury text-center max-w-3xl">
          <SectionHeading
            subtitle="Bilgi Merkezi"
            title="Sıkça Sorulan Sorular"
            description="Gayrimenkul alım-satım, kiralama, tapu süreçleri ve kentsel dönüşüm inşaat taahhüt hizmetlerimiz hakkında tüm yanıtlar."
          />

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Sorunuzu arayın (ör: tapu harcı, kentsel dönüşüm, ekspertiz)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border/70 rounded-md pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-sm text-xs font-body tracking-wider transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion List */}
      <section className="py-20">
        <div className="container-luxury max-w-3xl">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, i) => (
                <ScrollReveal key={i} delay={i * 0.04}>
                  <div className="luxury-card border-border/70 transition-colors">
                    <button
                      onClick={() => setOpen(open === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-display text-base md:text-lg text-foreground pr-4 font-medium">
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-primary flex-shrink-0 transition-transform duration-300 ${
                          open === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        open === i ? "max-h-96 px-6 pb-6" : "max-h-0 px-6"
                      }`}
                    >
                      <div className="pt-2 border-t border-border/40">
                        <p className="text-muted-foreground font-body text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 luxury-card p-8">
              <HelpCircle size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-display text-xl text-foreground mb-2">Aradığınız Soru Bulunamadı</p>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Farklı bir anahtar kelime deneyebilir veya doğrudan danışmanlarımıza danışabilirsiniz.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="luxury-btn-outline text-xs"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          )}

          {/* Quick Help Card */}
          <ScrollReveal delay={0.2}>
            <div className="mt-16 luxury-card p-8 md:p-10 border-primary/30 bg-secondary/30 text-center">
              <h3 className="font-display text-xl md:text-2xl text-foreground mb-2">
                Aklınıza Takılan Başka Bir Soru mu Var?
              </h3>
              <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto mb-6">
                Sarraf 34 gayrimenkul danışmanlarımız sorularınızı memnuniyetle yanıtlamak için her an hazırdır.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/905302503252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="luxury-btn-primary flex items-center gap-2"
                >
                  <MessageCircle size={16} /> WhatsApp ile Danışın
                </a>
                <a
                  href="tel:05302503252"
                  className="luxury-btn-outline flex items-center gap-2"
                >
                  <Phone size={16} /> 0530 250 32 52
                </a>
                <Link to="/contact" className="luxury-btn-outline flex items-center gap-2">
                  İletişim Formu <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
