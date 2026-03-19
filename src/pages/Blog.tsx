import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";

import lifestyle from "@/assets/lifestyle.jpg";
import luxuryInterior from "@/assets/luxury-interior.jpg";
import villaPool from "@/assets/villa-pool.jpg";

const posts = [
  { image: luxuryInterior, title: "How Presentation Elevates Property Value by Up to 30%", category: "Market Insights", date: "March 12, 2026", excerpt: "In luxury real estate, first impressions aren't just important — they're everything. Learn how strategic presentation transforms perception and accelerates premium sales." },
  { image: villaPool, title: "The Rise of Branded Residences: What Investors Need to Know", category: "Investment", date: "March 5, 2026", excerpt: "Branded residences are reshaping the luxury market. From hotel partnerships to designer collaborations, discover why this segment is outperforming traditional luxury." },
  { image: lifestyle, title: "Mediterranean Living: The World's Most Coveted Addresses", category: "Lifestyle", date: "February 28, 2026", excerpt: "From the French Riviera to the Amalfi Coast, explore the timeless allure of Mediterranean living and the properties that define coastal prestige." },
];

const Blog = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading
            subtitle="The Journal"
            title="Insights & Perspectives"
            description="Expert analysis, market intelligence, and editorial perspectives from the world of luxury real estate."
          />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury">
          {/* Featured */}
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div className="overflow-hidden rounded-sm aspect-[4/3]">
                <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-3">{posts[0].category}</span>
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">{posts[0].title}</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">{posts[0].excerpt}</p>
                <p className="flex items-center gap-2 text-muted-foreground font-body text-xs mb-6">
                  <Clock size={12} /> {posts[0].date}
                </p>
                <span className="luxury-btn-outline w-fit cursor-pointer">Read Article <ArrowRight size={14} className="ml-2" /></span>
              </div>
            </div>
          </ScrollReveal>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.slice(1).map((post, i) => (
              <ScrollReveal key={post.title} delay={i * 0.1}>
                <div className="luxury-card group cursor-pointer">
                  <div className="overflow-hidden aspect-[16/9]">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-primary">{post.category}</span>
                    <h3 className="font-display text-xl text-foreground mt-2 mb-3">{post.title}</h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">{post.excerpt}</p>
                    <p className="flex items-center gap-2 text-muted-foreground font-body text-xs">
                      <Clock size={12} /> {post.date}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
