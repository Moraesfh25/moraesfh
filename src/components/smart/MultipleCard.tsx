import React from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  Sparkles, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Copy, 
  Check, 
  Plus, 
  ChevronRight,
  BookOpen
} from "lucide-react";
import { SmartMultiple } from "../../services/predictionService";

interface MultipleCardProps {
  multiple: SmartMultiple;
  onCopyCoupon: (id: string) => void;
  copiedId: string | null;
  onSelectMultiple?: (multiple: SmartMultiple) => void;
  isSelected?: boolean;
}

export const MultipleCard: React.FC<MultipleCardProps> = ({
  multiple,
  onCopyCoupon,
  copiedId,
  onSelectMultiple,
  isSelected = false
}) => {
  const getBadgeConfig = (type: string) => {
    switch (type) {
      case "conservadora":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          icon: ShieldCheck,
          label: "Conservadora",
          gradient: "from-emerald-500 to-green-400"
        };
      case "moderada":
        return {
          bg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
          icon: Award,
          label: "Moderada",
          gradient: "from-sky-500 to-indigo-400"
        };
      case "agressiva":
        return {
          bg: "bg-orange-500/10 border-orange-500/20 text-orange-400",
          icon: TrendingUp,
          label: "Agressiva",
          gradient: "from-orange-500 to-red-400"
        };
      case "premium":
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          icon: Sparkles,
          label: "Premium VIP",
          gradient: "from-amber-500 to-yellow-400"
        };
      default: // ao_vivo
        return {
          bg: "bg-red-500/10 border-red-500/20 text-red-400",
          icon: Zap,
          label: "Ao Vivo Live",
          gradient: "from-red-500 to-orange-400"
        };
    }
  };

  const config = getBadgeConfig(multiple.type);
  const IconComponent = config.icon;

  const getTeamInitials = (name: string) => {
    if (!name) return "";
    const split = name.split(" ");
    if (split.length >= 2) return (split[0][0] + split[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div 
      layout="position"
      className={`bg-neutral-900/40 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between h-full shadow-lg ${
        isSelected ? "border-green-500 shadow-green-500/5 ring-1 ring-green-500/30" : "border-neutral-850 hover:border-neutral-800"
      }`}
    >
      <div>
        {/* HEADER */}
        <div className="p-4 bg-neutral-950/40 border-b border-neutral-850/60 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.bg}`}>
            <IconComponent className="w-3.5 h-3.5" />
            <span>Múltipla {config.label}</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-500 font-bold">CUPOM: {multiple.id}</span>
        </div>

        {/* DETAILS GRID */}
        <div className="p-4 grid grid-cols-3 gap-3 bg-neutral-950/20 border-b border-neutral-850/30 text-center">
          <div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Odd Combinada</div>
            <div className={`text-lg font-mono font-black mt-0.5 bg-gradient-to-r bg-clip-text text-transparent ${config.gradient}`}>
              @{multiple.oddTotal.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Acerto Esperado</div>
            <div className="text-sm font-mono font-bold text-white mt-1">
              {multiple.probability}%
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Stake Sugerida</div>
            <div className="text-sm font-mono font-bold text-green-400 mt-1">
              {multiple.stake}%
            </div>
          </div>
        </div>

        {/* COMBINED SELECTIONS */}
        <div className="p-4 space-y-3">
          <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Eventos Selecionados</div>
          <div className="space-y-2.5">
            {multiple.matches.map((item, idx) => (
              <div key={idx} className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850/70 flex items-center justify-between text-xs group">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-900 border border-neutral-800 text-[8px] font-bold text-neutral-400 flex items-center justify-center shrink-0">
                      {getTeamInitials(item.match.homeTeam)}
                    </span>
                    <span className="font-bold text-white truncate max-w-[130px]">{item.match.homeTeam}</span>
                    <span className="text-neutral-500 font-semibold px-1">vs</span>
                    <span className="w-4 h-4 rounded-full bg-neutral-900 border border-neutral-800 text-[8px] font-bold text-neutral-400 flex items-center justify-center shrink-0">
                      {getTeamInitials(item.match.awayTeam)}
                    </span>
                    <span className="font-bold text-white truncate max-w-[130px]">{item.match.awayTeam}</span>
                  </div>
                  <div className="text-[9.5px] font-bold text-green-400 mt-1 uppercase tracking-wide">
                    {item.market}
                  </div>
                </div>
                <div className="shrink-0 font-mono font-black text-white bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                  @{item.odd.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JUSTIFICATION */}
        <div className="px-4 pb-4">
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-850 flex gap-2.5">
            <BookOpen className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">Justificativa da IA</span>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">{multiple.justification}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="p-4 pt-0 flex gap-2">
        <button
          onClick={() => onCopyCoupon(multiple.id)}
          className="flex-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {copiedId === multiple.id ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Cupom</span>
            </>
          )}
        </button>

        {onSelectMultiple && (
          <button
            onClick={() => onSelectMultiple(multiple)}
            className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isSelected 
                ? "bg-green-500 text-black shadow-lg shadow-green-500/10 font-black hover:bg-green-400" 
                : "bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Selecionada</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar Bilhete</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};
