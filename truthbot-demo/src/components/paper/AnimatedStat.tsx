'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
  duration?: number;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export function AnimatedStat({
  value,
  suffix = '',
  prefix = '',
  label,
  decimals = 0,
  duration = 1.5,
  className = '',
  valueClassName = '',
  labelClassName = '',
}: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (v) => {
    return `${prefix}${v.toFixed(decimals)}${suffix}`;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          spring.set(value);
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated, spring]);

  return (
    <div ref={ref} className={`text-center ${className}`}>
      <motion.div className={`text-4xl font-bold ${valueClassName}`}>
        {display}
      </motion.div>
      <div className={`text-sm text-gray-600 mt-1 ${labelClassName}`}>{label}</div>
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  description?: string;
  color?: 'green' | 'red' | 'blue' | 'gray';
  decimals?: number;
}

export function StatCard({
  value,
  label,
  suffix = '',
  prefix = '',
  description,
  color = 'gray',
  decimals = 0,
}: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  const valueColorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    gray: 'text-gray-800',
  };

  return (
    <div className={`border p-6 ${colorClasses[color]}`}>
      <AnimatedStat
        value={value}
        suffix={suffix}
        prefix={prefix}
        label={label}
        decimals={decimals}
        valueClassName={valueColorClasses[color]}
      />
      {description && (
        <p className="text-sm mt-3 text-center opacity-80">{description}</p>
      )}
    </div>
  );
}
