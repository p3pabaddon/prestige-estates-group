import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border/80 shadow-2xl space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary text-3xl font-display font-bold border border-primary/20">
            404
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Sayfa Bulunamadı</h1>
            <p className="text-sm font-body text-muted-foreground">
              Aradığınız sayfa veya ilan mevcut değil ya da bağlantı adresi değiştirilmiş olabilir.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/ilanlar"
              className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-body text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Home size={16} /> Tüm İlanları İncele
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-lg bg-secondary border border-border text-foreground font-body text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft size={16} /> Ana Sayfa
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
