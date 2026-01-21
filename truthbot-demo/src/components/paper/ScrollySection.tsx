'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollySectionProps {
  children: ReactNode;
  onInView?: (inView: boolean) => void;
  className?: string;
  id?: string;
  threshold?: number;
}

export function ScrollySection({
  children,
  onInView,
  className = '',
  id,
  threshold = 0.3,
}: ScrollySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        onInView?.(inView);
      },
      { threshold, rootMargin: '-10% 0px -10% 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [onInView, threshold]);

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isInView ? 1 : 0.3, y: isInView ? 0 : 30 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`py-16 ${className}`}
    >
      {children}
    </motion.section>
  );
}

interface StickyChartProps {
  children: ReactNode;
  className?: string;
}

export function StickyChart({ children, className = '' }: StickyChartProps) {
  return (
    <div className={`lg:sticky lg:top-24 ${className}`}>
      {children}
    </div>
  );
}
