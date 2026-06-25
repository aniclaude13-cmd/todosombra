'use client';
import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 1400, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const steps = 50;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const modelos = useCountUp(50, 1400, active);
  const provincias = useCountUp(5, 900, active);
  const garantia = useCountUp(3, 800, active);

  return (
    <div ref={ref} className="bg-white border-y border-[#e5e1d8] py-14 px-6">
      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-4xl font-bold text-[#1a1917] tabular-nums">+{modelos}</div>
          <div className="text-sm text-[#9b9590] mt-1.5 tracking-wide">modelos en catálogo</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-[#1a1917] tabular-nums">{provincias}</div>
          <div className="text-sm text-[#9b9590] mt-1.5 tracking-wide">provincias con instalación</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-[#1a1917] tabular-nums">{garantia}</div>
          <div className="text-sm text-[#9b9590] mt-1.5 tracking-wide">años de garantía</div>
        </div>
      </div>
    </div>
  );
}
