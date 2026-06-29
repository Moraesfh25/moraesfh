import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../hooks/useTheme";
import { 
  Sparkles, 
  Play, 
  Pause, 
  SlidersHorizontal, 
  Zap, 
  TrendingUp, 
  Activity, 
  RefreshCw,
  Clock,
  ShieldCheck,
  User,
  Heart
} from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

export function DashboardAnimatedHeader() {
  const { preferences, resolvedTheme } = useTheme();
  const [greeting, setGreeting] = useState("Olá");
  const [isPlaying, setIsPlaying] = useState(true);
  const [density, setDensity] = useState<"low" | "medium" | "high">("medium");
  const [selectedEffect, setSelectedEffect] = useState<"matrix" | "nodes" | "waves">("nodes");
  const [currentTime, setCurrentTime] = useState("");
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);

  // Set greeting based on current local time
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Bom dia, Investidor");
    } else if (hours >= 12 && hours < 18) {
      setGreeting("Boa tarde, Investidor");
    } else {
      setGreeting("Boa noite, Investidor");
    }

    const formatTime = () => {
      const now = new Date();
      return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    };

    setCurrentTime(formatTime());
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Set up particles and handle animation loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize particles
    const initParticles = () => {
      const count = density === "low" ? 15 : density === "medium" ? 35 : 65;
      const particles: Particle[] = [];
      const colorScheme = resolvedTheme === "dark" 
        ? ["rgba(34, 197, 94, 0.5)", "rgba(16, 185, 129, 0.4)", "rgba(59, 130, 246, 0.3)", "rgba(168, 85, 247, 0.3)"]
        : ["rgba(22, 163, 74, 0.3)", "rgba(13, 148, 136, 0.25)", "rgba(37, 99, 235, 0.2)", "rgba(147, 51, 234, 0.2)"];

      for (let i = 0; i < count; i++) {
        particles.push({
          id: i,
          x: Math.random() * (canvas.width / window.devicePixelRatio),
          y: Math.random() * (canvas.height / window.devicePixelRatio),
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          color: colorScheme[Math.floor(Math.random() * colorScheme.length)]
        });
      }
      particlesRef.current = particles;
    };

    initParticles();

    // Animation function
    const render = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Render custom animated backgrounds
      if (selectedEffect === "matrix" && isPlaying) {
        // Subtle binary matrix style rows
        ctx.font = "8px monospace";
        ctx.fillStyle = resolvedTheme === "dark" ? "rgba(34, 197, 94, 0.08)" : "rgba(22, 163, 74, 0.05)";
        for (let x = 0; x < width; x += 30) {
          for (let y = 15; y < height; y += 20) {
            if (Math.random() > 0.95) {
              const text = Math.random() > 0.5 ? "1" : "0";
              ctx.fillText(text, x, y);
            }
          }
        }
      } else if (selectedEffect === "waves" && isPlaying) {
        // Fluid sine waves representing betting feeds
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = resolvedTheme === "dark" ? "rgba(34, 197, 94, 0.12)" : "rgba(22, 163, 74, 0.08)";
        
        const time = Date.now() * 0.001;
        for (let x = 0; x < width; x += 10) {
          const y = height / 2 + Math.sin(x * 0.01 + time) * 15 + Math.cos(x * 0.02 - time) * 10;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw and animate particles
      const particles = particlesRef.current;
      particles.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (isPlaying) {
          // Move particles
          p.x += p.speedX;
          p.y += p.speedY;

          // Boundary checks
          if (p.x < 0 || p.x > width) p.speedX *= -1;
          if (p.y < 0 || p.y > height) p.speedY *= -1;
        }

        // Draw connections if selectedEffect is "nodes"
        if (selectedEffect === "nodes") {
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            const maxDist = 85;

            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * (resolvedTheme === "dark" ? 0.15 : 0.12);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = resolvedTheme === "dark" 
                ? `rgba(34, 197, 94, ${alpha})` 
                : `rgba(22, 163, 74, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      });

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, density, selectedEffect, resolvedTheme]);

  // Handle manual interaction: click coordinates emit a particle
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: clickX,
      y: clickY,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
      color: resolvedTheme === "dark" ? "rgba(34, 197, 94, 0.8)" : "rgba(22, 163, 74, 0.7)"
    };

    // Keep particles length stable by shifting older ones
    if (particlesRef.current.length > 70) {
      particlesRef.current.shift();
    }
    particlesRef.current.push(newParticle);
  };

  return (
    <div 
      id="dashboard-animated-hero"
      className={`relative w-full rounded-2xl overflow-hidden border transition-all duration-300 shadow-xl ${
        resolvedTheme === "dark" 
          ? "bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-950 border-neutral-800" 
          : "bg-gradient-to-r from-white via-slate-50 to-emerald-50/20 border-slate-200"
      }`}
    >
      {/* Dynamic Interactive Canvas Background */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-crosshair block z-0"
        title="Clique para gerar ondas de energia IA!"
      />

      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-green-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 left-12 w-32 h-12 bg-green-500/10 rounded-full blur-2xl pointer-events-none z-0" />

      {/* Hero content area */}
      <div className="relative z-10 p-5 md:p-6 lg:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left column: Greetings & Core stats */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-green-500/20">
              <Sparkles className="w-3 h-3 animate-pulse" /> Motor Preditivo Ativo
            </span>
            <span className="text-neutral-300 dark:text-neutral-600 text-xs">•</span>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-mono font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" /> {currentTime}
            </span>
          </div>

          <div>
            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight font-display ${
              resolvedTheme === "dark" ? "text-white" : "text-neutral-900"
            }`}>
              {greeting}! 👋
            </h1>
            <p className={`text-xs md:text-sm mt-1.5 leading-relaxed font-medium ${
              resolvedTheme === "dark" ? "text-neutral-400" : "text-neutral-600"
            }`}>
              Seu painel inteligente da <span className="text-green-500 font-bold">BetVisionPro</span> compilou análises atualizadas das principais ligas do mundo.
            </p>
          </div>

          {/* Quick status feed */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <div className={`text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              resolvedTheme === "dark" ? "bg-neutral-950/80 border-neutral-850 text-neutral-300" : "bg-white/90 border-slate-200 text-neutral-700"
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              Sinais Seguros: <span className="font-bold text-green-500 font-mono">89.4% precisão</span>
            </div>
            
            <div className={`text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              resolvedTheme === "dark" ? "bg-neutral-950/80 border-neutral-850 text-neutral-300" : "bg-white/90 border-slate-200 text-neutral-700"
            }`}>
              <Zap className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              Over Gols: <span className="font-bold text-amber-500">Alta Probabilidade</span>
            </div>
          </div>
        </div>

        {/* Right column: Interactive configuration tools (glassmorphism dashboard controller) */}
        <div className={`w-full md:w-auto shrink-0 md:min-w-[280px] p-4 rounded-xl border backdrop-blur-xs flex flex-col gap-3.5 relative overflow-hidden ${
          resolvedTheme === "dark" 
            ? "bg-neutral-950/80 border-neutral-850/90 shadow-2xl" 
            : "bg-white/95 border-slate-200/90 shadow-lg"
        }`}>
          {/* Header of control pane */}
          <div className="flex items-center justify-between border-b border-neutral-800/20 pb-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
              resolvedTheme === "dark" ? "text-neutral-400" : "text-neutral-500"
            }`}>
              <SlidersHorizontal className="w-3.5 h-3.5 text-green-500" /> Controles de Manejo
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
          </div>

          {/* Interactive Toggle Button for Play/Pause Animation */}
          <div className="flex items-center justify-between gap-4">
            <span className={`text-xs font-medium ${resolvedTheme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
              Animação de Fundo:
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                isPlaying 
                  ? "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400" 
                  : "bg-neutral-900/40 hover:bg-neutral-900/60 border-neutral-800 text-neutral-500"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pausar
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Rodar
                </>
              )}
            </button>
          </div>

          {/* Render effects selector */}
          <div className="space-y-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              resolvedTheme === "dark" ? "text-neutral-500" : "text-neutral-400"
            }`}>
              Estilo do Algoritmo:
            </span>
            <div className="grid grid-cols-3 gap-1 bg-neutral-950/65 dark:bg-neutral-900/40 p-0.5 rounded-lg border border-neutral-850">
              {(["nodes", "waves", "matrix"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedEffect(style)}
                  className={`py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    selectedEffect === style
                      ? "bg-green-500 text-black font-extrabold shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Density selection */}
          <div className="flex items-center justify-between gap-4">
            <span className={`text-xs font-medium ${resolvedTheme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
              Densidade IA:
            </span>
            <div className="flex gap-1">
              {(["low", "medium", "high"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer border ${
                    density === d
                      ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 border-neutral-700 font-extrabold"
                      : "bg-transparent text-neutral-500 border-transparent hover:text-neutral-300"
                  }`}
                >
                  {d === "low" ? "Min" : d === "medium" ? "Med" : "Max"}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
