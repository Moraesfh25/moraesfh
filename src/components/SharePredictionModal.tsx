import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Smartphone,
  Info
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";

interface MatchType {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  isLive: boolean;
  liveMinute?: number;
  date: string;
  time: string;
  iaConfidence: number;
  iaMarketSuggestion: string;
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

interface SharePredictionModalProps {
  match: MatchType | null;
  onClose: () => void;
}

export function SharePredictionModal({ match, onClose }: SharePredictionModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [imageUrl, setImageUrl] = useState<string>("");
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!match) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create 1200x630 high resolution landscape banner for social sharing
    canvas.width = 1200;
    canvas.height = 630;

    // 1. Draw Background Gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 50,
      canvas.width / 2, canvas.height / 2, canvas.width / 1.5
    );
    gradient.addColorStop(0, "#0f172a"); // Slate 900
    gradient.addColorStop(1, "#020617"); // Slate 950
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Subtle Tech Grid Lines / Dots for aesthetic detail
    ctx.strokeStyle = "rgba(16, 185, 129, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 3. Draw Brand Glow Card Frame (Neon border)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 30, 30, canvas.width - 60, canvas.height - 60, 24);
    ctx.stroke();

    // Subtle internal neon accent line
    ctx.strokeStyle = "rgba(34, 197, 94, 0.1)";
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 20);
    ctx.stroke();

    // 4. Header: Brand and logo
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("BetVisionPro", 70, 95);

    // Dynamic Sparkle Logo Icon
    ctx.fillStyle = "#10b981"; // Emerald 500
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("✦", 45, 95);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 14px monospace";
    ctx.fillText("MOTOR PREDICTIVO IA", 240, 91);

    // League Badge (pill)
    ctx.fillStyle = "rgba(168, 85, 247, 0.15)"; // Purple tint
    ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
    ctx.lineWidth = 1.5;
    const leagueText = match.league.toUpperCase();
    ctx.font = "bold 13px sans-serif";
    const leagueTextWidth = ctx.measureText(leagueText).width;
    drawRoundedRect(ctx, canvas.width - 100 - leagueTextWidth, 68, leagueTextWidth + 30, 32, 16, true);
    ctx.stroke();

    ctx.fillStyle = "#c084fc"; // Purple 400
    ctx.fillText(leagueText, canvas.width - 85 - leagueTextWidth, 89);

    // 5. Matchup Centerpiece
    // Team Home vs Away text
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "extrabold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(match.homeTeam, canvas.width / 2 - 190, 210);
    ctx.fillText(match.awayTeam, canvas.width / 2 + 190, 210);

    ctx.fillStyle = "rgba(16, 185, 129, 0.8)"; // Green accent VS
    ctx.font = "italic bold 32px sans-serif";
    ctx.fillText("VS", canvas.width / 2, 205);

    // Match status/date
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "medium 16px sans-serif";
    const statusText = match.isLive ? `AO VIVO • ${match.liveMinute}' MIN` : `${match.date} • ${match.time}`;
    ctx.fillText(statusText, canvas.width / 2, 260);

    // Reset alignment
    ctx.textAlign = "left";
    ctx.shadowBlur = 0;

    // 6. Suggestion Card Highlight
    // Box gradient for recommendation
    const reccoX = 70;
    const reccoY = 320;
    const reccoW = 1060;
    const reccoH = 150;

    const boxGrad = ctx.createLinearGradient(reccoX, reccoY, reccoX + reccoW, reccoY);
    boxGrad.addColorStop(0, "rgba(16, 185, 129, 0.08)");
    boxGrad.addColorStop(1, "rgba(59, 130, 246, 0.04)");
    ctx.fillStyle = boxGrad;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, reccoX, reccoY, reccoW, reccoH, 18, true);
    ctx.stroke();

    // Suggestion Details
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 13px monospace";
    ctx.fillText("PALPITE RECOMENDADO DA IA", reccoX + 30, reccoY + 45);

    ctx.fillStyle = "#10b981"; // Emerald
    ctx.font = "extrabold 38px sans-serif";
    ctx.fillText(match.iaMarketSuggestion, reccoX + 30, reccoY + 105);

    // Reliability gauge / confidence pill on the right inside recco box
    const confX = reccoX + reccoW - 250;
    const confY = reccoY + 40;
    ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
    ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, confX, confY, 210, 75, 14, true);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "bold 11px monospace";
    ctx.fillText("CONFIABILIDADE IA", confX + 20, confY + 30);

    ctx.fillStyle = "#fbbf24"; // Amber 400
    ctx.font = "extrabold 28px sans-serif";
    ctx.fillText(`${match.iaConfidence}%`, confX + 20, confY + 62);

    // 7. Probabilities Strip
    const probY = 515;
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 11px monospace";
    ctx.fillText("PROBABILIDADES CALCULADAS", 70, probY);

    // Probability horizontal bar charts
    const totalWidth = 1060;
    const hWeight = match.probabilities.home;
    const dWeight = match.probabilities.draw;
    const aWeight = match.probabilities.away;
    const sum = hWeight + dWeight + aWeight;

    const barY = 530;
    const barH = 14;
    const hWidth = (hWeight / sum) * totalWidth;
    const dWidth = (dWeight / sum) * totalWidth;
    const aWidth = (aWeight / sum) * totalWidth;

    // Home bar
    ctx.fillStyle = "#3b82f6"; // Blue 500
    drawRoundedRect(ctx, 70, barY, hWidth, barH, { tl: 7, bl: 7, tr: 0, br: 0 }, true);
    // Draw bar
    ctx.fillStyle = "#64748b"; // Slate 500
    ctx.fillRect(70 + hWidth, barY, dWidth, barH);
    // Away bar
    ctx.fillStyle = "#f43f5e"; // Rose 500
    drawRoundedRect(ctx, 70 + hWidth + dWidth, barY, aWidth, barH, { tl: 0, bl: 0, tr: 7, br: 7 }, true);

    // Probability Labels
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#93c5fd"; // Home text
    ctx.fillText(`Casa: ${hWeight}%`, 70, barY + 35);

    ctx.fillStyle = "#cbd5e1"; // Draw text
    ctx.fillText(`Empate: ${dWeight}%`, 70 + hWidth + 10, barY + 35);

    ctx.fillStyle = "#fca5a5"; // Away text
    ctx.textAlign = "right";
    ctx.fillText(`Fora: ${aWeight}%`, 70 + totalWidth, barY + 35);
    ctx.textAlign = "left";

    // 8. Watermark Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.font = "bold 12px monospace";
    ctx.fillText("Gerado em betvisionpro.ai", canvas.width - 240, canvas.height - 45);

    // Store data url
    setImageUrl(canvas.toDataURL("image/png"));

  }, [match]);

  // Helper to draw rounded rectangle on Canvas
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | { tl: number; tr: number; br: number; bl: number },
    fill = false
  ) => {
    let r = { tl: 0, tr: 0, br: 0, bl: 0 };
    if (typeof radius === "number") {
      r = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      r = radius;
    }
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + width - r.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
    ctx.lineTo(x + width, y + height - r.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
    ctx.lineTo(x + r.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
  };

  const handleCopyText = async () => {
    if (!match) return;
    const text = `🔥 *BetVisionPro AI Predictor* 🔥\n\n⚽ *${match.homeTeam} vs ${match.awayTeam}*\n🏆 Liga: ${match.league}\n📈 Probabilidades: Casa ${match.probabilities.home}% | Empate ${match.probabilities.draw}% | Fora ${match.probabilities.away}%\n\n💡 *Palpite IA:* ${match.iaMarketSuggestion}\n🎯 *Confiança:* ${match.iaConfidence}%\n\n👉 Acesse betvisionpro.ai para mais análises!`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar texto", err);
    }
  };

  const handleCopyImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      // Fallback for iframe restrictions or unsupported clipboard item
      console.warn("Clipboard API failed, triggering standard copy text alert or alternative", err);
      // Trigger a raw text copy as a failover
      handleCopyText();
    }
  };

  if (!match) return null;

  return (
    <AnimatePresence>
      <div 
        id="share-prediction-modal-overlay"
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full max-w-3xl rounded-2xl overflow-hidden border transition-all ${
            isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-neutral-800 border-slate-100">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-500" />
              <h3 className="font-extrabold text-lg tracking-tight font-display">
                Compartilhar Palpite IA
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800/20 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 md:p-6 space-y-6">
            
            {/* Canvas hidden/drawn for building the dynamic snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Generated Image Preview Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-green-500 animate-pulse" /> Preview do Card de Compartilhamento
                </span>
                <span className="text-[10px] bg-green-500/10 text-green-500 dark:text-green-400 font-extrabold px-2 py-0.5 rounded-full border border-green-500/20">
                  Pronto para Redes Sociais
                </span>
              </div>
              
              <div className="relative aspect-[1200/630] w-full rounded-xl overflow-hidden border dark:border-neutral-800 border-slate-200 shadow-2xl bg-neutral-950/40">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Prediction snapshot card" 
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs font-mono">
                    Gerando snapshot em alta resolução...
                  </div>
                )}
              </div>
            </div>

            {/* Explanatory banner */}
            <div className="flex gap-2.5 p-3 rounded-lg bg-green-500/5 dark:bg-green-500/10 border border-green-500/10 text-xs text-neutral-600 dark:text-neutral-300">
              <Info className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p>
                O card de compartilhamento inclui o logotipo da <strong>BetVisionPro</strong>, os nomes das equipes, o campeonato correspondente, as probabilidades calculadas e o palpite sugerido pela IA com seu respectivo índice de confiança.
              </p>
            </div>

            {/* Share and Action Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={imageUrl}
                download={`betvision_predicao_${match.homeTeam.toLowerCase().replace(/\s+/g, '_')}.png`}
                className="flex-1 bg-green-500 hover:bg-green-600 text-neutral-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-green-500/20 text-sm"
              >
                <Download className="w-4 h-4" />
                Baixar Imagem (PNG)
              </a>

              <button
                onClick={handleCopyImage}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-700 text-sm"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-4 h-4 text-green-500 animate-bounce" />
                    Copiado para o Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Imagem
                  </>
                )}
              </button>

              <button
                onClick={handleCopyText}
                className="bg-neutral-950 dark:bg-black hover:bg-neutral-900 text-neutral-400 hover:text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-850 text-sm"
                title="Copiar texto formatado do palpite"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Texto Copiado!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Copiar Texto do Post
                  </>
                )}
              </button>
            </div>

          </div>

          <div className="p-4 bg-neutral-950/80 dark:bg-neutral-950/60 border-t dark:border-neutral-850 border-slate-100 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>Snapshot: 1200x630 PNG (16:9)</span>
            <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> Compatível com Twitter, Telegram & WhatsApp</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
