'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  colorInner: string;
  colorOuter: string;
  turbulence: number;
  turbulenceSpeed: number;
  isSpark: boolean;
}

export default function FireParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse interaction for aerodynamic draft effect
    let mouseX = -1000;
    let mouseY = -1000;
    let isHovering = false;

    const updateSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for optimal performance
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const particles: Particle[] = [];
    const maxParticles = 75;

    // Hot Wheels Racing Fire Color Palettes (Core -> Outer Halo)
    const colorThemes = [
      { inner: 'rgba(255, 255, 220,', outer: 'rgba(255, 194, 0,' }, // Ultra-hot ignition white-gold
      { inner: 'rgba(255, 220, 100,', outer: 'rgba(255, 120, 0,' }, // Blazing amber flame
      { inner: 'rgba(255, 160, 40,',  outer: 'rgba(229, 25, 55,' }, // Hot Wheels racing red flame
      { inner: 'rgba(255, 240, 180,', outer: 'rgba(255, 70, 20,' }, // Nitro spark
    ];

    const createParticle = (initialScatter = false): Particle => {
      const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const isSpark = Math.random() < 0.35; // 35% are ultra-fast kinetic sparks

      return {
        x: Math.random() * width,
        y: initialScatter ? Math.random() * height : height + Math.random() * 25,
        // Sparks are tiny and razor-sharp, embers are slightly fuller
        size: isSpark ? Math.random() * 1.8 + 0.8 : Math.random() * 3.2 + 1.6,
        // High-velocity upward surge (significantly faster and dynamic)
        speedY: isSpark ? Math.random() * 4.5 + 3.8 : Math.random() * 3.0 + 1.8,
        speedX: (Math.random() - 0.5) * (isSpark ? 1.6 : 0.9),
        opacity: Math.random() * 0.6 + 0.4,
        // Crisp fade speed so particles burn out naturally as they climb
        fadeSpeed: isSpark ? Math.random() * 0.016 + 0.010 : Math.random() * 0.009 + 0.005,
        colorInner: theme.inner,
        colorOuter: theme.outer,
        turbulence: Math.random() * 0.8 + 0.3,
        turbulenceSpeed: Math.random() * 0.04 + 0.02,
        isSpark,
      };
    };

    // Initialize initial pool scattered vertically
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      // Calculate delta-time normalized to 60fps (16.67ms) to guarantee smooth, consistent speed on 60Hz/120Hz/144Hz
      const dt = Math.min((now - lastTime) / 16.67, 2.5) || 1;
      lastTime = now;

      // Fast clear
      ctx.clearRect(0, 0, width, height);

      // Hardware-accelerated additive blending (creates bright fiery glows without slow CPU shadowBlur)
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply upward velocity & turbulence
        p.y -= p.speedY * dt;
        p.x += (p.speedX + Math.sin(p.y * p.turbulenceSpeed) * p.turbulence) * dt;

        // Interactive mouse draft: particles gently sway away from the cursor
        if (isHovering) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < 18000 && distSq > 0) {
            const force = (1 - distSq / 18000) * 1.8 * dt;
            p.x += (dx > 0 ? 1 : -1) * force;
            p.y -= force * 0.8;
          }
        }

        p.opacity -= p.fadeSpeed * dt;
        p.size *= Math.pow(0.994, dt); // gentle shrinkage as it ascends

        // Respawn conditions
        if (p.opacity <= 0 || p.y < -15 || p.size <= 0.3 || p.x < -20 || p.x > width + 20) {
          particles[i] = createParticle(false);
          continue;
        }

        const alpha = Math.max(0, p.opacity);

        // Optimized 2-pass glow (zero shadowBlur overhead):
        // 1. Soft outer halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorOuter} ${alpha * 0.35})`;
        ctx.fill();

        // 2. High-intensity incandescent core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorInner} ${alpha})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
}
