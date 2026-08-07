import { Sun, Moon, MessageCircle, PhoneCall } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

const FloatingButtons = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Quick Phone Call */}
      <motion.a
        href="tel:05302503252"
        title="Sarraf 34 Hemen Ara"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <PhoneCall size={20} />
      </motion.a>

      {/* WhatsApp Chat */}
      <motion.a
        href="https://wa.me/905302503252?text=Merhaba%2C%20Sarraf%2034%20Gayrimenkul%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp ile İletişime Geç"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <MessageCircle size={22} className="text-white" />
      </motion.a>

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Tema Değiştir"
        className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:border-primary/30"
      >
        {theme === "dark" ? (
          <Sun size={20} className="text-primary" />
        ) : (
          <Moon size={20} className="text-primary" />
        )}
      </motion.button>
    </div>
  );
};

export default FloatingButtons;
