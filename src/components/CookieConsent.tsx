import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CookieConsentProps {
  onOpenCookiePolicy?: () => void;
}

export const CookieConsent = ({ onOpenCookiePolicy }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem("sarraf34_cookie_consent");
    if (!consent) {
      // Delay display slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("sarraf34_cookie_consent", "all");
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("sarraf34_cookie_consent", "essential");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          aria-label="Çerez İzni Bildirimi"
          role="region"
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-5 rounded-lg border border-primary/30 bg-background/95 backdrop-blur-md shadow-2xl shadow-black/40 text-foreground"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Cookie size={18} className="text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">
                Çerez Kullanımı ve Gizlilik
              </h3>
            </div>
            <button
              onClick={handleAcceptEssential}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm"
              aria-label="Bildirimi Kapat"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-muted-foreground font-body leading-relaxed mb-4">
            Sarraf 34 olarak sizlere daha iyi ve kişiselleştirilmiş bir deneyim sunmak, site trafiğini analiz etmek ve güvenliği sağlamak için yasal mevzuata uygun çerezler kullanmaktayız.{" "}
            {onOpenCookiePolicy && (
              <button
                type="button"
                onClick={onOpenCookiePolicy}
                className="text-primary hover:underline font-medium inline underline-offset-2"
              >
                Çerez Politikamızı
              </button>
            )}{" "}
            inceleyebilirsiniz.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center font-body flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShieldCheck size={14} /> Tümünü Kabul Et
            </button>
            <button
              onClick={handleAcceptEssential}
              className="py-2 px-3 text-xs font-medium rounded-sm border border-border/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-center font-body"
            >
              Sadece Zorunlular
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
