import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Building2, Users, Bell, LogOut, Globe } from "lucide-react";

const nav = [
  { to: "/admin", label: "Genel Bakış", icon: LayoutDashboard, end: true },
  { to: "/admin/ilanlar", label: "İlanlar", icon: Building2 },
  { to: "/admin/musteriler", label: "Müşteriler (CRM)", icon: Users },
  { to: "/admin/hatirlatmalar", label: "Hatırlatmalar", icon: Bell },
];

const AdminLayout = ({ children, title, action }: { children: ReactNode; title: string; action?: ReactNode }) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-secondary/40 fixed inset-y-0">
        <Link to="/admin" className="font-display text-base tracking-wider px-6 py-6 border-b border-border">
          <span className="gradient-gold-text font-bold">SARRAF 34</span>
          <span className="text-foreground font-light ml-1.5">YAPI</span>
        </Link>
        <nav className="flex-1 py-6 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 font-body text-xs tracking-[0.12em] uppercase transition-colors ${
                  isActive ? "text-primary border-l-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <n.icon size={15} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-border space-y-3">
          <p className="font-body text-xs text-muted-foreground truncate">{user?.email}</p>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary">{role === "admin" ? "Yönetici" : "Danışman"}</p>
          <Link to="/" className="flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-primary">
            <Globe size={13} /> Siteyi görüntüle
          </Link>
          <button
            onClick={async () => { await signOut(); navigate("/giris"); }}
            className="flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-destructive"
          >
            <LogOut size={13} /> Çıkış yap
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 min-w-0">
        <header className="border-b border-border px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-display text-xl text-foreground">{title}</h1>
          {action}
        </header>
        <div className="md:hidden flex overflow-x-auto gap-1 border-b border-border px-3 py-2">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 font-body text-[10px] tracking-wider uppercase ${isActive ? "text-primary" : "text-muted-foreground"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;