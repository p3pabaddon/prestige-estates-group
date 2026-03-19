import ScrollReveal from "./ScrollReveal";

interface SectionHeadingProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

const SectionHeading = ({ subtitle, title, description, align = "center" }: SectionHeadingProps) => {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-3xl mb-16 ${alignment}`}>
      <ScrollReveal>
        {subtitle && (
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">{subtitle}</p>
        )}
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-6">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground font-body text-base leading-relaxed">{description}</p>
        )}
      </ScrollReveal>
    </div>
  );
};

export default SectionHeading;
