import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

import luxuryInterior from "@/assets/luxury-interior.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import lifestyle from "@/assets/lifestyle.jpg";

const Blog = () => {
  const { t } = useLanguage();

  const posts = [
    { id: "1", image: luxuryInterior, title: t("blog.1.title"), category: t("blog.1.category"), date: t("blog.1.date"), excerpt: t("blog.1.excerpt") },
    { id: "2", image: villaPool, title: t("blog.2.title"), category: t("blog.2.category"), date: t("blog.2.date"), excerpt: t("blog.2.excerpt") },
    { id: "3", image: lifestyle, title: t("blog.3.title"), category: t("blog.3.category"), date: t("blog.3.date"), excerpt: t("blog.3.excerpt") },
  ];

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <SectionHeading subtitle={t("blogPage.subtitle")} title={t("blogPage.title")} description={t("blogPage.desc")} />
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury">
          {/* Featured */}
          <ScrollReveal>
            <Link to={`/blog/${posts[0].id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 group cursor-pointer">
              <div className="overflow-hidden rounded-sm aspect-[4/3]">
                <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-3">{posts[0].category}</span>
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4 group-hover:text-primary transition-colors">{posts[0].title}</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">{posts[0].excerpt}</p>
                <p className="flex items-center gap-2 text-muted-foreground font-body text-xs mb-6">
                  <Clock size={12} /> {posts[0].date}
                </p>
                <span className="luxury-btn-outline w-fit">{t("blogPage.readArticle")} <ArrowRight size={14} className="ml-2" /></span>
              </div>
            </Link>
          </ScrollReveal>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.slice(1).map((post, i) => (
              <ScrollReveal key={post.id} delay={i * 0.1}>
                <Link to={`/blog/${post.id}`} className="luxury-card group cursor-pointer block">
                  <div className="overflow-hidden aspect-[16/9]">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-primary">{post.category}</span>
                    <h3 className="font-display text-xl text-foreground mt-2 mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">{post.excerpt}</p>
                    <p className="flex items-center gap-2 text-muted-foreground font-body text-xs">
                      <Clock size={12} /> {post.date}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
