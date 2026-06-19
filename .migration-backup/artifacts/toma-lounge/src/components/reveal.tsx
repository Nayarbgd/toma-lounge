import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export type RevealVariant = "fadeUp" | "fadeLeft" | "fadeRight" | "zoomIn";

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mobile;
}

const BASE: Record<RevealVariant, { initial: object; animate: object }> = {
  fadeUp:    { initial: { opacity: 0, y: 30 },       animate: { opacity: 1, y: 0 } },
  fadeLeft:  { initial: { opacity: 0, x: -30 },      animate: { opacity: 1, x: 0 } },
  fadeRight: { initial: { opacity: 0, x: 30 },       animate: { opacity: 1, x: 0 } },
  zoomIn:    { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
};

const MOBILE_OVERRIDE: Record<RevealVariant, { initial: object; animate: object }> = {
  fadeUp:    { initial: { opacity: 0, y: 15 },       animate: { opacity: 1, y: 0 } },
  fadeLeft:  { initial: { opacity: 0, x: -15 },      animate: { opacity: 1, x: 0 } },
  fadeRight: { initial: { opacity: 0, x: 15 },       animate: { opacity: 1, x: 0 } },
  zoomIn:    { initial: { opacity: 0, scale: 0.99 }, animate: { opacity: 1, scale: 1 } },
};

export function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration,
  className,
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();

  const set = isMobile ? MOBILE_OVERRIDE[variant] : BASE[variant];

  const initial = prefersReduced ? { opacity: 0 } : set.initial;
  const whileInView = prefersReduced ? { opacity: 1 } : set.animate;

  const defaultDuration =
    variant === "zoomIn" ? (isMobile ? 0.4 : 0.55) : isMobile ? 0.45 : 0.65;

  const finalDuration = duration ?? defaultDuration;
  const finalDelay = isMobile ? Math.min(delay, 0.1) : delay;

  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: finalDuration, delay: finalDelay, ease: "easeOut" }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
