import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

type LegalModal = "privacy" | "terms" | "cookies" | "brokerage" | "consent" | null;

interface FooterProps {
  initialModal?: LegalModal;
}

const Footer = ({ initialModal = null }: FooterProps) => {
  const { t } = useLanguage();
  const [modal, setModal] = useState<LegalModal>(initialModal);

  const legalContent: Record<string, { title: string; body: string }> = {
    privacy: {
      title: "KVKK Aydınlatma Metni ve Gizlilik Politikası",
      body: `Sarraf 34 İnşaat Yapı Gayrimenkul ("Şirket"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla kişisel verilerinizin güvenliğine ve gizliliğine azami hassasiyet göstermektedir.

1. Toplanan Kişisel Veriler
Web sitemiz, iletişim formlarımız, WhatsApp hattımız veya doğrudan ofisimiz aracılığıyla paylaştığınız; Ad, Soyad, Telefon Numarası, E-posta Adresi, Talep/Mesaj Detayları, Gayrimenkul Tercihleri ve IP adresi gibi teknik veriler toplanmaktadır.

2. Kişisel Verilerin İşlenme Amaçları
Kişisel verileriniz; gayrimenkul alım, satım, kiralama ve kentsel dönüşüm taleplerinizin karşılanması, randevu ve ekspertiz süreçlerinin organize edilmesi, müşteri memnuniyetinin artırılması, yasal mevzuat kapsamındaki yükümlülüklerin ifası ve yetkili mercilere bilgi verilmesi amacıyla işlenmektedir.

3. Kişisel Verilerin Aktarılması
Toplanan veriler, yasal zorunluluklar haricinde hiçbir üçüncü taraf kişi veya kurumla ticari amaçla paylaşılmaz. Yalnızca tapu müdürlükleri, noterler, yetkili kamu kurumları ve hizmetin ifası için zorunlu olan bankalar/eksperlerle yasal çerçevede paylaşılabilir.

4. Veri Güvenliği ve Saklama Süresi
Verileriniz yüksek güvenlikli dijital altyapılarda ve şifrelenmiş veritabanlarında saklanır. Yasal saklama süreleri dolduğunda veya talebiniz üzerine veriler güvenli bir şekilde silinir veya anonim hale getirilir.

5. KVKK Madde 11 Kapsamındaki Haklarınız
Veri sahibi olarak; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, düzeltilmesini veya silinmesini isteme ve kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme haklarına sahipsiniz.

İletişim ve Başvuru: info@sarraf34.com | 0530 250 32 52 | Güzelyurt, Ertuğrul Gazi Cd. 59 A, Esenyurt / İstanbul`,
    },
    terms: {
      title: "Kullanım Koşulları ve Hizmet Şartları",
      body: `Bu web sitesini (sarraf34.com) ziyaret ederek ve kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız:

1. Hizmet Kapsamı
Sarraf 34 İnşaat Yapı Gayrimenkul; gayrimenkul alım-satım ve kiralama danışmanlığı, kentsel dönüşüm proje yönetimi ve inşaat taahhüt hizmetleri sunmaktadır. Web sitesinde yer alan tüm görsel, proje ve ilan bilgileri tanıtım ve bilgilendirme amaçlıdır.

2. Fikri Mülkiyet Hakları
Sitede yer alan tüm marka logoları, metinler, fotoğraflar, mimari proje çizimleri, tasarım ve yazılım kodları Sarraf 34'e aittir. Yazılı izin alınmaksızın kopyalanamaz, çoğaltılamaz veya başka mecralarda yayınlanamaz.

3. İlan ve Fiyat Bilgileri
Web sitesindeki ilan fiyatları, m2 bilgileri ve teknik detaylar düzenli olarak güncellenmektedir. Ancak piyasa koşulları, döviz kuru değişimleri ve mülk sahibi talepleri doğrultusunda değişiklik gösterebilir. Nihai geçerli bilgiler resmi sözleşme ve tapu kayıtlarına tabidir.

4. Sorumluluk Sınırları
Sarraf 34, web sitesindeki teknik kesintilerden, üçüncü taraf bağlantılarından veya kullanıcıların hatalı bilgi girişlerinden kaynaklanan aksaklıklardan doğrudan sorumlu tutulamaz.

5. Yetkili Mahkeme
İşbu koşulların uygulanmasından doğabilecek her türlü hukuki uyuşmazlıkta İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
    },
    cookies: {
      title: "Çerez (Cookie) Politikası",
      body: `Sarraf 34 olarak, web sitemizin verimli çalışmasını sağlamak ve ziyaretçi deneyiminizi geliştirmek amacıyla çerezler (cookies) kullanmaktayız.

1. Çerez Nedir?
Çerezler, web sitemizi ziyaret ettiğinizde bilgisayarınız veya mobil cihazınızda saklanan küçük metin dosyalarıdır.

2. Kullandığımız Çerez Türleri:
• Zorunlu Çerezler: Sitenin temel işlevlerinin (güvenlik, oturum yönetimi, dil seçimi) çalışması için zorunludur.
• Performans ve Analitik Çerezleri: Sitenin kaç kişi tarafından ziyaret edildiğini ve en çok incelenen sayfaları anonim olarak analiz etmemizi sağlar.
• Fonksiyonel Çerezler: Dil tercihiniz ve filtreleme ayarlarınız gibi tercihlerinizi hatırlamamıza yardımcı olur.

3. Çerezleri Nasıl Kontrol Edebilirsiniz?
Tarayıcınızın ayarlar menüsünden dilediğiniz zaman çerezleri silebilir, engelleyebilir veya çerez gönderildiğinde uyarı verilmesini sağlayabilirsiniz. Zorunlu çerezleri devre dışı bırakmanız durumunda web sitesinin bazı özellikleri kısıtlanabilir.

Detaylı Bilgi: info@sarraf34.com`,
    },
    brokerage: {
      title: "Taşınmaz Ticareti ve Yetki Bilgilendirmesi",
      body: `Sarraf 34 İnşaat Yapı Gayrimenkul, T.C. Ticaret Bakanlığı Taşınmaz Ticareti Hakkında Yönetmelik hükümlerine tam uyumlu olarak faaliyet göstermektedir.

1. Hizmet Bedeli ve Komisyon Standartları
Taşınmaz alım-satım aracılık işlemlerinde, yasal mevzuat gereğince satış bedeli üzerinden %2 + KDV alıcıdan, %2 + KDV satıcıdan olmak üzere hizmet bedeli uygulanır. Kiralama işlemlerinde ise bir aylık kira bedeli + KDV olarak tahsil edilir.

2. Yetki Belgesi ve Sözleşmeli Çalışma
Tüm portföylerimiz taşınmaz sahipleriyle yapılan resmi yetkilendirme sözleşmeleri kapsamında pazarlanmaktadır. Yer gösterme işlemleri için yasal zorunluluk gereği "Taşınmaz Gösterme Belgesi" tanzim edilmektedir.

3. Güvenli Ödeme ve Tapu Devri
Tüm para transferleri ve tapu harç ödemeleri resmi banka kanalları ve Tapu ve Kadastro Genel Müdürlüğü (TKGM) Güvenli Ödeme Sistemi üzerinden güvence altına alınmaktadır.

İşletme Yetkilisi: Sarraf 34 İnşaat Yapı Gayrimenkul
Adres: Güzelyurt Mah. Ertuğrul Gazi Cd. 59 A, Esenyurt / İstanbul
Telefon: 0530 250 32 52`,
    },
    consent: {
      title: "Ticari Elektronik İleti ve Açık Rıza Metni",
      body: `Sarraf 34 İnşaat Yapı Gayrimenkul tarafından sunulan gayrimenkul portföyü, kentsel dönüşüm fırsatları, yeni proje lansmanları ve yatırım avantajları hakkında tarafıma SMS, WhatsApp, E-posta ve telefon araması yoluyla ticari elektronik ileti gönderilmesine;

Paylaşmış olduğum iletişim verilerimin bu kapsamda işlenmesine ve iletişim faaliyetlerinin yürütülmesi amacıyla gerekli teknik altyapı sağlayıcılarına aktarılmasına 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında açıkça onay veriyorum.

Not: Dilediğiniz zaman info@sarraf34.com adresine e-posta göndererek veya iletilerdeki ret seçeneğini kullanarak onayınızı ücretsiz olarak geri alabilirsiniz.`,
    },
  };

  return (
    <>
      <footer className="bg-secondary border-t border-border">
        <div className="container-luxury section-padding">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
              <div className="lg:col-span-1">
                <Link to="/" className="font-display text-base sm:text-lg tracking-wider flex items-center gap-1.5">
                  <span className="gradient-gold-text font-extrabold tracking-widest">SARRAF 34</span>
                  <span className="text-foreground font-light text-xs tracking-wider uppercase">İNŞAAT GAYRİMENKUL</span>
                </Link>
                <p className="text-muted-foreground font-body text-sm leading-relaxed mt-6">{t("footer.desc")}</p>

                {/* Social Media Icons */}
                <div className="flex gap-3 mt-6">
                  <a href="https://www.instagram.com/sarraf34insaat" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors" title="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  <a href="https://www.facebook.com/sarraf34insaat" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors" title="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="https://wa.me/905302503252" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-[#25D366] hover:border-[#25D366]/40 transition-colors" title="WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </a>
                </div>

                <div className="luxury-divider mt-8" />
              </div>

              <div>
                <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-6">{t("footer.navigate")}</h4>
                <div className="space-y-3">
                  {[
                    { label: t("footer.properties"), path: "/properties" },
                    { label: t("footer.projects"), path: "/projects" },
                    { label: t("footer.services"), path: "/services" },
                    { label: t("footer.aboutUs"), path: "/about" },
                    { label: t("footer.lifestyle"), path: "/lifestyle" },
                    { label: t("footer.soldPortfolio"), path: "/sold" },
                  ].map((link) => (
                    <Link key={link.path} to={link.path} className="block text-muted-foreground hover:text-primary font-body text-sm transition-colors duration-300">{link.label}</Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-6">{t("footer.resources")}</h4>
                <div className="space-y-3">
                  {[
                    { label: t("footer.journal"), path: "/blog" },
                    { label: t("footer.faq"), path: "/faq" },
                    { label: t("footer.contact"), path: "/contact" },
                  ].map((link) => (
                    <Link key={link.path} to={link.path} className="block text-muted-foreground hover:text-primary font-body text-sm transition-colors duration-300">{link.label}</Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-6">{t("footer.contact")}</h4>
                <div className="space-y-3 text-muted-foreground font-body text-sm">
                  <p>
                    <a href="tel:05302503252" className="hover:text-primary transition-colors font-medium text-foreground">
                      0530 250 32 52
                    </a>
                  </p>
                  <p>
                    <a href="mailto:info@sarraf34.com" className="hover:text-primary transition-colors">
                      info@sarraf34.com
                    </a>
                  </p>
                  <p className="leading-relaxed">
                    Güzelyurt, Ertuğrul Gazi Cd. 59 A,<br />34515 Esenyurt / İstanbul
                  </p>
                  <p className="pt-2 text-stone text-xs">{t("contactPage.monFri")}<br />{t("contactPage.sat")}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="luxury-divider mt-16 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground font-body text-xs tracking-wider">{t("footer.rights")}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2">
              {([
                { label: "KVKK & Gizlilik", key: "privacy" as const },
                { label: "Kullanım Şartları", key: "terms" as const },
                { label: "Çerez Politikası", key: "cookies" as const },
                { label: "Taşınmaz Ticareti", key: "brokerage" as const },
                { label: "Açık Rıza", key: "consent" as const },
              ]).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setModal(item.key)}
                  className="text-muted-foreground font-body text-xs tracking-wider hover:text-primary cursor-pointer transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/faq"
                className="text-muted-foreground font-body text-xs tracking-wider hover:text-primary transition-colors"
              >
                SSS
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      {modal && legalContent[modal] && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm overflow-y-auto p-4 md:p-10" onClick={() => setModal(null)}>
          <div className="luxury-card max-w-2xl mx-auto p-6 md:p-10 my-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl text-foreground">{legalContent[modal].title}</h2>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {legalContent[modal].body.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-muted-foreground font-body text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <button onClick={() => setModal(null)} className="luxury-btn-outline mt-8 text-xs">
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
