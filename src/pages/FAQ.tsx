import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";

const faqs = [
  { q: "How do private viewings work?", a: "Private viewings are arranged exclusively for pre-qualified clients. Once you express interest in a property, our advisors coordinate a discreet, personalized showing at a time that suits your schedule. Virtual tours are also available for international clients." },
  { q: "What is the process for listing my property?", a: "We begin with a confidential consultation to understand your property, objectives, and timeline. Our team then conducts a comprehensive market analysis, develops a bespoke marketing strategy including cinematic visuals and editorial content, and positions your property across our premium channels." },
  { q: "Do you handle international transactions?", a: "Absolutely. We operate across twelve global markets and have extensive experience managing cross-border transactions, including legal coordination, currency considerations, and tax advisory partnerships." },
  { q: "How do you determine property pricing?", a: "Our pricing recommendations are data-driven, combining proprietary market intelligence, comparable transaction analysis, and deep understanding of buyer psychology in the luxury segment to position your property for maximum value." },
  { q: "What makes Aurum Estates different from other agencies?", a: "We approach every property as a luxury brand launch — not a listing. Our cinematic marketing, editorial positioning, global buyer network, and white-glove service deliver results that consistently exceed market expectations." },
  { q: "Do you offer investment advisory services?", a: "Yes. Our investment consultancy team provides comprehensive guidance on portfolio strategy, market timing, yield optimization, and development opportunities across the world's most promising luxury markets." },
  { q: "How long does a typical sale take?", a: "Timelines vary based on property type, market conditions, and pricing strategy. However, our premium marketing approach and qualified buyer network typically accelerate the process significantly compared to traditional methods." },
  { q: "Is my information kept confidential?", a: "Discretion is fundamental to our service. All client information, property details, and transaction specifics are treated with the highest level of confidentiality. Many of our transactions are conducted entirely off-market." },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle="Questions"
            title="Frequently Asked"
            description="Answers to the most common questions about our services, process, and approach to luxury real estate."
          />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury max-w-3xl">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="border-b border-border">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left"
                >
                  <span className="font-display text-lg text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-primary flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${open === i ? "max-h-96 pb-6" : "max-h-0"}`}
                >
                  <p className="text-muted-foreground font-body leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
