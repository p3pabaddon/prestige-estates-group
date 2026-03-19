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
  "hero.subtitle": { tr: "Lüks Gayrimenkul Yeniden Tanımlandı", en: "Luxury Real Estate Redefined" },
  "hero.title1": { tr: "Prestijin", en: "Where Prestige" },
  "hero.title2": { tr: "Adresi Burada", en: "Finds Its Address" },
  "hero.desc": { tr: "Sadece bir ev değil — bir miras, zevk ve üst düzey yaşam ifadesi arayanlar için olağanüstü konutlar sunuyoruz.", en: "Curating extraordinary residences for those who demand more than a home — a statement of legacy, taste, and elevated living." },
  "hero.explore": { tr: "Gayrimenkulleri Keşfet", en: "Explore Properties" },
  "hero.consult": { tr: "Özel Danışmanlık", en: "Private Consultation" },
  "hero.portfolio": { tr: "Portföy Değeri", en: "Portfolio Value" },
  "hero.sold": { tr: "Satılan Mülk", en: "Properties Sold" },
  "hero.markets": { tr: "Global Pazar", en: "Global Markets" },
  "hero.satisfaction": { tr: "Müşteri Memnuniyeti", en: "Client Satisfaction" },

  // About Preview
  "about.subtitle": { tr: "Aurum Standardı", en: "The Aurum Standard" },
  "about.title1": { tr: "Bir ", en: "A Legacy of " },
  "about.title2": { tr: "Fark Mirası", en: "Distinction" },
  "about.p1": { tr: "Aurum Estates, olağanüstü mülklerin olağanüstü bir sunumu hak ettiği inancıyla kurulmuştur. Biz sadece ev listelemiyoruz — arzu yaratıyor, hikayeler kurguluyoruz ve her konutu gerçek değerine uygun konumlandırıyoruz.", en: "Aurum Estates was founded on a singular conviction: that exceptional properties deserve extraordinary presentation. We don't simply list homes — we architect desire, orchestrate narratives, and position every residence as the irreplaceable asset it truly is." },
  "about.p2": { tr: "Danışmanlarımız, dünyanın en prestijli pazarlarında onlarca yıllık deneyimi bir araya getirerek, derin yerel uzmanlığı en nitelikli alıcı ve yatırımcıları çeken küresel bir bakış açısıyla birleştirmektedir.", en: "Our advisors bring decades of experience across the world's most prestigious markets, combining deep local expertise with a global perspective that attracts the most qualified buyers and investors." },
  "about.cta": { tr: "Hikayemizi Keşfedin", en: "Discover Our Story" },

  // Featured Properties
  "featured.subtitle": { tr: "Seçkin Koleksiyon", en: "Curated Collection" },
  "featured.title": { tr: "Öne Çıkan Gayrimenkuller", en: "Featured Properties" },
  "featured.desc": { tr: "Lüks yaşamın zirvesini temsil eden, özenle seçilmiş konutlar — her biri mimari, tasarım ve konum şaheseri.", en: "Hand-selected residences that represent the pinnacle of luxury living — each one a masterpiece of architecture, design, and location." },
  "featured.viewAll": { tr: "Tüm Gayrimenkulleri Gör", en: "View All Properties" },

  // Why Choose Us
  "why.subtitle": { tr: "Farkımız", en: "Our Distinction" },
  "why.title": { tr: "Neden Aurum Estates", en: "Why Aurum Estates" },
  "why.desc": { tr: "Aracı kuruluşlarla dolu bir pazarda, taviz vermez standartlar ve sonuçlarla inşa edilmiş bir itibarla öne çıkıyoruz.", en: "In a market saturated with brokerages, we stand apart through uncompromising standards and a reputation built on results." },
  "why.pillar1.title": { tr: "Eşsiz Sunum", en: "Unmatched Presentation" },
  "why.pillar1.desc": { tr: "Her mülk, algıyı yükselten ve arzuyu hızlandıran sinematik görseller ve editoryal hikaye anlatımıyla sunulmaktadır.", en: "Every property is presented through cinematic visuals and editorial storytelling that elevates perception and accelerates desire." },
  "why.pillar2.title": { tr: "Elit Pazarlama", en: "Elite Marketing" },
  "why.pillar2.desc": { tr: "Premium kanallar aracılığıyla stratejik konumlandırma, mülkünüzün küresel olarak en nitelikli alıcılara ulaşmasını sağlar.", en: "Strategic positioning across premium channels ensures your property reaches the most qualified, high-net-worth audience globally." },
  "why.pillar3.title": { tr: "Gizli Hizmet", en: "Discreet Service" },
  "why.pillar3.desc": { tr: "Gizlilik, hassasiyet ve güven üzerine kurulu bir ilişkiye değer veren seçici müşterilere özel gizli danışmanlık.", en: "Confidential advisory tailored to discerning clients who value privacy, precision, and a relationship built on trust." },
  "why.pillar4.title": { tr: "Premium Müzakereler", en: "Premium Negotiations" },
  "why.pillar4.desc": { tr: "Pazar zekamız ve müzakere uzmanlığımız, sürekli olarak beklentileri aşan sonuçlar sunar.", en: "Our market intelligence and negotiation expertise consistently deliver results that exceed expectations." },

  // Lifestyle section
  "life.subtitle": { tr: "Mülkün Ötesinde", en: "Beyond Property" },
  "life.title1": { tr: "Bir ", en: "Invest in a " },
  "life.title2": { tr: "Yaşam Tarzına Yatırım Yapın", en: "Lifestyle" },
  "life.desc": { tr: "Mülklerimiz dünya standartlarında restoranlara, bozulmamış sahillere, özel marinalara ve prestijin standart olduğu semtlere kapı açar.", en: "Our properties open doors to world-class dining, pristine coastlines, exclusive marinas, and neighborhoods where prestige is the standard — not the exception." },
  "life.cta": { tr: "Yaşam Tarzını Keşfet", en: "Explore the Lifestyle" },

  // Projects Preview
  "proj.subtitle": { tr: "Yeni Projeler", en: "New Developments" },
  "proj.title1": { tr: "İmza ", en: "Signature " },
  "proj.title2": { tr: "Projeleri", en: "Projects" },
  "proj.desc": { tr: "Vizyoner mimarlar ve prestijli geliştiricilerin özel projelerini keşfedin. Markalı konutlardan sahil kulelerine, her proje lüksün geleceğine yatırım fırsatı sunar.", en: "Discover exclusive developments from visionary architects and prestige developers. From branded residences to waterfront towers, each project represents a rare opportunity to invest in the future of luxury." },
  "proj.cta": { tr: "Projeleri Gör", en: "View Projects" },

  // Sold Preview
  "sold.subtitle": { tr: "Sicilimiz", en: "Track Record" },
  "sold.title": { tr: "Son Kapanan İşlemler", en: "Recently Closed" },
  "sold.desc": { tr: "Son tamamlanan işlemlerimizden bir seçki — her biri uzmanlığımızın, gizliliğimizin ve premium sonuçlara olan bağlılığımızın kanıtı.", en: "A selection of our recently concluded transactions — each one a testament to our expertise, discretion, and unwavering commitment to premium results." },
  "sold.cta": { tr: "Tüm Portföyü Gör", en: "View Full Portfolio" },
  "sold.tag": { tr: "Satıldı", en: "Sold" },

  // Final CTA
  "cta.subtitle": { tr: "Yolculuğunuza Başlayın", en: "Begin Your Journey" },
  "cta.title1": { tr: "Bir Sonraki Bölümünüz Bir ", en: "Your Next Chapter Starts with a " },
  "cta.title2": { tr: "Sohbetle Başlar", en: "Conversation" },
  "cta.desc": { tr: "İster hayalinizdeki konutu arıyor olun, ister premium bir mülkü pazara konumlandırıyor olun, danışmanlarımız size özel bir strateji oluşturmaya hazır.", en: "Whether you're seeking your dream residence or positioning a premium property for the market, our advisors are ready to craft a bespoke strategy." },
  "cta.viewing": { tr: "Özel Gösterim Ayarlayın", en: "Schedule a Private Viewing" },
  "cta.discover": { tr: "Gayrimenkulleri Keşfet", en: "Discover Properties" },

  // Properties Page
  "props.subtitle": { tr: "Portföy", en: "Portfolio" },
  "props.title": { tr: "Olağanüstü Gayrimenkuller", en: "Exceptional Properties" },
  "props.desc": { tr: "Dünyanın en arzu edilen konutlarından oluşan seçkin koleksiyonumuza göz atın.", en: "Browse our curated collection of the world's most desirable residences." },
  "props.search": { tr: "İsim, konum veya türe göre arayın...", en: "Search by name, location, or type..." },
  "props.all": { tr: "Tümü", en: "All" },
  "props.filters": { tr: "Filtreler", en: "Filters" },
  "props.map": { tr: "Harita", en: "Map" },
  "props.refine": { tr: "Aramanızı Daraltın", en: "Refine Your Search" },
  "props.reset": { tr: "Sıfırla", en: "Reset All" },
  "props.price": { tr: "Fiyat Aralığı", en: "Price Range" },
  "props.minBeds": { tr: "Min Yatak Odası", en: "Min Bedrooms" },
  "props.minBaths": { tr: "Min Banyo", en: "Min Bathrooms" },
  "props.area": { tr: "Alan (m²)", en: "Area (m²)" },
  "props.any": { tr: "Tümü", en: "Any" },
  "props.found": { tr: "gayrimenkul bulundu", en: "properties found" },
  "props.found1": { tr: "gayrimenkul bulundu", en: "property found" },
  "props.none": { tr: "Gayrimenkul Bulunamadı", en: "No Properties Found" },
  "props.adjust": { tr: "Arama veya filtreleri ayarlamayı deneyin.", en: "Try adjusting your search or filters." },
  "props.viewProperty": { tr: "Mülkü Gör", en: "View Property" },

  // About Page
  "aboutPage.subtitle": { tr: "Hakkımızda", en: "About Us" },
  "aboutPage.title1": { tr: "", en: "The " },
  "aboutPage.title2": { tr: "Aurum", en: "Aurum" },
  "aboutPage.title3": { tr: " Standardı", en: " Standard" },
  "aboutPage.p1": { tr: "Aurum Estates, dünyanın en iyi mülklerinin kalibrelerine uygun bir temsil düzeyini hak ettiği inancından doğmuştur. Deneyimli gayrimenkul stratejistleri, lüks marka mimarları ve pazar vizyonerleri tarafından kurulan şirketimiz, premium bir gayrimenkul ajansının ne olabileceğini yeniden tanımlamak için yola çıktı.", en: "Aurum Estates was born from a conviction that the world's finest properties deserve a level of representation that matches their caliber. Founded by a collective of seasoned real estate strategists, luxury brand architects, and market visionaries, we set out to redefine what a premium real estate agency could be." },
  "aboutPage.p2": { tr: "Geleneksel bir aracı kurum gibi çalışmıyoruz. Yaklaşımımız lüks marka yönetimi ilkelerine dayanır — burada algı, konumlandırma ve sunum, mülkün kendisi kadar kritiktir.", en: "We don't operate like a traditional brokerage. Our approach is rooted in the principles of luxury brand management — where perception, positioning, and presentation are as critical as the property itself." },
  "aboutPage.p3": { tr: "Bugün Aurum Estates, dünyanın en prestijli on iki pazarında faaliyet göstermekte olup portföyü 2,4 milyar Euro'yu aşmaktadır.", en: "Today, Aurum Estates operates across twelve of the world's most prestigious markets, with a portfolio exceeding €2.4 billion." },
  "aboutPage.values": { tr: "Temel İlkelerimiz", en: "Our Pillars" },
  "aboutPage.valuesTitle": { tr: "Değerlerimiz", en: "Defining Values" },
  "aboutPage.v1": { tr: "Hassasiyet", en: "Precision" },
  "aboutPage.v1d": { tr: "Her öneri, her strateji, her detay titizlikle kalibre edilir.", en: "Every recommendation, every strategy, every detail is calibrated with meticulous care." },
  "aboutPage.v2": { tr: "Gizlilik", en: "Discretion" },
  "aboutPage.v2d": { tr: "Gizliliğin bu seviyede bir tercih değil, bir ön koşul olduğunu anlıyoruz.", en: "We understand that privacy is not a preference — it is a prerequisite at this level." },
  "aboutPage.v3": { tr: "Mükemmellik", en: "Excellence" },
  "aboutPage.v3d": { tr: "Sıradanlık kelime dağarcığımızda yer almaz. Her şeyde olağanüstüyü takip ediyoruz.", en: "Mediocrity has no place in our vocabulary. We pursue the exceptional in everything." },
  "aboutPage.v4": { tr: "Dürüstlük", en: "Integrity" },
  "aboutPage.v4d": { tr: "Güven, şeffaflık, tutarlılık ve sarsılmaz etik standartlarla kazanılır.", en: "Trust is earned through transparency, consistency, and unwavering ethical standards." },
  "aboutPage.cta": { tr: "Farkı Yaşamaya Hazır mısınız?", en: "Ready to Experience the Difference?" },
  "aboutPage.ctaBtn": { tr: "İletişime Geçin", en: "Get in Touch" },

  // Projects Page
  "projPage.subtitle": { tr: "Projeler", en: "Developments" },
  "projPage.title": { tr: "İmza Projeleri", en: "Signature Projects" },
  "projPage.desc": { tr: "Dünyanın en vizyoner mimarlarından ve prestijli geliştiricilerinden özel projeler. Her proje, lüks yaşamın geleceğine olağanüstü bir yatırım fırsatı sunar.", en: "Exclusive developments from the world's most visionary architects and prestige developers. Each project represents an exceptional investment in the future of luxury living." },
  "projPage.explore": { tr: "Projeyi Keşfet", en: "Explore Project" },
  "projPage.p.desc": { tr: "bölgesinde beklentileri yeniden tanımlayan dönüm noktası bir proje. Mimari ayrıcalık, premium bitiş ve hayranlık uyandıran bir adres arayan seçici alıcılar için tasarlandı.", en: "A landmark development redefining expectations. Designed for discerning buyers who seek architectural distinction, premium finishes, and an address that speaks volumes." },

  // Services Page
  "servPage.subtitle": { tr: "Neler Yapıyoruz", en: "What We Do" },
  "servPage.title": { tr: "Özel Gayrimenkul Hizmetleri", en: "Bespoke Real Estate Services" },
  "servPage.desc": { tr: "Olağanüstünün altını kabul etmeyen müşteriler için tasarlanmış kapsamlı hizmet paketi. Her angajman özelleştirilir, her sonuç mükemmellikle ölçülür.", en: "A comprehensive suite of services designed for clients who expect nothing less than extraordinary. Every engagement is tailored, every outcome is measured by excellence." },
  "servPage.s1": { tr: "Lüks Mülk Satışı", en: "Luxury Property Sales" },
  "servPage.s1d": { tr: "Global ağımızdan nitelikli alıcıları çekmek için premium konutların stratejik konumlandırması ve pazarlaması.", en: "Strategic positioning and marketing of premium residences to attract qualified buyers from our global network." },
  "servPage.s2": { tr: "Premium Kiralama", en: "Premium Rentals" },
  "servPage.s2d": { tr: "Kapsamlı yönetim ve kiracı taramasıyla lüks mülkünüz için olağanüstü kiracılar bulma.", en: "Securing exceptional tenants for your luxury property with comprehensive management and tenant screening." },
  "servPage.s3": { tr: "Yatırım Danışmanlığı", en: "Investment Consultancy" },
  "servPage.s3d": { tr: "Dünyanın en dinamik lüks pazarlarında yüksek getirili gayrimenkul yatırımları hakkında veri odaklı rehberlik.", en: "Data-driven guidance on high-yield real estate investments across the world's most dynamic luxury markets." },
  "servPage.s4": { tr: "Mülk Pazarlama", en: "Property Marketing" },
  "servPage.s4d": { tr: "Sinematik görseller, editoryal içerik ve ilanları arzuya dönüştüren premium kanal dağıtımı.", en: "Cinematic visuals, editorial content, and premium channel distribution that transforms listings into desire." },
  "servPage.s5": { tr: "Özel Alıcı Danışmanlığı", en: "Private Buyer Advisory" },
  "servPage.s5d": { tr: "Piyasa dışı ve özel fırsatlar arayan seçici alıcılar için özel arama ve edinim hizmetleri.", en: "Dedicated search and acquisition services for discerning buyers seeking off-market and exclusive opportunities." },
  "servPage.s6": { tr: "Portföy Yönetimi", en: "Portfolio Guidance" },
  "servPage.s6d": { tr: "Değeri, çeşitlendirmeyi ve uzun vadeli getirileri optimize etmek için gayrimenkul portföyünüzün bütünsel yönetimi.", en: "Holistic management of your real estate portfolio to optimize value, diversification, and long-term returns." },
  "servPage.s7": { tr: "Proje Satışları", en: "Project Sales" },
  "servPage.s7d": { tr: "Yeni lüks projeler için lansman öncesinden son teslimata kadar eksiksiz satış stratejisi ve yürütmesi.", en: "Complete sales strategy and execution for new luxury developments, from pre-launch to final handover." },
  "servPage.s8": { tr: "Pazar İstihbaratı", en: "Market Intelligence" },
  "servPage.s8d": { tr: "Sürekli gelişen lüks mülk ortamında bilinçli kararlar almanızı sağlayan özel araştırma ve analiz.", en: "Proprietary research and analysis empowering informed decisions in an ever-evolving luxury property landscape." },
  "servPage.cta": { tr: "Gereksinimlerinizi Tartışalım", en: "Let's Discuss Your Requirements" },
  "servPage.ctaBtn": { tr: "Randevu Al", en: "Book Consultation" },

  // Lifestyle Page
  "lifePage.subtitle": { tr: "Deneyim", en: "Experience" },
  "lifePage.title1": { tr: "", en: "The Art of " },
  "lifePage.title2": { tr: "Üst Düzey Yaşam Sanatı", en: "Elevated Living" },
  "lifePage.quote": { tr: "\"Bir ev sadece duvarlarıyla tanımlanmaz, onu çevreleyen dünyayla tanımlanır — şafakta sizi karşılayan manzaralar, akşamlarınıza ilham veren kültür, adresinize eşlik eden prestij.\"", en: "\"A home is not defined by its walls alone, but by the world that surrounds it — the views that greet you at dawn, the culture that inspires your evenings, the prestige that accompanies your address.\"" },
  "lifePage.amenities": { tr: "Dünyanız", en: "Your World" },
  "lifePage.amenTitle": { tr: "Taviz Vermeden Yaşam", en: "A Life Without Compromise" },
  "lifePage.a1": { tr: "Marinalar & Yatçılık", en: "Marinas & Yachting" },
  "lifePage.a1d": { tr: "Kapınızda dünya standartlarında marinalar, Akdeniz yaşam tarzı okyanus özgürlüğüyle buluşuyor.", en: "World-class marinas steps from your door, where Mediterranean lifestyle meets ocean freedom." },
  "lifePage.a2": { tr: "Gurme Restoranlar", en: "Fine Dining" },
  "lifePage.a2d": { tr: "Yüksek gastronomi sanatını tanımlayan Michelin yıldızlı restoranlar ve özel kulüpler.", en: "Michelin-starred restaurants and exclusive clubs that define the art of elevated gastronomy." },
  "lifePage.a3": { tr: "Uluslararası Okullar", en: "International Schools" },
  "lifePage.a3d": { tr: "Ailelerin yeni ortamlarında gelişmelerini sağlayan birinci sınıf eğitim kurumları.", en: "Top-tier educational institutions ensuring families thrive in their new environment." },
  "lifePage.a4": { tr: "İş Merkezleri", en: "Business Districts" },
  "lifePage.a4d": { tr: "Küresel finans merkezlerine ve premium iş altyapısına yakınlık.", en: "Proximity to global financial centers and premium business infrastructure." },
  "lifePage.a5": { tr: "Sanat & Kültür", en: "Arts & Culture" },
  "lifePage.a5d": { tr: "Yaşamın her boyutunu zenginleştiren galeriler, opera evleri ve kültürel etkinlikler.", en: "Galleries, opera houses, and cultural events that enrich every dimension of living." },
  "lifePage.a6": { tr: "Doğa & Wellness", en: "Nature & Wellness" },
  "lifePage.a6d": { tr: "Bozulmamış sahiller, dağ kaçamakları ve kapınızdaki dünya standartlarında spa destinasyonları.", en: "Pristine coastlines, mountain retreats, and world-class spa destinations at your doorstep." },
  "lifePage.sunset1": { tr: "Her Gün Batımı ", en: "Where Every Sunset Is " },
  "lifePage.sunset2": { tr: "Sizin", en: "Yours" },
  "lifePage.findAddress": { tr: "Adresinizi Bulun", en: "Find Your Address" },

  // Sold Page
  "soldPage.subtitle": { tr: "Sicilimiz", en: "Track Record" },
  "soldPage.title": { tr: "Satılan Portföy", en: "Sold Portfolio" },
  "soldPage.desc": { tr: "Son tamamlanan işlemlerimizin özenli bir vitrini. Her biri, gizlilik ve uzmanlıkla premium sonuçlar elde etme taahhüdümüzü temsil eder.", en: "A curated showcase of our recently concluded transactions. Each represents our commitment to achieving premium results with discretion and expertise." },

  // Blog Page
  "blogPage.subtitle": { tr: "Günlük", en: "The Journal" },
  "blogPage.title": { tr: "İçgörüler & Perspektifler", en: "Insights & Perspectives" },
  "blogPage.desc": { tr: "Lüks gayrimenkul dünyasından uzman analiz, pazar istihbaratı ve editoryal bakış açıları.", en: "Expert analysis, market intelligence, and editorial perspectives from the world of luxury real estate." },
  "blogPage.readArticle": { tr: "Makaleyi Oku", en: "Read Article" },
  "blogPage.back": { tr: "Blog'a Dön", en: "Back to Blog" },

  // Blog posts
  "blog.1.title": { tr: "Sunum, Mülk Değerini %30'a Kadar Nasıl Artırır?", en: "How Presentation Elevates Property Value by Up to 30%" },
  "blog.1.category": { tr: "Pazar İçgörüleri", en: "Market Insights" },
  "blog.1.date": { tr: "12 Mart 2026", en: "March 12, 2026" },
  "blog.1.excerpt": { tr: "Lüks gayrimenkulde ilk izlenimler sadece önemli değil — her şeydir. Stratejik sunumun algıyı nasıl dönüştürdüğünü ve premium satışları nasıl hızlandırdığını öğrenin.", en: "In luxury real estate, first impressions aren't just important — they're everything. Learn how strategic presentation transforms perception and accelerates premium sales." },
  "blog.1.content": { tr: "Lüks gayrimenkul pazarında, bir mülkün sunumu genellikle mülkün kendisi kadar önemlidir. Araştırmalar, profesyonel olarak sunulan mülklerin %30'a kadar daha yüksek fiyatlarla satıldığını göstermektedir.\n\nStratejik sunum, profesyonel fotoğrafçılıktan sinematik video turlara, sanal gerçeklik deneyimlerinden özenle hazırlanmış mülk açıklamalarına kadar geniş bir yelpazeyi kapsar. Her dokunuş noktası, potansiyel alıcının zihninde bir algı yaratır.\n\nAurum Estates olarak, her mülkü bir lüks marka lansmanı gibi ele alıyoruz. Sinematik görseller, editoryal içerik ve premium kanal dağıtımıyla mülkünüzü sadece listelemiyor, onu arzulanan bir yatırım fırsatına dönüştürüyoruz.\n\nDoğru sunum stratejisi, mülkünüzün pazarda geçirdiği süreyi kısaltır ve nihai satış fiyatını önemli ölçüde artırır. Bu, salt estetiğin ötesinde stratejik bir yaklaşımdır.", en: "In the luxury real estate market, the presentation of a property is often as important as the property itself. Research shows that professionally presented properties sell for up to 30% higher prices.\n\nStrategic presentation encompasses a wide range — from professional photography to cinematic video tours, virtual reality experiences to carefully crafted property descriptions. Every touchpoint creates a perception in the potential buyer's mind.\n\nAt Aurum Estates, we treat every property like a luxury brand launch. With cinematic visuals, editorial content, and premium channel distribution, we don't just list your property — we transform it into a coveted investment opportunity.\n\nThe right presentation strategy shortens your property's time on market and significantly increases the final sale price. This goes beyond mere aesthetics — it's a strategic approach." },

  "blog.2.title": { tr: "Markalı Konutların Yükselişi: Yatırımcıların Bilmesi Gerekenler", en: "The Rise of Branded Residences: What Investors Need to Know" },
  "blog.2.category": { tr: "Yatırım", en: "Investment" },
  "blog.2.date": { tr: "5 Mart 2026", en: "March 5, 2026" },
  "blog.2.excerpt": { tr: "Markalı konutlar lüks pazarı yeniden şekillendiriyor. Otel ortaklıklarından tasarımcı işbirliklerine, bu segmentin neden geleneksel lüksü geride bıraktığını keşfedin.", en: "Branded residences are reshaping the luxury market. From hotel partnerships to designer collaborations, discover why this segment is outperforming traditional luxury." },
  "blog.2.content": { tr: "Markalı konutlar, lüks gayrimenkul pazarının en hızlı büyüyen segmentlerinden biri haline geldi. Bu konsept, dünya çapında tanınmış otel markalarının, moda evlerinin ve tasarımcıların adlarını taşıyan konut projelerini ifade eder.\n\nBu tür projelerin çekiciliği açıktır: alıcılar sadece bir ev satın almaz, bir yaşam tarzı ve marka deneyimi satın alırlar. Four Seasons, Armani, Bulgari gibi markalar, konut projelerine imza atarak yatırımcılara eşsiz bir değer önerisi sunmaktadır.\n\nMarkalı konutlar, geleneksel lüks konutlara kıyasla ortalama %30-35 daha yüksek prim taşımaktadır. Ayrıca, bu mülkler daha hızlı satılmakta ve değerlerini daha iyi korumaktadır.\n\nYatırımcılar için temel değerlendirme kriterleri arasında markanın gücü, lokasyon, hizmet kalitesi ve uzun vadeli değer artışı potansiyeli yer almaktadır.", en: "Branded residences have become one of the fastest-growing segments of the luxury real estate market. This concept refers to residential projects bearing the names of world-renowned hotel brands, fashion houses, and designers.\n\nThe appeal is clear: buyers purchase not just a home, but a lifestyle and brand experience. Brands like Four Seasons, Armani, and Bulgari are lending their names to residential projects, offering investors a unique value proposition.\n\nBranded residences command an average premium of 30-35% compared to traditional luxury residences. These properties also sell faster and retain their value better.\n\nKey evaluation criteria for investors include brand strength, location, service quality, and long-term appreciation potential." },

  "blog.3.title": { tr: "Akdeniz Yaşamı: Dünyanın En Çok Aranan Adresleri", en: "Mediterranean Living: The World's Most Coveted Addresses" },
  "blog.3.category": { tr: "Yaşam Tarzı", en: "Lifestyle" },
  "blog.3.date": { tr: "28 Şubat 2026", en: "February 28, 2026" },
  "blog.3.excerpt": { tr: "Fransız Rivierası'ndan Amalfi Kıyısı'na, Akdeniz yaşamının zamansız çekiciliğini ve kıyı prestijini tanımlayan mülkleri keşfedin.", en: "From the French Riviera to the Amalfi Coast, explore the timeless allure of Mediterranean living and the properties that define coastal prestige." },
  "blog.3.content": { tr: "Akdeniz, yüzyıllardır dünyanın en zengin ve etkili insanlarının yaşam tarzı tercihi olmuştur. Azur Kıyısı'ndan Amalfi'ye, İbiza'dan Mykonos'a uzanan bu bölge, eşsiz bir yaşam kalitesi sunar.\n\nBu bölgelerdeki gayrimenkul yatırımları, hem yaşam kalitesi hem de finansal getiri açısından benzersiz fırsatlar sunmaktadır. Özellikle deniz manzaralı villalar ve sahil rezidansları, sürekli artan bir talep görmektedir.\n\nAkdeniz yaşam tarzı; güneş, deniz, gastronomi, kültür ve doğanın mükemmel harmonisini temsil eder. Bu bölgelerdeki mülkler, sadece bir yatırım değil, bir yaşam kalitesi yatırımıdır.\n\nAurum Estates olarak, Akdeniz'in en prestijli adreslerinde özenle seçilmiş mülk portföyümüzle, müşterilerimize hayallerindeki yaşamı sunuyoruz.", en: "The Mediterranean has been the lifestyle choice of the world's wealthiest and most influential people for centuries. From the Côte d'Azur to Amalfi, Ibiza to Mykonos, this region offers an unparalleled quality of life.\n\nReal estate investments in these regions present unique opportunities for both quality of life and financial returns. Sea-view villas and coastal residences, in particular, are seeing ever-increasing demand.\n\nThe Mediterranean lifestyle represents the perfect harmony of sun, sea, gastronomy, culture, and nature. Properties in these regions are not just investments — they are investments in quality of life.\n\nAt Aurum Estates, we offer our clients the life of their dreams with our carefully curated portfolio in the Mediterranean's most prestigious addresses." },

  // FAQ Page
  "faqPage.subtitle": { tr: "Sorular", en: "Questions" },
  "faqPage.title": { tr: "Sıkça Sorulanlar", en: "Frequently Asked" },
  "faqPage.desc": { tr: "Hizmetlerimiz, sürecimiz ve lüks gayrimenkul yaklaşımımız hakkındaki en yaygın soruların yanıtları.", en: "Answers to the most common questions about our services, process, and approach to luxury real estate." },
  "faq.1.q": { tr: "Özel gösterimler nasıl çalışır?", en: "How do private viewings work?" },
  "faq.1.a": { tr: "Özel gösterimler, ön nitelikli müşteriler için özel olarak düzenlenir. Bir mülke ilgi gösterdiğinizde, danışmanlarımız programınıza uygun gizli ve kişiselleştirilmiş bir gösteri koordine eder. Uluslararası müşteriler için sanal turlar da mevcuttur.", en: "Private viewings are arranged exclusively for pre-qualified clients. Once you express interest in a property, our advisors coordinate a discreet, personalized showing at a time that suits your schedule. Virtual tours are also available for international clients." },
  "faq.2.q": { tr: "Mülkümü listeleme süreci nasıl?", en: "What is the process for listing my property?" },
  "faq.2.a": { tr: "Mülkünüzü, hedeflerinizi ve zaman çizelgenizi anlamak için gizli bir danışmanlıkla başlıyoruz. Ardından kapsamlı bir pazar analizi yapıyor, sinematik görseller ve editoryal içerik dahil özel bir pazarlama stratejisi geliştiriyor ve mülkünüzü premium kanallarımız aracılığıyla konumlandırıyoruz.", en: "We begin with a confidential consultation to understand your property, objectives, and timeline. Our team then conducts a comprehensive market analysis, develops a bespoke marketing strategy including cinematic visuals and editorial content, and positions your property across our premium channels." },
  "faq.3.q": { tr: "Uluslararası işlemleri yönetiyor musunuz?", en: "Do you handle international transactions?" },
  "faq.3.a": { tr: "Kesinlikle. On iki küresel pazarda faaliyet gösteriyoruz ve yasal koordinasyon, döviz değerlendirmeleri ve vergi danışmanlığı ortaklıkları dahil sınır ötesi işlemleri yönetme konusunda kapsamlı deneyime sahibiz.", en: "Absolutely. We operate across twelve global markets and have extensive experience managing cross-border transactions, including legal coordination, currency considerations, and tax advisory partnerships." },
  "faq.4.q": { tr: "Mülk fiyatlandırmasını nasıl belirliyorsunuz?", en: "How do you determine property pricing?" },
  "faq.4.a": { tr: "Fiyatlandırma önerilerimiz veri odaklıdır; özel pazar istihbaratını, karşılaştırılabilir işlem analizini ve lüks segmentte alıcı psikolojisinin derin anlayışını birleştirerek mülkünüzü maksimum değer için konumlandırırız.", en: "Our pricing recommendations are data-driven, combining proprietary market intelligence, comparable transaction analysis, and deep understanding of buyer psychology in the luxury segment to position your property for maximum value." },
  "faq.5.q": { tr: "Aurum Estates'i diğer ajanslardan farklı kılan nedir?", en: "What makes Aurum Estates different from other agencies?" },
  "faq.5.a": { tr: "Her mülke bir lüks marka lansmanı olarak yaklaşıyoruz — bir listeleme olarak değil. Sinematik pazarlama, editoryal konumlandırma, küresel alıcı ağımız ve beyaz eldiven hizmetimiz, sürekli olarak pazar beklentilerini aşan sonuçlar sunar.", en: "We approach every property as a luxury brand launch — not a listing. Our cinematic marketing, editorial positioning, global buyer network, and white-glove service deliver results that consistently exceed market expectations." },
  "faq.6.q": { tr: "Yatırım danışmanlığı hizmeti sunuyor musunuz?", en: "Do you offer investment advisory services?" },
  "faq.6.a": { tr: "Evet. Yatırım danışmanlığı ekibimiz, portföy stratejisi, pazar zamanlaması, verim optimizasyonu ve dünyanın en umut vadeden lüks pazarlarındaki geliştirme fırsatları konusunda kapsamlı rehberlik sağlar.", en: "Yes. Our investment consultancy team provides comprehensive guidance on portfolio strategy, market timing, yield optimization, and development opportunities across the world's most promising luxury markets." },
  "faq.7.q": { tr: "Tipik bir satış ne kadar sürer?", en: "How long does a typical sale take?" },
  "faq.7.a": { tr: "Süreler mülk türü, pazar koşulları ve fiyatlandırma stratejisine göre değişir. Ancak premium pazarlama yaklaşımımız ve nitelikli alıcı ağımız, genellikle süreci geleneksel yöntemlere kıyasla önemli ölçüde hızlandırır.", en: "Timelines vary based on property type, market conditions, and pricing strategy. However, our premium marketing approach and qualified buyer network typically accelerate the process significantly compared to traditional methods." },
  "faq.8.q": { tr: "Bilgilerim gizli tutulur mu?", en: "Is my information kept confidential?" },
  "faq.8.a": { tr: "Gizlilik, hizmetimizin temelini oluşturur. Tüm müşteri bilgileri, mülk detayları ve işlem özellikleri en üst düzeyde gizlilikle ele alınır. İşlemlerimizin çoğu tamamen pazar dışı olarak gerçekleştirilir.", en: "Discretion is fundamental to our service. All client information, property details, and transaction specifics are treated with the highest level of confidentiality. Many of our transactions are conducted entirely off-market." },

  // Contact Page
  "contactPage.subtitle": { tr: "İletişime Geçin", en: "Get in Touch" },
  "contactPage.title": { tr: "Özel Danışmanlık", en: "Private Consultation" },
  "contactPage.desc": { tr: "İster hayalinizdeki konutu arıyor, ister mülkünüzü pazara konumlandırıyor, ister yatırım fırsatlarını keşfediyor olun — danışmanlarımız hazır.", en: "Whether you're seeking your dream residence, positioning a property for the market, or exploring investment opportunities — our advisors are ready." },
  "contactPage.name": { tr: "Ad Soyad", en: "Full Name" },
  "contactPage.email": { tr: "E-posta", en: "Email" },
  "contactPage.phone": { tr: "Telefon", en: "Phone" },
  "contactPage.iam": { tr: "Ben Bir", en: "I Am a" },
  "contactPage.buyer": { tr: "Alıcı", en: "Buyer" },
  "contactPage.seller": { tr: "Satıcı", en: "Seller" },
  "contactPage.investor": { tr: "Yatırımcı", en: "Investor" },
  "contactPage.developer": { tr: "Geliştirici", en: "Developer" },
  "contactPage.other": { tr: "Diğer", en: "Other" },
  "contactPage.message": { tr: "Mesaj", en: "Message" },
  "contactPage.send": { tr: "Sorgu Gönder", en: "Send Inquiry" },
  "contactPage.office": { tr: "Ofis", en: "Office" },
  "contactPage.hours": { tr: "Çalışma Saatleri", en: "Hours" },
  "contactPage.monFri": { tr: "Pzt–Cum: 9:00–19:00", en: "Mon–Fri: 9:00–19:00" },
  "contactPage.sat": { tr: "Cumartesi: Randevu ile", en: "Saturday: By appointment" },
  "contactPage.sun": { tr: "Pazar: Kapalı", en: "Sunday: Closed" },
  "contactPage.thanks": { tr: "Sorgunuz için teşekkürler. Ekibimiz en kısa sürede sizinle iletişime geçecektir.", en: "Thank you for your inquiry. Our team will be in touch shortly." },

  // Property Details
  "propDetail.back": { tr: "Gayrimenkullere Dön", en: "Back to Properties" },
  "propDetail.bedrooms": { tr: "Yatak Odası", en: "Bedrooms" },
  "propDetail.bathrooms": { tr: "Banyo", en: "Bathrooms" },
  "propDetail.area": { tr: "Yaşam Alanı", en: "Living Area" },
  "propDetail.aboutTitle": { tr: "Bu Konut Hakkında", en: "About This Residence" },
  "propDetail.highlights": { tr: "Lüks Detaylar", en: "Luxury Highlights" },
  "propDetail.gallery": { tr: "Galeri", en: "Gallery" },
  "propDetail.price": { tr: "İstenen Fiyat", en: "Asking Price" },
  "propDetail.viewing": { tr: "Özel Gösterim Talep Et", en: "Request Private Viewing" },
  "propDetail.inquire": { tr: "Bu Mülk Hakkında Bilgi Al", en: "Inquire About This Property" },
  "propDetail.type": { tr: "Mülk Türü", en: "Property Type" },
  "propDetail.year": { tr: "Yapım Yılı", en: "Year Built" },
  "propDetail.floor": { tr: "Kat", en: "Floor" },
  "propDetail.parking": { tr: "Otopark", en: "Parking" },
  "propDetail.status": { tr: "Durum", en: "Status" },
  "propDetail.available": { tr: "Müsait", en: "Available" },
  "propDetail.spaces": { tr: "Alan", en: "Spaces" },
  "propDetail.topFloor": { tr: "32. (En Üst Kat)", en: "32nd (Top Floor)" },
  "propDetail.similar": { tr: "Benzer Gayrimenkuller", en: "Similar Properties" },
  "propDetail.panoramic": { tr: "Panoramik Deniz Manzarası", en: "Panoramic Sea View" },
  "propDetail.pool": { tr: "Özel Sonsuzluk Havuzu", en: "Private Infinity Pool" },
  "propDetail.concierge": { tr: "7/24 Konsiyerj", en: "24/7 Concierge" },
  "propDetail.garage": { tr: "Özel Garaj", en: "Private Garage" },
  "propDetail.smart": { tr: "Akıllı Ev Sistemi", en: "Smart Home System" },
  "propDetail.designer": { tr: "Tasarımcı İç Mekanlar", en: "Designer Interiors" },

  // Footer
  "footer.desc": { tr: "Varlık, hassasiyet ve olağanüstü yaşama sarsılmaz bağlılıkla lüks gayrimenkulü tanımlıyoruz.", en: "Defining luxury real estate through presence, precision, and an unwavering commitment to extraordinary living." },
  "footer.navigate": { tr: "Gezinme", en: "Navigate" },
  "footer.resources": { tr: "Kaynaklar", en: "Resources" },
  "footer.contact": { tr: "İletişim", en: "Contact" },
  "footer.properties": { tr: "Gayrimenkuller", en: "Properties" },
  "footer.projects": { tr: "Projeler", en: "Projects" },
  "footer.services": { tr: "Hizmetler", en: "Services" },
  "footer.aboutUs": { tr: "Hakkımızda", en: "About Us" },
  "footer.lifestyle": { tr: "Yaşam Tarzı", en: "Lifestyle" },
  "footer.soldPortfolio": { tr: "Satılan Portföy", en: "Sold Portfolio" },
  "footer.journal": { tr: "Günlük", en: "Journal" },
  "footer.faq": { tr: "SSS", en: "FAQ" },
  "footer.rights": { tr: "© 2026 Aurum Estates. Tüm hakları saklıdır.", en: "© 2026 Aurum Estates. All rights reserved." },
  "footer.privacy": { tr: "Gizlilik Politikası", en: "Privacy Policy" },
  "footer.terms": { tr: "Kullanım Şartları", en: "Terms of Service" },
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
