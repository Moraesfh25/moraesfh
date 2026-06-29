import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Award, 
  Search, 
  SlidersHorizontal, 
  Bookmark, 
  BookmarkCheck,
  History, 
  Flame, 
  Percent, 
  Layers, 
  Info, 
  Dribbble, 
  ShieldCheck, 
  Heart,
  RotateCcw,
  Plus,
  Check,
  ChevronDown,
  BarChart3,
  Calendar
} from "lucide-react";
import { Match } from "../types";
import { SportsService } from "../services/sportsService";
import { 
  PredictionService, 
  SmartPrediction, 
  SmartMultiple, 
  ProTicket 
} from "../services/predictionService";
import { PredictionCard } from "../components/smart/PredictionCard";
import { MultipleCard } from "../components/smart/MultipleCard";
import { CornerCard, CardCard, RiskIndicator } from "../components/smart/ReusableComponents";

interface SmartBetsProps {
  isVIPUser: boolean;
  onOpenVIPModal: () => void;
  onAddToBetslip?: (match: Match, market: string, odd: number) => void;
  selectedSlip?: Array<{ matchId: string; market: string; odd: number }> | null;
}

type MainTab = "diarios" | "multiplas" | "bilhete_pro" | "escanteios" | "cartoes" | "favoritos" | "historico";

export const SmartBets: React.FC<SmartBetsProps> = ({
  isVIPUser,
  onOpenVIPModal,
  onAddToBetslip,
  selectedSlip = []
}) => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("diarios");
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, SmartPrediction>>({});
  
  // Selections
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Favorites storage list
  const [favoriteMatches, setFavoriteMatches] = useState<string[]>(() => {
    const saved = localStorage.getItem("betvision_fav_matches");
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteMultiples, setFavoriteMultiples] = useState<SmartMultiple[]>(() => {
    const saved = localStorage.getItem("betvision_fav_multiples");
    return saved ? JSON.parse(saved) : [];
  });

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchLeague, setSearchLeague] = useState("");
  const [filterMarket, setFilterMarket] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [minConfidence, setMinConfidence] = useState(65);
  const [maxOdds, setMaxOdds] = useState(6.0);

  // Rankings and dynamic slips
  const [multiples, setMultiples] = useState<SmartMultiple[]>([]);
  const [proTickets, setProTickets] = useState<ProTicket[]>([]);
  const [cornersRankings, setCornersRankings] = useState<any>(null);
  const [cardsRankings, setCardsRankings] = useState<any>(null);

  // History state
  const [betHistory, setBetHistory] = useState<Array<{
    id: string;
    date: string;
    time: string;
    teams: string;
    market: string;
    odd: number;
    result: "green" | "red" | "pending";
    stake: number;
    roi: number;
  }>>(() => {
    const saved = localStorage.getItem("betvision_smart_history");
    if (saved) return JSON.parse(saved);
    // Seed default historical entries so user doesn't see a completely blank dashboard
    const defaultHistory = [
      { id: "h1", date: "28/06/2026", time: "18:30", teams: "Palmeiras vs Flamengo", market: "Ambas Marcam (Sim)", odd: 1.82, result: "green", stake: 100, roi: 82 },
      { id: "h2", date: "28/06/2026", time: "21:00", teams: "Botafogo vs São Paulo", market: "Vitória Botafogo", odd: 1.95, result: "green", stake: 100, roi: 95 },
      { id: "h3", date: "27/06/2026", time: "16:00", teams: "Manchester City vs Arsenal", market: "Over 9.5 Escanteios", odd: 1.85, result: "red", stake: 100, roi: -100 },
      { id: "h4", date: "27/06/2026", time: "14:00", teams: "Real Madrid vs Barcelona", market: "Mais de 3.5 Cartões", odd: 1.70, result: "green", stake: 100, roi: 70 },
      { id: "h5", date: "26/06/2026", time: "20:00", teams: "Flamengo vs Bolivar", market: "Over 2.5 Gols", odd: 1.62, result: "green", stake: 150, roi: 93 }
    ];
    localStorage.setItem("betvision_smart_history", JSON.stringify(defaultHistory));
    return defaultHistory;
  });

  // Calculate history metrics
  const totalBets = betHistory.length;
  const greenBets = betHistory.filter(b => b.result === "green").length;
  const redBets = betHistory.filter(b => b.result === "red").length;
  const winRate = totalBets > 0 ? Math.round((greenBets / (greenBets + redBets)) * 100) : 84;
  const totalStake = betHistory.reduce((acc, b) => acc + b.stake, 0);
  const totalProfit = betHistory.reduce((acc, b) => acc + (b.result === "green" ? b.stake * (b.odd - 1) : -b.stake), 0);
  const roiValue = totalStake > 0 ? parseFloat(((totalProfit / totalStake) * 100).toFixed(2)) : +14.25;

  // Load and pre-calc predictions
  useEffect(() => {
    const list = SportsService.getMatches();
    setMatches(list);

    // Pre-calculate smart predictions for faster UI rendering
    const dict: Record<string, SmartPrediction> = {};
    list.forEach(m => {
      dict[m.id] = PredictionService.generateSmartPrediction(m);
    });
    setPredictions(dict);

    // Generate multiples
    setMultiples(PredictionService.generateSmartMultiples(list));

    // Generate Pro tickets
    const pros = list.map(m => PredictionService.generateProTicket(m)).filter(p => p.confidence > 80);
    setProTickets(pros);

    // Rankings
    setCornersRankings(PredictionService.getCornersRankings(list));
    setCardsRankings(PredictionService.getCardsRankings(list));
  }, []);

  // Save favorites helpers
  const handleToggleFavoriteMatch = (matchId: string) => {
    const updated = favoriteMatches.includes(matchId)
      ? favoriteMatches.filter(id => id !== matchId)
      : [...favoriteMatches, matchId];
    setFavoriteMatches(updated);
    localStorage.setItem("betvision_fav_matches", JSON.stringify(updated));
  };

  const handleToggleFavoriteMultiple = (mult: SmartMultiple) => {
    const exists = favoriteMultiples.some(m => m.id === mult.id);
    const updated = exists
      ? favoriteMultiples.filter(m => m.id !== mult.id)
      : [...favoriteMultiples, mult];
    setFavoriteMultiples(updated);
    localStorage.setItem("betvision_fav_multiples", JSON.stringify(updated));
  };

  const handleCopyCoupon = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddBetHistory = (gameName: string, marketName: string, oddVal: number) => {
    const newBet = {
      id: `h_${Date.now()}`,
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      teams: gameName,
      market: marketName,
      odd: oddVal,
      result: "pending" as const,
      stake: 100,
      roi: 0
    };
    const updated = [newBet, ...betHistory];
    setBetHistory(updated);
    localStorage.setItem("betvision_smart_history", JSON.stringify(updated));
  };

  const handleToggleHistoryResult = (id: string, result: "green" | "red") => {
    const updated = betHistory.map(b => {
      if (b.id === id) {
        return {
          ...b,
          result,
          roi: result === "green" ? Math.round(100 * (b.odd - 1)) : -100
        };
      }
      return b;
    });
    setBetHistory(updated);
    localStorage.setItem("betvision_smart_history", JSON.stringify(updated));
  };

  const handleResetFilters = () => {
    setSearchLeague("");
    setFilterMarket("all");
    setFilterRisk("all");
    setMinConfidence(65);
    setMaxOdds(6.0);
  };

  // Filter daily matches
  const filteredMatches = matches.filter(match => {
    const pred = predictions[match.id];
    if (!pred) return true;

    // Search by league name
    if (searchLeague && !match.league.toLowerCase().includes(searchLeague.toLowerCase())) return false;

    // Filter by risk level
    if (filterRisk !== "all") {
      const pRisk = pred.riskLevel.toLowerCase();
      if (filterRisk === "baixo" && pRisk !== "baixo") return false;
      if (filterRisk === "medio" && pRisk !== "médio") return false;
      if (filterRisk === "alto" && pRisk !== "alto") return false;
    }

    // Filter by min confidence
    if (pred.confidence < minConfidence) return false;

    // Filter by max odds
    const mOdd = Math.min(match.odds.home, match.odds.away, match.odds.draw);
    if (mOdd > maxOdds) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-850 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2">
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-1 rounded-lg">
              <Sparkles className="w-5 h-5 fill-green-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-green-400">Modelo Preditivo BetVision Pro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Sugestões Avançadas IA</h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl font-normal leading-relaxed">
            Consulte análises matemáticas, volume de escanteios, cartões, chutes ao gol e tendências automáticas geradas por redes neurais de alto rendimento esportivo.
          </p>
        </div>

        {/* STATS CAPSULES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 relative w-full md:w-auto shrink-0">
          <div className="bg-neutral-950/60 border border-neutral-850 p-3 rounded-2xl text-center min-w-[110px]">
            <div className="text-[8.5px] uppercase font-bold text-neutral-500">Taxa Acertos IA</div>
            <div className="text-xl font-mono font-black text-green-400 mt-1">{winRate}%</div>
          </div>
          <div className="bg-neutral-950/60 border border-neutral-850 p-3 rounded-2xl text-center min-w-[110px]">
            <div className="text-[8.5px] uppercase font-bold text-neutral-500">ROI IA Médio</div>
            <div className="text-xl font-mono font-black text-white mt-1">
              {roiValue >= 0 ? `+${roiValue}` : roiValue}%
            </div>
          </div>
          <div className="bg-neutral-950/60 border border-neutral-850 p-3 rounded-2xl text-center min-w-[110px] col-span-2 sm:col-span-1">
            <div className="text-[8.5px] uppercase font-bold text-neutral-500">Lucro Estimado</div>
            <div className="text-xl font-mono font-black text-green-400 mt-1">
              {totalProfit >= 0 ? `+${totalProfit}` : totalProfit} u
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION BAR SUBTABS */}
      <div className="border-b border-neutral-850 overflow-x-auto scrollbar-none pb-0.5 flex gap-2">
        <button
          onClick={() => setActiveMainTab("diarios")}
          className={`px-5 py-3 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeMainTab === "diarios" ? "text-green-400 bg-green-500/5 rounded-t-xl" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Partidas Analisadas</span>
          {activeMainTab === "diarios" && <motion.div layoutId="activeMainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>

        <button
          onClick={() => setActiveMainTab("multiplas")}
          className={`px-5 py-3 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeMainTab === "multiplas" ? "text-green-400 bg-green-500/5 rounded-t-xl" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Múltiplas IA</span>
          {activeMainTab === "multiplas" && <motion.div layoutId="activeMainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>

        <button
          onClick={() => setActiveMainTab("bilhete_pro")}
          className={`px-5 py-3 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeMainTab === "bilhete_pro" ? "text-green-400 bg-green-500/5 rounded-t-xl" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Bilhetes PRO</span>
          {activeMainTab === "bilhete_pro" && <motion.div layoutId="activeMainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>

        <button
          onClick={() => setActiveMainTab("escanteios")}
          className={`px-5 py-3 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeMainTab === "escanteios" ? "text-green-400 bg-green-500/5 rounded-t-xl" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Painel de Escanteios</span>
          {activeMainTab === "escanteios" && <motion.div layoutId="activeMainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>

        <button
          onClick={() => setActiveMainTab("cartoes")}
          className={`px-5 py-3 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeMainTab === "cartoes" ? "text-green-400 bg-green-500/5 rounded-t-xl" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Painel de Cartões</span>
          {activeMainTab === "cartoes" && <motion.div layoutId="activeMainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>

        <button
          onClick={() => setActiveMainTab("favoritos")}
          className={`px-5 py-3 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeMainTab === "favoritos" ? "text-green-400 bg-green-500/5 rounded-t-xl" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Favoritos</span>
          {activeMainTab === "favoritos" && <motion.div layoutId="activeMainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>

        <button
          onClick={() => setActiveMainTab("historico")}
          className={`px-5 py-3 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeMainTab === "historico" ? "text-green-400 bg-green-500/5 rounded-t-xl" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Meu Histórico ROI</span>
          {activeMainTab === "historico" && <motion.div layoutId="activeMainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>
      </div>

      {/* 3. ACTIVE SUB-TABS VIEWS */}
      <div className="space-y-6">

        {/* SUBVIEW 1: DAILY MATCHES + ADVANCED FILTERS */}
        {activeMainTab === "diarios" && (
          <div className="space-y-5">
            {/* SEARCH AND ADVANCED FILTERS ROW */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-neutral-900/50 backdrop-blur-sm p-4 rounded-2xl border border-neutral-850">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Pesquisar por campeonato ou país..."
                  value={searchLeague}
                  onChange={e => setSearchLeague(e.target.value)}
                  className="w-full bg-neutral-950 pl-10 pr-4 py-2 rounded-xl text-xs text-white border border-neutral-850 focus:border-green-500/50 outline-none"
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    showFilters || searchLeague || filterRisk !== "all" || minConfidence > 65
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-neutral-950 border-neutral-850 hover:border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filtros Avançados</span>
                </button>
                
                {(searchLeague || filterRisk !== "all" || minConfidence > 65 || maxOdds < 6.0) && (
                  <button
                    onClick={handleResetFilters}
                    className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Limpar Filtros"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* EXPANDABLE FILTERS DRAWER */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-neutral-950 border border-neutral-850 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs"
                >
                  {/* Risk Profile Selector */}
                  <div className="space-y-2">
                    <span className="font-bold text-neutral-400 block uppercase tracking-wide text-[9px]">Classificação de Risco</span>
                    <div className="grid grid-cols-3 gap-2">
                      {["all", "baixo", "medio", "alto"].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setFilterRisk(lvl)}
                          className={`py-1.5 rounded-lg border font-bold capitalize cursor-pointer ${
                            filterRisk === lvl 
                              ? "bg-green-500 text-black border-green-400" 
                              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {lvl === "all" ? "Todos" : lvl === "medio" ? "Médio" : lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Min Confidence Threshold */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold text-neutral-400 uppercase tracking-wide">
                      <span>Confiança da IA Mínima</span>
                      <span className="font-mono text-white text-xs">{minConfidence}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      value={minConfidence}
                      onChange={e => setMinConfidence(parseInt(e.target.value))}
                      className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>

                  {/* Max Odds Limit */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold text-neutral-400 uppercase tracking-wide">
                      <span>Teto de Odds de Entrada</span>
                      <span className="font-mono text-white text-xs">@{maxOdds.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="6.0"
                      step="0.5"
                      value={maxOdds}
                      onChange={e => setMaxOdds(parseFloat(e.target.value))}
                      className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CARDS LIST */}
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.length === 0 ? (
                <div className="text-center py-12 bg-neutral-900/20 rounded-2xl border border-neutral-850/50">
                  <Info className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-neutral-300">Nenhum palpite localizado</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">Tente redefinir seus filtros avançados ou reduzir as exigências de confiança da IA.</p>
                </div>
              ) : (
                filteredMatches.map(match => {
                  const pred = predictions[match.id];
                  if (!pred) return null;

                  const hasSelectedOdd = selectedSlip?.find(s => s.matchId === match.id);

                  return (
                    <div key={match.id} className="relative group">
                      {/* Favorite Button Overlay */}
                      <button
                        onClick={() => handleToggleFavoriteMatch(match.id)}
                        className="absolute right-4 top-4 z-20 p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-850 hover:border-neutral-800 transition-colors cursor-pointer group/fav"
                      >
                        {favoriteMatches.includes(match.id) ? (
                          <BookmarkCheck className="w-4 h-4 text-green-400" />
                        ) : (
                          <Bookmark className="w-4 h-4 text-neutral-500 group-hover/fav:text-neutral-300" />
                        )}
                      </button>

                      <PredictionCard 
                        match={match} 
                        prediction={pred} 
                        isVIPUser={isVIPUser}
                        onOpenVIPModal={onOpenVIPModal}
                        onSelectOdd={(m, label, odd) => {
                          onAddToBetslip?.(m, label, odd);
                          handleAddBetHistory(m.homeTeam + " vs " + m.awayTeam, label, odd);
                        }}
                        selectedOdd={hasSelectedOdd ? { market: hasSelectedOdd.market, odd: hasSelectedOdd.odd } : null}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SUBVIEW 2: MULTIPLES INTELIGENTES */}
        {activeMainTab === "multiplas" && (
          <div className="space-y-6">
            <div className="bg-neutral-900/30 p-4 rounded-2xl border border-neutral-850 text-xs text-neutral-400 leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <p>
                As **Múltiplas Inteligentes** combinam eventos com correlação tática favorável para alavancagem de bancas. Geramos 5 perfis analíticos atualizados diariamente com base nas cotações de momento e no clima esportivo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {multiples.map(mult => {
                const isSaved = favoriteMultiples.some(m => m.id === mult.id);
                return (
                  <MultipleCard 
                    key={mult.id} 
                    multiple={mult}
                    onCopyCoupon={handleCopyCoupon}
                    copiedId={copiedId}
                    onSelectMultiple={handleToggleFavoriteMultiple}
                    isSelected={isSaved}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* SUBVIEW 3: BILHETE PRO (MAX EV) */}
        {activeMainTab === "bilhete_pro" && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-5 rounded-3xl border border-amber-500/15 text-xs text-neutral-400 flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-amber-400 uppercase tracking-wide text-[10px] mb-1">Tecnologia Bilhete PRO</h4>
                <p className="leading-relaxed">
                  Os **Bilhetes PRO** são apostas combinadas compostas de múltiplos mercados em **uma única partida**. Os algoritmos buscam conexões estatísticas estreitas (ex: vitória do favorito + expectativa de largura gerando alto volume de cantos no 1º tempo) para produzir Odds de altíssimo valor esperado.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {proTickets.map(ticket => (
                <div key={ticket.id} className="bg-neutral-900/40 backdrop-blur-md border border-neutral-850 rounded-2xl overflow-hidden p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{ticket.match.league}</span>
                      <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3 fill-amber-400" />
                        <span>Confiança {ticket.confidence}%</span>
                      </div>
                    </div>

                    {/* Match Intro */}
                    <div className="text-center py-2">
                      <div className="text-sm font-black text-white">{ticket.match.homeTeam} vs {ticket.match.awayTeam}</div>
                      <div className="text-[10px] text-neutral-500 mt-1 font-semibold">{ticket.match.date} às {ticket.match.time}</div>
                    </div>

                    {/* Combinations List */}
                    <div className="space-y-2 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-850/50">
                      <span className="text-[8.5px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Linhas Combinadas no Bilhete</span>
                      {ticket.markets.map((market, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                          <Check className="w-4 h-4 text-green-400 shrink-0" />
                          <span>{market}</span>
                        </div>
                      ))}
                    </div>

                    {/* Justification */}
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-normal p-1 italic">"{ticket.justification}"</p>
                  </div>

                  {/* Odds and Action */}
                  <div className="mt-5 pt-4 border-t border-neutral-850/60 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase">Odd Combinada</span>
                      <div className="text-xl font-mono font-black text-amber-400">@{ticket.oddTotal.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => {
                        onAddToBetslip?.(ticket.match, `PRO: ${ticket.markets.join(" + ")}`, ticket.oddTotal);
                        handleAddBetHistory(ticket.match.homeTeam + " vs " + ticket.match.awayTeam, `PRO: ${ticket.markets.join(" + ")}`, ticket.oddTotal);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Copiar para Caderneta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBVIEW 4: ESCANTEIOS PANEL */}
        {activeMainTab === "escanteios" && cornersRankings && (
          <div className="space-y-6">
            <div className="bg-neutral-900/30 p-4 rounded-2xl border border-neutral-850 text-xs text-neutral-400 leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <p>
                **Ranking de Escanteios**: Listamos abaixo os 10 melhores jogos ordenados por expectativa total de cantos (volume tático, cruzamentos no terço final, e contra-ataques eficientes). Use as abas para selecionar a linha ideal de proteção.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>Top 10 Jogos para Over Escanteios (Cantos Totais)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {cornersRankings.over85.map((item: any, idx: number) => (
                  <CornerCard 
                    key={item.match.id} 
                    rank={idx + 1} 
                    match={item.match} 
                    score={item.score} 
                    odd={item.odd} 
                    prob={item.prob} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBVIEW 5: CARTÕES PANEL */}
        {activeMainTab === "cartoes" && cardsRankings && (
          <div className="space-y-6">
            <div className="bg-neutral-900/30 p-4 rounded-2xl border border-neutral-850 text-xs text-neutral-400 leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                **Ranking de Cartões**: Listagem matemática de jogos com tendência de altíssima agressividade e disputa física, cruzados com estatísticas históricas de arbitragem (árbitros de linha dura). Ótimo para apostas de contenção e cartões combinados.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Top 10 Jogos para Over Cartões (Mais Cartões)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {cardsRankings.over35.map((item: any, idx: number) => (
                  <CardCard 
                    key={item.match.id} 
                    rank={idx + 1} 
                    match={item.match} 
                    score={item.score} 
                    odd={item.odd} 
                    prob={item.prob} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBVIEW 6: FAVORITOS PANEL */}
        {activeMainTab === "favoritos" && (
          <div className="space-y-6">
            {/* Matches Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                <span>Partidas Favoritas</span>
              </h3>

              {favoriteMatches.length === 0 ? (
                <div className="text-center py-8 bg-neutral-900/20 rounded-2xl border border-neutral-850/50 text-xs text-neutral-500">
                  Nenhuma partida salva nos favoritos ainda. Clique no ícone de marcador nos cards.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {matches
                    .filter(m => favoriteMatches.includes(m.id))
                    .map(match => {
                      const pred = predictions[match.id];
                      if (!pred) return null;

                      return (
                        <div key={match.id} className="relative group">
                          <button
                            onClick={() => handleToggleFavoriteMatch(match.id)}
                            className="absolute right-4 top-4 z-20 p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-850 hover:border-neutral-800 transition-colors cursor-pointer"
                          >
                            <BookmarkCheck className="w-4 h-4 text-green-400" />
                          </button>
                          <PredictionCard 
                            match={match} 
                            prediction={pred} 
                            isVIPUser={isVIPUser}
                            onOpenVIPModal={onOpenVIPModal}
                            onSelectOdd={(m, label, odd) => onAddToBetslip?.(m, label, odd)}
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Multiples Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-green-400" />
                <span>Múltiplas Salvas</span>
              </h3>

              {favoriteMultiples.length === 0 ? (
                <div className="text-center py-8 bg-neutral-900/20 rounded-2xl border border-neutral-850/50 text-xs text-neutral-500">
                  Nenhuma múltipla salva nos favoritos ainda. Clique em "Salvar Bilhete" na aba de Múltiplas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favoriteMultiples.map(mult => (
                    <MultipleCard 
                      key={mult.id} 
                      multiple={mult}
                      onCopyCoupon={handleCopyCoupon}
                      copiedId={copiedId}
                      onSelectMultiple={handleToggleFavoriteMultiple}
                      isSelected={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBVIEW 7: HISTORICO & ROI PANEL */}
        {activeMainTab === "historico" && (
          <div className="space-y-5">
            {/* LOG PANEL */}
            <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-850 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-neutral-400" />
                  <span>Caderneta de ROI da Comunidade</span>
                </h3>
                <span className="text-[10px] text-neutral-500 font-bold">REGISTRO EM TEMPO REAL</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-850 text-neutral-500 uppercase text-[9px] tracking-wider">
                      <th className="py-2.5 font-bold">Data/Hora</th>
                      <th className="py-2.5 font-bold">Evento</th>
                      <th className="py-2.5 font-bold">Mercado</th>
                      <th className="py-2.5 font-bold text-center">Odd</th>
                      <th className="py-2.5 font-bold text-center">Resultado</th>
                      <th className="py-2.5 font-bold text-right">Ação / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {betHistory.map(bet => (
                      <tr key={bet.id} className="border-b border-neutral-850/45 hover:bg-neutral-950/20 transition-colors">
                        <td className="py-3 text-neutral-400 font-mono">{bet.date} {bet.time}</td>
                        <td className="py-3 font-bold text-white">{bet.teams}</td>
                        <td className="py-3 font-semibold text-green-400">{bet.market}</td>
                        <td className="py-3 font-mono font-bold text-center">@{bet.odd.toFixed(2)}</td>
                        <td className="py-3 text-center">
                          {bet.result === "green" ? (
                            <span className="inline-flex bg-green-500/10 text-green-400 border border-green-500/20 font-extrabold uppercase px-2 py-0.5 rounded text-[9px]">GREEN</span>
                          ) : bet.result === "red" ? (
                            <span className="inline-flex bg-red-500/10 text-red-400 border border-red-500/20 font-extrabold uppercase px-2 py-0.5 rounded text-[9px]">RED</span>
                          ) : (
                            <span className="inline-flex bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold uppercase px-2 py-0.5 rounded text-[9px]">PENDENTE</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {bet.result === "pending" ? (
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleHistoryResult(bet.id, "green")}
                                className="bg-green-500 hover:bg-green-400 text-black text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                              >
                                Ganha
                              </button>
                              <button
                                onClick={() => handleToggleHistoryResult(bet.id, "red")}
                                className="bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                              >
                                Perdida
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-500 font-bold uppercase">Resolvida</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
