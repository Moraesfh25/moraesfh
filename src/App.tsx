import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  TrendingUp,
  Coins,
  Clock,
  Settings,
  User,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Flame,
  ChevronRight,
  ChevronDown,
  Copy,
  Plus,
  Trash,
  Play,
  Lock,
  Unlock,
  Info,
  X,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Percent,
  TrendingDown,
  Check,
  Send,
  Sliders,
  HelpCircle,
  Star
} from "lucide-react";

import { Match, ChatMessage, BetSlipItem, UserBet, PersonalFilter } from "./types";
import { SportsService } from "./services/sportsService";
import { AIService } from "./services/aiService";
import { MultiplesService } from "./services/multiplesService";
import DashboardIA from "./pages/DashboardIA";
import PainelAdmin from "./admin/PainelAdmin";
import { BankrollManager } from "./components/BankrollManager";
import { 
  RiskManagementPanel, 
  RiskLimits, 
  RiskLosses 
} from "./components/RiskManagementPanel";
import { 
  NotificationCenter, 
  PushNotificationToastContainer, 
  MockNotification, 
  ActiveToast 
} from "./components/NotificationCenter";

export default function App() {
  // Navigation tabs: "dashboard" | "partidas" | "simulador" | "multiplas" | "minhas_apostas"
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Notifications State
  const [notifications, setNotifications] = useState<MockNotification[]>(() => {
    try {
      const saved = localStorage.getItem("betvision_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem("betvision_notifications_muted") === "true";
    } catch {
      return false;
    }
  });
  const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([]);

  // Risk Management State
  const [riskLimits, setRiskLimits] = useState<RiskLimits>(() => {
    try {
      const saved = localStorage.getItem("betvision_risk_limits");
      return saved ? JSON.parse(saved) : {
        daily: 500,
        weekly: 2000,
        monthly: 5000,
        enabledDaily: true,
        enabledWeekly: true,
        enabledMonthly: true
      };
    } catch {
      return {
        daily: 500,
        weekly: 2000,
        monthly: 5000,
        enabledDaily: true,
        enabledWeekly: true,
        enabledMonthly: true
      };
    }
  });

  const [simulatedLosses, setSimulatedLosses] = useState<RiskLosses>(() => {
    try {
      const saved = localStorage.getItem("betvision_risk_sim_losses");
      return saved ? JSON.parse(saved) : {
        daily: 0,
        weekly: 150,
        monthly: 500
      };
    } catch {
      return {
        daily: 0,
        weekly: 150,
        monthly: 500
      };
    }
  });

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Persist notifications settings
  useEffect(() => {
    try {
      localStorage.setItem("betvision_notifications", JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem("betvision_notifications_muted", String(isMuted));
    } catch {}
  }, [isMuted]);

  useEffect(() => {
    try {
      localStorage.setItem("betvision_risk_limits", JSON.stringify(riskLimits));
    } catch {}
  }, [riskLimits]);

  useEffect(() => {
    try {
      localStorage.setItem("betvision_risk_sim_losses", JSON.stringify(simulatedLosses));
    } catch {}
  }, [simulatedLosses]);

  const handleSimulateLoss = (amount: number, period: "daily" | "weekly" | "monthly") => {
    setSimulatedLosses((prev) => ({
      ...prev,
      [period]: parseFloat((prev[period] + amount).toFixed(2))
    }));
  };

  const handleResetSimulatedLosses = () => {
    setSimulatedLosses({
      daily: 0,
      weekly: 0,
      monthly: 0
    });
  };

  const playNotificationSound = () => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn("Audio Context blocked or not supported", err);
    }
  };

  const triggerPushNotification = (
    title: string,
    message: string,
    type: "goal" | "probability" | "status" | "info"
  ) => {
    const id = "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    const timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    
    const newNotif: MockNotification = {
      id,
      title,
      message,
      type,
      timestamp,
      read: false
    };

    setNotifications((prev) => [newNotif, ...prev].slice(0, 50)); // Keep last 50
    
    const newToast: ActiveToast = {
      id,
      title,
      message,
      type,
      timestamp
    };

    setActiveToasts((prev) => [...prev, newToast]);
    playNotificationSound();

    // Auto close toast after 5 seconds
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleTestNotification = (type: "goal" | "probability" | "status" | "info") => {
    if (type === "goal") {
      triggerPushNotification(
        "⚽ GOL DO FLAMENGO!",
        "Flamengo 2 x 1 River Plate. Probabilidade de vitória do Flamengo saltou para 87%. Análise IA atualizada!",
        "goal"
      );
    } else if (type === "probability") {
      triggerPushNotification(
        "📈 OSCILAÇÃO TÁTICA IA",
        "Arsenal x Liverpool: Pressão ofensiva do Arsenal aumentou em 15%. Probabilidade de gols (Over 2.5) subiu para 89%.",
        "probability"
      );
    } else if (type === "status") {
      triggerPushNotification(
        "⏱️ PARTIDA INICIADA",
        "Real Madrid x Barcelona: O clássico começou! Acompanhe as estatísticas táticas e os palpites dinâmicos da IA.",
        "status"
      );
    } else {
      triggerPushNotification(
        "💡 OPORTUNIDADE DE VALOR",
        "Dica Pro: Man City x Chelsea aos 72'. A odd para Vitória do Man City está em 1.95, com valor esperado positivo (+12.4% EV).",
        "info"
      );
    }
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleRemoveNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // VIP Subscription state
  const [isVIPSubscriber, setIsVIPSubscriber] = useState<boolean>(false);
  const [showVIPModal, setShowVIPModal] = useState<boolean>(false);

  // Filter states
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("high_confidence");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Personal Filters State & Actions
  const [personalFilters, setPersonalFilters] = useState<PersonalFilter[]>(() => {
    try {
      const saved = localStorage.getItem("betvision_personal_filters");
      return saved ? JSON.parse(saved) : [
        { id: "default-1", name: "Premier + Alta Confiança", league: "Premier League", filter: "high_confidence" },
        { id: "default-2", name: "Brasileirão + Over Gols", league: "Brasileirão", filter: "over_gols" }
      ];
    } catch {
      return [];
    }
  });

  const [newFilterName, setNewFilterName] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("betvision_personal_filters", JSON.stringify(personalFilters));
  }, [personalFilters]);

  const handleSavePersonalFilter = () => {
    const nameToUse = newFilterName.trim();
    if (!nameToUse) return;
    
    const newFilter: PersonalFilter = {
      id: `filter-${Date.now()}`,
      name: nameToUse,
      league: selectedLeague,
      filter: activeFilter
    };
    
    setPersonalFilters((prev) => [...prev, newFilter]);
    setNewFilterName("");
  };

  const handleRemovePersonalFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPersonalFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const getFilterCombinationLabel = (f: PersonalFilter) => {
    const leagueLabel = f.league === "all" ? "Todos" : f.league;
    const filterLabelsMap: Record<string, string> = {
      high_confidence: "Alta Confiança",
      favorites: "Favoritos",
      over_gols: "Over Gols",
      btts: "Ambas Marcam",
      vip: "VIP"
    };
    const filterLabel = filterLabelsMap[f.filter] || f.filter;
    return `${leagueLabel} • ${filterLabel}`;
  };


  // Active Selected Match for deep analysis drawer
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedMatchTab, setSelectedMatchTab] = useState<"analise" | "estatisticas" | "ficha">("analise");

  // Bet Slip (Bilhete do Dia)
  const [betSlip, setBetSlip] = useState<Array<{ match: Match; selection: "home" | "draw" | "away"; odd: number }>>([
    {
      match: {
        id: "m1",
        homeTeam: "Arsenal",
        awayTeam: "Liverpool",
        league: "Premier League",
        time: "16:00",
        date: "Hoje",
        isVIP: false,
        isLive: false,
        iaConfidence: 94,
        iaStars: 5,
        odds: { home: 1.55, draw: 4.20, away: 5.10 },
        probabilities: { home: 58, draw: 24, away: 18 },
        iaMarketSuggestion: "Over 2.5 Gols",
        iaAnalysis: "Arsenal matches at the Emirates show an average of 3.1 goals this season...",
        attackingStrength: { home: 92, away: 86 },
        defendingStrength: { home: 88, away: 82 },
        recentH2H: "Arsenal 3-1 Liverpool, Liverpool 1-1 Arsenal, Arsenal 2-2 Liverpool",
        formGuide: { home: ["W", "W", "D", "W", "L"], away: ["W", "D", "W", "L", "W"] }
      },
      selection: "home",
      odd: 1.55
    }
  ]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [hasCopiedSlip, setHasCopiedSlip] = useState<boolean>(false);

  // Multi Bet Generator Form
  const [genGamesCount, setGenGamesCount] = useState<number>(4);
  const [genRiskLevel, setGenRiskLevel] = useState<"conservative" | "moderate" | "aggressive">("moderate");
  const [genMarketType, setGenMarketType] = useState<"gols" | "vencedor" | "misto">("misto");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genProgressText, setGenProgressText] = useState<string>("");
  const [generatedSlipResult, setGeneratedSlipResult] = useState<any>(null);

  // AI Chat Consultant State
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [userChatInput, setUserChatInput] = useState<string>("");
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);

  // Balance
  const [userBalance, setUserBalance] = useState<number>(2450.0);

  // Mobile UI States
  const [showMobileSlip, setShowMobileSlip] = useState<boolean>(false);

  // ROI Calculator interactive state
  const [simulatedInvestment, setSimulatedInvestment] = useState<number>(500);

  // My placed bets log
  const [myBets, setMyBets] = useState<Array<{
    id: string;
    selections: Array<{ match: string; market: string; odd: number }>;
    oddTotal: number;
    amount: number;
    potentialPayout: number;
    status: "pending" | "won" | "lost";
    date: string;
  }>>([
    {
      id: "bet_8821",
      selections: [
        { match: "Real Madrid x Barcelona", market: "Vitória Mandante", odd: 2.10 },
        { match: "Arsenal x Liverpool", market: "Over 2.5 Gols", odd: 1.72 }
      ],
      oddTotal: 3.61,
      amount: 150,
      potentialPayout: 541.5,
      status: "pending",
      date: "Hoje, 19:10"
    },
    {
      id: "bet_8819",
      selections: [
        { match: "Man City x Chelsea", market: "Vitória Mandante", odd: 1.40 }
      ],
      oddTotal: 1.40,
      amount: 500,
      potentialPayout: 700.0,
      status: "won",
      date: "Ontem"
    }
  ]);  // Initial Matches Data from SportsService

  // Calculated losses from myBets where status === "lost"
  const getActualLostAmount = (period: "daily" | "weekly" | "monthly") => {
    return myBets
      .filter((b) => b.status === "lost")
      .reduce((acc, b) => {
        if (period === "daily") {
          const isToday = b.date.includes("Hoje") || b.date.includes("Agora");
          return isToday ? acc + b.amount : acc;
        }
        return acc + b.amount;
      }, 0);
  };

  const totalDailyLoss = simulatedLosses.daily + getActualLostAmount("daily");
  const totalWeeklyLoss = simulatedLosses.weekly + getActualLostAmount("weekly");
  const totalMonthlyLoss = simulatedLosses.monthly + getActualLostAmount("monthly");

  const actualLosses: RiskLosses = {
    daily: totalDailyLoss,
    weekly: totalWeeklyLoss,
    monthly: totalMonthlyLoss
  };

  const isDailyExceeded = riskLimits.enabledDaily && totalDailyLoss >= riskLimits.daily;
  const isWeeklyExceeded = riskLimits.enabledWeekly && totalWeeklyLoss >= riskLimits.weekly;
  const isMonthlyExceeded = riskLimits.enabledMonthly && totalMonthlyLoss >= riskLimits.monthly;
  const isAnyLimitExceeded = isDailyExceeded || isWeeklyExceeded || isMonthlyExceeded;

  const isDailyNearLimit = riskLimits.enabledDaily && totalDailyLoss >= riskLimits.daily * 0.8 && totalDailyLoss < riskLimits.daily;
  const isWeeklyNearLimit = riskLimits.enabledWeekly && totalWeeklyLoss >= riskLimits.weekly * 0.8 && totalWeeklyLoss < riskLimits.weekly;
  const isMonthlyNearLimit = riskLimits.enabledMonthly && totalMonthlyLoss >= riskLimits.monthly * 0.8 && totalMonthlyLoss < riskLimits.monthly;
  const isAnyLimitNearLimit = isDailyNearLimit || isWeeklyNearLimit || isMonthlyNearLimit;

  const lastAlertsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const checkLimits = () => {
      const checks = [
        {
          key: "daily_80",
          enabled: riskLimits.enabledDaily,
          loss: totalDailyLoss,
          limit: riskLimits.daily,
          title: "⚠️ ALERTA DE GESTÃO DE RISCO",
          message: `Você atingiu R$ ${totalDailyLoss.toFixed(2)} (${Math.round((totalDailyLoss / (riskLimits.daily || 1)) * 100)}%) de perdas diárias. Limite: R$ ${riskLimits.daily}. Controle sua banca!`,
          level: 0.8
        },
        {
          key: "daily_100",
          enabled: riskLimits.enabledDaily,
          loss: totalDailyLoss,
          limit: riskLimits.daily,
          title: "🛑 BLOQUEIO DE GESTÃO DE RISCO",
          message: `Você atingiu seu limite diário de perdas de R$ ${riskLimits.daily}. Novas apostas estão bloqueadas para sua segurança.`,
          level: 1.0
        },
        {
          key: "weekly_80",
          enabled: riskLimits.enabledWeekly,
          loss: totalWeeklyLoss,
          limit: riskLimits.weekly,
          title: "⚠️ ALERTA DE GESTÃO DE RISCO",
          message: `Suas perdas semanais atingiram R$ ${totalWeeklyLoss.toFixed(2)} (${Math.round((totalWeeklyLoss / (riskLimits.weekly || 1)) * 100)}%) do limite de R$ ${riskLimits.weekly}.`,
          level: 0.8
        },
        {
          key: "weekly_100",
          enabled: riskLimits.enabledWeekly,
          loss: totalWeeklyLoss,
          limit: riskLimits.weekly,
          title: "🛑 BLOQUEIO DE GESTÃO DE RISCO",
          message: `Você atingiu seu limite semanal de perdas de R$ ${riskLimits.weekly}. Novas apostas estão bloqueadas para sua segurança.`,
          level: 1.0
        },
        {
          key: "monthly_80",
          enabled: riskLimits.enabledMonthly,
          loss: totalMonthlyLoss,
          limit: riskLimits.monthly,
          title: "⚠️ ALERTA DE GESTÃO DE RISCO",
          message: `Suas perdas mensais atingiram R$ ${totalMonthlyLoss.toFixed(2)} (${Math.round((totalMonthlyLoss / (riskLimits.monthly || 1)) * 100)}%) do limite de R$ ${riskLimits.monthly}.`,
          level: 0.8
        },
        {
          key: "monthly_100",
          enabled: riskLimits.enabledMonthly,
          loss: totalMonthlyLoss,
          limit: riskLimits.monthly,
          title: "🛑 BLOQUEIO DE GESTÃO DE RISCO",
          message: `Você atingiu seu limite mensal de perdas de R$ ${riskLimits.monthly}. Novas apostas estão bloqueadas para sua segurança.`,
          level: 1.0
        }
      ];

      checks.forEach((c) => {
        if (!c.enabled || c.limit <= 0) return;
        
        const thresholdMet = c.loss >= c.limit * c.level;
        const alreadyAlerted = lastAlertsRef.current[c.key];

        if (thresholdMet && !alreadyAlerted) {
          triggerPushNotification(c.title, c.message, c.level === 1.0 ? "status" : "probability");
          lastAlertsRef.current[c.key] = true;
        } else if (!thresholdMet && alreadyAlerted) {
          lastAlertsRef.current[c.key] = false;
        }
      });
    };

    checkLimits();
  }, [totalDailyLoss, totalWeeklyLoss, totalMonthlyLoss, riskLimits]);

  const [matches, setMatches] = useState<Match[]>(() => SportsService.getMatches());

  const prevMatchesRef = useRef<Match[]>([]);

  // Monitor favorite matches for live goals, status changes, and probability shifts
  useEffect(() => {
    if (prevMatchesRef.current.length === 0) {
      prevMatchesRef.current = matches;
      return;
    }

    matches.forEach((newMatch) => {
      const prevMatch = prevMatchesRef.current.find((m) => m.id === newMatch.id);
      if (!prevMatch) return;

      // Only alert if the match is favorited
      if (newMatch.isFavorite) {
        // 1. Goal Scored check
        if (prevMatch.liveScore && newMatch.liveScore) {
          const homeGoalScored = newMatch.liveScore[0] > prevMatch.liveScore[0];
          const awayGoalScored = newMatch.liveScore[1] > prevMatch.liveScore[1];

          if (homeGoalScored) {
            triggerPushNotification(
              `⚽ GOL! ${newMatch.homeTeam.toUpperCase()}`,
              `${newMatch.homeTeam} marcou contra o ${newMatch.awayTeam}! Placar atual: ${newMatch.liveScore[0]} - ${newMatch.liveScore[1]}. A probabilidade de vitória subiu para ${newMatch.probabilities.home}%.`,
              "goal"
            );
          } else if (awayGoalScored) {
            triggerPushNotification(
              `⚽ GOL! ${newMatch.awayTeam.toUpperCase()}`,
              `${newMatch.awayTeam} marcou contra o ${newMatch.homeTeam}! Placar atual: ${newMatch.liveScore[0]} - ${newMatch.liveScore[1]}. A probabilidade de vitória subiu para ${newMatch.probabilities.away}%.`,
              "goal"
            );
          }
        }

        // 2. Status check: Game ended
        if (prevMatch.isLive && !newMatch.isLive && newMatch.time === "Fim") {
          triggerPushNotification(
            "⏱️ FIM DE JOGO!",
            `Partida encerrada: ${newMatch.homeTeam} ${newMatch.liveScore?.[0]} x ${newMatch.liveScore?.[1]} ${newMatch.awayTeam}. Todos os mercados de apostas foram liquidados!`,
            "status"
          );
        }

        // 3. Significant live probability shift (>= 7%) without goal
        const scoreChanged = prevMatch.liveScore && newMatch.liveScore &&
          (prevMatch.liveScore[0] !== newMatch.liveScore[0] || prevMatch.liveScore[1] !== newMatch.liveScore[1]);
        
        if (!scoreChanged) {
          const homeShift = Math.abs((newMatch.probabilities?.home ?? 0) - (prevMatch.probabilities?.home ?? 0));
          const drawShift = Math.abs((newMatch.probabilities?.draw ?? 0) - (prevMatch.probabilities?.draw ?? 0));
          const awayShift = Math.abs((newMatch.probabilities?.away ?? 0) - (prevMatch.probabilities?.away ?? 0));

          if (homeShift >= 7 || drawShift >= 7 || awayShift >= 7) {
            let leadingTeam = "";
            let pVal = 0;
            if (newMatch.probabilities.home > newMatch.probabilities.away) {
              leadingTeam = newMatch.homeTeam;
              pVal = newMatch.probabilities.home;
            } else {
              leadingTeam = newMatch.awayTeam;
              pVal = newMatch.probabilities.away;
            }
            triggerPushNotification(
              "📊 RADAR IA: OSCILAÇÃO TÁTICA",
              `Oscilação de probabilidade aos ${newMatch.liveMinute}' de ${newMatch.homeTeam} x ${newMatch.awayTeam}. A IA recalculou a chance de vitória do ${leadingTeam} para ${pVal}%.`,
              "probability"
            );
          }
        }
      }
    });

    prevMatchesRef.current = matches;
  }, [matches]);

  const toggleFavorite = (matchId: string) => {
    let isFavNow = false;
    let matchName = "";
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        isFavNow = !m.isFavorite;
        matchName = `${m.homeTeam} x ${m.awayTeam}`;
        return { ...m, isFavorite: isFavNow };
      }
      return m;
    });
    setMatches(updated);
    SportsService.saveMatches(updated);

    if (isFavNow) {
      triggerPushNotification(
        "⭐ PARTIDA FAVORITADA",
        `Você começou a monitorar ${matchName}. Você receberá alertas de gols, status e variações táticas de probabilidade!`,
        "info"
      );
    }
  };

  // Real-time live match ticker simulation using SportsService
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = SportsService.tickLiveGames();
      setMatches(updated);
    }, 10000); // Ticks every 10 seconds for real feel

    return () => clearInterval(interval);
  }, []);

  // Filter Match list
  const filteredMatches = matches.filter((match) => {
    // Search Team Name
    const matchesSearch =
      match.homeTeam.toLowerCase().includes(searchQuery) ||
      match.awayTeam.toLowerCase().includes(searchQuery) ||
      match.league.toLowerCase().includes(searchQuery);

    if (!matchesSearch) return false;

    // League select
    if (selectedLeague !== "all" && match.league !== selectedLeague) return false;

    // Sidebar Filters
    if (activeFilter === "high_confidence") {
      return match.iaConfidence >= 88;
    }
    if (activeFilter === "favorites") {
      return match.isFavorite || match.odds.home < 1.60;
    }
    if (activeFilter === "over_gols") {
      return match.iaMarketSuggestion.includes("Over") || match.iaMarketSuggestion.includes("Gols");
    }
    if (activeFilter === "btts") {
      return match.iaMarketSuggestion.includes("Ambas") || match.iaMarketSuggestion.includes("BTTS");
    }
    if (activeFilter === "vip") {
      return match.isVIP;
    }

    return true;
  });

  // Handle adding bet to Slip
  const addToBetSlip = (match: Match, selection: "home" | "draw" | "away", odd: number) => {
    // Check if match already in slip
    const exists = betSlip.find((item) => item.match.id === match.id);
    if (exists) {
      // Remove or update
      setBetSlip(betSlip.map((item) => item.match.id === match.id ? { match, selection, odd } : item));
    } else {
      setBetSlip([...betSlip, { match, selection, odd }]);
    }
  };

  const removeFromSlip = (matchId: string) => {
    setBetSlip(betSlip.filter((item) => item.match.id !== matchId));
  };

  // Calculations for active slip
  const totalOdds = betSlip.length === 0 ? 0 : parseFloat(betSlip.reduce((acc, curr) => acc * curr.odd, 1).toFixed(2));
  const potentialProfit = parseFloat((betAmount * totalOdds).toFixed(2));

  // Handle Bet placement
  const handlePlaceBet = () => {
    if (betSlip.length === 0) return;
    
    // Check risk limits
    if (riskLimits.enabledDaily && totalDailyLoss >= riskLimits.daily) {
      alert(`🛑 Aposta Bloqueada: Limite Diário de Perdas Excedido (R$ ${riskLimits.daily.toFixed(2)}). Visite o painel de Gestão de Risco para redefinir.`);
      return;
    }
    if (riskLimits.enabledWeekly && totalWeeklyLoss >= riskLimits.weekly) {
      alert(`🛑 Aposta Bloqueada: Limite Semanal de Perdas Excedido (R$ ${riskLimits.weekly.toFixed(2)}). Visite o painel de Gestão de Risco para redefinir.`);
      return;
    }
    if (riskLimits.enabledMonthly && totalMonthlyLoss >= riskLimits.monthly) {
      alert(`🛑 Aposta Bloqueada: Limite Mensal de Perdas Excedido (R$ ${riskLimits.monthly.toFixed(2)}). Visite o painel de Gestão de Risco para redefinir.`);
      return;
    }

    if (userBalance < betAmount) {
      alert("Saldo insuficiente para realizar esta aposta.");
      return;
    }

    // Subtract balance
    setUserBalance((prev) => parseFloat((prev - betAmount).toFixed(2)));

    // Create new bet entry
    const newBet = {
      id: "bet_" + Math.floor(1000 + Math.random() * 9000),
      selections: betSlip.map((item) => ({
        match: `${item.match.homeTeam} x ${item.match.awayTeam}`,
        market: item.selection === "home" ? `Vitória ${item.match.homeTeam}` : item.selection === "away" ? `Vitória ${item.match.awayTeam}` : "Empate",
        odd: item.odd
      })),
      oddTotal: totalOdds,
      amount: betAmount,
      potentialPayout: potentialProfit,
      status: "pending" as const,
      date: "Hoje, " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMyBets([newBet, ...myBets]);
    setBetSlip([]); // Clear slip
    
    // Trigger feedback notification
    alert("✓ Aposta registrada com sucesso pelo Motor de IA!");
  };

  const handleSettleBet = (betId: string, status: "won" | "lost") => {
    setMyBets((prevBets) => 
      prevBets.map((b) => {
        if (b.id === betId) {
          if (status === "won") {
            setUserBalance((prev) => parseFloat((prev + b.potentialPayout).toFixed(2)));
            triggerPushNotification(
              "🏆 BILHETE GANHO!",
              `Seu bilhete ${b.id} foi liquidado como GANHO! R$ ${b.potentialPayout.toFixed(2)} adicionados ao seu saldo.`,
              "status"
            );
          } else {
            triggerPushNotification(
              "💔 BILHETE PERDIDO",
              `Seu bilhete ${b.id} foi liquidado como PERDIDO. R$ ${b.amount.toFixed(2)} contabilizados como perda.`,
              "status"
            );
          }
          return { ...b, status };
        }
        return b;
      })
    );
  };

  // Copy Ticket Hash Code
  const copySlipToClipboard = () => {
    const codes = ["BV-8821X-PRO", "BV-9901A-MAX", "BV-2139P-VIP", "BV-3342E-SLIP"];
    const randomHash = codes[Math.floor(Math.random() * codes.length)];
    navigator.clipboard.writeText(randomHash).then(() => {
      setHasCopiedSlip(true);
      setTimeout(() => setHasCopiedSlip(false), 2000);
    });
  };

  // Multi slip generator simulation using MultiplesService
  const triggerMultiGenerator = () => {
    setIsGenerating(true);
    setGenProgressText("Consultando base de dados Futebolística...");
    
    setTimeout(() => {
      setGenProgressText("Analisando coeficientes de probabilidade H2H...");
      
      setTimeout(() => {
        setGenProgressText("Calculando índices de fadiga e desfalques...");
        
        setTimeout(() => {
          setGenProgressText("Gerando Bilhete de Alta Confiabilidade...");
          
          setTimeout(() => {
            try {
              const multiple = MultiplesService.generateMultiple({
                gamesCount: genGamesCount,
                riskLevel: genRiskLevel,
                marketType: genMarketType
              });

              const gamesFormatted = multiple.matches.map((match) => {
                let selection: "home" | "draw" | "away" = "home";
                let odd = match.odds.home;
                const mSuggestion = match.iaMarketSuggestion || "Over 1.5 Gols";

                if (genMarketType === "vencedor") {
                  selection = match.probabilities.home >= match.probabilities.away ? "home" : "away";
                  odd = selection === "home" ? match.odds.home : match.odds.away;
                } else if (genMarketType === "gols") {
                  if (mSuggestion.toLowerCase().includes("gols") || mSuggestion.toLowerCase().includes("under") || mSuggestion.toLowerCase().includes("over")) {
                    const res = MultiplesService.getMarketOddBySuggestion(match, mSuggestion);
                    selection = res.selection;
                    odd = res.odd;
                  } else {
                    selection = "draw";
                    odd = 1.85;
                  }
                } else {
                  // Misto
                  const res = MultiplesService.getMarketOddBySuggestion(match, mSuggestion);
                  selection = res.selection;
                  odd = res.odd;
                }

                return {
                  match: `${match.homeTeam} x ${match.awayTeam}`,
                  market: mSuggestion,
                  odd: odd,
                  confidence: match.iaConfidence,
                  matchRef: match,
                  selection,
                };
              });

              setGeneratedSlipResult({
                odds: multiple.oddTotal,
                risk: genRiskLevel.toUpperCase(),
                games: gamesFormatted,
                hash: multiple.id,
                explanation: multiple.explanation
              });
            } catch (err) {
              console.error("Error generating multiples", err);
            }
            setIsGenerating(false);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const addGeneratedToSlip = () => {
    if (!generatedSlipResult) return;
    
    // Clean and transfer all selected matches with their precise AI selections to the main slip
    const itemsToAdd = generatedSlipResult.games.map((g: any) => ({
      match: g.matchRef,
      selection: g.selection,
      odd: g.odd
    }));

    setBetSlip(itemsToAdd);
    setGeneratedSlipResult(null);
    alert("✓ Todos os palpites gerados pela IA integrados ao seu Bilhete Principal!");
  };

  // AI Chat Consultant triggers simulated responses using AIService
  const sendChatMessage = () => {
    if (!userChatInput.trim() || !selectedMatch) return;

    const query = userChatInput;
    const userMsgId = "msg_" + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    const matchId = selectedMatch.id;
    const currentMessages = chatMessages[matchId] || [];
    const updatedMessages = [...currentMessages, newMsg];
    
    setChatMessages({
      ...chatMessages,
      [matchId]: updatedMessages
    });
    setUserChatInput("");
    setIsChatTyping(true);

    // Dynamic AI feedback using the business logic AIService layer
    setTimeout(async () => {
      const historyFormatted = currentMessages.map(m => ({ sender: m.sender, text: m.text }));
      const aiResponseText = await AIService.getAIConsultantResponse(query, historyFormatted, selectedMatch);

      const aiMsg: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };

      setChatMessages((prev) => ({
        ...prev,
        [matchId]: [...(prev[matchId] || []), aiMsg]
      }));
      setIsChatTyping(false);
    }, 1200);
  };

  // Simulate manual event for live match
  const triggerLiveEvent = () => {
    setMatches((prevMatches) => {
      return prevMatches.map((match) => {
        if (match.isLive) {
          const currentScore = match.liveScore || [1, 1];
          const updatedScore: [number, number] = [currentScore[0], currentScore[1] + 1]; // Barcelona scores!
          alert(`⚡ GOL DO BARCELONA! O placar agora é Real Madrid ${updatedScore[0]} x ${updatedScore[1]} Barcelona!`);
          
          const currentStats = match.stats || {
            possession: [50, 50],
            corners: [4, 3],
            yellowCards: [1, 2],
            redCards: [0, 0],
            shotsOnTarget: [6, 4],
            shotsOffTarget: [5, 3],
            xg: [1.45, 0.98]
          };

          const nextStats = {
            ...currentStats,
            shotsOnTarget: [currentStats.shotsOnTarget[0], currentStats.shotsOnTarget[1] + 1] as [number, number],
            xg: [currentStats.xg[0], parseFloat((currentStats.xg[1] + 0.75).toFixed(2))] as [number, number]
          };

          return {
            ...match,
            liveScore: updatedScore,
            iaMarketSuggestion: "Over 3.5 Gols em alta",
            probabilities: { home: 25, draw: 35, away: 40 },
            stats: nextStats
          };
        }
        return match;
      });
    });
  };

  const renderStatBar = (label: string, homeVal: number, awayVal: number, isFloat: boolean = false) => {
    const total = homeVal + awayVal || 1;
    const homePercent = (homeVal / total) * 100;
    const awayPercent = (awayVal / total) * 100;
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-300">
          <span className="font-semibold text-green-400">{isFloat ? homeVal.toFixed(2) : homeVal}</span>
          <span className="text-[9px] uppercase font-sans text-neutral-450 tracking-wider font-semibold">{label}</span>
          <span className="font-semibold text-red-400">{isFloat ? awayVal.toFixed(2) : awayVal}</span>
        </div>
        <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden flex border border-neutral-850">
          <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${homePercent}%` }}></div>
          <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${awayPercent}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-950 text-neutral-200 font-sans overflow-hidden">
      
      {/* TOP NAVIGATION BAR */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-black text-sm shrink-0">BV</div>
            <span className="text-base sm:text-xl font-bold tracking-tighter text-white">
              BETVISION<span className="text-green-500">PRO</span>
            </span>
          </div>
          <nav className="hidden lg:flex gap-4 text-xs font-medium">
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedLeague("all"); }}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === "dashboard" ? "bg-green-500 text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              Dashboard IA
            </button>
            <button
              onClick={() => { setActiveTab("partidas"); setActiveFilter("high_confidence"); }}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === "partidas" ? "bg-green-500 text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              Partidas Preditas
            </button>
            <button
              onClick={() => { setActiveTab("simulador"); }}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === "simulador" ? "bg-green-500 text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 animate-pulse text-amber-500" /> Live Tracker
            </button>
            <button
              onClick={() => { setActiveTab("multiplas"); }}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === "multiplas" ? "bg-green-500 text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              Múltiplas Assistidas
            </button>
            <button
              onClick={() => { setActiveTab("minhas_apostas"); }}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
                activeTab === "minhas_apostas" ? "bg-green-500 text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              Histórico
              <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                {myBets.filter(b => b.status === "pending").length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("dashboard_ia"); }}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === "dashboard_ia" ? "bg-green-500 text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              Estatísticas IA
            </button>
            <button
              onClick={() => { setActiveTab("admin"); }}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1 text-red-400 hover:text-red-350 border border-neutral-800 hover:border-red-500/20 ${
                activeTab === "admin" ? "bg-red-500 text-white font-semibold" : ""
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Admin
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              if (isVIPSubscriber) {
                setIsVIPSubscriber(false);
              } else {
                setShowVIPModal(true);
              }
            }}
            className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-all ${
              isVIPSubscriber
                ? "bg-amber-500 text-black border border-amber-600 shadow-md animate-pulse"
                : "bg-neutral-800 text-amber-400 border border-neutral-700 hover:bg-neutral-700"
            }`}
          >
            ★ <span className="hidden sm:inline">{isVIPSubscriber ? "VIP ATIVO" : "Upgrade VIP"}</span>
            <span className="sm:hidden">{isVIPSubscriber ? "VIP" : "UP"}</span>
          </button>
          
          <NotificationCenter
            notifications={notifications}
            isMuted={isMuted}
            onClearAll={handleClearAllNotifications}
            onToggleMute={handleToggleMute}
            onRemoveNotification={handleRemoveNotification}
            onTestNotification={handleTestNotification}
          />
          
          <div className="bg-neutral-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs border border-neutral-700 flex items-center gap-1.5 sm:gap-2">
            <span className="text-neutral-400 hidden sm:inline">Saldo:</span>
            <span className="text-green-400 font-mono font-bold">R$ {userBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            <button
              onClick={() => {
                setUserBalance(2450.0);
                alert("✓ Saldo redefinido para R$ 2.450,00 para fins de simulação!");
              }}
              title="Recarregar Saldo de Demonstração"
              className="p-0.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
          
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded text-xs transition-colors cursor-pointer font-bold"
            title="Gestão de Risco de Perdas"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Gestão de Risco</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 hidden sm:flex items-center justify-center font-bold text-neutral-950 text-xs shrink-0 hover:ring-2 hover:ring-green-400 transition-all cursor-pointer"
            title="Configurações do Perfil e Gestão de Risco"
          >
            FP
          </button>
        </div>
      </header>

      {/* MAIN INTERFACE */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR FILTERS (Only visible on dashboard and matches list) - HIDDEN ON MOBILE/TABLET */}
        {(activeTab === "dashboard" || activeTab === "partidas") && (
          <aside className="hidden md:flex w-56 border-r border-neutral-800 bg-neutral-900/40 p-4 flex-col shrink-0 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <div className="mb-6">
              <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3 flex items-center gap-1">
                <Filter className="w-3 h-3 text-green-500" /> Filtros IA
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveFilter("high_confidence")}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between ${
                    activeFilter === "high_confidence"
                      ? "bg-neutral-800 text-green-500 border border-green-500/20"
                      : "hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>Maior Confiança (&gt;88%)</span>
                  <span className="text-[9px] bg-green-500/10 text-green-500 px-1 rounded">HOT</span>
                </button>
                <button
                  onClick={() => setActiveFilter("favorites")}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between ${
                    activeFilter === "favorites"
                      ? "bg-neutral-800 text-green-500 border border-green-500/20"
                      : "hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>Favoritos Clássicos</span>
                </button>
                <button
                  onClick={() => setActiveFilter("over_gols")}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors ${
                    activeFilter === "over_gols"
                      ? "bg-neutral-800 text-green-500 border border-green-500/20"
                      : "hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Over Gols
                </button>
                <button
                  onClick={() => setActiveFilter("btts")}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors ${
                    activeFilter === "btts"
                      ? "bg-neutral-800 text-green-500 border border-green-500/20"
                      : "hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Ambas Marcam (BTTS)
                </button>
                <button
                  onClick={() => setActiveFilter("vip")}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between ${
                    activeFilter === "vip"
                      ? "bg-neutral-800 text-amber-500 border border-amber-500/20"
                      : "hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>VIP Exclusivo</span>
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 rounded font-bold">VIP</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" /> Campeonatos
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedLeague("all")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded ${
                    selectedLeague === "all" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>Todos</span>
                  <span className="text-xs bg-neutral-800 px-1.5 rounded">{matches.length}</span>
                </button>
                <button
                  onClick={() => setSelectedLeague("Brasileirão")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded ${
                    selectedLeague === "Brasileirão" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>Brasileirão</span>
                  <span className="text-xs bg-neutral-800 px-1.5 rounded">
                    {matches.filter(m => m.league === "Brasileirão").length}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedLeague("Premier League")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded ${
                    selectedLeague === "Premier League" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>Premier League</span>
                  <span className="text-xs bg-neutral-800 px-1.5 rounded">
                    {matches.filter(m => m.league === "Premier League").length}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedLeague("Libertadores")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded ${
                    selectedLeague === "Libertadores" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>Libertadores</span>
                  <span className="text-[9px] text-amber-500 font-bold border border-amber-500/20 bg-amber-500/10 px-1 rounded">VIP</span>
                </button>
                <button
                  onClick={() => setSelectedLeague("La Liga")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded ${
                    selectedLeague === "La Liga" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>La Liga</span>
                  <span className="text-[9px] text-green-500 font-bold border border-green-500/20 bg-green-500/10 px-1 rounded">LIVE</span>
                </button>
              </div>
            </div>

            {/* Filtros Pessoais */}
            <div className="mb-6">
              <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" /> Filtros Pessoais
              </h3>
              
              <div className="space-y-2 mb-3">
                {personalFilters.map((f) => {
                  const isActive = selectedLeague === f.league && activeFilter === f.filter;
                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        setSelectedLeague(f.league);
                        setActiveFilter(f.filter);
                      }}
                      className={`group w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between cursor-pointer border ${
                        isActive
                          ? "bg-green-500/10 border-green-500/30 text-green-400 font-medium"
                          : "bg-neutral-900/40 border-neutral-850 text-neutral-400 hover:text-neutral-200 hover:border-neutral-800"
                      }`}
                    >
                      <div className="truncate min-w-0 pr-1">
                        <span className="font-semibold block truncate leading-tight text-[11px] group-hover:text-neutral-100 transition-colors">
                          {f.name}
                        </span>
                        <span className="text-[9px] font-mono opacity-60 block truncate mt-0.5">
                          {getFilterCombinationLabel(f)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleRemovePersonalFilter(f.id, e)}
                        className="text-neutral-500 hover:text-red-400 p-1 rounded hover:bg-neutral-800 shrink-0 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Excluir filtro"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                
                {personalFilters.length === 0 && (
                  <p className="text-[10px] text-neutral-500 italic px-1 py-1">
                    Nenhum atalho salvo. Crie um combinando filtros acima!
                  </p>
                )}
              </div>

              {/* Form to save current */}
              <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-850 space-y-2">
                <div className="text-[9px] font-mono text-neutral-400 leading-tight">
                  Salvar atual: <span className="text-neutral-200">{getFilterCombinationLabel({ id: "", name: "", league: selectedLeague, filter: activeFilter })}</span>
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Ex: Premier + VIP"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSavePersonalFilter()}
                    className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[10px] text-neutral-200 focus:outline-none focus:border-green-500 flex-1"
                  />
                  <button
                    onClick={handleSavePersonalFilter}
                    disabled={!newFilterName.trim()}
                    className="bg-green-500 hover:bg-green-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black px-2 py-1 rounded text-[10px] font-bold transition-all shrink-0 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Interactive ROI Tool */}
            <div className="mt-auto bg-neutral-900/60 border border-neutral-800 rounded p-3 text-xs">
              <h4 className="font-bold text-neutral-300 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Simulador de ROI
              </h4>
              <p className="text-[10px] text-neutral-400 mb-2">Simule seu retorno estimado com base em nossa taxa de acerto de 89.4%:</p>
              <div className="flex justify-between text-[11px] mb-1 font-mono">
                <span>Investimento:</span>
                <span className="text-white">R$ {simulatedInvestment}</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={simulatedInvestment}
                onChange={(e) => setSimulatedInvestment(parseInt(e.target.value))}
                className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2"
              />
              <div className="flex justify-between text-[11px] font-mono border-t border-neutral-800 pt-1.5">
                <span className="text-neutral-400">Lucro Estimado (30d):</span>
                <span className="text-green-400 font-bold">+R$ {Math.round(simulatedInvestment * 0.242)}</span>
              </div>
            </div>
          </aside>
        )}

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-950 overflow-y-auto pb-16 md:pb-0">
          
          {/* DASHBOARD TAB VIEW */}
          {activeTab === "dashboard" && (
            <div className="p-4 space-y-4">
              
              {/* MOBILE HORIZONTAL FILTERS & LEAGUES (hidden on desktop) */}
              <div className="md:hidden space-y-3 pb-3 border-b border-neutral-900">
                {/* Filters IA */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-1">
                    <Filter className="w-2.5 h-2.5 text-green-500" /> Filtros IA
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                    <button
                      onClick={() => setActiveFilter("high_confidence")}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                        activeFilter === "high_confidence"
                          ? "bg-green-500 text-black border-green-500 font-bold"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      Maior Confiança
                    </button>
                    <button
                      onClick={() => setActiveFilter("favorites")}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                        activeFilter === "favorites"
                          ? "bg-green-500 text-black border-green-500 font-bold"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      Favoritos
                    </button>
                    <button
                      onClick={() => setActiveFilter("over_gols")}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                        activeFilter === "over_gols"
                          ? "bg-green-500 text-black border-green-500 font-bold"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      Over Gols
                    </button>
                    <button
                      onClick={() => setActiveFilter("btts")}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                        activeFilter === "btts"
                          ? "bg-green-500 text-black border-green-500 font-bold"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      Ambas Marcam
                    </button>
                    <button
                      onClick={() => setActiveFilter("vip")}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                        activeFilter === "vip"
                          ? "bg-amber-500 text-black border-amber-500 font-bold"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      ★ VIP Exclusivo
                    </button>
                  </div>
                </div>

                {/* Filtros Pessoais Mobile */}
                {personalFilters.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-yellow-500" /> Filtros Pessoais
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                      {personalFilters.map((f) => {
                        const isActive = selectedLeague === f.league && activeFilter === f.filter;
                        return (
                          <button
                            key={f.id}
                            onClick={() => {
                              setSelectedLeague(f.league);
                              setActiveFilter(f.filter);
                            }}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                              isActive
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-bold"
                                : "bg-neutral-900 text-neutral-400 border-neutral-800"
                            }`}
                          >
                            <span>{f.name}</span>
                            <span className="text-[8px] opacity-65 font-mono">({getFilterCombinationLabel(f)})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Campeonatos */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-1">
                    <Award className="w-2.5 h-2.5 text-amber-500" /> Campeonatos
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                    {[
                      { id: "all", name: "Todos" },
                      { id: "Brasileirão", name: "Brasileirão" },
                      { id: "Premier League", name: "Premier League" },
                      { id: "Libertadores", name: "Libertadores", vip: true },
                      { id: "La Liga", name: "La Liga", live: true },
                    ].map((league) => (
                      <button
                        key={league.id}
                        onClick={() => setSelectedLeague(league.id)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
                          selectedLeague === league.id
                            ? "bg-neutral-200 text-neutral-950 border-neutral-200 font-bold"
                            : "bg-neutral-900 text-neutral-400 border-neutral-800"
                        }`}
                      >
                        {league.name}
                        {league.vip && <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1 rounded font-bold">VIP</span>}
                        {league.live && <span className="text-[8px] bg-red-500/10 text-red-500 px-1 rounded font-bold animate-pulse">LIVE</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mini ROI Simulator Tool for Mobile */}
                <div className="bg-neutral-900/40 border border-neutral-850 rounded-lg p-3 text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-300 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" /> Simulador de ROI
                    </span>
                    <span className="text-[10px] text-green-400 font-bold font-mono">Retorno 30d: +R$ {Math.round(simulatedInvestment * 0.242)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={simulatedInvestment}
                      onChange={(e) => setSimulatedInvestment(parseInt(e.target.value))}
                      className="flex-1 h-1 bg-neutral-750 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <span className="text-[10px] text-white font-mono shrink-0">Aporte: R$ {simulatedInvestment}</span>
                  </div>
                </div>
              </div>
              
              {/* STATS STRIP */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 relative overflow-hidden group hover:border-green-500/30 transition-all">
                  <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1 flex justify-between">
                    <span>Precisão IA</span>
                    <span className="text-green-500 font-mono">+1.2%</span>
                  </div>
                  <div className="text-xl font-bold text-green-500 tracking-tight flex items-baseline gap-1">
                    89.4%
                    <span className="text-[10px] text-neutral-400 font-normal">taxa global</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: "89.4%" }}></div>
                  </div>
                </div>

                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 hover:border-green-500/30 transition-all">
                  <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1">ROI Média (30d)</div>
                  <div className="text-xl font-bold text-white tracking-tight flex items-baseline gap-1">
                    +24.2%
                    <span className="text-[10px] text-green-400 font-normal">Consistente</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-green-400 h-1 rounded-full" style={{ width: "74%" }}></div>
                  </div>
                </div>

                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 hover:border-green-500/30 transition-all">
                  <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1">Lucro Estimado Mensal</div>
                  <div className="text-xl font-bold text-white tracking-tight font-mono">
                    R$ 4.821,00
                  </div>
                  <div className="text-[9px] text-neutral-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" /> Atualizado há 10m
                  </div>
                </div>

                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 hover:border-green-500/30 transition-all relative">
                  <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1">Acertos Hoje</div>
                  <div className="text-xl font-bold text-green-400 tracking-tight">
                    14/16
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden flex">
                    <div className="bg-green-500 h-full" style={{ width: "87.5%" }}></div>
                    <div className="bg-red-500 h-full" style={{ width: "12.5%" }}></div>
                  </div>
                </div>
              </div>

              {/* LIVE TRACKER HIGHLIGHT (If live game exists) */}
              {matches.some(m => m.isLive) && (
                <div className="bg-neutral-900 border border-green-500/30 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-1.5 py-0.5 rounded">Partida Ao Vivo</span>
                      <div className="text-xs font-semibold mt-1">
                        {matches.find(m => m.isLive)?.homeTeam} <span className="text-green-400 font-mono font-bold mx-1">{matches.find(m => m.isLive)?.liveScore?.[0]} - {matches.find(m => m.isLive)?.liveScore?.[1]}</span> {matches.find(m => m.isLive)?.awayTeam} ({matches.find(m => m.isLive)?.liveMinute}')
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={triggerLiveEvent}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold px-2.5 py-1 rounded"
                    >
                      Simular Lance Perigoso ⚡
                    </button>
                    <button
                      onClick={() => setActiveTab("simulador")}
                      className="bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-3 py-1 rounded"
                    >
                      Abrir Tracker
                    </button>
                  </div>
                </div>
              )}

              {/* FEATURED MATCH LIST VIEW */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    Análises de Alta Precisão 
                    <span className="text-[9px] bg-green-500/15 text-green-500 px-2 py-0.5 rounded font-bold">MOTOR PREDITIVO ATIVO</span>
                  </h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Pesquisar times ou campeonatos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                      className="bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-green-500 w-48 md:w-64"
                    />
                  </div>
                </div>

                {/* Grid layout for match list and detail drawer */}
                <div className="flex flex-col xl:flex-row gap-4">
                  
                  {/* Match Cards List */}
                  <div className="flex-1 space-y-3">
                    {filteredMatches.length === 0 ? (
                      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center text-neutral-400 text-xs">
                        Nenhuma partida predita corresponde aos filtros selecionados.
                      </div>
                    ) : (
                      filteredMatches.map((match) => {
                        const isLocked = match.isVIP && !isVIPSubscriber;
                        return (
                          <div
                            key={match.id}
                            className={`bg-neutral-900 border ${
                              selectedMatch?.id === match.id ? "border-green-500" : "border-neutral-800 hover:border-neutral-700"
                            } rounded-lg p-3.5 flex flex-col md:flex-row gap-4 relative overflow-hidden transition-all`}
                          >
                            {/* VIP Locked overlay */}
                            {isLocked && (
                              <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center z-10 p-4">
                                <div className="text-center">
                                  <div className="flex justify-center mb-1">
                                    <Lock className="w-5 h-5 text-amber-500 animate-bounce" />
                                  </div>
                                  <p className="text-amber-400 font-bold text-xs uppercase tracking-wider">Conteúdo VIP Exclusivo</p>
                                  <p className="text-[10px] text-neutral-400 mb-2">Desbloqueie análises matemáticas com probabilidade estendida</p>
                                  <button
                                    onClick={() => setShowVIPModal(true)}
                                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] px-3 py-1 rounded-full transition-all"
                                  >
                                    ASSINAR PREMIUM VIP
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Left part: Teams & Header */}
                            <div className="w-full md:w-1/4 shrink-0 border-b md:border-b-0 md:border-r border-neutral-800 pb-3 md:pb-0 md:pr-4 flex flex-col justify-between">
                              <div>
                                <div className="text-[9px] text-neutral-400 font-mono flex items-center justify-between gap-1.5 mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span>{match.league}</span>
                                    <span>•</span>
                                    <span className={match.isLive ? "text-green-500 font-bold animate-pulse" : ""}>
                                      {match.isLive ? `LIVE ${match.liveMinute}'` : `${match.date}, ${match.time}`}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(match.id);
                                    }}
                                    className="text-neutral-500 hover:text-amber-400 p-1 transition-colors relative z-20"
                                    title={match.isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                                  >
                                    <Star className={`w-3.5 h-3.5 ${match.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                                  </button>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between font-bold text-xs text-white">
                                    <span>{match.homeTeam}</span>
                                    <span className="text-[10px] bg-neutral-800 px-1 rounded text-neutral-400">H</span>
                                  </div>
                                  <div className="flex items-center justify-between font-bold text-xs text-white">
                                    <span>{match.awayTeam}</span>
                                    <span className="text-[10px] bg-neutral-800 px-1 rounded text-neutral-400">A</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 flex gap-1 items-center">
                                <span className="text-[9px] text-neutral-500 uppercase font-mono">IA Confiabilidade:</span>
                                <span className="text-[10px] text-amber-400 font-mono font-bold">{match.iaConfidence}%</span>
                              </div>
                            </div>

                            {/* Right part: Predict & Actions */}
                            <div className="flex-1 flex flex-col justify-between">
                              
                              {/* Probabilities strip */}
                              <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
                                <button
                                  onClick={() => addToBetSlip(match, "home", match.odds.home)}
                                  className="bg-neutral-800/60 hover:bg-neutral-800 p-1.5 rounded text-left px-2 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col"
                                >
                                  <span className="text-[9px] text-neutral-500 uppercase">1 ({match.homeTeam})</span>
                                  <div className="flex justify-between items-baseline mt-0.5">
                                    <span className="text-xs font-mono font-bold text-neutral-200">{match.odds.home}</span>
                                    <span className="text-[10px] text-green-500 font-mono">{match.probabilities.home}%</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => addToBetSlip(match, "draw", match.odds.draw)}
                                  className="bg-neutral-800/60 hover:bg-neutral-800 p-1.5 rounded text-left px-2 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col"
                                >
                                  <span className="text-[9px] text-neutral-500 uppercase">X (Empate)</span>
                                  <div className="flex justify-between items-baseline mt-0.5">
                                    <span className="text-xs font-mono font-bold text-neutral-200">{match.odds.draw}</span>
                                    <span className="text-[10px] text-neutral-400 font-mono">{match.probabilities.draw}%</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => addToBetSlip(match, "away", match.odds.away)}
                                  className="bg-neutral-800/60 hover:bg-neutral-800 p-1.5 rounded text-left px-2 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col"
                                >
                                  <span className="text-[9px] text-neutral-500 uppercase">2 ({match.awayTeam})</span>
                                  <div className="flex justify-between items-baseline mt-0.5">
                                    <span className="text-xs font-mono font-bold text-neutral-200">{match.odds.away}</span>
                                    <span className="text-[10px] text-red-400 font-mono">{match.probabilities.away}%</span>
                                  </div>
                                </button>
                              </div>

                              {/* Footer Action items */}
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/60">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-neutral-500 uppercase">Sugestão:</span>
                                  <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold italic">
                                    {match.iaMarketSuggestion}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setSelectedMatch(selectedMatch?.id === match.id ? null : match)}
                                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                                      selectedMatch?.id === match.id
                                        ? "bg-neutral-700 text-white"
                                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                                    }`}
                                  >
                                    <Sliders className="w-3 h-3" />
                                    {selectedMatch?.id === match.id ? "Fechar" : "Estatísticas IA"}
                                  </button>
                                  <button
                                    onClick={() => addToBetSlip(match, "home", match.odds.home)}
                                    className="bg-green-500 hover:bg-green-400 text-black font-bold px-3 py-1 rounded"
                                  >
                                    Adicionar +
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Deep Analysis Side Panel / Drawer */}
                  {(() => {
                    const activeMatchDetails = selectedMatch ? matches.find(m => m.id === selectedMatch.id) || selectedMatch : null;
                    if (!activeMatchDetails) return null;

                    return (
                      <div className="w-full xl:w-80 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col shrink-0 space-y-4">
                        <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                          <div>
                            <h3 className="font-bold text-xs text-white">Análise Preditiva & Live</h3>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {activeMatchDetails.homeTeam} x {activeMatchDetails.awayTeam}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedMatch(null)}
                            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* TABS SELECTOR */}
                        <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded border border-neutral-850 text-[10px] font-semibold shrink-0">
                          <button
                            onClick={() => setSelectedMatchTab("analise")}
                            className={`py-1 rounded text-center transition-all ${
                              selectedMatchTab === "analise" ? "bg-green-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            Análise IA
                          </button>
                          <button
                            onClick={() => setSelectedMatchTab("estatisticas")}
                            className={`py-1 rounded text-center transition-all ${
                              selectedMatchTab === "estatisticas" ? "bg-green-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            Métricas Ao Vivo
                          </button>
                          <button
                            onClick={() => setSelectedMatchTab("ficha")}
                            className={`py-1 rounded text-center transition-all ${
                              selectedMatchTab === "ficha" ? "bg-green-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            Ficha & Esc.
                          </button>
                        </div>

                        {/* TAB 1: ANALISE */}
                        {selectedMatchTab === "analise" && (
                          <div className="flex flex-col space-y-4 flex-1">
                            {/* Visual Attacking/Defending indicators */}
                            <div className="space-y-3">
                              <h4 className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Métricas Comparativas</h4>
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                    <span>Força Ofensiva ({activeMatchDetails.homeTeam})</span>
                                    <span className="font-mono text-green-400">{activeMatchDetails.attackingStrength.home}%</span>
                                  </div>
                                  <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full" style={{ width: `${activeMatchDetails.attackingStrength.home}%` }}></div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                    <span>Força Ofensiva ({activeMatchDetails.awayTeam})</span>
                                    <span className="font-mono text-red-400">{activeMatchDetails.attackingStrength.away}%</span>
                                  </div>
                                  <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full" style={{ width: `${activeMatchDetails.attackingStrength.away}%` }}></div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                    <span>Compactação Defensiva</span>
                                    <span className="font-mono text-white">
                                      {activeMatchDetails.defendingStrength.home} vs {activeMatchDetails.defendingStrength.away}
                                    </span>
                                  </div>
                                  <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden flex">
                                    <div className="bg-green-500 h-full" style={{ width: "50%" }}></div>
                                    <div className="bg-neutral-700 w-0.5 h-full"></div>
                                    <div className="bg-amber-500 h-full" style={{ width: "50%" }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* AI Expert Text rationale */}
                            <div className="bg-neutral-950 p-3 rounded border border-neutral-850 text-xs">
                              <div className="flex items-center gap-1 text-green-400 font-semibold mb-1 text-[11px]">
                                <Sparkles className="w-3 h-3" /> Parecer do Analista Pro IA:
                              </div>
                              <p className="text-neutral-300 leading-relaxed text-[11px] italic">
                                "{activeMatchDetails.iaAnalysis}"
                              </p>
                            </div>

                            {/* Real-time Interactive AI Consultation Chat */}
                            <div className="space-y-2 border-t border-neutral-800 pt-3 flex-1 flex flex-col justify-end">
                              <h4 className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider flex items-center gap-1">
                                <HelpCircle className="w-3 h-3 text-green-500" /> Pergunte à Inteligência Artificial
                              </h4>
                              
                              {/* Chat history wrapper */}
                              <div className="h-28 bg-neutral-950 rounded p-2 overflow-y-auto space-y-2 border border-neutral-850">
                                {(!chatMessages[activeMatchDetails.id] || chatMessages[activeMatchDetails.id].length === 0) ? (
                                  <p className="text-[10px] text-neutral-500 text-center italic mt-4">
                                    "Quem tem mais chance de vencer?", "Qual é o mercado ideal?" Pergunte abaixo.
                                  </p>
                                ) : (
                                  chatMessages[activeMatchDetails.id].map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                                      <div className={`max-w-[85%] rounded p-2 text-[10px] ${
                                        msg.sender === "user" ? "bg-green-500 text-black font-medium" : "bg-neutral-800 text-neutral-200"
                                      }`}>
                                        {msg.text}
                                      </div>
                                      <span className="text-[8px] text-neutral-500 mt-0.5 px-1 font-mono">{msg.timestamp}</span>
                                    </div>
                                  ))
                                )}
                                {isChatTyping && (
                                  <div className="flex items-center gap-1.5 text-neutral-500 text-[9px] pl-1">
                                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-bounce"></span>
                                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    <span>IA redigindo parecer...</span>
                                  </div>
                                )}
                              </div>

                              {/* Input bar */}
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Perguntar sobre H2H, gols, desfalques..."
                                  value={userChatInput}
                                  onChange={(e) => setUserChatInput(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                                  className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] text-neutral-200 focus:outline-none focus:border-green-500 flex-1"
                                />
                                <button
                                  onClick={sendChatMessage}
                                  className="bg-green-500 hover:bg-green-400 text-black p-1.5 rounded transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: ESTATISTICAS */}
                        {selectedMatchTab === "estatisticas" && (
                          <div className="flex flex-col space-y-4">
                            {activeMatchDetails.stats ? (
                              <div className="space-y-4 bg-neutral-950/40 p-3 rounded-lg border border-neutral-850">
                                <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-800 pb-1 mb-2">
                                  <span>{activeMatchDetails.homeTeam}</span>
                                  <span className="text-green-500 font-mono">AO VIVO</span>
                                  <span>{activeMatchDetails.awayTeam}</span>
                                </div>

                                {renderStatBar("Posse de Bola", activeMatchDetails.stats.possession[0], activeMatchDetails.stats.possession[1], false)}
                                {renderStatBar("Expectativa de Gols (xG)", activeMatchDetails.stats.xg[0], activeMatchDetails.stats.xg[1], true)}
                                {renderStatBar("Finalizações no Alvo", activeMatchDetails.stats.shotsOnTarget[0], activeMatchDetails.stats.shotsOnTarget[1], false)}
                                {renderStatBar("Finalizações Fora", activeMatchDetails.stats.shotsOffTarget[0], activeMatchDetails.stats.shotsOffTarget[1], false)}
                                {renderStatBar("Escanteios", activeMatchDetails.stats.corners[0], activeMatchDetails.stats.corners[1], false)}
                                {renderStatBar("Cartões Amarelos", activeMatchDetails.stats.yellowCards[0], activeMatchDetails.stats.yellowCards[1], false)}
                                {renderStatBar("Cartões Vermelhos", activeMatchDetails.stats.redCards[0], activeMatchDetails.stats.redCards[1], false)}
                              </div>
                            ) : (
                              <div className="bg-neutral-950/60 p-6 rounded-lg border border-neutral-850 text-center space-y-3">
                                <Clock className="w-8 h-8 text-neutral-600 mx-auto animate-pulse" />
                                <p className="text-[11px] text-neutral-400 leading-relaxed">
                                  Esta partida ainda não iniciou. Estatísticas detalhadas de posse de bola, escanteios, cartões e xG estarão disponíveis em tempo real assim que o jogo começar!
                                </p>
                              </div>
                            )}

                            {/* Small informative prompt */}
                            <div className="text-[9px] bg-neutral-950 border border-neutral-850 text-neutral-400 p-2.5 rounded italic">
                              💡 <strong>Dica IA:</strong> No SofaScore, o indicador <strong>xG (Expected Goals)</strong> mede a qualidade das chances criadas. Use isso para apostar em "Próximo Gol" ou "Over" ao vivo!
                            </div>
                          </div>
                        )}

                        {/* TAB 3: FICHA & ESCALACAO */}
                        {selectedMatchTab === "ficha" && (
                          <div className="flex flex-col space-y-4 overflow-y-auto max-h-[420px] pr-1">
                            {/* Stadium and Referee */}
                            <div className="bg-neutral-950 p-2.5 rounded border border-neutral-850 space-y-2 text-[11px]">
                              <div className="flex items-center gap-2 text-neutral-300">
                                <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                <div>
                                  <span className="text-neutral-500 text-[10px] block leading-none">Estádio / Local</span>
                                  <span className="font-semibold text-white">{activeMatchDetails.stadium || "Estádio do Mandante"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-neutral-300 border-t border-neutral-900 pt-2">
                                <User className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                <div>
                                  <span className="text-neutral-500 text-[10px] block leading-none">Árbitro Oficial</span>
                                  <span className="font-semibold text-white">{activeMatchDetails.referee || "Árbitro Licenciado"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Starting Lineups */}
                            {activeMatchDetails.lineups ? (
                              <div className="space-y-2">
                                <h4 className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider flex items-center gap-1">
                                  📋 Titulares Prováveis / Escalados
                                </h4>
                                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-2.5 rounded border border-neutral-850">
                                  <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-green-400 truncate border-b border-neutral-900 pb-1 mb-1.5">{activeMatchDetails.homeTeam}</div>
                                    {activeMatchDetails.lineups.home.map((player, idx) => (
                                      <div key={player} className="text-[10px] text-neutral-300 truncate flex items-center gap-1 font-mono">
                                        <span className="text-[8px] text-neutral-500 w-3">{idx + 1}</span>
                                        <span>{player}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="space-y-1 border-l border-neutral-900 pl-2">
                                    <div className="text-[10px] font-bold text-red-400 truncate border-b border-neutral-900 pb-1 mb-1.5">{activeMatchDetails.awayTeam}</div>
                                    {activeMatchDetails.lineups.away.map((player, idx) => (
                                      <div key={player} className="text-[10px] text-neutral-300 truncate flex items-center gap-1 font-mono">
                                        <span className="text-[8px] text-neutral-500 w-3">{idx + 1}</span>
                                        <span>{player}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-neutral-500 italic text-center py-2">Sem escalação disponível.</div>
                            )}

                            {/* Injuries / Suspensions */}
                            {activeMatchDetails.injuries && (activeMatchDetails.injuries.home.length > 0 || activeMatchDetails.injuries.away.length > 0) ? (
                              <div className="space-y-2">
                                <h4 className="text-[10px] uppercase text-red-400 font-bold tracking-wider flex items-center gap-1">
                                  🚨 Desfalques / Boletim Médico
                                </h4>
                                <div className="grid grid-cols-2 gap-2 bg-neutral-950/40 p-2 rounded border border-neutral-850">
                                  <div className="space-y-1 text-[10px]">
                                    {activeMatchDetails.injuries.home.map(p => (
                                      <div key={p} className="text-neutral-400 truncate text-[9px]">❌ {p}</div>
                                    ))}
                                    {activeMatchDetails.injuries.home.length === 0 && <span className="text-neutral-600 italic">Nenhum</span>}
                                  </div>
                                  <div className="space-y-1 text-[10px] border-l border-neutral-900 pl-2">
                                    {activeMatchDetails.injuries.away.map(p => (
                                      <div key={p} className="text-neutral-400 truncate text-[9px]">❌ {p}</div>
                                    ))}
                                    {activeMatchDetails.injuries.away.length === 0 && <span className="text-neutral-600 italic">Nenhum</span>}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-neutral-500 italic text-center py-2">Nenhum desfalque importante registrado.</div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })()}

                </div>
              </div>

            </div>
          )}

          {/* PARTIDAS PREDITAS FULL LIST TAB VIEW */}
          {activeTab === "partidas" && (
            <div className="p-4 space-y-4">
              
              {/* MOBILE HORIZONTAL CAMPEONATOS (hidden on desktop) */}
              <div className="md:hidden flex flex-col gap-1.5 pb-2 border-b border-neutral-900">
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-1">
                  <Award className="w-2.5 h-2.5 text-amber-500" /> Campeonatos
                </span>
                <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                  {[
                    { id: "all", name: "Todos" },
                    { id: "Brasileirão", name: "Brasileirão" },
                    { id: "Premier League", name: "Premier League" },
                    { id: "Libertadores", name: "Libertadores", vip: true },
                    { id: "La Liga", name: "La Liga", live: true },
                  ].map((league) => (
                    <button
                      key={league.id}
                      onClick={() => setSelectedLeague(league.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
                        selectedLeague === league.id
                          ? "bg-neutral-200 text-neutral-950 border-neutral-200 font-bold"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      {league.name}
                      {league.vip && <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1 rounded font-bold">VIP</span>}
                      {league.live && <span className="text-[8px] bg-red-500/10 text-red-500 px-1 rounded font-bold animate-pulse">LIVE</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-900">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Centro de Partidas Analisadas</h2>
                  <p className="text-xs text-neutral-400">Exibindo coeficiente preditivo estatístico dos principais campeonatos europeus e nacionais.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-mono">Filtrar Confiabilidade:</span>
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-xs rounded px-2 py-1 focus:outline-none focus:border-green-500"
                  >
                    <option value="all">Ver Todas</option>
                    <option value="high_confidence">Alta Confiança (&gt;88%)</option>
                    <option value="favorites">Favoritos &lt; 1.60</option>
                    <option value="vip">Apenas VIPs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.map((match) => (
                  <div key={match.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3 relative overflow-hidden">
                    {match.isVIP && !isVIPSubscriber && (
                      <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xs flex items-center justify-center z-10 p-4">
                        <div className="text-center">
                          <Lock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                          <p className="text-amber-400 font-bold text-xs uppercase tracking-wider">Conteúdo VIP</p>
                          <button
                            onClick={() => setShowVIPModal(true)}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] px-3 py-1 rounded-full mt-2"
                          >
                            Desbloquear
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-300 font-mono">{match.league}</span>
                      <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                        ★ IA {match.iaConfidence}% Confiança
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 font-bold text-sm">
                        <div>{match.homeTeam}</div>
                        <div>{match.awayTeam}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-neutral-500 block">SUGESTÃO IA</span>
                        <span className="text-xs text-green-400 font-bold italic">{match.iaMarketSuggestion}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/60 text-center">
                      <div className="bg-neutral-950 p-1.5 rounded text-xs">
                        <div className="text-[9px] text-neutral-500">MANDANTE</div>
                        <div className="font-mono font-semibold">{match.odds.home}</div>
                      </div>
                      <div className="bg-neutral-950 p-1.5 rounded text-xs">
                        <div className="text-[9px] text-neutral-500">EMPATE</div>
                        <div className="font-mono font-semibold">{match.odds.draw}</div>
                      </div>
                      <div className="bg-neutral-950 p-1.5 rounded text-xs">
                        <div className="text-[9px] text-neutral-500">VISITANTE</div>
                        <div className="font-mono font-semibold">{match.odds.away}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1.5">
                      <span className="text-[10px] text-neutral-500 font-mono">{match.date}, {match.time}</span>
                      <button
                        onClick={() => addToBetSlip(match, "home", match.odds.home)}
                        className="bg-green-500 hover:bg-green-400 text-black font-bold text-xs px-3 py-1 rounded transition-all"
                      >
                        Selecionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIVE TRACKER SIMULATOR TAB VIEW */}
          {activeTab === "simulador" && (
            <div className="p-4 space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    Centro de Simulação & Eventos Ao Vivo
                  </h2>
                  <p className="text-xs text-neutral-400">As odds e probabilidades mudam dinamicamente a cada minuto jogado de acordo com a pressão ofensiva de IA.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={triggerLiveEvent}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded transition-all"
                  >
                    Simular Gol / Evento Crítico ⚽
                  </button>
                </div>
              </div>

              {/* List of active tracker elements */}
              <div className="space-y-4">
                {matches.filter(m => m.isLive).map(match => (
                  <div key={match.id} className="bg-neutral-900 border border-green-500/30 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                          LIVE - MINUTO {match.liveMinute}'
                        </span>
                        <button
                          onClick={() => toggleFavorite(match.id)}
                          className="text-neutral-500 hover:text-amber-400 p-1 transition-colors relative z-20"
                          title={match.isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                        >
                          <Star className={`w-3.5 h-3.5 ${match.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">{match.league}</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-8 justify-center w-full md:w-auto">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-sm text-white mb-1.5 border border-neutral-700">RM</div>
                          <div className="text-xs font-bold text-white">{match.homeTeam}</div>
                        </div>
                        <div className="text-2xl font-mono font-bold text-green-400 bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800 tracking-wider">
                          {match.liveScore?.[0]} - {match.liveScore?.[1]}
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-sm text-white mb-1.5 border border-neutral-700">BC</div>
                          <div className="text-xs font-bold text-white">{match.awayTeam}</div>
                        </div>
                      </div>

                      {/* Live win probabilities */}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between text-[11px] text-neutral-400">
                          <span>Probabilidade de vitória dinâmica:</span>
                          <span className="text-green-500 font-bold font-mono">Pressão: Barcelona</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${match.probabilities.home}%` }} title={`Mandante: ${match.probabilities.home}%`}></div>
                          <div className="bg-neutral-600 h-full" style={{ width: `${match.probabilities.draw}%` }} title={`Empate: ${match.probabilities.draw}%`}></div>
                          <div className="bg-red-500 h-full" style={{ width: `${match.probabilities.away}%` }} title={`Visitante: ${match.probabilities.away}%`}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                          <span>{match.homeTeam} ({match.probabilities.home}%)</span>
                          <span>Empate ({match.probabilities.draw}%)</span>
                          <span>{match.awayTeam} ({match.probabilities.away}%)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded border border-neutral-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 animate-spin" /> Live IA Recomendação de entrada:
                        </span>
                        <span className="text-[10px] bg-green-500/10 text-green-500 px-2 rounded font-bold">{match.iaMarketSuggestion}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 italic">"As defesas estão cansadas e o Real Madrid avança mais no bloco ofensivo. Isso dá espaço para rápidos contra-ataques do Barcelona. Recomendamos explorar over de escanteios ou gols asiáticos a partir do minuto 75."</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => addToBetSlip(match, "home", match.odds.home)}
                        className="bg-neutral-950 hover:bg-neutral-800 p-2.5 rounded border border-neutral-800 flex flex-col items-center justify-center"
                      >
                        <span className="text-[10px] text-neutral-500">Back {match.homeTeam}</span>
                        <span className="text-sm font-mono font-bold text-white mt-0.5">{match.odds.home}</span>
                      </button>
                      <button
                        onClick={() => addToBetSlip(match, "draw", match.odds.draw)}
                        className="bg-neutral-950 hover:bg-neutral-800 p-2.5 rounded border border-neutral-800 flex flex-col items-center justify-center"
                      >
                        <span className="text-[10px] text-neutral-500">Back Empate</span>
                        <span className="text-sm font-mono font-bold text-white mt-0.5">{match.odds.draw}</span>
                      </button>
                      <button
                        onClick={() => addToBetSlip(match, "away", match.odds.away)}
                        className="bg-neutral-950 hover:bg-neutral-800 p-2.5 rounded border border-neutral-800 flex flex-col items-center justify-center"
                      >
                        <span className="text-[10px] text-neutral-500">Back {match.awayTeam}</span>
                        <span className="text-sm font-mono font-bold text-white mt-0.5">{match.odds.away}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC IA MULTIPLE SLIP GENERATOR VIEW */}
          {activeTab === "multiplas" && (
            <div className="p-4 space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Gerador Inteligente de Múltiplas IA</h2>
                <p className="text-xs text-neutral-400">Selecione suas preferências e deixe nosso superalgoritmo preditivo de IA vasculhar partidas globais para encontrar o valor matemático ideal.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-bold block mb-1.5">Quantidade de Jogos</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="2"
                        max="8"
                        value={genGamesCount}
                        onChange={(e) => setGenGamesCount(parseInt(e.target.value))}
                        className="w-full accent-green-500"
                      />
                      <span className="text-xs font-mono bg-neutral-950 px-2 py-1 rounded text-green-400 font-bold">{genGamesCount}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-bold block mb-1.5">Perfil de Risco IA</label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setGenRiskLevel("conservative")}
                        className={`py-1 text-[10px] font-bold rounded transition-colors ${
                          genRiskLevel === "conservative" ? "bg-green-500 text-black" : "bg-neutral-950 hover:bg-neutral-850"
                        }`}
                      >
                        CONSERVADOR
                      </button>
                      <button
                        onClick={() => setGenRiskLevel("moderate")}
                        className={`py-1 text-[10px] font-bold rounded transition-colors ${
                          genRiskLevel === "moderate" ? "bg-amber-500 text-black" : "bg-neutral-950 hover:bg-neutral-850"
                        }`}
                      >
                        MODERADO
                      </button>
                      <button
                        onClick={() => setGenRiskLevel("aggressive")}
                        className={`py-1 text-[10px] font-bold rounded transition-colors ${
                          genRiskLevel === "aggressive" ? "bg-red-500 text-white animate-pulse" : "bg-neutral-950 hover:bg-neutral-850"
                        }`}
                      >
                        AGRESSIVO
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-bold block mb-1.5">Foco de Mercado</label>
                    <select
                      value={genMarketType}
                      onChange={(e: any) => setGenMarketType(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 text-xs py-1.5 px-2 rounded focus:outline-none focus:border-green-500"
                    >
                      <option value="misto">Múltipla Mista (Recomendado)</option>
                      <option value="gols">Foco em Gols (Over/Under)</option>
                      <option value="vencedor">Apenas Vencedor (1X2)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={triggerMultiGenerator}
                    disabled={isGenerating}
                    className="bg-green-500 hover:bg-green-400 text-neutral-950 font-bold text-xs py-2 px-6 rounded flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGenerating ? "Processando Algoritmo..." : "GERAR MÚLTIPLA ASSISTIDA"}
                  </button>
                </div>
              </div>

              {/* Generating Animation Overlay */}
              {isGenerating && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-10 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-green-500/10 border-t-green-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-amber-500/10 border-b-amber-500 animate-spin [animation-duration:1.5s]"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-green-400 font-mono font-bold uppercase tracking-widest">Motor de IA em Processamento</p>
                    <p className="text-sm font-semibold text-white animate-pulse">{genProgressText}</p>
                  </div>
                </div>
              )}

              {/* Generated Result Container */}
              {generatedSlipResult && !isGenerating && (
                <div className="bg-neutral-900 border border-green-500/30 rounded-lg p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <span className="text-[10px] bg-green-500/15 text-green-500 px-2 py-0.5 rounded font-bold uppercase">
                        BILHETE PREPARADO POR IA
                      </span>
                      <div className="text-xs font-mono text-neutral-400 mt-1">Identificador: {generatedSlipResult.hash}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-500 uppercase block">Risco Estimado</span>
                      <span className={`text-xs font-bold ${
                        generatedSlipResult.risk === "CONSERVADOR" ? "text-green-400" : generatedSlipResult.risk === "MODERADO" ? "text-amber-400" : "text-red-400"
                      }`}>{generatedSlipResult.risk}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {generatedSlipResult.games.map((game: any, idx: number) => (
                      <div key={idx} className="bg-neutral-950 p-2.5 rounded border border-neutral-850 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-semibold text-white">{game.match}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">Mercado: {game.market}</div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-[10px] text-green-500 mr-2">Confiança: {game.confidence}%</span>
                          <span className="bg-neutral-900 px-2 py-0.5 rounded text-white font-bold">@{game.odd}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-neutral-950 p-3 rounded border border-neutral-850 flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-neutral-400">Odd Combinada Total:</span>
                      <div className="text-lg font-bold text-green-400 font-mono">@{generatedSlipResult.odds}</div>
                    </div>
                    <button
                      onClick={addGeneratedToSlip}
                      className="bg-green-500 hover:bg-green-400 text-black font-bold text-xs py-2 px-4 rounded transition-all"
                    >
                      COPIAR PARA BILHETE PRINCIPAL
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* MY BETS HISTORIC TAB VIEW */}
          {activeTab === "minhas_apostas" && (
            <div className="p-4 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Bilhetes Registrados</h2>
              
              <div className="space-y-3">
                {myBets.map((bet) => (
                  <div key={bet.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div className="text-xs">
                        <span className="font-bold text-white mr-2">{bet.id}</span>
                        <span className="text-neutral-500 font-mono text-[10px]">{bet.date}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        bet.status === "won" ? "bg-green-500/10 text-green-400 border border-green-500/20" : bet.status === "lost" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-neutral-800 text-neutral-300"
                      }`}>
                        {bet.status === "won" ? "GANHA" : bet.status === "lost" ? "PERDIDA" : "AGUARDANDO RESULTADOS"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {bet.selections.map((sel, sIdx) => (
                        <div key={sIdx} className="flex justify-between text-xs font-mono">
                          <span className="text-neutral-300">{sel.match}</span>
                          <span className="text-neutral-400">
                            {sel.market} <span className="text-green-400 ml-1">@{sel.odd}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    {bet.status === "pending" && (
                      <div className="bg-neutral-950 p-2 rounded-md border border-neutral-850 flex items-center justify-between gap-3 text-[11px] animate-fade-in">
                        <span className="text-neutral-400 font-medium">Testar Gestão de Risco:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSettleBet(bet.id, "won")}
                            className="bg-green-500/15 hover:bg-green-500/30 text-green-400 font-bold px-2 py-1.5 rounded transition-colors"
                          >
                            Simular Vitória
                          </button>
                          <button
                            onClick={() => handleSettleBet(bet.id, "lost")}
                            className="bg-red-500/15 hover:bg-red-500/30 text-red-400 font-bold px-2 py-1.5 rounded transition-colors"
                          >
                            Simular Derrota
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-850 flex justify-between items-center text-xs">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-neutral-500 block text-[9px]">Valor</span>
                          <span className="font-bold text-white font-mono">R$ {bet.amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[9px]">Odd Combinada</span>
                          <span className="font-bold text-white font-mono">@{bet.oddTotal}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-500 block text-[9px]">Retorno Potencial</span>
                        <span className="font-bold text-green-400 font-mono text-sm">
                          R$ {bet.potentialPayout.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC INTEGRATION: STATISTICAL DASHBOARD IA */}
          {activeTab === "dashboard_ia" && (
            <DashboardIA />
          )}

          {/* DYNAMIC INTEGRATION: ADMINISTRATIVE PLAYGROUND PANEL */}
          {activeTab === "admin" && (
            <PainelAdmin
              matches={matches}
              onRefreshMatches={() => setMatches(SportsService.getMatches())}
            />
          )}

        </div>

        {/* RIGHT PANEL: BILHETE DO DIA & RECENT PROMPTS - HIDDEN ON MOBILE/TABLET, SHOWN ON lg+ */}
        <div className="hidden lg:flex w-80 shrink-0 border-l border-neutral-800 bg-neutral-900/40 p-4 flex-col justify-between overflow-y-auto">
          
          {/* Active Bet Slip (Bilhete do Dia) */}
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-neutral-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-green-500" /> Bilhete de Hoje
                </h3>
                <span className="text-[9px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                  Ativo
                </span>
              </div>

              {betSlip.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 italic space-y-2">
                  <HelpCircle className="w-6 h-6 mx-auto text-neutral-600" />
                  <p>Nenhum palpite selecionado para o bilhete.</p>
                  <p className="text-[10px]">Navegue nas partidas preditas e clique em "Adicionar +"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {betSlip.map((item, idx) => (
                    <div key={idx} className="border-b border-neutral-800 pb-2 flex justify-between items-start text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-neutral-400 font-mono">{item.match.homeTeam} x {item.match.awayTeam}</div>
                        <div className="font-semibold text-white">
                          {item.selection === "home" ? `Vitória ${item.match.homeTeam}` : item.selection === "away" ? `Vitória ${item.match.awayTeam}` : "Empate"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-green-400 font-bold bg-neutral-950 px-1.5 py-0.5 rounded">
                          @{item.odd}
                        </span>
                        <button
                          onClick={() => removeFromSlip(item.match.id)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-400"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 space-y-3">
                    <div className="flex justify-between items-center text-xs text-neutral-300">
                      <span>Valor de Entrada:</span>
                      <div className="flex items-center gap-1.5 w-24">
                        <span className="text-[10px] text-neutral-500">R$</span>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                          className="bg-neutral-950 border border-neutral-850 rounded py-1 px-1.5 text-xs text-white text-right w-full font-mono font-bold focus:outline-none focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setBetAmount(50)}
                        className={`text-[10px] py-1 px-2 rounded border ${betAmount === 50 ? "bg-green-500/15 border-green-500 text-green-400" : "bg-neutral-950 border-neutral-850"}`}
                      >
                        R$50
                      </button>
                      <button
                        onClick={() => setBetAmount(100)}
                        className={`text-[10px] py-1 px-2 rounded border ${betAmount === 100 ? "bg-green-500/15 border-green-500 text-green-400" : "bg-neutral-950 border-neutral-850"}`}
                      >
                        R$100
                      </button>
                      <button
                        onClick={() => setBetAmount(250)}
                        className={`text-[10px] py-1 px-2 rounded border ${betAmount === 250 ? "bg-green-500/15 border-green-500 text-green-400" : "bg-neutral-950 border-neutral-850"}`}
                      >
                        R$250
                      </button>
                      <button
                        onClick={() => setBetAmount(500)}
                        className={`text-[10px] py-1 px-2 rounded border ${betAmount === 500 ? "bg-green-500/15 border-green-500 text-green-400" : "bg-neutral-950 border-neutral-850"}`}
                      >
                        R$500
                      </button>
                    </div>

                    <BankrollManager
                      userBalance={userBalance}
                      betSlip={betSlip}
                      totalOdds={totalOdds}
                      onApplyStake={setBetAmount}
                      currentStake={betAmount}
                    />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Odd Combinada:</span>
                      <span className="font-mono text-green-400 font-bold">@{totalOdds}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-neutral-800/60 pt-2">
                      <span className="text-neutral-300 font-semibold">Retorno Potencial:</span>
                      <span className="font-mono text-green-400 font-bold text-sm">
                        R$ {potentialProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Risk limits feedback indicators */}
                    {isAnyLimitExceeded && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-[10px] text-red-400 flex items-start gap-1.5 leading-tight">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Apostas Bloqueadas</strong>
                          Limite de perdas excedido nas configurações de Gestão de Risco.
                        </div>
                      </div>
                    )}

                    {!isAnyLimitExceeded && isAnyLimitNearLimit && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2 text-[10px] text-amber-400 flex items-start gap-1.5 leading-tight">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Alerta de Risco (80%+)</strong>
                          Você está muito próximo do seu limite de perdas estabelecido.
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={copySlipToClipboard}
                        className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-300 text-xs py-2 rounded flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {hasCopiedSlip ? "Copiado!" : "Copiar Bilhete"}
                      </button>
                      <button
                        onClick={handlePlaceBet}
                        disabled={isAnyLimitExceeded}
                        className={`font-bold text-xs py-2 rounded shadow-md transition-all ${
                          isAnyLimitExceeded
                            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
                            : "bg-green-500 hover:bg-green-400 text-black cursor-pointer"
                        }`}
                      >
                        {isAnyLimitExceeded ? "Bloqueado" : "Registrar Aposta"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Generator Promo Widget */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Múltiplas Assistidas
              </h4>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Deixe a IA analisar milhares de mercados de gols e escanteios para compor o bilhete ideal automaticamente.
              </p>
              <button
                onClick={() => setActiveTab("multiplas")}
                className="w-full bg-green-500 text-neutral-950 font-bold py-1.5 rounded text-xs transition-colors hover:bg-green-400"
              >
                Gerar Múltipla IA
              </button>
            </div>
          </div>

          {/* Quick Informational / Educational Footer */}
          <div className="text-[10px] text-neutral-500 space-y-1.5 mt-4 border-t border-neutral-800/60 pt-3">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3 text-neutral-400" />
              <span>Simulações calculadas via coeficientes de regressão de Poisson em tempo real.</span>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER STATUS BAR */}
      <footer className="h-6 bg-neutral-900 border-t border-neutral-800 px-6 flex items-center justify-between text-[10px] text-neutral-500 shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            Status API: <span className="text-green-500 font-bold">Conectado Football-Data Pro v2.4</span>
          </span>
          <span>•</span>
          <span>Modelo IA: <span className="text-white font-mono">gemini-3.5-flash</span></span>
        </div>
        <div>© 2026 BetVision Pro - Inteligência Artificial Aplicada ao Futebol</div>
      </footer>

      {/* PREMIUM VIP PLAN SIGNUP MODAL */}
      {showVIPModal && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-lg max-w-md w-full p-6 relative space-y-5 animate-scale-up">
            <button
              onClick={() => setShowVIPModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mb-2 border border-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Desbloquear Premium VIP Area</h3>
              <p className="text-xs text-neutral-400">Tenha acesso a palpites de precisão acima de 92% e análise profunda de fluxo asiático de odds em tempo real.</p>
            </div>

            <div className="space-y-3">
              <div className="bg-neutral-950 p-3 rounded border border-neutral-850 space-y-1">
                <div className="text-xs font-bold text-white">Benefícios Exclusivos:</div>
                <ul className="text-[11px] text-neutral-400 space-y-1 pl-4 list-disc">
                  <li>Análise preditiva estendida de 42 parâmetros de Poisson</li>
                  <li>Sinais de arbitragem e surebet asiática</li>
                  <li>Atendimento personalizado direto via consultoria IA</li>
                  <li>Suporte estendido para cartões e escanteios</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-950 p-3 rounded border border-neutral-850 text-center relative group cursor-pointer hover:border-amber-500/30">
                  <div className="text-[10px] text-neutral-500 font-bold uppercase">Mensal VIP</div>
                  <div className="text-lg font-bold text-white mt-1">R$ 49,90</div>
                  <span className="text-[8px] text-neutral-400 block mt-0.5">Cobrança única</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded border border-amber-500/40 text-center relative cursor-pointer bg-amber-500/5">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                    Melhor Valor
                  </div>
                  <div className="text-[10px] text-amber-500 font-bold uppercase mt-1">Semestral VIP</div>
                  <div className="text-lg font-bold text-white mt-1">R$ 199,90</div>
                  <span className="text-[8px] text-neutral-400 block mt-0.5">Economia de 33%</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsVIPSubscriber(true);
                  setShowVIPModal(false);
                  alert("✓ Parabéns! Plano Premium VIP desbloqueado. Você agora tem acesso a todas as partidas preditas e análise estendida!");
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded text-xs transition-all tracking-wider shadow-lg"
              >
                ASSINAR PREMIUM VIP AGORA
              </button>
              <div className="text-center text-[9px] text-neutral-500 mt-2">
                Plano de simulação demonstrativo. Não serão efetuadas cobranças reais.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RISK MANAGEMENT SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <RiskManagementPanel
            limits={riskLimits}
            onChangeLimits={setRiskLimits}
            losses={actualLosses}
            onSimulateLoss={handleSimulateLoss}
            onResetSimulatedLosses={handleResetSimulatedLosses}
            onClose={() => setShowSettingsModal(false)}
          />
        </div>
      )}

      {/* FLOATING MOBILE BET SLIP BUTTON */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowMobileSlip(true)}
          className="bg-green-500 hover:bg-green-400 text-black p-3.5 rounded-full shadow-lg flex items-center justify-center gap-1.5 font-bold relative group border border-green-600 active:scale-95 transition-all"
        >
          <Award className="w-5 h-5" />
          {betSlip.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-neutral-950 animate-bounce">
              {betSlip.length}
            </span>
          )}
          <span className="text-xs">Bilhete</span>
        </button>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden h-16 bg-neutral-900 border-t border-neutral-800 fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 pb-safe">
        <button
          onClick={() => { setActiveTab("dashboard"); setSelectedLeague("all"); }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded transition-colors ${
            activeTab === "dashboard" ? "text-green-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Dashboard</span>
        </button>
        <button
          onClick={() => { setActiveTab("partidas"); setActiveFilter("high_confidence"); }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded transition-colors ${
            activeTab === "partidas" ? "text-green-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Partidas</span>
        </button>
        <button
          onClick={() => { setActiveTab("simulador"); }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded transition-colors ${
            activeTab === "simulador" ? "text-green-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Zap className="w-5 h-5 animate-pulse text-amber-500" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Ao Vivo</span>
        </button>
        <button
          onClick={() => { setActiveTab("multiplas"); }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded transition-colors ${
            activeTab === "multiplas" ? "text-green-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Múltiplas</span>
        </button>
        <button
          onClick={() => { setActiveTab("minhas_apostas"); }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded transition-colors relative ${
            activeTab === "minhas_apostas" ? "text-green-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Histórico</span>
          {myBets.filter(b => b.status === "pending").length > 0 && (
            <span className="absolute top-1 right-2 bg-green-500 text-neutral-950 font-bold text-[8px] px-1 rounded-full">
              {myBets.filter(b => b.status === "pending").length}
            </span>
          )}
        </button>
      </div>

      {/* MOBILE BET SLIP DRAWER OVERLAY */}
      {showMobileSlip && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex flex-col justify-end lg:hidden">
          <div className="bg-neutral-900 border-t border-neutral-800 rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 flex flex-col space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-green-500" /> Seu Bilhete ({betSlip.length})
              </h3>
              <button
                onClick={() => setShowMobileSlip(false)}
                className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {betSlip.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 italic space-y-2">
                <HelpCircle className="w-6 h-6 mx-auto text-neutral-600" />
                <p>Nenhum palpite selecionado para o bilhete.</p>
                <p className="text-[10px]">Navegue nas partidas preditas e clique em "Adicionar +"</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                  {betSlip.map((item, idx) => (
                    <div key={idx} className="border-b border-neutral-800 pb-2.5 flex justify-between items-start text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-neutral-400 font-mono">{item.match.homeTeam} x {item.match.awayTeam}</div>
                        <div className="font-semibold text-white">
                          {item.selection === "home" ? `Vitória ${item.match.homeTeam}` : item.selection === "away" ? `Vitória ${item.match.awayTeam}` : "Empate"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-green-400 font-bold bg-neutral-950 px-1.5 py-0.5 rounded">
                          @{item.odd}
                        </span>
                        <button
                          onClick={() => removeFromSlip(item.match.id)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-400"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex justify-between items-center text-xs text-neutral-300">
                    <span>Valor de Entrada:</span>
                    <div className="flex items-center gap-1.5 w-28">
                      <span className="text-[10px] text-neutral-500">R$</span>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                        className="bg-neutral-950 border border-neutral-850 rounded py-1 px-1.5 text-xs text-white text-right w-full font-mono font-bold focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    <button
                      onClick={() => setBetAmount(50)}
                      className={`text-[10px] py-1 px-3 rounded border shrink-0 ${betAmount === 50 ? "bg-green-500/15 border-green-500 text-green-400 font-bold" : "bg-neutral-950 border-neutral-850"}`}
                    >
                      R$50
                    </button>
                    <button
                      onClick={() => setBetAmount(100)}
                      className={`text-[10px] py-1 px-3 rounded border shrink-0 ${betAmount === 100 ? "bg-green-500/15 border-green-500 text-green-400 font-bold" : "bg-neutral-950 border-neutral-850"}`}
                    >
                      R$100
                    </button>
                    <button
                      onClick={() => setBetAmount(250)}
                      className={`text-[10px] py-1 px-3 rounded border shrink-0 ${betAmount === 250 ? "bg-green-500/15 border-green-500 text-green-400 font-bold" : "bg-neutral-950 border-neutral-850"}`}
                    >
                      R$250
                    </button>
                    <button
                      onClick={() => setBetAmount(500)}
                      className={`text-[10px] py-1 px-3 rounded border shrink-0 ${betAmount === 500 ? "bg-green-500/15 border-green-500 text-green-400 font-bold" : "bg-neutral-950 border-neutral-850"}`}
                    >
                      R$500
                    </button>
                  </div>

                  <BankrollManager
                    userBalance={userBalance}
                    betSlip={betSlip}
                    totalOdds={totalOdds}
                    onApplyStake={setBetAmount}
                    currentStake={betAmount}
                  />

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Odd Combinada:</span>
                    <span className="font-mono text-green-400 font-bold">@{totalOdds}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-neutral-800/60 pt-2">
                    <span className="text-neutral-300 font-semibold">Retorno Potencial:</span>
                    <span className="font-mono text-green-400 font-bold text-sm">
                      R$ {potentialProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                   {/* Risk limits feedback indicators */}
                  {isAnyLimitExceeded && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-[10px] text-red-400 flex items-start gap-1.5 leading-tight">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block">Apostas Bloqueadas</strong>
                        Limite de perdas excedido nas configurações de Gestão de Risco.
                      </div>
                    </div>
                  )}

                  {!isAnyLimitExceeded && isAnyLimitNearLimit && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2 text-[10px] text-amber-400 flex items-start gap-1.5 leading-tight">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block">Alerta de Risco (80%+)</strong>
                        Você está muito próximo do seu limite de perdas estabelecido.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={copySlipToClipboard}
                      className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-300 text-xs py-2.5 rounded flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {hasCopiedSlip ? "Copiado!" : "Copiar Bilhete"}
                    </button>
                    <button
                      onClick={() => {
                        handlePlaceBet();
                        setShowMobileSlip(false);
                      }}
                      disabled={isAnyLimitExceeded}
                      className={`font-bold text-xs py-2.5 rounded shadow-md transition-all ${
                        isAnyLimitExceeded
                          ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
                          : "bg-green-500 hover:bg-green-400 text-black cursor-pointer"
                      }`}
                    >
                      {isAnyLimitExceeded ? "Bloqueado" : "Registrar Aposta"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mock Push Notification Toast Floating Container */}
      <PushNotificationToastContainer 
        toasts={activeToasts} 
        onClose={(id) => setActiveToasts((prev) => prev.filter((t) => t.id !== id))} 
      />

    </div>
  );
}
