import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Giriş yapıldı, panele yönlendiriliyorsunuz...");
        navigate("/admin", { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        
        if (data.session) {
          toast.success("Hesabınız başarıyla oluşturuldu! Panele yönlendiriliyorsunuz...");
          navigate("/admin", { replace: true });
        } else {
          toast.success("Kayıt oluşturuldu! Supabase üzerinde e-posta onayı aktifse lütfen onaylayın veya yönetici onayıyla giriş yapın.");
          setMode("login");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors rounded-sm";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-xl tracking-wider block text-center mb-10">
          <span className="gradient-gold-text font-bold">SARRAF 34</span>
          <span className="text-foreground font-light ml-2">YAPI</span>
        </Link>

        <div className="luxury-card p-8">
          <h1 className="font-display text-2xl text-foreground mb-1">
            {mode === "login" ? "Yönetim Girişi" : "Ekip Hesabı Oluştur"}
          </h1>
          <p className="font-body text-xs text-muted-foreground mb-8 tracking-wider uppercase">
            Sarraf 34 Yapı İnşaat Gayrimenkul
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <input
                className={inputClass}
                placeholder="Ad Soyad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={100}
              />
            )}
            <input
              className={inputClass}
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
            <input
              className={inputClass}
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full gradient-gold text-primary-foreground py-3 text-xs tracking-[0.2em] uppercase font-body flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-6 w-full text-center font-body text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === "login" ? "Ekip hesabı oluştur" : "Zaten hesabım var"}
          </button>
        </div>

        <Link
          to="/"
          className="block text-center mt-8 font-body text-xs text-muted-foreground hover:text-primary tracking-wider uppercase"
        >
          ← Siteye dön
        </Link>
      </div>
    </div>
  );
};

export default Auth;