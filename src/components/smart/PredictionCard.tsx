import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  Award, 
  Zap, 
  Lock, 
  ArrowRight, 
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Percent,
  TrendingUp,
  Target,
  BarChart3,
  Dribbble,
  Sparkles
} from "lucide-react";
import { Match } from "../../types";
import { SmartPrediction, PredictionService } from "../../services/predictionService";
import { ConfidenceBar, RiskIndicator, SmartSuggestion, OddsCard } from "./ReusableComponents";
import { TeamShield } from "../TeamShield";

interface PredictionCardProps {
  match: Match;
  prediction: SmartPrediction;
  isVIPUser: boolean;
  onOpenVIPModal: () => void;
  onSelectOdd?: (match: Match, market: string, odd: number) => void;
  selectedOdd?: { market: string; odd: number } | null;
}

type MarketTab = "resultado" | "gols" | "escanteios" | "cartões" | "chutes" | "impedimentos";

export const PredictionCard: React.FC<PredictionCardProps> = ({
  match,
  prediction,
  isVIPUser,
  onOpenVIPModal,
  onSelectOdd,
  selectedOdd
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<MarketTab>("resultado");

  const showLockedContent = match.isVIP && !isVIPUser;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getTeamInitials = (name: string) => {
    if (!name) return "";
    const split = name.split(" ");
    if (split.length >= 2) return (split[0][0] + split[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSelect1X2 = (type: "home" | "draw" | "away") => {
    if (!onSelectOdd) return;
    
    let marketLabel = "";
    let oddValue = 0;

    if (type === "home") {
      marketLabel = `Vitória ${match.homeTeam}`;
      oddValue = match.odds.home;
    } else if (type === "draw") {
      marketLabel = "Empate";
      oddValue = match.odds.draw;
    } else {
      marketLabel = `Vitória ${match.awayTeam}`;
      oddValue = match.odds.away;
    }

    onSelectOdd(match, marketLabel, oddValue);
  };

  const getSelected1X2Market = () => {
    if (!selectedOdd) return null;
    if (selectedOdd.market.includes("Vitória " + match.homeTeam)) return "home";
    if (selectedOdd.market === "Empate") return "draw";
    if (selectedOdd.market.includes("Vitória " + match.awayTeam)) return "away";
    return null;
  };

  const tabs: Array<{ id: MarketTab; label: string }> = [
    { id: "resultado", label: "Result" },
    { id: "gols", label: "Gols" },
    { id: "escanteios", label: "Cantos" },
    { id: "cartões", label: "Cards" },
    { id: "chutes", label: "Chutes" },
    { id: "impedimentos", label: "Imped." },
  ];

  return (
    <motion.div 
      layout="position"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-neutral-900/40 backdrop-blur-md border border-neutral-850 rounded-2xl overflow-hidden hover:border-neutral-800 transition-all shadow-xl"
    >
      {/* HEADER: Tournament & Badges */}
      <div className="px-5 py-3.5 bg-neutral-950/40 border-b border-neutral-850/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{match.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.isLive && (
            <span className="inline-flex items-center gap-1 bg-red-500/15 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3 fill-red-400" />
              <span>Ao Vivo ({match.liveMinute || match.time})</span>
            </span>
          )}
          {match.isVIP && (
            <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 fill-amber-400" />
              <span>VIP PRO</span>
            </span>
          )}
          <span className="text-[10px] font-mono text-neutral-500 font-semibold">{match.date} • {match.time}</span>
        </div>
      </div>

      {/* CORE MATCH CONTENT */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Teams and Score */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-4">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2 text-center flex-1 min-w-0">
              <TeamShield teamName={match.homeTeam} size="md" />
              <span className="text-sm font-bold text-white truncate w-full" title={match.homeTeam}>{match.homeTeam}</span>
            </div>

            {/* Live Score or VS Badge */}
            <div className="flex flex-col items-center justify-center shrink-0 px-2">
              {match.isLive ? (
                <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 font-mono font-bold text-lg text-green-400">
                  {match.liveScore || "0 - 0"}
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center text-[10px] font-bold text-neutral-500 tracking-wider">
                  VS
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2 text-center flex-1 min-w-0">
              <TeamShield teamName={match.awayTeam} size="md" />
              <span className="text-sm font-bold text-white truncate w-full" title={match.awayTeam}>{match.awayTeam}</span>
            </div>
          </div>

          {/* AI Indicators */}
          <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3.5 w-full">
            <ConfidenceBar percentage={prediction.confidence} />
            <div className="flex items-center justify-between sm:justify-start md:justify-between w-full">
              <RiskIndicator level={prediction.riskLevel} />
              <span className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">Stake: <span className="text-white font-mono">{prediction.suggestedStake.split(" ")[0]}</span></span>
            </div>
          </div>

          {/* Core Odds (1X2) */}
          <div className="md:col-span-3 w-full">
            <OddsCard 
              odds={match.odds} 
              onSelect={handleSelect1X2} 
              selectedMarket={getSelected1X2Market()}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
            />
          </div>
        </div>

        {/* EXPAND BUTTON */}
        <div className="mt-4 pt-4 border-t border-neutral-850/60 flex justify-center">
          <button
            onClick={handleToggleExpand}
            className="flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 transition-colors cursor-pointer group"
          >
            <span>{isExpanded ? "Ocultar Análise IA" : "Ver Análise IA Completa"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* EXPANDED SECTION */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="border-t border-neutral-850 overflow-hidden"
          >
            {showLockedContent ? (
              /* LOCKED VIP SCREEN */
              <div className="p-8 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-1.5">Análise VIP Bloqueada</h4>
                <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mb-5">
                  Esta partida possui alta classificação de confiança e está restrita para assinantes do plano **BetVision Pro VIP**.
                </p>
                <button
                  onClick={onOpenVIPModal}
                  className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center gap-1.5"
                >
                  <span>Liberar Acesso VIP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* REVEALED CONTENT */
              <div className="p-5 bg-neutral-950/40 space-y-5">
                
                {/* AI Text Summary */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 flex gap-3">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Parecer do Software Architect IA</div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-normal">{prediction.analysisSummary}</p>
                  </div>
                </div>

                {/* Sub-tabs Markets Selector */}
                <div className="flex border-b border-neutral-850 overflow-x-auto scrollbar-none pb-0.5">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
                        activeTab === tab.id ? "text-green-400" : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="activePredictionTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" 
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Sub-tab content */}
                <div className="min-h-[140px]">
                  {activeTab === "resultado" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <SmartSuggestion 
                        title="Casa (1)" 
                        suggestion={prediction.suggestions.result.home.value} 
                        odd={prediction.suggestions.result.home.odd} 
                        prob={prediction.suggestions.result.home.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.result.home.value, prediction.suggestions.result.home.odd)}
                        isSelected={selectedOdd?.market === prediction.suggestions.result.home.value}
                      />
                      <SmartSuggestion 
                        title="Empate (X)" 
                        suggestion={prediction.suggestions.result.draw.value} 
                        odd={prediction.suggestions.result.draw.odd} 
                        prob={prediction.suggestions.result.draw.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.result.draw.value, prediction.suggestions.result.draw.odd)}
                        isSelected={selectedOdd?.market === prediction.suggestions.result.draw.value}
                      />
                      <SmartSuggestion 
                        title="Fora (2)" 
                        suggestion={prediction.suggestions.result.away.value} 
                        odd={prediction.suggestions.result.away.odd} 
                        prob={prediction.suggestions.result.away.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.result.away.value, prediction.suggestions.result.away.odd)}
                        isSelected={selectedOdd?.market === prediction.suggestions.result.away.value}
                      />
                    </div>
                  )}

                  {activeTab === "gols" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <SmartSuggestion 
                        title="Gols: Mais de 1.5" 
                        suggestion={prediction.suggestions.goals.over15.value} 
                        odd={prediction.suggestions.goals.over15.odd} 
                        prob={prediction.suggestions.goals.over15.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.goals.over15.value, prediction.suggestions.goals.over15.odd)}
                        isSelected={selectedOdd?.market === prediction.suggestions.goals.over15.value}
                      />
                      <SmartSuggestion 
                        title="Gols: Mais de 2.5" 
                        suggestion={prediction.suggestions.goals.over25.value} 
                        odd={prediction.suggestions.goals.over25.odd} 
                        prob={prediction.suggestions.goals.over25.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.goals.over25.value, prediction.suggestions.goals.over25.odd)}
                        isSelected={selectedOdd?.market === prediction.suggestions.goals.over25.value}
                      />
                      <SmartSuggestion 
                        title="Gols: Menos de 2.5" 
                        suggestion={prediction.suggestions.goals.under25.value} 
                        odd={prediction.suggestions.goals.under25.odd} 
                        prob={prediction.suggestions.goals.under25.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.goals.under25.value, prediction.suggestions.goals.under25.odd)}
                        isSelected={selectedOdd?.market === prediction.suggestions.goals.under25.value}
                      />
                      <SmartSuggestion 
                        title="Ambas Marcam" 
                        suggestion={prediction.suggestions.goals.btts.value} 
                        odd={prediction.suggestions.goals.btts.odd} 
                        prob={prediction.suggestions.goals.btts.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.goals.btts.value, prediction.suggestions.goals.btts.odd)}
                        isSelected={selectedOdd?.market === prediction.suggestions.goals.btts.value}
                      />
                    </div>
                  )}

                  {activeTab === "escanteios" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <SmartSuggestion 
                          title="Linha: Mais de 7.5" 
                          suggestion={prediction.suggestions.corners.over75.value} 
                          odd={prediction.suggestions.corners.over75.odd} 
                          prob={prediction.suggestions.corners.over75.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, "Escanteios: " + prediction.suggestions.corners.over75.value, prediction.suggestions.corners.over75.odd)}
                          isSelected={selectedOdd?.market === "Escanteios: " + prediction.suggestions.corners.over75.value}
                        />
                        <SmartSuggestion 
                          title="Linha: Mais de 8.5" 
                          suggestion={prediction.suggestions.corners.over85.value} 
                          odd={prediction.suggestions.corners.over85.odd} 
                          prob={prediction.suggestions.corners.over85.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, "Escanteios: " + prediction.suggestions.corners.over85.value, prediction.suggestions.corners.over85.odd)}
                          isSelected={selectedOdd?.market === "Escanteios: " + prediction.suggestions.corners.over85.value}
                        />
                        <SmartSuggestion 
                          title="Linha: Mais de 9.5" 
                          suggestion={prediction.suggestions.corners.over95.value} 
                          odd={prediction.suggestions.corners.over95.odd} 
                          prob={prediction.suggestions.corners.over95.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, "Escanteios: " + prediction.suggestions.corners.over95.value, prediction.suggestions.corners.over95.odd)}
                          isSelected={selectedOdd?.market === "Escanteios: " + prediction.suggestions.corners.over95.value}
                        />
                        <SmartSuggestion 
                          title="Linha: Mais de 10.5" 
                          suggestion={prediction.suggestions.corners.over105.value} 
                          odd={prediction.suggestions.corners.over105.odd} 
                          prob={prediction.suggestions.corners.over105.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, "Escanteios: " + prediction.suggestions.corners.over105.value, prediction.suggestions.corners.over105.odd)}
                          isSelected={selectedOdd?.market === "Escanteios: " + prediction.suggestions.corners.over105.value}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                        <div className="text-center">
                          <div className="text-[9px] font-bold text-neutral-500 uppercase">Cantos {match.homeTeam}</div>
                          <div className="text-xs font-mono font-bold text-white mt-1">{prediction.suggestions.corners.homeCorners.value.split(": ")[1]}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] font-bold text-neutral-500 uppercase">Cantos {match.awayTeam}</div>
                          <div className="text-xs font-mono font-bold text-white mt-1">{prediction.suggestions.corners.awayCorners.value.split(": ")[1]}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] font-bold text-neutral-500 uppercase">Média 1ºT</div>
                          <div className="text-xs font-mono font-bold text-white mt-1">{prediction.suggestions.corners.firstHalf.value.split(": ")[1]}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] font-bold text-neutral-500 uppercase">Média 2ºT</div>
                          <div className="text-xs font-mono font-bold text-white mt-1">{prediction.suggestions.corners.secondHalf.value.split(": ")[1]}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "cartões" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <SmartSuggestion 
                          title="Cartões: Mais de 2.5" 
                          suggestion={prediction.suggestions.cards.over25.value} 
                          odd={prediction.suggestions.cards.over25.odd} 
                          prob={prediction.suggestions.cards.over25.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, "Cartões: " + prediction.suggestions.cards.over25.value, prediction.suggestions.cards.over25.odd)}
                          isSelected={selectedOdd?.market === "Cartões: " + prediction.suggestions.cards.over25.value}
                        />
                        <SmartSuggestion 
                          title="Cartões: Mais de 3.5" 
                          suggestion={prediction.suggestions.cards.over35.value} 
                          odd={prediction.suggestions.cards.over35.odd} 
                          prob={prediction.suggestions.cards.over35.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, "Cartões: " + prediction.suggestions.cards.over35.value, prediction.suggestions.cards.over35.odd)}
                          isSelected={selectedOdd?.market === "Cartões: " + prediction.suggestions.cards.over35.value}
                        />
                        <SmartSuggestion 
                          title="Cartões: Mais de 4.5" 
                          suggestion={prediction.suggestions.cards.over45.value} 
                          odd={prediction.suggestions.cards.over45.odd} 
                          prob={prediction.suggestions.cards.over45.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, "Cartões: " + prediction.suggestions.cards.over45.value, prediction.suggestions.cards.over45.odd)}
                          isSelected={selectedOdd?.market === "Cartões: " + prediction.suggestions.cards.over45.value}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400 font-bold">1º Cartão do Jogo:</span>
                          <span className="font-semibold text-white">{prediction.suggestions.cards.firstCard.team}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400 font-bold">Equipe Mais Punida:</span>
                          <span className="font-semibold text-amber-400">{prediction.suggestions.cards.mostBooked.team}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400 font-bold">Média Cartões {match.homeTeam}:</span>
                          <span className="font-semibold text-white font-mono">{prediction.suggestions.cards.homeCards.valueNum}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400 font-bold">Média Cartões {match.awayTeam}:</span>
                          <span className="font-semibold text-white font-mono">{prediction.suggestions.cards.awayCards.valueNum}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "chutes" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <SmartSuggestion 
                          title="Total Chutes ao Alvo > 6.5" 
                          suggestion={prediction.suggestions.shots.over65.value} 
                          odd={prediction.suggestions.shots.over65.odd} 
                          prob={prediction.suggestions.shots.over65.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.shots.over65.value, prediction.suggestions.shots.over65.odd)}
                          isSelected={selectedOdd?.market === prediction.suggestions.shots.over65.value}
                        />
                        <SmartSuggestion 
                          title="Total Chutes ao Alvo > 8.5" 
                          suggestion={prediction.suggestions.shots.over85.value} 
                          odd={prediction.suggestions.shots.over85.odd} 
                          prob={prediction.suggestions.shots.over85.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.shots.over85.value, prediction.suggestions.shots.over85.odd)}
                          isSelected={selectedOdd?.market === prediction.suggestions.shots.over85.value}
                        />
                        <SmartSuggestion 
                          title="Total Chutes ao Alvo > 10.5" 
                          suggestion={prediction.suggestions.shots.over105.value} 
                          odd={prediction.suggestions.shots.over105.odd} 
                          prob={prediction.suggestions.shots.over105.prob} 
                          onAddToSlip={() => onSelectOdd?.(match, prediction.suggestions.shots.over105.value, prediction.suggestions.shots.over105.odd)}
                          isSelected={selectedOdd?.market === prediction.suggestions.shots.over105.value}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400 font-bold">Mais finalizações (Equipe):</span>
                          <span className="font-semibold text-white">{prediction.suggestions.shots.topTeam.team}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400 font-bold">Jogador com mais finalizações:</span>
                          <span className="font-semibold text-green-400">{prediction.suggestions.shots.topShooter.player}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "impedimentos" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <SmartSuggestion 
                        title="Impedimentos: Mais de 1.5" 
                        suggestion={prediction.suggestions.offsides.over15.value} 
                        odd={prediction.suggestions.offsides.over15.odd} 
                        prob={prediction.suggestions.offsides.over15.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, "Impedimentos: " + prediction.suggestions.offsides.over15.value, prediction.suggestions.offsides.over15.odd)}
                        isSelected={selectedOdd?.market === "Impedimentos: " + prediction.suggestions.offsides.over15.value}
                      />
                      <SmartSuggestion 
                        title="Impedimentos: Mais de 2.5" 
                        suggestion={prediction.suggestions.offsides.over25.value} 
                        odd={prediction.suggestions.offsides.over25.odd} 
                        prob={prediction.suggestions.offsides.over25.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, "Impedimentos: " + prediction.suggestions.offsides.over25.value, prediction.suggestions.offsides.over25.odd)}
                        isSelected={selectedOdd?.market === "Impedimentos: " + prediction.suggestions.offsides.over25.value}
                      />
                      <SmartSuggestion 
                        title="Impedimentos: Mais de 3.5" 
                        suggestion={prediction.suggestions.offsides.over35.value} 
                        odd={prediction.suggestions.offsides.over35.odd} 
                        prob={prediction.suggestions.offsides.over35.prob} 
                        onAddToSlip={() => onSelectOdd?.(match, "Impedimentos: " + prediction.suggestions.offsides.over35.value, prediction.suggestions.offsides.over35.odd)}
                        isSelected={selectedOdd?.market === "Impedimentos: " + prediction.suggestions.offsides.over35.value}
                      />
                    </div>
                  )}
                </div>

                {/* Recommended vs Dangerous Markets lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Recommended Markets */}
                  <div className="bg-green-500/5 rounded-xl border border-green-500/10 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-wider mb-2">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Mercados Recomendados (Valor Esperado +)</span>
                    </div>
                    <ul className="space-y-1.5">
                      {prediction.recommendedMarkets.map((market, idx) => (
                        <li key={idx} className="text-xs text-neutral-300 flex items-center gap-2 font-medium">
                          <span className="w-1 h-1 rounded-full bg-green-500" />
                          <span>{market}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dangerous Markets */}
                  <div className="bg-red-500/5 rounded-xl border border-red-500/10 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Evitar / Mercados de Alto Risco</span>
                    </div>
                    <ul className="space-y-1.5">
                      {prediction.dangerousMarkets.map((market, idx) => (
                        <li key={idx} className="text-xs text-neutral-300 flex items-center gap-2 font-medium">
                          <span className="w-1 h-1 rounded-full bg-red-400" />
                          <span>{market}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Radar-like Stats breakdown */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Métricas de Força de Combate</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850/40 text-center">
                      <div className="text-[9px] text-neutral-500 uppercase font-bold">Ataque</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">{prediction.score.attack}</div>
                    </div>
                    <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850/40 text-center">
                      <div className="text-[9px] text-neutral-500 uppercase font-bold">Defesa</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">{prediction.score.defense}</div>
                    </div>
                    <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850/40 text-center">
                      <div className="text-[9px] text-neutral-500 uppercase font-bold">Cantos</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">{prediction.score.corners}</div>
                    </div>
                    <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850/40 text-center">
                      <div className="text-[9px] text-neutral-500 uppercase font-bold">Cartões</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">{prediction.score.cards}</div>
                    </div>
                    <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850/40 text-center">
                      <div className="text-[9px] text-neutral-500 uppercase font-bold">Gols</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">{prediction.score.goals}</div>
                    </div>
                    <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850/40 text-center">
                      <div className="text-[9px] text-neutral-500 uppercase font-bold">Equilíbrio</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">{prediction.score.equilibrium}</div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
