"use client";

import React, { useEffect, useRef, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 4000; // Total duration in ms

    // Handle resize
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", handleResize);

    // Particle system
    const numParticles = 200;
    const particles: any[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 60 + 200}, 100%, 70%)`, // Cool blue/cyan/purple tones
      });
    }

    const render = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Clear canvas with trail effect
      ctx.fillStyle = `rgba(10, 10, 15, ${progress > 0.8 ? 0.05 : 0.2})`;
      ctx.fillRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;

      // Phase control
      const isBlackHole = progress > 0.3 && progress < 0.75;
      const isExploding = progress >= 0.75;

      particles.forEach((p, i) => {
        if (isBlackHole) {
          // Accelerate towards center
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = (0.75 - progress) * 0.1; // Pull strength
          
          p.vx += (dx / dist) * force * 10;
          p.vy += (dy / dist) * force * 10;
          
          // Friction
          p.vx *= 0.95;
          p.vy *= 0.95;
        } else if (isExploding) {
          // Explode outwards rapidly
          if (progress < 0.8) {
             const dx = p.x - centerX;
             const dy = p.y - centerY;
             const dist = Math.sqrt(dx * dx + dy * dy) || 1;
             p.vx = (dx / dist) * (Math.random() * 30 + 10);
             p.vy = (dy / dist) * (Math.random() * 30 + 10);
          }
        } else {
          // Normal wandering
          p.x += Math.sin(elapsed * 0.001 + i) * 0.5;
          p.y += Math.cos(elapsed * 0.002 + i) * 0.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, isExploding ? p.size * (1 + (progress - 0.75) * 20) : p.size, 0, Math.PI * 2);
        ctx.fillStyle = isExploding ? "#fff" : p.color;
        ctx.fill();

        // Connect nearby particles
        if (!isExploding) {
          for (let j = i + 1; j < numParticles; j += 4) { // Optmization: check fewer connections
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(100, 200, 255, ${0.2 - dist * 0.002})`;
              ctx.stroke();
            }
          }
        }
      });

      // Draw Center Core during black hole phase
      if (isBlackHole || isExploding) {
        ctx.beginPath();
        const coreSize = isExploding ? (progress - 0.75) * 4000 : Math.sin((progress - 0.3) * Math.PI) * 50;
        ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize);
        gradient.addColorStop(0, "#fff");
        gradient.addColorStop(0.2, "rgba(100, 200, 255, 0.8)");
        gradient.addColorStop(1, "rgba(10, 10, 15, 0)");
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw Text Overlay
      const textAlpha = progress < 0.2 ? progress * 5 : progress > 0.75 ? 1 - (progress - 0.75) * 4 : 1;
      ctx.globalAlpha = Math.max(0, textAlpha);
      ctx.font = `bold ${w < 600 ? '3rem' : '5rem'} "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Glitch effect on text based on phase
      const glitchOffset = isBlackHole ? (Math.random() - 0.5) * 10 * (progress - 0.3) * 3 : 0;
      
      ctx.fillStyle = "#fff";
      ctx.fillText("QuizGenius AI", centerX + glitchOffset, centerY);
      ctx.globalAlpha = 1;

      // Handle Component Unmount state
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        setShow(false);
      }

      // Handle Container Fade Out
      if (progress > 0.85 && containerRef.current) {
        const fadeProgress = (progress - 0.85) / 0.15;
        containerRef.current.style.opacity = `${1 - fadeProgress}`;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        background: "#0a0a0f", // Deep dark background
        pointerEvents: "none", // Let clicks pass through if animation is almost done
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "opacity 0.5s ease-out",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
