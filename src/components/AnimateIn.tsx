"use client";
import React, { useEffect, useRef, useState } from "react";

type Variant = "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale-in";

const HIDDEN: Record<Variant, string> = {
  "fade-up":    "opacity-0 translate-y-7",
  "fade-in":    "opacity-0",
  "fade-left":  "opacity-0 -translate-x-7",
  "fade-right": "opacity-0 translate-x-7",
  "scale-in":   "opacity-0 scale-95",
};

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export function AnimateIn({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 550,
  className = "",
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${className} transition-all ease-out will-change-transform ${
        visible
          ? "opacity-100 translate-y-0 translate-x-0 scale-100"
          : HIDDEN[variant]
      }`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
