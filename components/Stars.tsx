"use client";

import { useEffect, useRef } from "react";

// The night sky behind the site: twinkling stars and the odd shooting star.
export function Stars() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    type Star = { x: number; y: number; r: number; p: number; s: number; c: string };
    let stars: Star[] = [];
    let shoot: { x: number; y: number; life: number } | null = null;
    let W = 0;
    let H = 0;
    let raf = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * ratio;
      cv.height = H * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = Array.from({ length: Math.round((W * H) / 5000) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        p: Math.random() * 6.28,
        s: Math.random() * 0.002 + 0.0006,
        c: Math.random() < 0.15 ? "#9ff0ff" : Math.random() < 0.1 ? "#ffe08a" : "#ffffff",
      }));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.8, H * 0.1, 0, W * 0.8, H * 0.1, Math.max(W, H) * 0.8);
      g.addColorStop(0, "rgba(40,80,200,.35)");
      g.addColorStop(1, "rgba(7,15,43,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      for (const s of stars) {
        ctx.globalAlpha = still ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(s.p + time * s.s));
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!still) {
        if (!shoot && Math.random() < 0.004) shoot = { x: Math.random() * W * 0.7, y: Math.random() * H * 0.4, life: 0 };
        if (shoot) {
          shoot.life += 1;
          const L = shoot.life * 9;
          const x = shoot.x + L;
          const y = shoot.y + L * 0.45;
          const grad = ctx.createLinearGradient(x, y, x - 120, y - 54);
          grad.addColorStop(0, "rgba(255,255,255,.9)");
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 120, y - 54);
          ctx.stroke();
          if (shoot.life > 60) shoot = null;
        }
        raf = requestAnimationFrame(draw);
      }
    };

    const onResize = () => {
      resize();
      if (still) draw(0);
    };
    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="stars" aria-hidden="true" />;
}
