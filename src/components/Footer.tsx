import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container-luxury section-padding">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="font-display text-2xl tracking-wider">
                <span className="gradient-gold-text font-bold">AURUM</span>
                <span className="text-foreground font-light ml-1">ESTATES</span>
              </Link>
              <p className="text-muted-foreground font-body text-sm leading-relaxed mt-6">
                Defining luxury real estate through presence, precision, and an unwavering commitment to extraordinary living.
              </p>
              <div className="luxury-divider mt-8" />
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-6">Navigate</h4>
              <div className="space-y-3">
                {[
                  { label: "Properties", path: "/properties" },
                  { label: "Projects", path: "/projects" },
                  { label: "Services", path: "/services" },
                  { label: "About Us", path: "/about" },
                  { label: "Lifestyle", path: "/lifestyle" },
                  { label: "Sold Portfolio", path: "/sold" },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-muted-foreground hover:text-primary font-body text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-6">Resources</h4>
              <div className="space-y-3">
                {[
                  { label: "Journal", path: "/blog" },
                  { label: "FAQ", path: "/faq" },
                  { label: "Contact", path: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-muted-foreground hover:text-primary font-body text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-6">Contact</h4>
              <div className="space-y-3 text-muted-foreground font-body text-sm">
                <p>+1 (555) 900-8800</p>
                <p>concierge@aurumestates.com</p>
                <p>42 Prestige Boulevard<br />Monaco, MC 98000</p>
                <p className="pt-2 text-stone">Mon–Fri: 9:00–19:00<br />Sat: By appointment</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="luxury-divider mt-16 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground font-body text-xs tracking-wider">
            © 2026 Aurum Estates. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <span key={item} className="text-muted-foreground font-body text-xs tracking-wider hover:text-primary cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
