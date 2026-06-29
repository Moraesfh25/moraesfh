import React from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Award, 
  TrendingDown, 
  Plus, 
  Check, 
  Info,
  ChevronRight,
  Flame,
  Zap,
  BookOpen
} from "lucide-react";
import { Match } from "../../types";

// 1. RISK INDICATOR
interface RiskIndicatorProps {
  level: "Baixo" | "Médio" | "Alto";
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ level }) => {
  const config = {
    Baixo: {
      color: "text-green-400 bg-green-500/10 border-green-500/20",
      icon: ShieldCheck,
      label: "Risco Baixo"
    },
    Médio: {
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      icon: Shield,
      label: "Risco Moderado"
    },
    Alto: {
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      icon: ShieldAlert,
      label: "Risco Elevado"
    }
  };

  const current = config[level] || config["Médio"];
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${current.color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </div>
  );
};

// 2. CONFIDENCE BAR
interface ConfidenceBarProps {
  percentage: number;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ percentage }) => {
  const getGradient = (pct: number) => {
    if (pct > 88) return "from-green-500 to-emerald-400";
    if (pct > 78) return "from-amber-500 to-yellow-400";
    return "from-orange-500 to-red-400";
  };

  const getTextColor = (pct: number) => {
    if (pct > 88) return "text-green-400";
    if (pct > 78) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-1 w-full">
      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-neutral-450">
        <span>Confiança da IA</span>
        <span className={`font-mono font-bold ${getTextColor(percentage)}`}>{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850 p-[1px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${getGradient(percentage)}`}
        />
      </div>
    </div>
  );
};

// 3. STATISTICS CARD
interface StatisticsCardProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  icon?: React.ReactNode;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ label, value, max = 100, unit = "%", icon }) => {
  const pct = Math.round((value / max) * 100);

  return (
    <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-850 p-3 rounded-xl flex flex-col justify-between hover:border-neutral-800 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{label}</span>
        {icon && <div className="text-neutral-500">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-xl font-mono font-bold text-white">{value}</span>
        <span className="text-xs text-neutral-500 font-semibold">{unit}</span>
      </div>
      <div className="w-full h-1 bg-neutral-950 rounded-full mt-2 overflow-hidden">
        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

// 4. SMART SUGGESTION CARD / BUTTON
interface SmartSuggestionProps {
  title: string;
  suggestion: string;
  odd: number;
  prob: number;
  onAddToSlip?: () => void;
  isSelected?: boolean;
}

export const SmartSuggestion: React.FC<SmartSuggestionProps> = ({ 
  title, 
  suggestion, 
  odd, 
  prob, 
  onAddToSlip,
  isSelected = false
}) => {
  return (
    <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 flex items-center justify-between text-xs hover:border-neutral-800 transition-all group">
      <div className="min-w-0 flex-1 pr-2">
        <div className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider mb-0.5">{title}</div>
        <div className="font-bold text-neutral-200 truncate">{suggestion}</div>
        <div className="text-[10px] text-green-400 font-medium font-mono mt-0.5">Probabilidade: {prob}%</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800 font-mono font-bold text-white group-hover:border-green-500/30 transition-colors">
          @{odd.toFixed(2)}
        </div>
        {onAddToSlip && (
          <button
            onClick={onAddToSlip}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              isSelected 
                ? "bg-green-500 text-black border border-green-400" 
                : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};

// 5. ODDS CARD
interface OddsCardProps {
  odds: { home: number; draw: number; away: number };
  onSelect: (market: "home" | "draw" | "away") => void;
  selectedMarket?: "home" | "draw" | "away" | null;
  homeTeam: string;
  awayTeam: string;
}

export const OddsCard: React.FC<OddsCardProps> = ({ 
  odds, 
  onSelect, 
  selectedMarket,
  homeTeam,
  awayTeam
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      <button
        onClick={() => onSelect("home")}
        className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
          selectedMarket === "home" 
            ? "bg-green-500/10 border-green-500 text-green-400" 
            : "bg-neutral-950/40 hover:bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-neutral-300"
        }`}
      >
        <span className="text-[9px] uppercase font-bold text-neutral-500 truncate w-full max-w-full block" title={homeTeam}>1 ({homeTeam.substring(0,3).toUpperCase()})</span>
        <span className="text-sm font-mono font-bold text-white mt-1">@{odds.home.toFixed(2)}</span>
      </button>

      <button
        onClick={() => onSelect("draw")}
        className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
          selectedMarket === "draw" 
            ? "bg-green-500/10 border-green-500 text-green-400" 
            : "bg-neutral-950/40 hover:bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-neutral-300"
        }`}
      >
        <span className="text-[9px] uppercase font-bold text-neutral-500">X (Empate)</span>
        <span className="text-sm font-mono font-bold text-white mt-1">@{odds.draw.toFixed(2)}</span>
      </button>

      <button
        onClick={() => onSelect("away")}
        className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
          selectedMarket === "away" 
            ? "bg-green-500/10 border-green-500 text-green-400" 
            : "bg-neutral-950/40 hover:bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-neutral-300"
        }`}
      >
        <span className="text-[9px] uppercase font-bold text-neutral-500 truncate w-full max-w-full block" title={awayTeam}>2 ({awayTeam.substring(0,3).toUpperCase()})</span>
        <span className="text-sm font-mono font-bold text-white mt-1">@{odds.away.toFixed(2)}</span>
      </button>
    </div>
  );
};

// 6. CORNERS CARD (For ranking view)
interface CornerCardProps {
  rank: number;
  match: Match;
  score: number;
  odd: number;
  prob: number;
}

export const CornerCard: React.FC<CornerCardProps> = ({ rank, match, score, odd, prob }) => {
  return (
    <div className="bg-neutral-900/40 backdrop-blur-sm border border-neutral-850 rounded-xl p-3.5 flex items-center justify-between hover:border-neutral-800 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-mono font-bold text-xs">
          #{rank}
        </div>
        <div>
          <div className="text-xs font-bold text-white">{match.homeTeam} vs {match.awayTeam}</div>
          <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">{match.league}</div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[9px] font-bold text-neutral-500 uppercase">Expectativa</div>
          <div className="text-xs font-bold text-green-400 font-mono">{score} pts</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold text-neutral-500 uppercase">Probabilidade</div>
          <div className="text-xs font-bold text-white font-mono">{prob}%</div>
        </div>
        <div className="bg-neutral-950 px-2.5 py-1.5 rounded border border-neutral-850 text-xs font-mono font-bold text-white">
          @{odd.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

// 7. CARDS CARD (For ranking view)
interface CardCardProps {
  rank: number;
  match: Match;
  score: number;
  odd: number;
  prob: number;
}

export const CardCard: React.FC<CardCardProps> = ({ rank, match, score, odd, prob }) => {
  return (
    <div className="bg-neutral-900/40 backdrop-blur-sm border border-neutral-850 rounded-xl p-3.5 flex items-center justify-between hover:border-neutral-800 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
          #{rank}
        </div>
        <div>
          <div className="text-xs font-bold text-white">{match.homeTeam} vs {match.awayTeam}</div>
          <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">{match.league} | Árb: {match.referee || "N/D"}</div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[9px] font-bold text-neutral-500 uppercase">Agressividade</div>
          <div className="text-xs font-bold text-amber-400 font-mono">{score} pts</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold text-neutral-500 uppercase">Probabilidade</div>
          <div className="text-xs font-bold text-white font-mono">{prob}%</div>
        </div>
        <div className="bg-neutral-950 px-2.5 py-1.5 rounded border border-neutral-850 text-xs font-mono font-bold text-white">
          @{odd.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
