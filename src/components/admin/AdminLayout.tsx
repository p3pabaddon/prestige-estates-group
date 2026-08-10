import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Building2, Users, Bell, LogOut, Globe, Inbox, UserCheck } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  action?: ReactNode;
}

const AdminLayout = ({ children, title, action }: AdminLayoutProps) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/admin", label: "Genel Bakış", icon: LayoutDashboard, end: true },
    { to: "/admin/formlar", label: "Gelen Formlar", icon: Inbox },
    { to: "/admin/ilanlar", label: "İlanlar", icon: Building2 },
    { to: "/admin/musteriler", label: role === "admin" ? "Müşteriler (Ofis CRM)" : "Müşterilerim (CRM)", icon: Users },
    { to: "/admin/hatirlatmalar", label: "Hatırlatmalar", icon: Bell },
    ...(role === "admin" ? [{ to: "/admin/personel", label: "Personel & Yetki", icon: UserCheck }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-secondary/40 fixed inset-y-0">
        <Link to="/admin" className="font-display text-base tracking-wider px-6 py-6 border-b border-border">
          <span className="gradient-gold-text font-bold">SARRAF 34</span>
          <span className="text-foreground font-light ml-1.5">YAPI</span>
        </Link>
        
        <nav className="flex-1 py-6 space-y-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 font-body text-xs tracking-[0.12em] uppercase transition-colors ${
                  isActive ? "text-primary border-l-2 border-primary bg-primary/5 font-semibold" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <n.icon size={15} /> {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-border space-y-3">
          <p className="font-body text-xs text-muted-foreground truncate">{user?.email}</p>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${role === "admin" ? "bg-amber-400" : "bg-blue-400"}`} />
            <p className="font-body text-[10px] tracking-[0.2em] uppercase font-bold text-primary">
              {role === "admin" ? "Yönetici (Ofis Sahibi)" : "Gayrimenkul Danışmanı"}
            </p>
          </div>
          <Link to="/" className="flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-primary">
            <Globe size={13} /> Siteyi görüntüle
          </Link>
          <button
            onClick={async () => { await signOut(); navigate("/giris"); }}
            className="flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-destructive w-full text-left"
          >
            <LogOut size={13} /> Çıkış yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-w-0">
        <header className="border-b border-border px-6 py-5 flex items-center justify-between gap-4 flex-wrap bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          <h1 className="font-display text-xl text-foreground font-semibold">{title}</h1>
          {action}
        </header>

        {/* Mobile Horizontal Menu */}
        <div className="md:hidden flex overflow-x-auto gap-1 border-b border-border px-3 py-2 bg-secondary/30">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 font-body text-[10px] tracking-wider uppercase rounded-sm ${isActive ? "text-primary font-bold bg-primary/10" : "text-muted-foreground"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>

        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;