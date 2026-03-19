import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string; // e.g. "€2.4B+", "340+", "12", "98%"
  label: string;
}

const parseValue = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
};

const formatValue = (current: number, original: string) => {
  // Reconstruct the format from the original string
  const prefix = original.match(/^[^0-9.]*/)?.[0] || "";
  const suffix = original.match(/[^0-9.]*$/)?.[0] || "";
  const hasDecimal = original.includes(".");
  
  if (hasDecimal) {
    const decimalPlaces = original.split(".")[1]?.replace(/[^0-9]/g, "").length || 1;
    return `${prefix}${current.toFixed(decimalPlaces)}${suffix}`;
  }
  return `${prefix}${Math.round(current)}${suffix}`;
};

const AnimatedCounter = ({ value, label }: AnimatedCounterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(formatValue(0, value));
  const target = parseValue(value);

  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(formatValue(current, value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, target, value]);

  return (
    <div ref={ref}>
      <p className="font-display text-2xl md:text-3xl text-primary">{display}</p>
      <p className="font-body text-xs tracking-wider uppercase text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

export default AnimatedCounter;
