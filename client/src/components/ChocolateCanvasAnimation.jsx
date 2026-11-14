import React, { useEffect, useRef } from 'react';

export default function ChocolateCanvasAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for interactive gravity & delicate repulsion
    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Dainty, Subtle, Micro-scale Luxury Particles
    // Reduced sizes: small faceted gold/chocolate crystals, micro star sparkles & miniature pearls
    const particles = [];
    const count = Math.min(50, Math.floor(width / 28));

    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.55 ? 'gem' : Math.random() > 0.3 ? 'star' : 'pearl';
      // Significantly reduced sizes (small, delicate, ambient)
      const baseSize = type === 'gem' 
        ? Math.random() * 3.5 + 3.0 // 3px to 6.5px (tiny luxury crystals)
        : type === 'star' 
        ? Math.random() * 3.0 + 2.0 // 2px to 5px (delicate star twinkle)
        : Math.random() * 2.5 + 1.5; // 1.5px to 4px (micro pearls)

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: baseSize,
        baseSize: baseSize,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.15, // Gentle buoyant upward float
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        type: type,
        color: Math.random() > 0.6 ? '#d4af37' : Math.random() > 0.3 ? '#a87832' : '#5c3822',
        opacity: Math.random() * 0.35 + 0.45, // Soft, non-dominant opacity
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.025 + 0.012,
      });
    }

    // Liquid silk wave phases
    let wavePhase1 = 0;
    let wavePhase2 = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Warm Linen & Cream Background Gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        80,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, '#fefbf6');
      bgGrad.addColorStop(0.5, '#f7f1e6');
      bgGrad.addColorStop(0.85, '#ede1ce');
      bgGrad.addColorStop(1, '#decbaf');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Delicate Liquid Silk Ribbon Waves
      wavePhase1 += 0.007;
      wavePhase2 += 0.005;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height * 0.74);
      for (let x = 0; x <= width; x += 30) {
        const y = height * 0.74 + Math.sin(x * 0.0025 + wavePhase1) * 35 + Math.cos(x * 0.0018 + wavePhase2) * 18;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const waveGrad1 = ctx.createLinearGradient(0, height * 0.68, width, height);
      waveGrad1.addColorStop(0, 'rgba(212, 175, 55, 0.06)');
      waveGrad1.addColorStop(0.5, 'rgba(140, 93, 25, 0.04)');
      waveGrad1.addColorStop(1, 'rgba(61, 32, 20, 0.05)');
      ctx.fillStyle = waveGrad1;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, height * 0.42);
      for (let x = 0; x <= width; x += 30) {
        const y = height * 0.42 + Math.cos(x * 0.002 - wavePhase2) * 30 + Math.sin(x * 0.0025 - wavePhase1) * 15;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const waveGrad2 = ctx.createLinearGradient(width, 0, 0, height);
      waveGrad2.addColorStop(0, 'rgba(245, 200, 90, 0.05)');
      waveGrad2.addColorStop(1, 'rgba(212, 175, 55, 0.02)');
      ctx.fillStyle = waveGrad2;
      ctx.fill();
      ctx.restore();

      // 3. Render Subtle, Dainty Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.pulse += p.pulseSpeed;

        // Interactive mouse reaction (gentle drift away)
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (1 - dist / 150) * 1.2;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Screen wrap
        if (p.y < -30) {
          p.y = height + 30;
          p.x = Math.random() * width;
        }
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;

        const currentScale = p.baseSize + Math.sin(p.pulse) * 0.8;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'gem') {
          // Delicate Miniature Faceted Gemstone
          const s = currentScale;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.85, -s * 0.3);
          ctx.lineTo(s * 0.55, s * 0.85);
          ctx.lineTo(-s * 0.55, s * 0.85);
          ctx.lineTo(-s * 0.85, -s * 0.3);
          ctx.closePath();

          const gemGrad = ctx.createLinearGradient(-s, -s, s, s);
          gemGrad.addColorStop(0, '#fef3c7');
          gemGrad.addColorStop(0.4, p.color);
          gemGrad.addColorStop(1, '#33190b');
          ctx.fillStyle = gemGrad;
          ctx.fill();

          ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
          ctx.lineWidth = 0.6;
          ctx.stroke();

        } else if (p.type === 'star') {
          // Delicate 4-Point Golden Star Sparkle
          const r = currentScale * 1.1;
          const starAlpha = Math.abs(Math.sin(p.pulse)) * 0.6 + 0.3;
          ctx.fillStyle = `rgba(212, 175, 55, ${starAlpha})`;
          ctx.beginPath();
          for (let step = 0; step < 4; step++) {
            const rot = (step * Math.PI) / 2;
            ctx.lineTo(Math.cos(rot) * r, Math.sin(rot) * r);
            ctx.lineTo(Math.cos(rot + Math.PI / 4) * (r * 0.28), Math.sin(rot + Math.PI / 4) * (r * 0.28));
          }
          ctx.closePath();
          ctx.fill();

        } else {
          // Delicate Micro Ganache Pearl
          const r = currentScale;
          const pearlGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
          pearlGrad.addColorStop(0, '#fffbeb');
          pearlGrad.addColorStop(0.4, p.color);
          pearlGrad.addColorStop(1, '#24140b');
          ctx.fillStyle = pearlGrad;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        ctx.restore();
      }

      // 4. Ultra-faint Golden Constellation Strands
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            const alpha = (1 - dist / 60) * 0.08;
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
