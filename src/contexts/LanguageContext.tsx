import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "tr" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  "nav.home": { tr: "Ana Sayfa", en: "Home" },
  "nav.properties": { tr: "Gayrimenkuller", en: "Properties" },
  "nav.projects": { tr: "Projeler", en: "Projects" },
  "nav.services": { tr: "Hizmetler", en: "Services" },
  "nav.lifestyle": { tr: "Yaşam Tarzı", en: "Lifestyle" },
  "nav.about": { tr: "Hakkımızda", en: "About" },
  "nav.blog": { tr: "Blog", en: "Blog" },
  "nav.contact": { tr: "İletişim", en: "Contact" },
  "nav.book": { tr: "Randevu Al", en: "Book Consultation" },

  // Hero
  "hero.subtitle": { tr: "Lüks Gayrimenkul & İnşaat Çözümleri", en: "Luxury Real Estate & Construction" },
  "hero.title1": { tr: "Prestijin", en: "Where Prestige" },
  "hero.title2": { tr: "Adresi Burada", en: "Finds Its Address" },
  "hero.desc": { tr: "Sarraf 34 İnşaat Yapı Gayrimenkul güvencesiyle; sadece bir ev değil, geleceğe değer katan bir yatırım ve prestijli bir yaşam alanı sunuyoruz.", en: "Under the assurance of Sarraf 34 Construction & Real Estate; curating extraordinary residences for those who demand more than a home — a statement of legacy, taste, and elevated living." },
  "hero.explore": { tr: "Gayrimenkulleri Keşfet", en: "Explore Properties" },
  "hero.consult": { tr: "Özel Danışmanlık", en: "Private Consultation" },
  "hero.portfolio": { tr: "Portföy Değeri", en: "Portfolio Value" },
  "hero.sold": { tr: "Tamamlanan Proje", en: "Completed Projects" },
  "hero.markets": { tr: "Hizmet Bölgesi", en: "Service Regions" },
  "hero.satisfaction": { tr: "Müşteri Memnuniyeti", en: "Client Satisfaction" },

  // About Preview
  "about.subtitle": { tr: "Sarraf 34 Standartları", en: "The Sarraf 34 Standard" },
  "about.title1": { tr: "Güven ve ", en: "A Legacy of " },
  "about.title2": { tr: "Kalite Mirası", en: "Trust & Quality" },
  "about.p1": { tr: "Sarraf 34 İnşaat Yapı Gayrimenkul, seçkin yapıların ve gayrimenkullerin en yüksek güvenilirlikle alıcı ve yatırımcılarla buluşması amacıyla kurulmuştur. Sadece mülk satmıyor; doğru değerleme, şeffaf süreçler ve güçlü inşaat vizyonumuzla geleceğinizi inşa ediyoruz.", en: "Sarraf 34 Construction & Real Estate was founded on trust and excellence. We don't simply list homes — we architect desire, orchestrate transparent processes, and position every residence as the valuable asset it truly is." },
  "about.p2": { tr: "Uzman gayrimenkul danışmanlarımız ve inşaat mühendisliği kadromuz, İstanbul ve Türkiye genelinde güvenilir kentsel dönüşüm, arsa geliştirme ve lüks konut portföyü yönetiminde öncüdür.", en: "Our real estate advisors and construction specialists combine deep local market expertise with modern engineering to deliver premier developments and bespoke brokerage services." },
  "about.cta": { tr: "Hikayemizi Keşfedin", en: "Discover Our Story" },

  // Featured Properties
  "featured.subtitle": { tr: "Seçkin Koleksiyon", en: "Curated Collection" },
  "featured.title": { tr: "Öne Çıkan Gayrimenkuller", en: "Featured Properties" },
  "featured.desc": { tr: "Sarraf 34 güvencesiyle seçilen, mimarisi, konumu ve yatırım getirisiyle fark yaratan prestijli mülkler.", en: "Hand-selected residences curated by Sarraf 34 — each one a masterpiece of architecture, design, and prime location." },
  "featured.viewAll": { tr: "Tüm Gayrimenkulleri Gör", en: "View All Properties" },

  // Why Choose Us
  "why.subtitle": { tr: "Farkımız", en: "Our Distinction" },
  "why.title": { tr: "Neden Sarraf 34", en: "Why Sarraf 34" },
  "why.desc": { tr: "İnşaat, yapı ve gayrimenkul sektöründe köklü güven, şeffaf ekspertiz ve sonuç odaklı çözümlerle hizmet veriyoruz.", en: "In a crowded market, Sarraf 34 stands apart through uncompromising engineering standards and a reputation built on trust." },
  "why.pillar1.title": { tr: "Doğru Değerleme & Sunum", en: "Accurate Valuation & Presentation" },
  "why.pillar1.desc": { tr: "Her gayrimenkul, gerçek piyasa değeriyle, profesyonel görsellerle ve doğru hedef kitleyle buluşturulur.", en: "Every property is presented through accurate market pricing and high-fidelity visuals that attract verified buyers." },
  "why.pillar2.title": { tr: "Güçlü İnşaat & Mühendislik", en: "Construction & Engineering Expertise" },
  "why.pillar2.desc": { tr: "Kentsel dönüşüm, proje geliştirme ve yapı kalitesinde sağlam zemin ve modern mimari anlayışı.", en: "Comprehensive urban transformation, site development, and modern architectural standards built for longevity." },
  "why.pillar3.title": { tr: "Güvenilir & Şeffaf Süreç", en: "Transparent & Secure Transactions" },
  "why.pillar3.desc": { tr: "Tapu, kredi, sözleşme ve hukuki aşamalarda tam şeffaflık ve müşteri gizliliği esastır.", en: "Confidential and fully compliant transactions with expert legal and title deed guidance." },
  "why.pillar4.title": { tr: "Yüksek Yatırım Getirisi", en: "High Yield & ROI" },
  "why.pillar4.desc": { tr: "Bölgesel analizlerimiz ve piyasa öngörülerimizle yatırımlarınızın değerine değer katıyoruz.", en: "Our market intelligence and regional insights ensure optimal returns on all residential and commercial investments." },

  // Lifestyle section
  "life.subtitle": { tr: "Mülkün Ötesinde", en: "Beyond Property" },
  "life.title1": { tr: "Prestijli Bir ", en: "Invest in a " },
  "life.title2": { tr: "Yaşama Yatırım Yapın", en: "Privileged Lifestyle" },
  "life.desc": { tr: "Sarraf 34 portföyündeki konutlar, merkezi lokasyonları, sosyal olanakları ve lüks detaylarıyla ayrıcalıklı bir hayat sunar.", en: "Our properties open doors to prime city centers, coastal ease, and exclusive communities where comfort is the standard." },
  "life.cta": { tr: "Projelerimizi Keşfet", en: "Explore Our Projects" },

  // Projects Preview
  "proj.subtitle": { tr: "Yeni Projeler", en: "Developments" },
  "proj.title1": { tr: "Sarraf 34 ", en: "Signature " },
  "proj.title2": { tr: "İnşaat Projeleri", en: "Construction Projects" },
  "proj.desc": { tr: "Kentsel dönüşümden modern rezidanslara, her projemiz sağlam temeller ve yüksek yaşam standartlarıyla yükseliyor.", en: "From urban redevelopment to modern luxury towers, each Sarraf 34 development represents a sound investment for the future." },
  "proj.cta": { tr: "Projeleri Gör", en: "View Projects" },

  // Sold Preview
  "sold.subtitle": { tr: "Başarı Tablomuz", en: "Track Record" },
  "sold.title": { tr: "Tamamlanan Satış ve Projeler", en: "Recently Closed Transactions" },
  "sold.desc": { tr: "Başarıyla sonuçlanan gayrimenkul satışlarımız ve teslim edilen inşaat projelerimiz güvenimizin kanıtıdır.", en: "A showcase of our successfully completed property sales and delivered developments." },
  "sold.cta": { tr: "Tüm Portföyü Gör", en: "View Full Portfolio" },
  "sold.tag": { tr: "Satıldı", en: "Sold" },

  // Final CTA
  "cta.subtitle": { tr: "Bize Ulaşın", en: "Begin Your Journey" },
  "cta.title1": { tr: "Geleceğiniz İçin Doğru ", en: "Your Next Chapter Starts with " },
  "cta.title2": { tr: "Adımı Atın", en: "Sarraf 34" },
  "cta.desc": { tr: "İster hayalinizdeki evi arıyor olun, ister mülkünüzü güvenle satmak veya inşaat projesi başlatmak isteyin; Sarraf 34 uzmanları yanınızda.", en: "Whether seeking your dream home, selling a premium property, or starting a new construction project, our team is ready to assist you." },
  "cta.viewing": { tr: "Randevu Talep Edin", en: "Schedule a Consultation" },
  "cta.discover": { tr: "İlanları İncele", en: "Browse Listings" },

  // Properties Page
  "props.subtitle": { tr: "Portföy", en: "Portfolio" },
  "props.title": { tr: "Güncel Gayrimenkuller", en: "Exceptional Properties" },
  "props.desc": { tr: "Sarraf 34 İnşaat Yapı Gayrimenkul portföyündeki satılık ve kiralık seçkin mülkleri inceleyin.", en: "Browse the curated residential and commercial listings by Sarraf 34." },
  "props.search": { tr: "İlan adı, ilçe, semt veya mülk tipi ara...", en: "Search by title, location, or property type..." },
  "props.all": { tr: "Tümü", en: "All" },
  "props.filters": { tr: "Filtreler", en: "Filters" },
  "props.map": { tr: "Harita", en: "Map" },
  "props.refine": { tr: "Aramanızı Daraltın", en: "Refine Your Search" },
  "props.reset": { tr: "Sıfırla", en: "Reset All" },
  "props.price": { tr: "Fiyat Aralığı", en: "Price Range" },
  "props.minBeds": { tr: "Min Oda", en: "Min Bedrooms" },
  "props.minBaths": { tr: "Min Banyo", en: "Min Bathrooms" },
  "props.area": { tr: "Alan (m²)", en: "Area (m²)" },
  "props.any": { tr: "Tümü", en: "Any" },
  "props.found": { tr: "gayrimenkul bulundu", en: "properties found" },
  "props.found1": { tr: "gayrimenkul bulundu", en: "property found" },
  "props.none": { tr: "Gayrimenkul Bulunamadı", en: "No Properties Found" },
  "props.adjust": { tr: "Arama veya filtre kriterlerinizi değiştirmeyi deneyin.", en: "Try adjusting your search or filters." },
  "props.viewProperty": { tr: "İlanı İncele", en: "View Listing" },

  // About Page
  "aboutPage.subtitle": { tr: "Hakkımızda", en: "About Us" },
  "aboutPage.title1": { tr: "Sarraf 34 ", en: "About " },
  "aboutPage.title2": { tr: "İnşaat Yapı ", en: "Sarraf 34 " },
  "aboutPage.title3": { tr: "Gayrimenkul", en: "Real Estate & Construction" },
  "aboutPage.p1": { tr: "Sarraf 34 İnşaat Yapı Gayrimenkul, sektördeki köklü tecrübesi, sağlam mali yapısı ve güvenilir kadrosuyla gayrimenkul ve inşaat sektöründe öncü hizmet sunmaktadır. Konut alım-satımından kentsel dönüşüme, arsa geliştirmeden proje taahhüdüne kadar müşterilerimize uçtan uca güvenilir çözümler üretiyoruz.", en: "Sarraf 34 Construction & Real Estate provides elite brokerage, building redevelopment, and property development services with unmatched integrity and commitment to client satisfaction." },
  "aboutPage.p2": { tr: "Biz sadece bina inşa etmiyor ya da mülk satmıyoruz; ailelerin huzurla yaşayacağı sağlam yuvalar ve yatırımcıların güvenle kazanç sağlayacağı sürdürülebilir değerler üretiyoruz.", en: "We do not merely build structures or facilitate sales; we create enduring living spaces where families thrive and deliver profitable, secure investments for our partners." },
  "aboutPage.p3": { tr: "Bugün Sarraf 34, geniş portföy ağı, şeffaf çalışma prensibi ve profesyonel CRM altyapısıyla bölgenin en çok tercih edilen gayrimenkul ve inşaat markalarından biridir.", en: "Today, Sarraf 34 is recognized as a trusted partner in urban construction, property brokerage, and investment consulting." },
  "aboutPage.values": { tr: "Temel İlkelerimiz", en: "Our Pillars" },
  "aboutPage.valuesTitle": { tr: "Değerlerimiz", en: "Defining Values" },
  "aboutPage.v1": { tr: "Güven ve Şeffaflık", en: "Trust & Transparency" },
  "aboutPage.v1d": { tr: "Tüm süreçlerimizde açık, dürüst ve yasal güvenceli adımlar atarız.", en: "Every transaction and contract is handled with complete honesty, clarity, and legal compliance." },
  "aboutPage.v2": { tr: "Yapı & Mühendislik Kalitesi", en: "Engineering & Quality" },
  "aboutPage.v2d": { tr: "İnşaat projelerimizde birinci sınıf malzeme ve güncel deprem yönetmeliklerine tam uyum esastır.", en: "Uncompromising building standards, premium materials, and full adherence to structural safety." },
  "aboutPage.v3": { tr: "Müşteri Odaklılık", en: "Client Focus" },
  "aboutPage.v3d": { tr: "İhtiyaçlarınıza en uygun gayrimenkulü ve ödeme koşullarını titizlikle belirleriz.", en: "Dedicated advisory to match your lifestyle and investment objectives seamlessly." },
  "aboutPage.v4": { tr: "Sonuç Odaklı Uzmanlık", en: "Results & Expertise" },
  "aboutPage.v4d": { tr: "Hızlı pazarlama, doğru fiyatlama ve profesyonel portföy yönetimi sunarız.", en: "Rapid marketing, accurate valuation, and smooth closing processes." },
  "aboutPage.cta": { tr: "Sarraf 34 ile Tanışmaya Hazır mısınız?", en: "Ready to Work with Sarraf 34?" },
  "aboutPage.ctaBtn": { tr: "İletişime Geçin", en: "Get in Touch" },

  // Projects Page
  "projPage.subtitle": { tr: "Projeler", en: "Developments" },
  "projPage.title": { tr: "İnşaat ve Kentsel Dönüşüm Projelerimiz", en: "Our Construction & Redevelopment Projects" },
  "projPage.desc": { tr: "Sarraf 34 imzası taşıyan modern mimarili konut projeleri, kentsel dönüşüm binaları ve ticari yapılar.", en: "Signature residential towers, urban redevelopment buildings, and commercial spaces developed by Sarraf 34." },
  "projPage.explore": { tr: "Projeyi İncele", en: "Explore Project" },
  "projPage.p.desc": { tr: "bölgesinde sağlam zemin, modern mimari ve yüksek konforla inşa edilen Sarraf 34 projesi.", en: "A landmark development built with premium engineering, modern aesthetics, and superior comfort by Sarraf 34." },

  // Services Page
  "servPage.subtitle": { tr: "Hizmetlerimiz", en: "What We Do" },
  "servPage.title": { tr: "Gayrimenkul & İnşaat Hizmetlerimiz", en: "Real Estate & Construction Services" },
  "servPage.desc": { tr: "Konut satışından kentsel dönüşüme, arsa geliştirmeden değerleme danışmanlığına kadar kapsamlı kurumsal hizmetler.", en: "A comprehensive suite of real estate, construction, and property advisory services." },
  "servPage.s1": { tr: "Lüks Konut Alım & Satım", en: "Residential Sales & Acquisition" },
  "servPage.s1d": { tr: "Daire, villa ve rezidans alım-satım süreçlerinde profesyonel ekspertiz ve hızlı satış.", en: "Expert brokerage for apartments, villas, and luxury residences." },
  "servPage.s2": { tr: "Kentsel Dönüşüm & Müteahhitlik", en: "Urban Transformation & Contracting" },
  "servPage.s2d": { tr: "Eski binalarınızın yerinde dönüşümü, güvenli mühendislik ve anahtar teslim inşaat hizmeti.", en: "Modern, earthquake-resistant urban reconstruction with turnkey delivery." },
  "servPage.s3": { tr: "Arsa & Arazi Geliştirme", en: "Land & Plot Development" },
  "servPage.s3d": { tr: "Yüksek imar ve getiri potansiyeline sahip arsalarda proje geliştirme ve yatırım planlaması.", en: "Zoning analysis, land valuation, and development planning for investors." },
  "servPage.s4": { tr: "Gayrimenkul Pazarlama & İlan Yönetimi", en: "Property Marketing & Promotion" },
  "servPage.s4d": { tr: "Ultra HD profesyonel çekimler, çok kanallı portal yayını ve aktif alıcı ağı.", en: "High-resolution media, multi-portal coverage, and targeted buyer outreach." },
  "servPage.s5": { tr: "Yatırım & Portföy Danışmanlığı", en: "Investment & Portfolio Advisory" },
  "servPage.s5d": { tr: "Kira getirisi ve değer artışı yüksek gayrimenkul yatırımları için veri odaklı rehberlik.", en: "High-yield real estate investments guided by deep regional market analytics." },
  "servPage.s6": { tr: "Kiralama & Mülk Yönetimi", en: "Leasing & Property Management" },
  "servPage.s6d": { tr: "Doğru kiracı seçimi, sözleşme yönetimi ve mülkünüzün düzenli kira takibi.", en: "Reliable tenant placement, lease administration, and rental income management." },
  "servPage.s7": { tr: "Tapu & Hukuki Danışmanlık", en: "Title Deed & Legal Support" },
  "servPage.s7d": { tr: "Tapu devirleri, ipotek, ekspertiz ve miras intikal süreçlerinde tam hukuki destek.", en: "Full legal assistance for title transfers, mortgages, and property inheritance." },
  "servPage.s8": { tr: "Ekspertiz & Piyasa Değerlemesi", en: "Valuation & Appraisal" },
  "servPage.s8d": { tr: "Mülkünüzün güncel piyasa koşullarına göre en doğru değerini belirleyen profesyonel analiz.", en: "Accurate comparative market analysis to establish optimal pricing." },
  "servPage.cta": { tr: "İhtiyaçlarınızı Birlikte Planlayalım", en: "Let's Discuss Your Needs" },
  "servPage.ctaBtn": { tr: "Randevu Al", en: "Book Consultation" },

  // Lifestyle Page
  "lifePage.subtitle": { tr: "Yaşam", en: "Experience" },
  "lifePage.title1": { tr: "Sarraf 34 ile ", en: "The Art of " },
  "lifePage.title2": { tr: "Ayrıcalıklı Yaşam Alanları", en: "Privileged Living" },
  "lifePage.quote": { tr: "\"Bir ev sadece dört duvardan ibaret değildir; ailenizin güvenliği, huzuru ve prestijidir.\"", en: "\"A home is not just four walls; it is your family's sanctuary, legacy, and peace of mind.\"" },
  "lifePage.amenities": { tr: "Sosyal Ayrıcalıklar", en: "Amenities" },
  "lifePage.amenTitle": { tr: "Konforlu & Güvenli Yaşam", en: "Comfort & Security" },
  "lifePage.a1": { tr: "Merkezi Ulaşım", en: "Prime Transport" },
  "lifePage.a1d": { tr: "Metro, metrobüs ve ana arterlere yakın stratejik lokasyonlar.", en: "Proximity to main transport hubs, metro lines, and highways." },
  "lifePage.a2": { tr: "Sosyal & Ticari Alanlar", en: "Shopping & Dining" },
  "lifePage.a2d": { tr: "Alışveriş merkezleri, çarşı ve restoranlara yürüme mesafesinde yaşam.", en: "Walking distance to shopping plazas, cafes, and daily conveniences." },
  "lifePage.a3": { tr: "Eğitim & Sağlık Kurumları", en: "Schools & Hospitals" },
  "lifePage.a3d": { tr: "Seçkin okullara ve tam donanımlı hastanelere kolay erişim.", en: "Quick access to leading educational and healthcare facilities." },
  "lifePage.a4": { tr: "Kapalı Otopark & Güvenlik", en: "Parking & 24/7 Security" },
  "lifePage.a4d": { tr: "7/24 kamera sistemi, güvenlik personeli ve her daireye özel kapalı otopark.", en: "Gated security, 24/7 CCTV surveillance, and dedicated parking." },
  "lifePage.a5": { tr: "Yeşil Alanlar & Parklar", en: "Green Spaces & Parks" },
  "lifePage.a5d": { tr: "Çocuk oyun alanları, yürüyüş parkurları ve peyzajlı bahçeler.", en: "Landscaped gardens, playgrounds, and relaxing open air spaces." },
  "lifePage.a6": { tr: "Depreme Dayanıklı Yapı", en: "Earthquake Resilient" },
  "lifePage.a6d": { tr: "En son deprem yönetmeliğine uygun, C35/C40 beton ve radye temel teknolojisi.", en: "Engineered with modern seismic standards, raft foundation, and high-grade concrete." },
  "lifePage.sunset1": { tr: "Hayalinizdeki Yuva ", en: "Your Dream Home " },
  "lifePage.sunset2": { tr: "Sarraf 34'te", en: "With Sarraf 34" },
  "lifePage.findAddress": { tr: "Portföyümüzü Keşfedin", en: "Discover Listings" },

  // Sold Page
  "soldPage.subtitle": { tr: "Sicilimiz", en: "Track Record" },
  "soldPage.title": { tr: "Tamamlanan Projeler & Satışlar", en: "Delivered Projects & Sold Properties" },
  "soldPage.desc": { tr: "Sarraf 34 güvencesiyle başarıyla teslim edilen inşaat projelerimiz ve satışı tamamlanan mülkler.", en: "A showcase of our delivered developments and successfully sold properties." },

  // Blog Page
  "blogPage.subtitle": { tr: "Bilgi Merkezi", en: "The Journal" },
  "blogPage.title": { tr: "Gayrimenkul & İnşaat Rehberi", en: "Real Estate & Construction Insights" },
  "blogPage.desc": { tr: "Kentsel dönüşüm, tapu süreçleri, konut kredileri ve gayrimenkul yatırımı hakkında güncel makaleler.", en: "Articles and guides on urban renewal, title deeds, real estate investment, and market trends." },
  "blogPage.readArticle": { tr: "Makaleyi Oku", en: "Read Article" },
  "blogPage.back": { tr: "Blog'a Dön", en: "Back to Blog" },

  // Blog posts
  "blog.1.title": { tr: "Kentsel Dönüşümde Nelere Dikkat Edilmeli?", en: "Key Considerations in Urban Redevelopment" },
  "blog.1.category": { tr: "Kentsel Dönüşüm", en: "Urban Renewal" },
  "blog.1.date": { tr: "12 Mart 2026", en: "March 12, 2026" },
  "blog.1.excerpt": { tr: "Bina yenileme ve kentsel dönüşüm sürecinde kat malikleri hakları, müteahhit seçimi ve inşaat sözleşmelerinin kritik detayları.", en: "Essential legal rights, contractor selection criteria, and contract safety in residential building renewal." },
  "blog.1.content": { tr: "Kentsel dönüşüm, eski ve deprem riski taşıyan yapıların güvenli, modern ve yüksek standartlı konutlara dönüştürülmesidir.\n\nSüreçte en önemli aşama, güvenilir ve finansal gücü kanıtlanmış bir müteahhit firma ile çalışmaktır. Sarraf 34 İnşaat olarak, kat malikleriyle şeffaf sözleşmeler imzalayarak, zamanında teslim ve kaliteli işçilik garantisi sunuyoruz.\n\nBelediye ruhsat aşamaları, kira yardımı başvuruları ve noter onaylı kat karşılığı inşaat sözleşmeleri profesyonelce yönetilmelidir.", en: "Urban renewal ensures safety against seismic risks while upgrading living quality. Working with a proven and reliable construction partner like Sarraf 34 guarantees turnkey delivery, transparent legal agreements, and top-tier construction standards." },

  "blog.2.title": { tr: "Gayrimenkul Yatırımında Bölge Analizinin Önemi", en: "Importance of Location Analysis in Real Estate" },
  "blog.2.category": { tr: "Yatırım Rehberi", en: "Investment Guide" },
  "blog.2.date": { tr: "5 Mart 2026", en: "March 5, 2026" },
  "blog.2.excerpt": { tr: "İstanbul ve çevresinde değer kazanan yeni akslar, ulaşım projelerinin konut fiyatlarına etkisi.", en: "Emerging investment zones, transportation links, and capital appreciation factors." },
  "blog.2.content": { tr: "Gayrimenkulde kazancın anahtarı doğru zamanda doğru lokasyonu seçmektir. Yeni metro hatları, kentsel dönüşüm alanları ve ticaret merkezlerine yakın bölgeler en yüksek değer artışını sunar.\n\nSarraf 34 Gayrimenkul danışmanları, bölge rayiçlerini ve gelecek imar planlarını analiz ederek yatırımcılarına en karlı seçenekleri sunar.", en: "Strategic location analysis drives long-term capital growth and high rental yields. Sarraf 34 guides investors toward prime growth corridors." },

  "blog.3.title": { tr: "Konut Satarken Doğru Fiyat Belirlemenin İpuçları", en: "Setting the Right Price When Selling Property" },
  "blog.3.category": { tr: "Ekspertiz", en: "Valuation" },
  "blog.3.date": { tr: "28 Şubat 2026", en: "February 28, 2026" },
  "blog.3.excerpt": { tr: "Mülkünüzün değerinde ve hızlı satılması için emsal analizi ve profesyonel ilan sunumunun önemi.", en: "How professional appraisal and high-resolution marketing accelerate property sales." },
  "blog.3.content": { tr: "Aşırı yüksek fiyatlanan mülkler pazarda uzun süre bekleyerek değer kaybına uğrar. Doğru piyasa analizi ve Ultra HD profesyonel görsel sunumla mülkünüzü en iyi alıcılarla buluşturuyoruz.", en: "Accurate pricing combined with high-quality visual presentation ensures faster sales at true market value." },

  // FAQ Page
  "faqPage.subtitle": { tr: "Sorular", en: "Questions" },
  "faqPage.title": { tr: "Sıkça Sorulan Sorular", en: "Frequently Asked Questions" },
  "faqPage.desc": { tr: "Sarraf 34 İnşaat ve Gayrimenkul hizmetleri hakkında merak edilen tüm sorular ve yanıtları.", en: "Answers to common questions about Sarraf 34 construction and brokerage services." },
  "faq.1.q": { tr: "Gayrimenkul gösterme ve yerinde inceleme süreci nasıl işler?", en: "How do property viewings work?" },
  "faq.1.a": { tr: "İlgilendiğiniz gayrimenkul için danışmanlarımızla iletişime geçtiğinizde, size uygun gün ve saatte özel yerinde sunum ve detaylı ekspertiz bilgilendirmesi yapılır.", en: "Our advisors arrange private on-site viewings at your convenience, providing comprehensive property details and neighborhood data." },
  "faq.2.q": { tr: "Mülkümü Sarraf 34 ile satmak veya kiralamak istiyorum, ne yapmalıyım?", en: "How do I list my property with Sarraf 34?" },
  "faq.2.a": { tr: "Bize telefon veya iletişim formuyla ulaştığınızda, uzman ekibimiz mülkünüzü yerinde inceler, ücretsiz değerleme yapar ve profesyonel fotoğraf çekimi ile portallarımızda satışa sunar.", en: "Contact us and our specialists will perform an on-site valuation, capture high-res media, and list your property across major channels." },
  "faq.3.q": { tr: "Kentsel dönüşüm için binamızı yenilemek istiyoruz, süreç nasıl başlar?", en: "How does the urban renewal process start for our building?" },
  "faq.3.a": { tr: "Binanızın tapu ve mevcut imar durumunu inceleyerek kat maliklerine özel mimari taslak ve teklif sunuyoruz. Noter onaylı sözleşmelerle güvenli inşaat sürecini başlatıyoruz.", en: "We analyze your site's zoning, prepare architectural proposals for owners, and handle all legal and municipal permitting." },
  "faq.4.q": { tr: "Tapu ve kredi işlemlerinde destek veriyor musunuz?", en: "Do you provide support for title deeds and mortgages?" },
  "faq.4.a": { tr: "Evet. Anlaşmalı bankalarımızla en uygun konut kredisi oranları, eksper takibi ve tapu müdürlüğündeki devir işlemleri baştan sona ekibimiz tarafından yürütülür.", en: "Yes, we facilitate bank mortgage applications, appraisal tracking, and full title deed transfer procedures." },
  "faq.5.q": { tr: "Sarraf 34'ü diğer firmalardan ayıran nedir?", en: "What makes Sarraf 34 different?" },
  "faq.5.a": { tr: "Hem inşaat müteahhitliği hem de gayrimenkul danışmanlığı gücünü birleştirerek mülklerinize sadece aracı gözüyle değil, teknik mühendislik ve gerçek yatırım vizyonuyla yaklaşırız.", en: "Combining construction contracting with real estate brokerage allows us to evaluate properties with technical rigor and true investment foresight." },
  "faq.6.q": { tr: "Satış sözleşmeleri ve ödemeler nasıl güvence altına alınır?", en: "How are contracts and payments secured?" },
  "faq.6.a": { tr: "Tüm işlemler resmi sözleşmeler, banka transferleri ve Tapu Takas / Güvenli Ödeme sistemleri üzerinden %100 güvenceyle yürütülür.", en: "All transactions are secured through official contracts, verified bank transfers, and title escrow services." },
  "faq.7.q": { tr: "Gayrimenkul alımında komisyon ve tapu masrafları nelerdir?", en: "What are the transfer fees and commission rates?" },
  "faq.7.a": { tr: "Yasal mevzuata uygun olarak %2 + KDV hizmet bedeli ve yasal tapu harçları uygulanır. Tüm masraflar önceden şeffafça hesaplanarak tarafınıza iletilir.", en: "Standard statutory brokerage fees and title taxes apply, clearly calculated and presented prior to signing." },
  "faq.8.q": { tr: "Ofisinizi ziyaret edebilir miyim?", en: "Can I visit your office?" },
  "faq.8.a": { tr: "Elbette! Sarraf 34 Plaza'da haftanın 6 günü sizleri ağırlamaktan ve kahve eşliğinde gayrimenkul planlarınızı konuşmaktan memnuniyet duyarız.", en: "You are always welcome to visit our office to discuss your real estate and construction goals." },

  // Contact Page
  "contactPage.subtitle": { tr: "İletişim", en: "Get in Touch" },
  "contactPage.title": { tr: "Sarraf 34 ile İletişime Geçin", en: "Contact Sarraf 34" },
  "contactPage.desc": { tr: "Gayrimenkul alım, satım, kiralama veya kentsel dönüşüm projeleriniz için bize ulaşın; size en uygun çözümü sunalım.", en: "Contact our team for residential sales, acquisitions, or construction projects." },
  "contactPage.name": { tr: "Ad Soyad", en: "Full Name" },
  "contactPage.email": { tr: "E-posta", en: "Email" },
  "contactPage.phone": { tr: "Telefon", en: "Phone" },
  "contactPage.iam": { tr: "İşlem Türü", en: "Inquiry Type" },
  "contactPage.buyer": { tr: "Alıcı / Yatırımcı", en: "Buyer / Investor" },
  "contactPage.seller": { tr: "Mülk Sahibi / Satıcı", en: "Seller" },
  "contactPage.investor": { tr: "Kentsel Dönüşüm / Arsa Sahibi", en: "Redevelopment / Land Owner" },
  "contactPage.developer": { tr: "Müteahhit / Proje Ortağı", en: "Developer / Partner" },
  "contactPage.other": { tr: "Diğer", en: "Other" },
  "contactPage.message": { tr: "Mesajınız", en: "Message" },
  "contactPage.send": { tr: "Mesajı Gönder", en: "Send Inquiry" },
  "contactPage.office": { tr: "Merkez Ofis", en: "Head Office" },
  "contactPage.hours": { tr: "Çalışma Saatleri", en: "Working Hours" },
  "contactPage.monFri": { tr: "Pzt–Cum: 09:00–19:00", en: "Mon–Fri: 09:00–19:00" },
  "contactPage.sat": { tr: "Cumartesi: 09:00–19:00", en: "Saturday: 09:00–19:00" },
  "contactPage.sun": { tr: "Pazar: Randevu ile", en: "Sunday: By Appointment" },
  "contactPage.thanks": { tr: "Mesajınız başarıyla iletildi. Sarraf 34 uzman danışmanımız en kısa sürede sizinle iletişime geçecektir.", en: "Thank you for reaching out. A Sarraf 34 advisor will contact you shortly." },

  // Property Details
  "propDetail.back": { tr: "Gayrimenkullere Dön", en: "Back to Properties" },
  "propDetail.bedrooms": { tr: "Oda Sayısı", en: "Bedrooms" },
  "propDetail.bathrooms": { tr: "Banyo", en: "Bathrooms" },
  "propDetail.area": { tr: "Kullanım Alanı", en: "Living Area" },
  "propDetail.aboutTitle": { tr: "Gayrimenkul Açıklaması", en: "About This Property" },
  "propDetail.highlights": { tr: "Öne Çıkan Özellikler", en: "Property Highlights" },
  "propDetail.gallery": { tr: "Fotoğraf Galerisi", en: "Photo Gallery" },
  "propDetail.price": { tr: "Satış Fiyatı", en: "Price" },
  "propDetail.viewing": { tr: "Randevu & Detaylı Bilgi", en: "Request Viewing" },
  "propDetail.inquire": { tr: "Bu İlan Hakkında Danışın", en: "Inquire About This Listing" },
  "propDetail.type": { tr: "Mülk Türü", en: "Property Type" },
  "propDetail.year": { tr: "Bina Yaşı", en: "Building Age" },
  "propDetail.floor": { tr: "Bulunduğu Kat", en: "Floor" },
  "propDetail.parking": { tr: "Otopark", en: "Parking" },
  "propDetail.status": { tr: "Durum", en: "Status" },
  "propDetail.available": { tr: "Satışa Hazır", en: "Available" },
  "propDetail.spaces": { tr: "Alan", en: "Area" },
  "propDetail.topFloor": { tr: "En Üst Kat", en: "Top Floor" },
  "propDetail.similar": { tr: "Benzer Gayrimenkuller", en: "Similar Properties" },
  "propDetail.panoramic": { tr: "Ferah & Açık Manzara", en: "Panoramic Open View" },
  "propDetail.pool": { tr: "Yüzme Havuzu", en: "Swimming Pool" },
  "propDetail.concierge": { tr: "7/24 Güvenlik", en: "24/7 Security" },
  "propDetail.garage": { tr: "Kapalı Otopark", en: "Private Parking" },
  "propDetail.smart": { tr: "Doğalgaz & Yerden Isıtma", en: "Modern Heating" },
  "propDetail.designer": { tr: "Lüks İç Mimari", en: "Luxury Interior" },

  // Footer
  "footer.desc": { tr: "Sarraf 34 İnşaat Yapı Gayrimenkul; güvenilir yapı kalitesi, doğru ekspertiz ve profesyonel portföy yönetimi ile yanınızda.", en: "Sarraf 34 Construction & Real Estate — delivering quality building developments, reliable appraisal, and premier property management." },
  "footer.navigate": { tr: "Menü", en: "Navigation" },
  "footer.resources": { tr: "Kurumsal", en: "Corporate" },
  "footer.contact": { tr: "İletişim", en: "Contact" },
  "footer.properties": { tr: "Gayrimenkuller", en: "Properties" },
  "footer.projects": { tr: "Projeler", en: "Projects" },
  "footer.services": { tr: "Hizmetler", en: "Services" },
  "footer.aboutUs": { tr: "Hakkımızda", en: "About Us" },
  "footer.lifestyle": { tr: "Yaşam Alanları", en: "Living Spaces" },
  "footer.soldPortfolio": { tr: "Tamamlanan Satışlar", en: "Sold Portfolio" },
  "footer.journal": { tr: "Blog / Rehber", en: "Blog & Guides" },
  "footer.faq": { tr: "Sıkça Sorulanlar", en: "FAQ" },
  "footer.rights": { tr: "© 2026 Sarraf 34 İnşaat Yapı Gayrimenkul. Tüm hakları saklıdır.", en: "© 2026 Sarraf 34 Construction & Real Estate. All rights reserved." },
  "footer.privacy": { tr: "Gizlilik Politikası", en: "Privacy Policy" },
  "footer.terms": { tr: "Kullanım Koşulları", en: "Terms of Service" },
  "footer.cookies": { tr: "Çerez Politikası", en: "Cookie Policy" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("tr");

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
