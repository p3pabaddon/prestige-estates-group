import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.properties"), path: "/properties" },
    { label: t("nav.projects"), path: "/projects" },
    { label: t("nav.services"), path: "/services" },
    { label: t("nav.lifestyle"), path: "/lifestyle" },
    { label: t("nav.about"), path: "/about" },
    { label: t("nav.blog"), path: "/blog" },
    { label: t("nav.contact"), path: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-panel py-3" : "py-5 bg-transparent"
        }`}
      >
        <div className="container-luxury flex items-center justify-between">
          <Link to="/" className="font-display text-base sm:text-lg tracking-wider text-foreground flex-shrink-0 flex items-center gap-1.5">
            <span className="gradient-gold-text font-extrabold tracking-widest">SARRAF 34</span>
            <span className="text-foreground/90 font-light text-xs tracking-wider uppercase hidden sm:inline">İNŞAAT GAYRİMENKUL</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 ml-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-[11px] tracking-[0.15em] uppercase transition-colors duration-300 whitespace-nowrap ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 ml-6">
            {/* Language Toggle */}
            <div className="flex items-center border border-border rounded-sm overflow-hidden">
              <button
                onClick={() => setLang("tr")}
                className={`px-2.5 py-1.5 text-[10px] tracking-wider font-body uppercase transition-all ${
                  lang === "tr" ? "gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                TR
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1.5 text-[10px] tracking-wider font-body uppercase transition-all ${
                  lang === "en" ? "gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>

            <Link to="/contact" className="luxury-btn-outline text-[10px] py-2.5 px-5 whitespace-nowrap">
              {t("nav.book")}
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <div className="flex items-center border border-border rounded-sm overflow-hidden">
              <button
                onClick={() => setLang("tr")}
                className={`px-2 py-1 text-[10px] tracking-wider font-body uppercase transition-all ${
                  lang === "tr" ? "gradient-gold text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                TR
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 text-[10px] tracking-wider font-body uppercase transition-all ${
                  lang === "en" ? "gradient-gold text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-foreground"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-6"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={link.path}
                  className="font-display text-2xl tracking-wider text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Link to="/contact" className="luxury-btn-primary mt-4">
                {t("nav.book")}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
