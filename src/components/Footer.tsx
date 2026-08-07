import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
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
                <p>+90 (212) 650 34 34</p>
                <p>info@sarraf34.com</p>
                <p>Sarraf 34 Plaza, Merkez Mah.<br />İstanbul, Türkiye</p>
                <p className="pt-2 text-stone">{t("contactPage.monFri")}<br />{t("contactPage.sat")}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="luxury-divider mt-16 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground font-body text-xs tracking-wider">{t("footer.rights")}</p>
          <div className="flex gap-6">
            {[t("footer.privacy"), t("footer.terms"), t("footer.cookies")].map((item) => (
              <span key={item} className="text-muted-foreground font-body text-xs tracking-wider hover:text-primary cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
