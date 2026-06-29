import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, Percent, TrendingUp, HelpCircle } from "lucide-react";
import { Match } from "../types";

interface BankrollManagerProps {
  userBalance: number;
  betSlip: Array<{ match: Match; selection: "home" | "draw" | "away"; odd: number }>;
  totalOdds: number;
  onApplyStake: (amount: number) => void;
  currentStake: number;
}

export type RiskProfile = "conservative" | "moderate" | "aggressive";

export const BankrollManager: React.FC<BankrollManagerProps> = ({
  userBalance,
  betSlip,
  totalOdds,
  onApplyStake,
  currentStake,
}) => {
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("moderate");
  const [showExplanation, setShowExplanation] = useState(false);

  if (betSlip.length === 0) return null;

  // Calculate average confidence of the current slip matches
  const avgConfidence = Math.round(
    betSlip.reduce((acc, curr) => acc + (curr.match.iaConfidence || 85), 0) / betSlip.length
  );

  // Get base percentages
  const getBasePercentage = (profile: RiskProfile): number => {
    switch (profile) {
      case "conservative":
        return 1.5; // 1.5% of bankroll
      case "moderate":
        return 3.5; // 3.5% of bankroll
      case "aggressive":
        return 6.0; // 6.0% of bankroll
    }
  };

  const basePercent = getBasePercentage(riskProfile);

  // Confidence Factor: (avgConfidence / 90). Normalizes around 90% confidence.
  const confidenceFactor = Math.max(0.6, Math.min(1.4, avgConfidence / 90));

  // Odds Factor: As the total odds rise, reduce the percentage to manage variance.
  const oddsFactor = Math.max(0.15, Math.min(1.0, 3.5 / Math.sqrt(totalOdds)));

  // Final computed percentage
  const suggestedPercentage = parseFloat((basePercent * confidenceFactor * oddsFactor).toFixed(2));

  // Compute suggested stake in currency
  let suggestedStake = Math.round(userBalance * (suggestedPercentage / 100));
  
  // Cap suggested stake (min R$10, max user balance)
  if (suggestedStake < 10) suggestedStake = 10;
  if (suggestedStake > userBalance) suggestedStake = Math.max(10, Math.round(userBalance));

  const isApplied = currentStake === suggestedStake;

  return (
    <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3 space-y-2.5" id="bankroll-manager-widget">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
            Gestão de Banca IA
          </span>
        </div>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-0.5"
          title="Ver Critério de Gestão"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Fórmula</span>
        </button>
      </div>

      {/* Formula Explanation Expandable */}
      {showExplanation && (
        <div className="text-[9px] text-neutral-400 bg-neutral-900/80 border border-neutral-800/50 rounded p-2 space-y-1 font-sans leading-relaxed">
          <p className="font-semibold text-neutral-300">Como é calculada a stake ideal?</p>
          <p>
            Nosso modelo utiliza uma versão adaptada do <strong className="text-green-500">Critério de Kelly</strong> para preservar sua banca:
          </p>
          <ul className="list-disc pl-3 space-y-0.5">
            <li><strong>Perfil de Risco:</strong> Define a porcentagem base (1.5% a 6%).</li>
            <li><strong>Confiança Média ({avgConfidence}%):</strong> Multiplica o valor em até +40% ou reduz em até -40%.</li>
            <li><strong>Variância de Odd (@{totalOdds}):</strong> Reduz exponencialmente o valor apostado conforme as odds sobem para proteger seu saldo de zebras.</li>
          </ul>
        </div>
      )}

      {/* Risk Profile Selection Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-neutral-900/60 p-0.5 rounded-md border border-neutral-800/40">
        {(["conservative", "moderate", "aggressive"] as RiskProfile[]).map((p) => {
          let label = "Moderado";
          let activeStyle = "bg-green-500 text-black font-bold";
          if (p === "conservative") {
            label = "Conservador";
            activeStyle = "bg-green-600 text-white font-bold";
          } else if (p === "aggressive") {
            label = "Agressivo";
            activeStyle = "bg-red-500 text-white font-bold";
          }

          const isSelected = riskProfile === p;

          return (
            <button
              key={p}
              onClick={() => setRiskProfile(p)}
              className={`text-[9px] py-1 rounded transition-all uppercase tracking-wider font-mono ${
                isSelected ? activeStyle : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Live calculation dashboard grid */}
      <div className="grid grid-cols-2 gap-2 bg-neutral-900/20 p-2 rounded border border-neutral-850">
        <div className="space-y-0.5">
          <span className="text-[9px] text-neutral-500 block">Confiança Média IA</span>
          <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> {avgConfidence}%
          </span>
        </div>
        <div className="space-y-0.5 text-right">
          <span className="text-[9px] text-neutral-500 block">Porcentagem Sugerida</span>
          <span className="text-xs font-mono font-bold text-green-400">
            {suggestedPercentage}%
          </span>
        </div>
      </div>

      {/* Apply suggestion trigger footer */}
      <div className="flex items-center justify-between gap-2 border-t border-neutral-850 pt-2.5">
        <div className="min-w-0">
          <span className="text-[9px] text-neutral-500 block">Aposta Sugerida:</span>
          <span className="text-xs font-mono font-bold text-white truncate">
            R$ {suggestedStake.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={() => onApplyStake(suggestedStake)}
          disabled={isApplied || userBalance < suggestedStake}
          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
            isApplied
              ? "bg-neutral-900 border-neutral-800 text-neutral-400 cursor-default"
              : userBalance < suggestedStake
              ? "bg-neutral-950 border-red-500/20 text-neutral-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-400 border-transparent text-black active:scale-95 cursor-pointer shadow-md"
          }`}
        >
          {isApplied ? "✓ Aplicada" : "Aplicar Stake"}
        </button>
      </div>
    </div>
  );
};
