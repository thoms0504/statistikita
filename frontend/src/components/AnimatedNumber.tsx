'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

export default function AnimatedNumber({ value, duration = 1200, className = '' }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const to = Number.isFinite(value) ? value : 0;
    const from = previous.current;
    previous.current = to;

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplay(to);
      return;
    }

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{display.toLocaleString('id-ID')}</span>;
}
