"use client";

import { useEffect, useRef } from "react";

export default function WaveformBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const waves = [
        { amplitude: 30, frequency: 0.02, speed: 0.03, color: "rgba(139, 92, 246, 0.3)" },
        { amplitude: 20, frequency: 0.03, speed: 0.02, color: "rgba(59, 130, 246, 0.2)" },
        { amplitude: 15, frequency: 0.015, speed: 0.04, color: "rgba(6, 182, 212, 0.15)" },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
          const y =
            h / 2 +
            Math.sin(x * wave.frequency + time * wave.speed) *
              wave.amplitude *
              Math.sin(time * 0.01 + x * 0.001);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      time++;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
    />
  );
}
