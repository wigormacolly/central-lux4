'use client';
import { useEffect } from 'react';

/** Brilho cinza discreto que acompanha o cursor. */
export default function Luz() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = innerWidth * .7, ty = innerHeight * .15, x = tx, y = ty, raf = 0;
    const mv = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * .06; y += (ty - y) * .06;
      document.documentElement.style.setProperty('--lx', `${x}px`);
      document.documentElement.style.setProperty('--ly', `${y}px`);
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', mv, { passive: true }); raf = requestAnimationFrame(loop);
    return () => { removeEventListener('pointermove', mv); cancelAnimationFrame(raf); };
  }, []);
  return <div className="luz" aria-hidden="true" />;
}
