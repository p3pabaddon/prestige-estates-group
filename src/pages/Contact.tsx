import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", intent: "Buyer", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your inquiry. Our team will be in touch shortly.");
  };

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle="Get in Touch"
            title="Private Consultation"
            description="Whether you're seeking your dream residence, positioning a property for the market, or exploring investment opportunities — our advisors are ready."
          />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">I Am a</label>
                      <select
                        value={formData.intent}
                        onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                        className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors"
                      >
                        <option>Buyer</option>
                        <option>Seller</option>
                        <option>Investor</option>
                        <option>Developer</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">Message</label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-secondary border border-border px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      required
                    />
                  </div>
                  <button type="submit" className="luxury-btn-primary">
                    Send Inquiry <Send size={14} className="ml-2" />
                  </button>
                </form>
              </ScrollReveal>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.2}>
                <div className="glass-panel p-8 space-y-8">
                  <div className="flex items-start gap-4">
                    <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">Office</h4>
                      <p className="text-muted-foreground font-body text-sm">42 Prestige Boulevard<br />Monaco, MC 98000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">Phone</h4>
                      <p className="text-muted-foreground font-body text-sm">+1 (555) 900-8800</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">Email</h4>
                      <p className="text-muted-foreground font-body text-sm">concierge@aurumestates.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display text-base text-foreground mb-1">Hours</h4>
                      <p className="text-muted-foreground font-body text-sm">Mon–Fri: 9:00–19:00<br />Saturday: By appointment<br />Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
