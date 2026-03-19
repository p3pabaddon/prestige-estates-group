import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

import luxuryInterior from "@/assets/luxury-interior.jpg";
import villaPool from "@/assets/villa-pool.jpg";
import lifestyle from "@/assets/lifestyle.jpg";

const blogImages: Record<string, string> = {
  "1": luxuryInterior,
  "2": villaPool,
  "3": lifestyle,
};

const BlogDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();

  const blogId = id || "1";
  const image = blogImages[blogId] || luxuryInterior;

  const title = t(`blog.${blogId}.title`);
  const category = t(`blog.${blogId}.category`);
  const date = t(`blog.${blogId}.date`);
  const content = t(`blog.${blogId}.content`);

  return (
    <Layout>
      <section className="pt-32 pb-8">
        <div className="container-luxury max-w-4xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground font-body text-sm hover:text-primary transition-colors mb-8">
            <ArrowLeft size={16} /> {t("blogPage.back")}
          </Link>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury max-w-4xl">
          <ScrollReveal>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-3 block">{category}</span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-tight">{title}</h1>
            <p className="flex items-center gap-2 text-muted-foreground font-body text-sm mb-10">
              <Clock size={14} /> {date}
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="overflow-hidden rounded-sm aspect-[16/9] mb-12">
              <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="prose prose-lg max-w-none">
              {content.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-muted-foreground font-body leading-relaxed text-base mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="luxury-divider my-12" />
            <Link to="/blog" className="luxury-btn-outline">
              {t("blogPage.back")}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default BlogDetail;
