import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Layers,
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
  Share2,
  HelpCircle,
  Star,
  BarChart3,
  Globe,
  ShieldCheck,
  Trash2
} from "lucide-react";

import { Match, ChatMessage, BetSlipItem, UserBet, PersonalFilter, AdminLog } from "./types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { SportsService } from "./services/sportsService";
import { AIService } from "./services/aiService";
import { MultiplesService } from "./services/multiplesService";
import DashboardIA from "./pages/DashboardIA";
import { SmartBets } from "./pages/SmartBets";
import PainelAdmin from "./admin/PainelAdmin";
import { ThemeToggle } from "./components/ThemeToggle";
import { UserPreferencesPanel } from "./components/UserPreferencesPanel";
import { DashboardAnimatedHeader } from "./components/DashboardAnimatedHeader";
import { LeagueBadge } from "./components/LeagueBadge";
import { SharePredictionModal } from "./components/SharePredictionModal";
import { TeamShield } from "./components/TeamShield";
import { LiveProbabilityText } from "./components/LiveProbabilityText";
import { BankrollManager } from "./components/BankrollManager";
import { PremiumSaaSModal } from "./components/PremiumSaaSModal";
import { SaaSAuthScreen } from "./components/SaaSAuthScreen";
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

// Helper to generate probability trend data based on match state and seed
const getProbabilityTrendData = (match: Match) => {
  const seed = parseInt(match.id.replace(/\D/g, "") || "42") % 100;
  
  if (match.isLive) {
    const currentMin = match.liveMinute || 0;
    const points: Array<{ minute: string; home: number; draw: number; away: number }> = [];
    
    const hBase = match.probabilities.home;
    const dBase = match.probabilities.draw;
    const aBase = match.probabilities.away;
    
    const intervals = [0, 15, 30, 45, 60, 75, 90];
    intervals.forEach((min) => {
      if (min <= Math.max(currentMin, 15)) {
        const offsetH = Math.sin((min + seed) * 0.1) * 8;
        const offsetA = Math.cos((min + seed) * 0.1) * 8;
        
        let h = Math.max(5, Math.min(90, Math.round(hBase + offsetH)));
        let a = Math.max(5, Math.min(90, Math.round(aBase + offsetA)));
        let d = 100 - h - a;
        if (d < 5) {
          d = 5;
          const total = h + a;
          h = Math.round((h / total) * 95);
          a = 95 - h;
        }
        
        points.push({
          minute: `${min}'`,
          home: h,
          draw: d,
          away: a
        });
      }
    });
    return points;
  } else {
    const hBase = match.probabilities.home;
    const dBase = match.probabilities.draw;
    const aBase = match.probabilities.away;
    
    return [
      {
        minute: "5d atrás",
        home: Math.max(5, Math.min(95, Math.round(hBase + Math.sin(seed) * 5))),
        draw: Math.max(5, Math.min(95, Math.round(dBase + Math.cos(seed) * 3))),
        away: Math.max(5, Math.min(95, Math.round(aBase - Math.sin(seed) * 4)))
      },
      {
        minute: "3d atrás",
        home: Math.max(5, Math.min(95, Math.round(hBase + Math.cos(seed + 1) * 4))),
        draw: Math.max(5, Math.min(95, Math.round(dBase - Math.sin(seed + 1) * 2))),
        away: Math.max(5, Math.min(95, Math.round(aBase + Math.cos(seed + 1) * 3)))
      },
      {
        minute: "1d atrás",
        home: Math.max(5, Math.min(95, Math.round(hBase - Math.sin(seed + 2) * 2))),
        draw: Math.max(5, Math.min(95, Math.round(dBase + Math.cos(seed + 2) * 1))),
        away: Math.max(5, Math.min(95, Math.round(aBase + Math.sin(seed + 2) * 2)))
      },
      {
        minute: "Atual",
        home: hBase,
        draw: dBase,
        away: aBase
      }
    ];
  }
};

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
    const defaults = {
      daily: 500,
      weekly: 2000,
      monthly: 5000,
      enabledDaily: true,
      enabledWeekly: true,
      enabledMonthly: true,
      minBankroll: 500,
      enabledMinBankroll: false
    };
    try {
      const saved = localStorage.getItem("betvision_risk_limits");
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
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

  // Current logged in user (SaaS Authentication & session state)
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    plan: "Free" | "Pro" | "VIP" | "Enterprise";
    avatar: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("betvision_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Centralized Administrative Activity Logs state
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(() => {
    try {
      const saved = localStorage.getItem("betvision_admin_logs");
      return saved ? JSON.parse(saved) : [
        { id: "log_1", action: "CACHE_HIT_LOCAL_STORAGE", user: "SYSTEM", timestamp: "19:42:01", status: "success" },
        { id: "log_2", action: "API_FOOTBALL_CREDENTIALS_VALID", user: "SYSTEM", timestamp: "19:42:04", status: "success" },
        { id: "log_3", action: "SYNCHRONIZED_CLASSIFICATION_STANDINGS", user: "SYSTEM", timestamp: "19:42:05", status: "success" },
        { id: "log_4", action: "AI_MODEL_REASONING_RESPONSE_OK", user: "gemini-2.5-flash", timestamp: "19:43:10", status: "success" },
        { id: "log_5", action: "LOCAL_USER_SESSION_VERIFIED_JWT", user: "Felipe Pires", timestamp: "19:45:12", status: "success" }
      ];
    } catch {
      return [];
    }
  });

  const addAdminLog = (action: string, user: string, status: "success" | "warning" | "error" = "success") => {
    const time = new Date().toLocaleTimeString("pt-BR");
    const newLog: AdminLog = {
      id: "log_" + Math.floor(Math.random() * 90000 + 10000),
      action,
      user,
      timestamp: time,
      status
    };
    setAdminLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem("betvision_admin_logs", JSON.stringify(updated));
      return updated;
    });
  };

  const isVIPSubscriber = currentUser?.plan === "VIP" || currentUser?.plan === "Enterprise" || currentUser?.plan === "Pro";
  const setIsVIPSubscriber = (val: boolean) => {
    if (currentUser) {
      const updated = { ...currentUser, plan: val ? "VIP" as const : "Free" as const };
      setCurrentUser(updated);
      localStorage.setItem("betvision_user", JSON.stringify(updated));
    }
  };
  const [showVIPModal, setShowVIPModal] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

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
  const [shareMatch, setShareMatch] = useState<any | null>(null);
  const [selectedMatchTab, setSelectedMatchTab] = useState<"analise" | "estatisticas" | "ficha">("analise");

  // Dynamic AI generated rationales state
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, string>>({});
  const [isAiAnalysisLoading, setIsAiAnalysisLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedMatch) {
      const matchId = selectedMatch.id;
      if (!aiAnalyses[matchId]) {
        setIsAiAnalysisLoading(true);
        AIService.getAIAnalysis(selectedMatch).then((result) => {
          setAiAnalyses((prev) => ({ ...prev, [matchId]: result }));
          setIsAiAnalysisLoading(false);
        }).catch(() => {
          setIsAiAnalysisLoading(false);
        });
      }
    }
  }, [selectedMatch]);

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

  // Splash Screen & UI States
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashStatusText, setSplashStatusText] = useState<string>("Iniciando conexão neural...");
  const [isBrasileiraoOpen, setIsBrasileiraoOpen] = useState<boolean>(false);
  const [isPremierOpen, setIsPremierOpen] = useState<boolean>(false);
  const [matchAnalysisProgress, setMatchAnalysisProgress] = useState<number>(0);

  // Splash Screen simulation
  useEffect(() => {
    if (!showSplashScreen) return;
    let currentProgress = 0;
    const statusTexts = [
      { limit: 15, text: "Conectando ao banco de dados global..." },
      { limit: 35, text: "Analisando 11.450 partidas do banco de dados..." },
      { limit: 55, text: "Avaliando probabilidades matemáticas neurais..." },
      { limit: 75, text: "Sincronizando boletins de lesões e suspensões..." },
      { limit: 90, text: "Analisando 142 mercados e variações de odds..." },
      { limit: 99, text: "Validando integridade da gestão de risco..." },
      { limit: 100, text: "✔ Sincronização concluída com sucesso!" }
    ];
    
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 6;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setSplashProgress(100);
        setSplashStatusText("✔ Sistema pronto!");
        clearInterval(interval);
        setTimeout(() => {
          setShowSplashScreen(false);
        }, 800);
      } else {
        setSplashProgress(currentProgress);
        const textObj = statusTexts.find(t => currentProgress <= t.limit);
        if (textObj) {
          setSplashStatusText(textObj.text);
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Real-time Match Analysis progress simulation
  useEffect(() => {
    if (selectedMatch) {
      setMatchAnalysisProgress(0);
      let cur = 0;
      const interval = setInterval(() => {
        cur += 20;
        if (cur >= 100) {
          cur = 100;
          clearInterval(interval);
        }
        setMatchAnalysisProgress(cur);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [selectedMatch]);

  // Mobile UI States
  const [showMobileSlip, setShowMobileSlip] = useState<boolean>(false);

  // Dashboard AI Consultant State
  const [dashboardAiAnswer, setDashboardAiAnswer] = useState<string>(
    `🤖 *BetVision AI Copilot* \n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `Olá, José. Boa noite.\n` +
    `Analisei 148 partidas de futebol programadas para hoje.\n\n` +
    `Aqui está o meu diagnóstico de IA:\n` +
    `🟢 **7 apostas seguras** (Taxa de assertividade calculada > 91%)\n` +
    `🟡 **3 apostas de valor** (Variação de odds em assimetria (+EV))\n` +
    `🔴 **2 jogos recomendados para evitar** (Clássicos e alto risco de cartões)\n\n` +
    `Quer que eu monte um bilhete inteligente múltiplo agora mesmo com estas melhores oportunidades?`
  );
  const [isDashboardAiTyping, setIsDashboardAiTyping] = useState<boolean>(false);

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
  const isMinBankrollExceeded = riskLimits.enabledMinBankroll && userBalance <= (riskLimits.minBankroll ?? 500);
  const isAnyLimitExceeded = isDailyExceeded || isWeeklyExceeded || isMonthlyExceeded || isMinBankrollExceeded;

  const isDailyNearLimit = riskLimits.enabledDaily && totalDailyLoss >= riskLimits.daily * 0.8 && totalDailyLoss < riskLimits.daily;
  const isWeeklyNearLimit = riskLimits.enabledWeekly && totalWeeklyLoss >= riskLimits.weekly * 0.8 && totalWeeklyLoss < riskLimits.weekly;
  const isMonthlyNearLimit = riskLimits.enabledMonthly && totalMonthlyLoss >= riskLimits.monthly * 0.8 && totalMonthlyLoss < riskLimits.monthly;
  const isMinBankrollNearLimit = riskLimits.enabledMinBankroll && userBalance > (riskLimits.minBankroll ?? 500) && userBalance <= (riskLimits.minBankroll ?? 500) * 1.2;
  const isAnyLimitNearLimit = isDailyNearLimit || isWeeklyNearLimit || isMonthlyNearLimit || isMinBankrollNearLimit;

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

      // Check minimum bankroll limits explicitly
      if (riskLimits.enabledMinBankroll) {
        const minVal = riskLimits.minBankroll ?? 500;
        
        // 100% block check
        const limitMet100 = userBalance <= minVal;
        const alreadyAlerted100 = lastAlertsRef.current["minBankroll_100"];
        if (limitMet100 && !alreadyAlerted100) {
          triggerPushNotification(
            "🛑 BANCA PROTEGIDA ALCANÇADA",
            `Seu saldo atingiu o valor de banca mínima estipulado de R$ ${minVal.toFixed(2)}. Novas apostas estão bloqueadas para proteger seu capital.`,
            "status"
          );
          lastAlertsRef.current["minBankroll_100"] = true;
        } else if (!limitMet100 && alreadyAlerted100) {
          lastAlertsRef.current["minBankroll_100"] = false;
        }

        // 80% close-to-limit check
        const limitMet80 = userBalance <= minVal * 1.2 && userBalance > minVal;
        const alreadyAlerted80 = lastAlertsRef.current["minBankroll_80"];
        if (limitMet80 && !alreadyAlerted80) {
          triggerPushNotification(
            "⚠️ ALERTA DE BANCA MÍNIMA",
            `Seu saldo de R$ ${userBalance.toFixed(2)} está muito próximo do limite de banca mínima de R$ ${minVal.toFixed(2)}.`,
            "probability"
          );
          lastAlertsRef.current["minBankroll_80"] = true;
        } else if (!limitMet80 && alreadyAlerted80) {
          lastAlertsRef.current["minBankroll_80"] = false;
        }
      }
    };

    checkLimits();
  }, [totalDailyLoss, totalWeeklyLoss, totalMonthlyLoss, riskLimits, userBalance]);

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
    if (riskLimits.enabledMinBankroll && userBalance <= (riskLimits.minBankroll ?? 500)) {
      alert(`🛑 Aposta Bloqueada: Banca Mínima de Segurança Atingida (R$ ${(riskLimits.minBankroll ?? 500).toFixed(2)}). Seu saldo atual é de R$ ${userBalance.toFixed(2)}.`);
      return;
    }
    if (riskLimits.enabledMinBankroll && (userBalance - betAmount) < (riskLimits.minBankroll ?? 500)) {
      alert(`🛑 Aposta Bloqueada: Esta aposta faria seu saldo cair para R$ ${(userBalance - betAmount).toFixed(2)}, abaixo da sua Banca Mínima de Segurança configurada de R$ ${(riskLimits.minBankroll ?? 500).toFixed(2)}.`);
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

  // Copy Ticket detailed information for betting suggestions sharing
  const copySlipToClipboard = () => {
    if (betSlip.length === 0) return;
    
    let text = "🎯 *BILHETE DE HOJE - BETVISION PRO* 🎯\n";
    text += "🤖 _Palpites esportivos gerados por Inteligência Artificial_\n\n";
    
    betSlip.forEach((item, idx) => {
      const selectionText = item.selection === "home" 
        ? `Vitória ${item.match.homeTeam}` 
        : item.selection === "away" 
          ? `Vitória ${item.match.awayTeam}` 
          : "Empate";
      
      text += `${idx + 1}. ⚽ *${item.match.homeTeam} x ${item.match.awayTeam}*\n`;
      text += `   📍 Palpite Recomendado: *${selectionText}*\n`;
      text += `   📈 Cotação da IA: @${item.odd}\n\n`;
    });
    
    text += `📊 *Odd Acumulada Final:* @${totalOdds}\n`;
    text += `💰 *Aposta Recomendada:* R$ ${betAmount}\n`;
    text += `🔮 *Retorno Projetado:* R$ ${(betAmount * totalOdds).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n`;
    text += "👉 _Copie estas dicas e monte seu bilhete na sua plataforma preferida!_\n";
    text += "⚠️ _Aposte sempre com responsabilidade e controle de banca._";

    navigator.clipboard.writeText(text).then(() => {
      setHasCopiedSlip(true);
      setTimeout(() => setHasCopiedSlip(false), 2500);
    });
  };

  const [hasSharedSlip, setHasSharedSlip] = useState<boolean>(false);

  // Generate a snapshot of the current betting slip and share it directly via a native browser share API
  const shareSlipViaWebAPI = () => {
    if (betSlip.length === 0) return;
    
    let text = "🎯 *BILHETE DE HOJE - BETVISION PRO* 🎯\n";
    text += "🤖 _Palpites gerados por IA em tempo real_\n\n";
    
    betSlip.forEach((item, idx) => {
      const selectionText = item.selection === "home" 
        ? `Vitória ${item.match.homeTeam}` 
        : item.selection === "away" 
          ? `Vitória ${item.match.awayTeam}` 
          : "Empate";
      
      text += `${idx + 1}. ⚽ *${item.match.homeTeam} x ${item.match.awayTeam}*\n`;
      text += `   📍 Palpite: *${selectionText}*\n`;
      text += `   📈 Odd: @${item.odd}\n\n`;
    });
    
    text += `📊 *Odd Total:* @${totalOdds}\n`;
    text += `💰 *Stake:* R$ ${betAmount}\n`;
    text += `🔮 *Retorno:* R$ ${(betAmount * totalOdds).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n`;
    text += "⚠️ _Aposte com responsabilidade._";

    const shareData = {
      title: "Bilhete BetVision Pro",
      text: text,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          setHasSharedSlip(true);
          triggerPushNotification(
            "Compartilhamento Realizado",
            "Bilhete enviado com sucesso utilizando o compartilhamento nativo do seu dispositivo! 🚀",
            "info"
          );
          addAdminLog("BETSLIP_SHARED_NATIVELY", currentUser?.name || "SYSTEM", "success");
          setTimeout(() => setHasSharedSlip(false), 2500);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Erro ao compartilhar", err);
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
              setHasCopiedSlip(true);
              triggerPushNotification(
                "Copiado para Área de Transferência",
                "Seu bilhete foi copiado com sucesso! Compartilhe onde desejar.",
                "info"
              );
              setTimeout(() => setHasCopiedSlip(false), 2500);
            });
          }
        });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        setHasCopiedSlip(true);
        triggerPushNotification(
          "Copiado para Área de Transferência",
          "Compartilhamento nativo indisponível. Bilhete de palpites copiado com sucesso!",
          "info"
        );
        setTimeout(() => setHasCopiedSlip(false), 2500);
      });
    }
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

  if (!currentUser) {
    return (
      <SaaSAuthScreen 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem("betvision_user", JSON.stringify(user));
          triggerPushNotification(
            "Sessão Iniciada",
            `Seja bem-vindo ao BetVision Pro, ${user.name}! Token JWT assinado e autenticado com sucesso.`,
            "status"
          );
        }}
        addLog={addAdminLog}
      />
    );
  }

  if (showSplashScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#14181f] text-white font-sans p-6 z-50">
        <div className="max-w-md w-full space-y-8 text-center animate-fade-in">
          {/* Logo Brand with a sleek pulse gold/green glow */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#00D26A] to-[#00A94E] rounded-2xl flex items-center justify-center font-black text-black text-2xl shadow-[0_0_40px_rgba(0,210,106,0.3)] animate-pulse">
              BV
            </div>
            <h1 className="text-3xl font-black tracking-widest text-white mt-2">
              BETVISION<span className="text-[#00D26A]">PRO</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-neutral-450 font-bold font-mono">
              SISTEMA COGNITIVO DE PREDIÇÕES ESPORTIVAS
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-3 pt-6">
            <div className="flex justify-between items-center text-xs text-neutral-450 font-mono">
              <span className="animate-pulse font-semibold text-[#00D26A]">IA Carregando...</span>
              <span className="font-bold text-white">{splashProgress}%</span>
            </div>
            
            {/* The actual progress bar */}
            <div className="w-full bg-neutral-900/80 h-2 rounded-full border border-neutral-800 p-0.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#00D26A] to-[#00A94E] h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(0,210,106,0.6)]" 
                style={{ width: `${splashProgress}%` }}
              ></div>
            </div>

            {/* Cyberpunk Progress Block Indicators [█████████░] */}
            <div className="font-mono text-[10px] text-neutral-500 tracking-wider">
              {"["}
              <span className="text-[#00D26A]">
                {"█".repeat(Math.round(splashProgress / 10))}
              </span>
              <span className="text-neutral-800">
                {"░".repeat(10 - Math.round(splashProgress / 10))}
              </span>
              {"]"}
            </div>
          </div>

          {/* System Scan Scrolling Log Cards */}
          <div className="bg-[#1b212b] border border-neutral-800/80 p-4 rounded-xl text-left space-y-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.35)] relative overflow-hidden min-h-[140px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="text-[10px] text-neutral-450 font-mono uppercase font-bold tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-1.5">
              <span className="h-1.5 w-1.5 bg-[#00D26A] rounded-full animate-ping"></span>
              Sincronização de Redes Neurais
            </div>
            <div className="space-y-1 font-mono text-[10px] leading-relaxed text-neutral-300">
              <div className="flex items-center gap-1.5">
                <span className="text-green-500">{splashProgress >= 15 ? "✔" : "⚡"}</span>
                <span>Análise de base histórica: 11.000 partidas de futebol</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-green-500">{splashProgress >= 55 ? "✔" : "⚡"}</span>
                <span>Mapeamento de probabilidades e desvios de odds (+EV)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-green-500">{splashProgress >= 75 ? "✔" : "⚡"}</span>
                <span>Verificação de boletins de desfalques & lesões</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-green-500">{splashProgress >= 90 ? "✔" : "⚡"}</span>
                <span>Mapeamento de escalações prováveis e táticas</span>
              </div>
            </div>
          </div>

          {/* Loading status details text */}
          <p className="text-[11px] text-[#00D26A] font-mono h-4">
            {splashStatusText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#14181f] text-neutral-200 font-sans overflow-hidden">
      
      {/* TOP NAVIGATION BAR */}
      <header className="h-12 border-b border-neutral-800/60 bg-[#1b212b] flex items-center justify-between px-4 md:px-6 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-4 md:gap-8 h-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-[#00D26A] to-[#00A94E] rounded flex items-center justify-center font-bold text-black text-xs shrink-0 shadow">BV</div>
            <span className="text-xs sm:text-sm font-black tracking-widest text-white">
              BETVISION<span className="text-[#00D26A]">PRO</span>
            </span>
          </div>
          <nav className="hidden lg:flex gap-1.5 text-[11px] font-semibold h-full items-center">
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedLeague("all"); }}
              className={`px-3 py-1 rounded-md transition-all relative cursor-pointer ${
                activeTab === "dashboard" ? "bg-green-500/10 text-[#00D26A] border border-green-500/20" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              Dashboard IA
              {activeTab === "dashboard" && <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00D26A] rounded-full"></span>}
            </button>
            <button
              onClick={() => { setActiveTab("partidas"); setActiveFilter("high_confidence"); }}
              className={`px-3 py-1 rounded-md transition-all relative cursor-pointer ${
                activeTab === "partidas" ? "bg-green-500/10 text-[#00D26A] border border-green-500/20" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              Partidas Preditas
              {activeTab === "partidas" && <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00D26A] rounded-full"></span>}
            </button>
            <button
              onClick={() => { setActiveTab("simulador"); }}
              className={`px-3 py-1 rounded-md transition-all relative flex items-center gap-1.5 cursor-pointer ${
                activeTab === "simulador" ? "bg-green-500/10 text-[#00D26A] border border-green-500/20" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              <Zap className="w-3 h-3 animate-pulse text-amber-500" /> Live Tracker
              {activeTab === "simulador" && <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00D26A] rounded-full"></span>}
            </button>
            <button
              onClick={() => { setActiveTab("smart_bets"); }}
              className={`px-3 py-1 rounded-md transition-all relative flex items-center gap-1 cursor-pointer ${
                activeTab === "smart_bets" ? "bg-green-500/10 text-[#00D26A] border border-green-500/20" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              <Sparkles className="w-3 h-3" /> Sugestões IA
              {activeTab === "smart_bets" && <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00D26A] rounded-full"></span>}
            </button>
            <button
              onClick={() => { setActiveTab("multiplas"); }}
              className={`px-3 py-1 rounded-md transition-all relative cursor-pointer ${
                activeTab === "multiplas" ? "bg-green-500/10 text-[#00D26A] border border-green-500/20" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              Múltiplas Assistidas
              {activeTab === "multiplas" && <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00D26A] rounded-full"></span>}
            </button>
            <button
              onClick={() => { setActiveTab("dashboard_ia"); }}
              className={`px-3 py-1 rounded-md transition-all relative cursor-pointer ${
                activeTab === "dashboard_ia" ? "bg-green-500/10 text-[#00D26A] border border-green-500/20" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              Estatísticas IA
              {activeTab === "dashboard_ia" && <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00D26A] rounded-full"></span>}
            </button>
            <button
              onClick={() => { setActiveTab("admin"); }}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1 text-red-400 hover:text-red-350 border border-neutral-800 hover:border-red-500/20 ${
                activeTab === "admin" ? "bg-red-500 text-white font-semibold" : ""
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Admin
            </button>
            <button
              onClick={() => { setActiveTab("configuracoes"); }}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === "configuracoes" ? "bg-green-500 text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Configurações
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
          
          <div className="bg-neutral-800/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs border border-neutral-700 flex items-center gap-1.5 sm:gap-2 text-white">
            <Sparkles className="w-3.5 h-3.5 text-green-400" />
            <span className="text-neutral-400 hidden sm:inline">Assertividade IA:</span>
            <span className="text-green-400 font-mono font-bold">88.4% Win Rate</span>
          </div>
          
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded text-xs transition-colors cursor-pointer font-bold"
            title="Gestão de Risco de Perdas"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Gestão de Risco</span>
          </button>

          <ThemeToggle />

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center font-bold text-neutral-950 text-xs shrink-0 hover:ring-2 hover:ring-green-400 transition-all cursor-pointer overflow-hidden"
              title="Configurações do Perfil"
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase()
              )}
            </button>

            {/* PROFILE DROPDOWN MENU */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-4 z-40 text-left space-y-4 animate-fade-in backdrop-blur-md">
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 overflow-hidden shrink-0">
                    {currentUser.avatar && (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate mt-1 leading-none">{currentUser.email}</p>
                  </div>
                </div>

                <div className="space-y-1 bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Minha Assinatura</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      currentUser.plan === "VIP" 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                        : currentUser.plan === "Enterprise"
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : currentUser.plan === "Pro"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                    }`}>
                      {currentUser.plan === "Free" ? "Free Tier" : `${currentUser.plan} Plan`}
                    </span>
                    <button 
                      onClick={() => { setShowVIPModal(true); setShowProfileMenu(false); }}
                      className="text-[10px] text-green-400 hover:text-green-350 font-bold transition-colors underline cursor-pointer bg-transparent border-none"
                    >
                      {currentUser.plan === "Free" ? "Fazer Upgrade" : "Gerenciar"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors font-medium flex items-center gap-2 cursor-pointer bg-transparent border-none"
                  >
                    <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                    Gestão de Risco & Limites
                  </button>

                  <button
                    onClick={() => { setActiveTab("configuracoes"); setShowProfileMenu(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-800 transition-colors font-medium flex items-center gap-2 cursor-pointer bg-transparent border-none ${
                      activeTab === "configuracoes" ? "text-green-400 font-bold" : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    Preferências do Sistema
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      try {
                        const exportData = {
                          platform: "BetVision Pro",
                          timestamp: new Date().toISOString(),
                          user: {
                            name: currentUser.name,
                            email: currentUser.email,
                            plan: currentUser.plan
                          },
                          cookiesConsent: "Accepted",
                          dataRetention: "GDPR & LGPD Compliant",
                          activityLogs: adminLogs.filter(l => l.user === currentUser.name)
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `betvision_dados_${currentUser.name.toLowerCase().replace(/\s+/g, "_")}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        triggerPushNotification(
                          "Dados Exportados",
                          "Seus dados em conformidade com a LGPD foram exportados em JSON com sucesso.",
                          "info"
                        );
                      } catch (err) {
                        alert("Ocorreu um erro ao exportar seus dados.");
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors font-medium flex items-center gap-2 cursor-pointer bg-transparent border-none"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                    Exportar Meus Dados (LGPD)
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("ATENÇÃO: Deseja realmente excluir sua conta de forma definitiva? Todos os seus dados, bilhetes e logs serão excluídos permanentemente de nossos servidores, de acordo com a LGPD.")) {
                        setShowProfileMenu(false);
                        localStorage.removeItem("betvision_user");
                        localStorage.removeItem("betvision_admin_logs");
                        setCurrentUser(null);
                        alert("Sua conta foi excluída definitivamente. Todos os seus dados de sessão foram expurgados.");
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors font-medium flex items-center gap-2 cursor-pointer bg-transparent border-none"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    Excluir Minha Conta (LGPD)
                  </button>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      localStorage.removeItem("betvision_user");
                      setCurrentUser(null);
                      triggerPushNotification(
                        "Sessão Encerrada",
                        "Você foi desconectado. Faça login novamente para reativar seu painel de IA.",
                        "info"
                      );
                    }}
                    className="text-xs text-neutral-400 hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none"
                  >
                    Sair da Conta (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
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
                  onClick={() => {
                    setSelectedLeague("Brasileirão");
                    setIsBrasileiraoOpen(!isBrasileiraoOpen);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded transition-all cursor-pointer ${
                    selectedLeague === "Brasileirão" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-[9px] text-neutral-500 inline-block transition-transform duration-200" style={{ transform: isBrasileiraoOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                    Brasileirão
                  </span>
                  <span className="text-xs bg-neutral-800 px-1.5 rounded">
                    {matches.filter(m => m.league === "Brasileirão").length}
                  </span>
                </button>
                {isBrasileiraoOpen && (
                  <div className="pl-3.5 pr-1 py-1 space-y-1 border-l border-neutral-800 ml-3 animate-fade-in text-[11px] flex flex-col items-start w-full">
                    {[
                      "Série A",
                      "Série B",
                      "Copa do Brasil",
                      "Feminino",
                      "Sub-20"
                    ].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedLeague("Brasileirão");
                          triggerPushNotification(
                            "Filtro de Campeonato",
                            `Filtrando estatísticas avançadas do Brasileirão ${sub} via rede neural.`,
                            "info"
                          );
                        }}
                        className="w-full text-left py-0.5 text-neutral-400 hover:text-green-400 transition-colors flex justify-between items-center cursor-pointer bg-transparent border-none"
                      >
                        <span>• {sub}</span>
                        <span className="text-[9px] bg-neutral-900/40 text-neutral-500 px-1 rounded">IA</span>
                      </button>
                    ))}
                  </div>
                )}
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
            <div className="p-4 space-y-6">
              
              {/* DYNAMIC ANIMATED HEADER WITH DUAL THEME CONTRAST & VIDEOS */}
              <DashboardAnimatedHeader />

              {/* HIERARQUIA VISUAL - TOPO: METRICAS E SALDO */}
              <div className="space-y-2">
                <h3 className="text-[10px] uppercase text-neutral-400 font-extrabold tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                  1. Desempenho Global & Carteira (Topo)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Assertividade */}
                  <div className="bg-neutral-900/95 p-4 rounded-xl border border-neutral-800 relative overflow-hidden group hover:border-green-500/30 transition-all shadow-lg">
                    <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1 flex justify-between">
                      <span>Assertividade IA</span>
                      <span className="text-green-500 font-mono font-bold">+1.2%</span>
                    </div>
                    <div className="text-2xl font-extrabold text-green-500 tracking-tight flex items-baseline gap-1">
                      89.4%
                      <span className="text-[10px] text-neutral-400 font-normal">taxa global</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">Alta consistência baseada em modelos matemáticos refinados.</p>
                    <div className="w-full bg-neutral-800 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-green-500 h-1 rounded-full" style={{ width: "89.4%" }}></div>
                    </div>
                  </div>

                  {/* Card 2: ROI */}
                  <div className="bg-neutral-900/95 p-4 rounded-xl border border-neutral-800 hover:border-green-500/30 transition-all shadow-lg">
                    <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1 flex justify-between">
                      <span>Retorno s/ Investimento</span>
                      <span className="text-green-400 font-bold text-[10px] font-mono">Consistente</span>
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      +24.2%
                      <span className="text-[10px] text-neutral-400 font-normal ml-1">Média (30d)</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">Valor esperado positivo (+EV) sustentado em longo prazo.</p>
                    <div className="w-full bg-neutral-800 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-green-400 h-1 rounded-full" style={{ width: "74%" }}></div>
                    </div>
                  </div>

                  {/* Card 3: Lucro Estimado */}
                  <div className="bg-neutral-900/95 p-4 rounded-xl border border-neutral-800 hover:border-green-500/30 transition-all shadow-lg">
                    <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1">Lucro Estimado</div>
                    <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
                      R$ 4.821,00
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">Projeção estimada para o fechamento do período mensal.</p>
                    <div className="text-[9px] text-neutral-400 mt-3 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Projeção baseada em aportes padrão de R$ 500
                    </div>
                  </div>

                  {/* Card 4: Saldo Disponível (Com Controles Simulados interativos) */}
                  <div className="bg-neutral-900/95 p-4 rounded-xl border border-neutral-800 hover:border-green-500/30 transition-all shadow-lg relative">
                    <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1 flex justify-between">
                      <span>Saldo em Banca</span>
                      {riskLimits.enabledMinBankroll && (
                        <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 rounded font-bold font-mono">
                          Mínimo: R$ {riskLimits.minBankroll}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
                      R$ {userBalance.toFixed(2)}
                    </div>
                    
                    {/* Interactive Balance Simulation Controls */}
                    <div className="mt-2.5 flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-lg border border-neutral-850">
                      <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold block flex-1">Simular banca:</span>
                      <button
                        onClick={() => setUserBalance((prev) => parseFloat((prev - 50).toFixed(2)))}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 transition-colors"
                        title="Sacar / Reduzir R$ 50 para simular risco"
                      >
                        - R$ 50
                      </button>
                      <button
                        onClick={() => setUserBalance((prev) => parseFloat((prev + 50).toFixed(2)))}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/20 transition-colors"
                        title="Depositar / Aumentar R$ 50"
                      >
                        + R$ 50
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTRAL DE INTELIGÊNCIA ARTIFICIAL - COPILOT (BETVISION AI) */}
              <div className="bg-gradient-to-r from-[#1c222e] via-[#12161f] to-[#1a1f29] border border-neutral-850 rounded-2xl p-5 md:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)] relative overflow-hidden group">
                {/* Background radial glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#00D26A]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#00D26A]/8 transition-all duration-700"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="relative flex flex-col xl:flex-row gap-5 items-start justify-between">
                  <div className="space-y-3.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D26A] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D26A]"></span>
                      </span>
                      <h4 className="text-xs font-black tracking-widest text-[#00D26A] uppercase font-mono flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#00D26A]" /> BetVision AI Copilot
                      </h4>
                      <span className="text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-400 px-2.5 py-0.5 rounded-full font-bold font-mono">
                        v2.5 Live
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                        Olá, {currentUser?.name || "Apostador"}. Bom dia!
                      </h3>
                      <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
                        Analisei <span className="text-white font-extrabold font-mono">427 partidas</span> das próximas 48 horas nas principais ligas internacionais. Identifiquei anomalias de valor estatístico e consolidei os seguintes pareceres:
                      </p>
                    </div>

                    {/* Status grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1.5">
                      <div className="bg-[#131722]/60 border border-neutral-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-neutral-700/60 transition-all">
                        <span className="text-[9px] uppercase font-black tracking-wider text-neutral-500 font-mono">Alta Confiança</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-black text-emerald-400 font-mono">12</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">&gt;90%</span>
                        </div>
                      </div>
                      <div className="bg-[#131722]/60 border border-neutral-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-neutral-700/60 transition-all">
                        <span className="text-[9px] uppercase font-black tracking-wider text-neutral-500 font-mono">Valor Positivo</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-black text-amber-400 font-mono">18</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">+EV</span>
                        </div>
                      </div>
                      <div className="bg-[#131722]/60 border border-neutral-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-neutral-700/60 transition-all">
                        <span className="text-[9px] uppercase font-black tracking-wider text-neutral-500 font-mono">Reduzir / Evitar</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-black text-red-400 font-mono">9</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Risco</span>
                        </div>
                      </div>
                      <div className="bg-[#131722]/60 border border-neutral-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-neutral-700/60 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[7px] font-black tracking-widest px-1 py-0.5 rounded-bl uppercase">VIP</div>
                        <span className="text-[9px] uppercase font-black tracking-wider text-neutral-500 font-mono">Exclusivo VIP</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-black text-purple-400 font-mono">5</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Premium</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      Última análise de redes neurais concluída há 2 minutos.
                    </div>
                  </div>

                  {/* Interactive Buttons block */}
                  <div className="w-full xl:w-auto xl:self-stretch flex flex-col justify-center gap-2.5 shrink-0 pt-3 xl:pt-0">
                    <button
                      onClick={() => {
                        // Generate smart bet slip
                        const topMatches = matches.filter(m => m.iaConfidence >= 88).slice(0, 3);
                        if (topMatches.length > 0) {
                          const newItems = topMatches.map(m => ({
                            match: m,
                            selection: "home" as const,
                            odd: m.odds.home
                          }));
                          setBetSlip(newItems);
                          // Notification
                          setNotifications(prev => [{
                            id: "smart_" + Date.now(),
                            title: "Múltipla IA Gerada! 🚀",
                            message: `${topMatches.length} seleções com excelente valor esperado (+EV) inseridas no seu bilhete.`,
                            timestamp: "Agora",
                            isRead: false,
                            type: "success"
                          }, ...prev]);
                        }
                      }}
                      className="w-full xl:w-56 bg-gradient-to-r from-emerald-500 to-[#00D26A] hover:brightness-110 text-neutral-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-[0_4px_20px_rgba(0,210,106,0.25)] hover:shadow-[0_4px_30px_rgba(0,210,106,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-neutral-950" />
                      Gerar Bilhete Inteligente
                    </button>
                    <button
                      onClick={() => {
                        // Switch tab to Suggestões IA
                        setActiveTab("smart_bets");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full xl:w-56 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800/80 hover:border-neutral-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-[#00D26A]" />
                      Conversar com a IA
                    </button>
                    <button
                      onClick={() => {
                        // Set filter to High Confidence
                        setActiveFilter("high_confidence");
                        // Scroll to the next partidas
                        const el = document.getElementById("proximas-partidas");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="w-full xl:w-56 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800/80 hover:border-neutral-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      Ver Melhores Oportunidades
                    </button>
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
              <div id="proximas-partidas" className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-neutral-850">
                  <div className="space-y-0.5">
                    <h3 className="text-[10px] uppercase text-neutral-400 font-extrabold tracking-widest flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                      2. Próximas Partidas em Destaque
                    </h3>
                    <p className="text-[11px] text-neutral-500">Selecione resultados para copiar diretamente para o seu bilhete ativo.</p>
                  </div>
                  
                  {/* Search and interactive league filter */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Pesquisar times ou ligas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-green-500 w-48 sm:w-60"
                      />
                    </div>
                    <select
                      value={selectedLeague}
                      onChange={(e) => setSelectedLeague(e.target.value)}
                      className="bg-neutral-900 border border-neutral-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-green-500 text-neutral-300 font-semibold"
                    >
                      <option value="all">Todas as Ligas</option>
                      <option value="Brasileirão">Brasileirão</option>
                      <option value="Premier League">Premier League</option>
                      <option value="Libertadores">Libertadores</option>
                      <option value="La Liga">La Liga</option>
                    </select>
                  </div>
                </div>

                {/* Sub-Filters for fast categorizing */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "high_confidence", name: "Maior Confiança (>88%)" },
                    { id: "favorites", name: "Favoritos (<1.60)" },
                    { id: "over_gols", name: "Over Gols" },
                    { id: "btts", name: "Ambas Marcam" },
                    { id: "vip", name: "★ VIP Exclusivo" },
                    { id: "all", name: "Ver Todas" }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0 ${
                        activeFilter === filter.id
                          ? "bg-green-500 text-black border-green-500 font-extrabold"
                          : "bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>

                {/* Grid layout for match list and detail drawer */}
                <div className="flex flex-col xl:flex-row gap-4">
                  
                  {/* Match Cards List */}
                  <div className="flex-1 space-y-4">
                    {filteredMatches.length === 0 ? (
                      <div className="bg-[#1b212b] border border-neutral-800/80 rounded-2xl p-10 text-center text-neutral-400 text-xs shadow-inner">
                        Nenhuma partida predita corresponde aos filtros selecionados.
                      </div>
                    ) : (
                      filteredMatches.map((match, index) => {
                        const isLocked = match.isVIP && !isVIPSubscriber;
                        return (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.05, 0.4) }}
                            whileHover={{ y: -5, scale: 1.006 }}
                            className={`bg-gradient-to-br from-[#1c222e] to-[#12161f] border ${
                              selectedMatch?.id === match.id 
                                ? "border-[#00D26A] shadow-[0_16px_44px_rgba(0,210,106,0.14)]" 
                                : "border-neutral-800/90 hover:border-neutral-700 shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
                            } rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all duration-300 ease-out`}
                          >
                            {isLocked && (
                              <div className="absolute inset-0 bg-gradient-to-br from-[#12161f]/98 via-[#1c222e]/99 to-[#12161f]/98 backdrop-blur-[3px] flex items-center justify-center z-20 p-5">
                                <div className="text-center space-y-4 max-w-xs animate-fade-in">
                                  <div className="flex items-center justify-center gap-1.5 text-amber-500 text-xs drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] font-bold">
                                    ★ ★ ★ ★ ★ <span className="text-amber-400 font-black ml-1.5 text-[11px] tracking-widest">IA PREMIUM PRO</span>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-neutral-300 font-extrabold text-xs uppercase tracking-widest">Predição Exclusiva</p>
                                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)] font-mono">
                                      {match.iaConfidence}%
                                    </div>
                                    <p className="text-[10px] text-neutral-400 font-semibold font-mono">
                                      Valor Esperado: <span className="text-amber-400 font-extrabold">+{((match.odds.home + match.odds.away) * 3.5).toFixed(1)}% (+EV)</span>
                                    </p>
                                  </div>
                                  <p className="text-[10px] text-neutral-400 leading-relaxed px-5">
                                    Acesse palpites de alta assertividade gerados por redes neurais exclusivas.
                                  </p>
                                  <button
                                    onClick={() => setShowVIPModal(true)}
                                    className="w-full py-2.5 px-6 rounded-full font-black text-[10px] uppercase tracking-widest text-black bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:shadow-[0_0_30px_rgba(245,158,11,0.65)]"
                                  >
                                    Desbloquear Palpite VIP
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Left part: Teams with beautiful Club Shields */}
                            <div className="w-full md:w-5/12 lg:w-4/12 shrink-0 border-b md:border-b-0 md:border-r border-neutral-800/80 pb-5 md:pb-0 md:pr-6 flex flex-col justify-between space-y-4">
                              <div>
                                <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between gap-2 mb-3.5">
                                  <div className="flex items-center gap-2">
                                    <LeagueBadge league={match.league} isLive={match.isLive} />
                                    <span className="text-neutral-750">•</span>
                                    <span className={`font-mono text-[10px] ${match.isLive ? "text-[#00D26A] font-black animate-pulse flex items-center gap-1" : "text-neutral-450 font-semibold"}`}>
                                      {match.isLive && <span className="w-1.5 h-1.5 bg-[#00D26A] rounded-full inline-block animate-ping"></span>}
                                      {match.isLive ? `LIVE ${match.liveMinute}'` : `${match.date}, ${match.time}`}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(match.id);
                                    }}
                                    className="text-neutral-500 hover:text-amber-400 p-2 rounded-full hover:bg-neutral-800/40 transition-all active:scale-90 relative z-20"
                                    title={match.isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                                  >
                                    <Star className={`w-4 h-4 ${match.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                                  </button>
                                </div>

                                {/* Club Shields & Custom Labels replacing initials */}
                                <div className="space-y-3.5 pt-1">
                                  <div className="flex items-center justify-between gap-2 text-xs text-white">
                                    <div className="flex items-center gap-2.5 truncate">
                                      <TeamShield teamName={match.homeTeam} size="sm" />
                                      <span className="font-extrabold tracking-tight text-white/95 text-[13px] truncate">{match.homeTeam}</span>
                                    </div>
                                    <span className="text-[9px] bg-neutral-900/60 border border-neutral-800/40 text-neutral-450 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">MANDANTE</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 text-xs text-white">
                                    <div className="flex items-center gap-2.5 truncate">
                                      <TeamShield teamName={match.awayTeam} size="sm" />
                                      <span className="font-extrabold tracking-tight text-white/95 text-[13px] truncate">{match.awayTeam}</span>
                                    </div>
                                    <span className="text-[9px] bg-neutral-900/60 border border-neutral-800/40 text-neutral-450 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">VISITANTE</span>
                                  </div>
                                </div>
                              </div>

                              {/* Technical Instrument IA Block */}
                              <div className="flex flex-col gap-1.5 bg-[#131722]/60 p-2.5 rounded-xl border border-neutral-800/50">
                                <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-wider text-neutral-400">
                                  <span className="flex items-center gap-1.5 text-neutral-350">
                                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D26A] opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00D26A]"></span>
                                    </span>
                                    PREDIÇÃO DA IA
                                  </span>
                                  <span className="text-[#00D26A] font-extrabold font-mono text-[11px]">{match.iaConfidence}% CONFIDENCIALIDADE</span>
                                </div>
                                <div className="relative w-full bg-neutral-900 h-2 rounded-full overflow-hidden p-0.5 border border-neutral-800/60">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 via-[#00D26A] to-[#00A94E] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(0,210,106,0.6)]" 
                                    style={{ width: `${match.iaConfidence}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Right part: Predict & Actions */}
                            <div className="flex-1 flex flex-col justify-between space-y-5">
                              
                              {/* Probabilities strip */}
                              <div className="grid grid-cols-3 gap-3.5 text-center">
                                <button
                                  onClick={() => addToBetSlip(match, "home", match.odds.home)}
                                  className="bg-[#131722]/50 hover:bg-[#1b2230] border border-neutral-800/60 hover:border-neutral-600 p-3 rounded-2xl transition-all duration-200 flex flex-col items-center justify-between gap-1 cursor-pointer active:scale-95 group/odd"
                                >
                                  <span className="text-[9.5px] text-neutral-450 uppercase font-mono font-black tracking-widest text-center truncate w-full group-hover/odd:text-neutral-300">1 ({match.homeTeam.substring(0,3)})</span>
                                  <div className="flex flex-col sm:flex-row justify-between items-center w-full mt-1.5 gap-1 pt-1 border-t border-neutral-800/30">
                                    <span className="text-sm font-black font-mono text-white group-hover/odd:text-[#00D26A] transition-colors">@{match.odds.home}</span>
                                    <span className="text-[10px] text-green-500 font-mono font-extrabold bg-[#00D26A]/5 px-2 py-0.5 rounded-full border border-[#00D26A]/10">{match.probabilities.home}%</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => addToBetSlip(match, "draw", match.odds.draw)}
                                  className="bg-[#131722]/50 hover:bg-[#1b2230] border border-neutral-800/60 hover:border-neutral-600 p-3 rounded-2xl transition-all duration-200 flex flex-col items-center justify-between gap-1 cursor-pointer active:scale-95 group/odd"
                                >
                                  <span className="text-[9.5px] text-neutral-450 uppercase font-mono font-black tracking-widest text-center truncate w-full group-hover/odd:text-neutral-300">X (Empate)</span>
                                  <div className="flex flex-col sm:flex-row justify-between items-center w-full mt-1.5 gap-1 pt-1 border-t border-neutral-800/30">
                                    <span className="text-sm font-black font-mono text-white group-hover/odd:text-white transition-colors">@{match.odds.draw}</span>
                                    <span className="text-[10px] text-neutral-300 font-mono font-extrabold bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">{match.probabilities.draw}%</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => addToBetSlip(match, "away", match.odds.away)}
                                  className="bg-[#131722]/50 hover:bg-[#1b2230] border border-neutral-800/60 hover:border-neutral-600 p-3 rounded-2xl transition-all duration-200 flex flex-col items-center justify-between gap-1 cursor-pointer active:scale-95 group/odd"
                                >
                                  <span className="text-[9.5px] text-neutral-450 uppercase font-mono font-black tracking-widest text-center truncate w-full group-hover/odd:text-neutral-300">2 ({match.awayTeam.substring(0,3)})</span>
                                  <div className="flex flex-col sm:flex-row justify-between items-center w-full mt-1.5 gap-1 pt-1 border-t border-neutral-800/30">
                                    <span className="text-sm font-black font-mono text-white group-hover/odd:text-red-400 transition-colors">@{match.odds.away}</span>
                                    <span className="text-[10px] text-red-450 font-mono font-extrabold bg-red-500/5 px-2 py-0.5 rounded-full border border-red-500/10">{match.probabilities.away}%</span>
                                  </div>
                                </button>
                              </div>

                              {/* Footer Action items with spacious padding */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-4 border-t border-neutral-800/80">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-[9.5px] text-neutral-400 uppercase font-black tracking-widest font-mono">Dica de IA:</span>
                                  <span className="bg-gradient-to-r from-[#00D26A]/10 to-emerald-500/10 border border-[#00D26A]/30 text-[#00D26A] px-3.5 py-1 rounded-full text-xs font-extrabold shadow-[0_0_15px_rgba(0,210,106,0.15)] tracking-wide flex items-center gap-1.5">
                                    {match.iaMarketSuggestion}
                                  </span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShareMatch(match);
                                    }}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-[#131722] hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all border border-neutral-800/80 cursor-pointer flex-1 sm:flex-initial"
                                    title="Compartilhar Palpite"
                                  >
                                    <Share2 className="w-4 h-4 text-[#00D26A]" />
                                    <span>Compartilhar</span>
                                  </button>
                                  <button
                                    onClick={() => setSelectedMatch(selectedMatch?.id === match.id ? null : match)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial ${
                                      selectedMatch?.id === match.id
                                        ? "bg-neutral-700 text-white border border-neutral-600"
                                        : "bg-[#131722] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800/80"
                                    }`}
                                  >
                                    <Sliders className="w-4 h-4 text-neutral-400" />
                                    {selectedMatch?.id === match.id ? "Fechar" : "Ficha IA"}
                                  </button>
                                  <button
                                    onClick={() => addToBetSlip(match, "home", match.odds.home)}
                                    className="bg-gradient-to-r from-[#00D26A] to-[#00A94E] hover:brightness-115 text-black font-extrabold px-4.5 py-2 rounded-xl active:scale-95 transition-all text-xs cursor-pointer flex-1 sm:flex-initial shadow-[0_4px_16px_rgba(0,210,106,0.3)] hover:shadow-[0_4px_22px_rgba(0,210,106,0.45)]"
                                  >
                                    Selecionar
                                  </button>
                                </div>
                              </div>

                            </div>
                          </motion.div>
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
                            {/* Neural Active Scanning Sequence */}
                            <div className="bg-[#14181f]/80 border border-neutral-800 p-3.5 rounded-xl space-y-2 shadow-inner">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#00D26A] flex items-center gap-1.5 font-mono uppercase">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D26A] animate-ping"></span>
                                  {matchAnalysisProgress < 100 ? "🤖 IA Analisando..." : "🤖 IA Análise Concluída"}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-450 font-black">{matchAnalysisProgress}%</span>
                              </div>
                              
                              <div className="space-y-1 text-[10px] font-mono">
                                <div className="flex items-center gap-2">
                                  <span className={matchAnalysisProgress >= 20 ? "text-green-500 font-bold" : "text-neutral-600 animate-pulse"}>
                                    {matchAnalysisProgress >= 20 ? "✔" : "⚡"}
                                  </span>
                                  <span className={matchAnalysisProgress >= 20 ? "text-neutral-200 font-medium" : "text-neutral-500"}>Form & Histórico de Confrontos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={matchAnalysisProgress >= 50 ? "text-green-500 font-bold" : "text-neutral-600 animate-pulse"}>
                                    {matchAnalysisProgress >= 50 ? "✔" : "⚡"}
                                  </span>
                                  <span className={matchAnalysisProgress >= 50 ? "text-neutral-200 font-medium" : "text-neutral-500"}>Lineups & Escalações Estimadas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={matchAnalysisProgress >= 85 ? "text-green-500 font-bold" : "text-neutral-600 animate-pulse"}>
                                    {matchAnalysisProgress >= 85 ? "✔" : "⚡"}
                                  </span>
                                  <span className={matchAnalysisProgress >= 85 ? "text-neutral-200 font-medium" : "text-neutral-500"}>Sentiment & Assimetria de Odds</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={matchAnalysisProgress >= 100 ? "text-[#00D26A] font-bold" : "text-neutral-600"}>
                                    {matchAnalysisProgress >= 100 ? "✔" : "⚡"}
                                  </span>
                                  <span className={matchAnalysisProgress >= 100 ? "text-[#00D26A] font-bold" : "text-neutral-500"}>Concluído • Sugestão Disponível</span>
                                </div>
                              </div>
                            </div>

                            {/* Visual Attacking/Defending indicators */}
                            {/* Visual Attacking/Defending indicators - Radar do Jogo */}
                            <div className="bg-[#131722] border border-neutral-800/80 rounded-xl p-3.5 space-y-3.5 shadow-inner">
                              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800/40">
                                <h4 className="text-[10px] uppercase text-neutral-400 font-extrabold tracking-widest flex items-center gap-1.5">
                                  <BarChart3 className="w-3.5 h-3.5 text-[#00D26A]" /> Comparador Técnico & Radar
                                </h4>
                                <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono font-bold">VS</span>
                              </div>
                              <div className="space-y-2.5 text-[10px]">
                                {/* ATAQUE */}
                                <div>
                                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                    <span>Ataque: {activeMatchDetails.homeTeam} vs {activeMatchDetails.awayTeam}</span>
                                    <span className="font-mono text-white font-semibold">
                                      {activeMatchDetails.attackingStrength.home}% vs {activeMatchDetails.attackingStrength.away}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden flex border border-neutral-800/30">
                                    <div className="bg-green-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${(activeMatchDetails.attackingStrength.home / (activeMatchDetails.attackingStrength.home + activeMatchDetails.attackingStrength.away)) * 100}%` }}></div>
                                    <div className="bg-red-500 h-full rounded-r-full transition-all duration-500" style={{ width: `${(activeMatchDetails.attackingStrength.away / (activeMatchDetails.attackingStrength.home + activeMatchDetails.attackingStrength.away)) * 100}%` }}></div>
                                  </div>
                                </div>

                                {/* DEFESA */}
                                <div>
                                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                    <span>Defesa: {activeMatchDetails.homeTeam} vs {activeMatchDetails.awayTeam}</span>
                                    <span className="font-mono text-white font-semibold">
                                      {activeMatchDetails.defendingStrength.home}% vs {activeMatchDetails.defendingStrength.away}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden flex border border-neutral-800/30">
                                    <div className="bg-green-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${(activeMatchDetails.defendingStrength.home / (activeMatchDetails.defendingStrength.home + activeMatchDetails.defendingStrength.away)) * 100}%` }}></div>
                                    <div className="bg-red-500 h-full rounded-r-full transition-all duration-500" style={{ width: `${(activeMatchDetails.defendingStrength.away / (activeMatchDetails.defendingStrength.home + activeMatchDetails.defendingStrength.away)) * 100}%` }}></div>
                                  </div>
                                </div>

                                {/* POSSE */}
                                <div>
                                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                    <span>Posse Estimada: {activeMatchDetails.homeTeam} vs {activeMatchDetails.awayTeam}</span>
                                    <span className="font-mono text-white font-semibold">
                                      {activeMatchDetails.stats?.possession ? `${activeMatchDetails.stats.possession[0]}% - ${activeMatchDetails.stats.possession[1]}%` : "54% - 46%"}
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden flex border border-neutral-800/30">
                                    <div className="bg-green-500 h-full rounded-l-full transition-all duration-500" style={{ width: activeMatchDetails.stats?.possession ? `${activeMatchDetails.stats.possession[0]}%` : "54%" }}></div>
                                    <div className="bg-red-500 h-full rounded-r-full transition-all duration-500" style={{ width: activeMatchDetails.stats?.possession ? `${activeMatchDetails.stats.possession[1]}%` : "46%" }}></div>
                                  </div>
                                </div>

                                {/* FORMA */}
                                <div>
                                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                    <span>Forma Recente & Tendência</span>
                                    <span className="font-mono text-[#00D26A] font-semibold">{activeMatchDetails.iaConfidence >= 88 ? "Excelente (Muito Alta)" : "Regular (Alta)"}</span>
                                  </div>
                                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/30">
                                    <div className="bg-gradient-to-r from-emerald-500 to-[#00D26A] h-full rounded-full transition-all duration-500" style={{ width: `${activeMatchDetails.iaConfidence}%` }}></div>
                                  </div>
                                </div>

                                {/* MOTIVAÇÃO */}
                                <div>
                                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                    <span>Fator Motivação & Engajamento</span>
                                    <span className="font-mono text-amber-400 font-semibold">85%</span>
                                  </div>
                                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/30">
                                    <div className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* AI Expert Text rationale */}
                            <div className="bg-neutral-950 p-3 rounded border border-neutral-850 text-xs min-h-[75px] flex flex-col justify-center">
                              <div className="flex items-center gap-1 text-green-400 font-semibold mb-1.5 text-[11px]">
                                <Sparkles className={`w-3 h-3 ${isAiAnalysisLoading ? "animate-spin" : ""}`} /> 
                                <span>{isAiAnalysisLoading ? "Sincronizando Cognição Gemini IA..." : "Parecer do Analista Pro IA:"}</span>
                              </div>
                              {isAiAnalysisLoading ? (
                                <div className="space-y-1.5 py-1 animate-pulse">
                                  <div className="h-2 bg-neutral-800 rounded w-full"></div>
                                  <div className="h-2 bg-neutral-800 rounded w-11/12"></div>
                                  <div className="h-2 bg-neutral-800 rounded w-4/5"></div>
                                </div>
                              ) : (
                                <p className="text-neutral-300 leading-relaxed text-[11px] italic">
                                  "{aiAnalyses[activeMatchDetails.id] || activeMatchDetails.iaAnalysis}"
                                </p>
                              )}
                            </div>

                            {/* Semáforo de Valor & Motivos da IA */}
                            <div className="bg-gradient-to-br from-[#1c222e] to-[#12161f] border border-neutral-850 rounded-xl p-3.5 space-y-3.5 shadow-md">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-extrabold text-neutral-400 tracking-wider">Análise de Valor do Mercado</span>
                                {/* Semáforo de Valor */}
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                                  activeMatchDetails.iaConfidence >= 88 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                    : activeMatchDetails.iaConfidence >= 75
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    activeMatchDetails.iaConfidence >= 88 ? "bg-emerald-400 animate-pulse" : activeMatchDetails.iaConfidence >= 75 ? "bg-amber-400" : "bg-red-400"
                                  }`}></span>
                                  {activeMatchDetails.iaConfidence >= 88 
                                    ? "Excelente Valor" 
                                    : activeMatchDetails.iaConfidence >= 75
                                    ? "Valor Moderado"
                                    : "Odd abaixo do ideal"}
                                </span>
                              </div>

                              {/* Index de Confiança Animado */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] text-neutral-400">
                                  <span>Confiança do Algoritmo</span>
                                  <span className="font-black text-[#00D26A] font-mono">{activeMatchDetails.iaConfidence}% ({activeMatchDetails.iaConfidence >= 88 ? "Muito Alta" : activeMatchDetails.iaConfidence >= 75 ? "Alta" : "Moderada"})</span>
                                </div>
                                <div className="relative w-full bg-neutral-950 h-2 rounded-full overflow-hidden p-0.5 border border-neutral-800/60">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 via-[#00D26A] to-[#00A94E] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(0,210,106,0.5)]" 
                                    style={{ width: `${activeMatchDetails.iaConfidence}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Motivos da IA */}
                              <div className="space-y-2 border-t border-neutral-800/60 pt-2.5">
                                <div className="text-[10px] uppercase font-black text-neutral-400 tracking-wider flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Motivos da Inteligência Artificial
                                </div>
                                <ul className="space-y-1.5 text-[11px] text-neutral-300">
                                  <li className="flex items-start gap-1.5">
                                    <span className="text-[#00D26A] font-black shrink-0">✔</span>
                                    <span>Média de {activeMatchDetails.iaConfidence > 85 ? "3,1" : "2,5"} gols nos últimos 10 jogos no retrospecto geral.</span>
                                  </li>
                                  <li className="flex items-start gap-1.5">
                                    <span className="text-[#00D26A] font-black shrink-0">✔</span>
                                    <span>Ambas marcaram em {activeMatchDetails.iaConfidence - 3}% das rodadas recentes analisadas.</span>
                                  </li>
                                  {activeMatchDetails.injuries?.away && activeMatchDetails.injuries.away.length > 0 ? (
                                    <li className="flex items-start gap-1.5">
                                      <span className="text-[#00D26A] font-black shrink-0">✔</span>
                                      <span>Defesa visitante desfalcada: ausência de {activeMatchDetails.injuries.away[0]}.</span>
                                    </li>
                                  ) : (
                                    <li className="flex items-start gap-1.5">
                                      <span className="text-[#00D26A] font-black shrink-0">✔</span>
                                      <span>Ataque em alto rendimento sob xG positivo acumulado.</span>
                                    </li>
                                  )}
                                  <li className="flex items-start gap-1.5">
                                    <span className="text-[#00D26A] font-black shrink-0">✔</span>
                                    <span>Árbitro {activeMatchDetails.referee || "escalado"} com média estatística alta de cartões favorecendo mercado.</span>
                                  </li>
                                  <li className="flex items-start gap-1.5">
                                    <span className="text-[#00D26A] font-black shrink-0">✔</span>
                                    <span>Mercado precificado com assimetria de +{(activeMatchDetails.iaConfidence * 0.15).toFixed(1)}% EV+.</span>
                                  </li>
                                </ul>
                              </div>
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
                            {/* Recharts Fluctuation Chart */}
                            <div className="bg-[#131722] border border-neutral-800/80 rounded-xl p-3.5 space-y-2.5 shadow-inner">
                              <h4 className="text-[10px] uppercase text-neutral-400 font-extrabold tracking-widest flex items-center gap-1.5 border-b border-neutral-800/40 pb-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-[#00D26A]" /> Flutuação de Probabilidades
                              </h4>
                              <div className="h-44 w-full text-[10px] select-none">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={getProbabilityTrendData(activeMatchDetails)}
                                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.4} />
                                    <XAxis 
                                      dataKey="minute" 
                                      stroke="#4b5563" 
                                      fontSize={9}
                                      tickLine={false}
                                    />
                                    <YAxis 
                                      stroke="#4b5563" 
                                      fontSize={9}
                                      domain={[0, 100]}
                                      tickCount={5}
                                      tickLine={false}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#0d0f14",
                                        borderColor: "#1f2937",
                                        borderRadius: "6px",
                                        fontSize: "10px",
                                        color: "#f3f4f6"
                                      }}
                                    />
                                    <Legend 
                                      verticalAlign="top" 
                                      height={24} 
                                      iconSize={8}
                                      iconType="circle"
                                      wrapperStyle={{ fontSize: "9px" }}
                                    />
                                    <Line
                                      name={activeMatchDetails.homeTeam.substring(0, 10)}
                                      type="monotone"
                                      dataKey="home"
                                      stroke="#10b981"
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 4 }}
                                    />
                                    <Line
                                      name="Empate"
                                      type="monotone"
                                      dataKey="draw"
                                      stroke="#737373"
                                      strokeWidth={1.5}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 4 }}
                                    />
                                    <Line
                                      name={activeMatchDetails.awayTeam.substring(0, 10)}
                                      type="monotone"
                                      dataKey="away"
                                      stroke="#ef4444"
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 4 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

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

              {/* 3. SUGESTÕES IA & ASSISTENTE DIGITAL */}
              <div className="space-y-3 pt-2">
                <div className="space-y-0.5">
                  <h3 className="text-[10px] uppercase text-neutral-400 font-extrabold tracking-widest flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    3. Sugestões de Mercado & Assistente de IA
                  </h3>
                  <p className="text-[11px] text-neutral-500">Insights analíticos proativos e assistente esportivo interativo em tempo real.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Assistant Interactive Chat Card */}
                  <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-neutral-700 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex items-start gap-3.5">
                      {/* Avatar design */}
                      <div className="relative shrink-0 mt-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-extrabold text-lg shadow-lg relative z-10 animate-pulse">
                          🤖
                        </div>
                        <div className="absolute inset-0 rounded-full border border-green-500/40 animate-ping opacity-75"></div>
                        <div className="absolute -inset-1.5 rounded-full border border-dashed border-green-500/20 animate-spin [animation-duration:12s]"></div>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-neutral-900 z-20" title="Online"></span>
                      </div>

                      {/* Text Bubble */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-green-400 tracking-wider uppercase font-mono">Conselheiro Virtual BetVision</span>
                          <span className="text-[9px] text-neutral-500 font-mono">AGORA</span>
                        </div>
                        
                        <div className="bg-neutral-950/80 border border-neutral-850/60 rounded-xl p-3 text-neutral-200 text-xs leading-relaxed font-sans relative">
                          {isDashboardAiTyping ? (
                            <div className="flex items-center gap-1.5 py-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                              <span className="text-[10px] text-neutral-500 font-mono ml-1.5">Analisando probabilidades neurais...</span>
                            </div>
                          ) : (
                            <p className="whitespace-pre-line">{dashboardAiAnswer}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Questions Grid */}
                    <div className="mt-4 pt-3.5 border-t border-neutral-850 space-y-2">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold font-mono block">Consulte a IA Instantaneamente:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            if (isDashboardAiTyping) return;
                            setIsDashboardAiTyping(true);
                            setTimeout(() => {
                              const bestMatches = [...matches]
                                .sort((a, b) => b.iaConfidence - a.iaConfidence)
                                .slice(0, 2);
                              const match1 = bestMatches[0];
                              const match2 = bestMatches[1];
                              
                              setDashboardAiAnswer(
                                `🎯 *PALPITES QUENTES DO DIA (Confiança Absoluta)*\n\n` +
                                `1️⃣ **${match1.homeTeam} x ${match1.awayTeam}** (${match1.league})\n` +
                                `   • Indicação: *${match1.iaMarketSuggestion}*\n` +
                                `   • Confiança Algorítmica: **${match1.iaConfidence}%** (Alta Precisão)\n` +
                                `   • Odd Estimada: @${match1.odds.home}\n\n` +
                                `2️⃣ **${match2.homeTeam} x ${match2.awayTeam}** (${match2.league})\n` +
                                `   • Indicação: *${match2.iaMarketSuggestion}*\n` +
                                `   • Confiança Algorítmica: **${match2.iaConfidence}%**\n` +
                                `   • Odd Estimada: @${match2.odds.home}\n\n` +
                                `💡 *Dica:* Clique em "Selecionar" no card da partida acima para carregar estes palpites diretamente no seu cupom!`
                              );
                              setIsDashboardAiTyping(false);
                            }, 900);
                          }}
                          disabled={isDashboardAiTyping}
                          className="bg-neutral-950 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-850 hover:border-green-500/20 text-[10px] font-semibold py-2 px-2.5 rounded-lg text-left transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="text-green-500">🔍</span> Palpites Quentes
                        </button>

                        <button
                          onClick={() => {
                            if (isDashboardAiTyping) return;
                            setIsDashboardAiTyping(true);
                            setTimeout(() => {
                              const minVal = riskLimits.enabledMinBankroll ? riskLimits.minBankroll ?? 500 : 0;
                              const margin = userBalance - minVal;
                              let recommendation = "";
                              
                              if (userBalance <= minVal) {
                                recommendation = "🛑 SEU SALDO ALCANÇOU A BANCA MÍNIMA DE PROTEÇÃO. Novas apostas estão bloqueadas para evitar a quebra do seu caixa. Redefina seus limites na seção de Gestão de Risco para reativar.";
                              } else if (margin < 300) {
                                recommendation = `⚠️ ALERTA: Seu saldo de R$ ${userBalance.toFixed(2)} está muito próximo do seu limite de banca de segurança (R$ ${minVal.toFixed(2)}). Sugiro reduzir sua stake para no máximo R$ 20.00 por entrada para mitigar riscos de oscilação temporária.`;
                              } else {
                                recommendation = `📊 DIAGNÓSTICO: Seu saldo está saudável em R$ ${userBalance.toFixed(2)} (Margem de R$ ${margin.toFixed(2)} sobre a banca mínima de proteção). A IA recomenda uma gestão conservadora de até 5% (R$ ${(userBalance * 0.05).toFixed(2)}) por bilhete múltiplo.`;
                              }
                              
                              setDashboardAiAnswer(
                                `📈 *RELATÓRIO DE GESTÃO E BLINDAGEM DE BANCA*\n\n` +
                                `• Saldo Atual: **R$ ${userBalance.toFixed(2)}**\n` +
                                `• Banca Mínima Protegida: **R$ ${minVal.toFixed(2)}** (${riskLimits.enabledMinBankroll ? "Ativo" : "Inativo"})\n` +
                                `• Status de Risco: *${userBalance <= minVal ? "BLOQUEADO" : margin < 300 ? "ATENÇÃO" : "SAUDÁVEL"}*\n\n` +
                                `${recommendation}`
                              );
                              setIsDashboardAiTyping(false);
                            }, 900);
                          }}
                          disabled={isDashboardAiTyping}
                          className="bg-neutral-950 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-850 hover:border-green-500/20 text-[10px] font-semibold py-2 px-2.5 rounded-lg text-left transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="text-emerald-500">📈</span> Diagnóstico de Banca
                        </button>

                        <button
                          onClick={() => {
                            if (isDashboardAiTyping) return;
                            setIsDashboardAiTyping(true);
                            setTimeout(() => {
                              setDashboardAiAnswer(
                                `🏆 *ANÁLISE DE MERCADOS E MELHORES LIGAS*\n\n` +
                                `• **Premier League (Inglaterra):** Apresenta assertividade histórica de **92.4%** em mercados de vitória do mandante (Favoritos Clássicos) neste mês.\n\n` +
                                `• **La Liga (Espanha):** Altíssima incidência de *Under Gols* no primeiro tempo e *Over Gols* no segundo tempo (Desvio de +14.8% tático).\n\n` +
                                `• **Brasileirão Série A:** Excelente liquidez em *Ambas Marcam (BTTS)* com média de @1.92 nas últimas rodadas, perfeito para entradas combinadas de valor.`
                              );
                              setIsDashboardAiTyping(false);
                            }, 900);
                          }}
                          disabled={isDashboardAiTyping}
                          className="bg-neutral-950 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-850 hover:border-green-500/20 text-[10px] font-semibold py-2 px-2.5 rounded-lg text-left transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="text-amber-500">🏆</span> Melhores Ligas
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Critical Insights Column */}
                  <div className="lg:col-span-5 flex flex-col gap-3">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500 font-mono block">Sinais Neurais Recentes</span>
                        <div className="space-y-2">
                          <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-850 flex items-start gap-2 text-[11px]">
                            <span className="text-xs shrink-0 mt-0.5">📊</span>
                            <div>
                              <span className="font-bold text-neutral-200 block">Distorção de Preço (La Liga)</span>
                              <span className="text-neutral-400">Modelos acusam cotação de @1.90 descompensada para gols. Margem de lucro de +18% detectada.</span>
                            </div>
                          </div>
                          
                          <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-850 flex items-start gap-2 text-[11px]">
                            <span className="text-xs shrink-0 mt-0.5">🔥</span>
                            <div>
                              <span className="font-bold text-neutral-200 block">Tendência Acumulada de Cantos</span>
                              <span className="text-neutral-400">Média de 10.4 escanteios em jogos ao vivo da Premier League quando o mandante pressiona nos minutos finais.</span>
                            </div>
                          </div>

                          <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-850 flex items-start gap-2 text-[11px]">
                            <span className="text-xs shrink-0 mt-0.5">⚡</span>
                            <div>
                              <span className="font-bold text-neutral-200 block">Fadiga Defensiva Mapeada</span>
                              <span className="text-neutral-400">O time visitante do Brasileirão sofre 70% dos seus gols após os 75 minutos devido a desequilíbrio físico.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-500/5 border border-green-500/20 p-2.5 rounded-lg text-[10px] text-green-400 flex items-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-medium">O motor de IA atualizou 142 variáveis estatísticas há 1 minuto.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. GERADOR DE BILHETE INTELIGENTE IA */}
              <div className="space-y-3 pt-2">
                <div className="space-y-0.5">
                  <h3 className="text-[10px] uppercase text-neutral-400 font-extrabold tracking-widest flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                    4. Gerador de Bilhete Inteligente IA
                  </h3>
                  <p className="text-[11px] text-neutral-500">Monte apostas combinadas automáticas alinhando alta matemática e o perfil de risco desejado.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Generator Panel */}
                  <div className="md:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">Quantidade de Jogos</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              onClick={() => setGenGamesCount(num)}
                              className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                                genGamesCount === num 
                                  ? "bg-green-500 text-black shadow-md shadow-green-500/10" 
                                  : "bg-neutral-950 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 border border-neutral-850"
                              }`}
                            >
                              {num} {num === 2 ? "Duo" : num === 3 ? "Trio" : "Jogos"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">Perfil de Risco do Bilhete</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: "conservative", name: "CONSERVADOR", color: "bg-green-500" },
                            { id: "moderate", name: "MODERADO", color: "bg-amber-500" },
                            { id: "aggressive", name: "AGRESSIVO", color: "bg-red-500" }
                          ].map((level) => (
                            <button
                              key={level.id}
                              onClick={() => setGenRiskLevel(level.id as any)}
                              className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                genRiskLevel === level.id 
                                  ? `${level.color} text-black font-extrabold shadow-lg` 
                                  : "bg-neutral-950 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 border border-neutral-850"
                              }`}
                            >
                              {level.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">Foco de Mercado</label>
                        <select
                          value={genMarketType}
                          onChange={(e: any) => setGenMarketType(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-850 text-xs py-2 px-2.5 rounded-lg text-neutral-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20"
                        >
                          <option value="misto">Misto (Recomendado pela IA)</option>
                          <option value="gols">Mercado de Gols (Over / Under)</option>
                          <option value="vencedor">Vencedor Final (1X2)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Valor de Entrada Recomendado</label>
                          <span className="text-xs font-mono font-bold text-green-400">R$ {betAmount}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="20"
                            max="1000"
                            step="10"
                            value={betAmount}
                            onChange={(e) => setBetAmount(parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-green-500"
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-1 mt-2">
                          {[20, 50, 100, 200].map((val) => (
                            <button
                              key={val}
                              onClick={() => setBetAmount(val)}
                              className={`py-1 text-[10px] font-semibold rounded font-mono ${
                                betAmount === val ? "bg-neutral-800 text-white border-neutral-700" : "bg-neutral-950 text-neutral-500 hover:text-neutral-300 border border-neutral-900"
                              } border transition-all cursor-pointer`}
                            >
                              +R$ {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={triggerMultiGenerator}
                      disabled={isGenerating}
                      className="w-full bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-green-500/10 cursor-pointer hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isGenerating ? "Processando Algoritmo de Probabilidades..." : "GERAR BILHETE INTELIGENTE IA ⚡"}
                    </button>
                  </div>

                  {/* Generator Output */}
                  <div className="md:col-span-7 flex flex-col">
                    {isGenerating ? (
                      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 rounded-full border-4 border-green-500/10 border-t-green-500 animate-spin"></div>
                          <div className="absolute inset-1.5 rounded-full border-4 border-amber-500/10 border-b-amber-500 animate-spin [animation-duration:1.5s]"></div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-green-400 font-mono font-bold uppercase tracking-widest animate-pulse">Cruzando Dados Neurais</p>
                          <p className="text-xs text-neutral-400 font-medium">{genProgressText}</p>
                        </div>
                      </div>
                    ) : generatedSlipResult ? (
                      <div className="bg-neutral-900 border border-green-500/20 rounded-xl p-4 flex-1 flex flex-col justify-between space-y-3.5 relative overflow-hidden animate-fade-in">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-850">
                          <div>
                            <span className="text-[9px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">
                              Palpites Combinados de Alta Precisão
                            </span>
                            <div className="text-[10px] text-neutral-500 mt-1 font-mono">Assinatura Digital: {generatedSlipResult.hash}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-neutral-500 uppercase block font-bold">Risco Estimado</span>
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded font-mono ${
                              generatedSlipResult.risk === "CONSERVADOR" ? "bg-green-500/10 text-green-400" : generatedSlipResult.risk === "MODERADO" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400 animate-pulse"
                            }`}>{generatedSlipResult.risk}</span>
                          </div>
                        </div>

                        {/* List of generated games */}
                        <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                          {generatedSlipResult.games.map((game: any, idx: number) => (
                            <div key={idx} className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 flex justify-between items-center text-xs hover:border-neutral-800 transition-colors">
                              <div className="space-y-0.5">
                                <div className="font-bold text-neutral-200">{game.match}</div>
                                <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                                  <span>Mercado: <strong className="text-neutral-300 font-semibold">{game.market}</strong></span>
                                  <span className="text-neutral-600">•</span>
                                  <span className="text-green-500/90 font-mono">Confiança: {game.confidence}%</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="bg-neutral-900 border border-neutral-800 text-green-400 px-2.5 py-1 rounded font-bold font-mono text-xs">@{game.odd.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary and actions */}
                        <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 flex flex-wrap gap-4 items-center justify-between">
                          <div className="flex gap-4">
                            <div>
                              <span className="text-[9px] text-neutral-500 uppercase block">Cotação Total</span>
                              <span className="text-sm font-mono font-extrabold text-white">@{generatedSlipResult.odds.toFixed(2)}</span>
                            </div>
                            <div className="border-l border-neutral-850 pl-4">
                              <span className="text-[9px] text-neutral-500 uppercase block">Entrada Sugerida</span>
                              <span className="text-sm font-mono font-extrabold text-neutral-300">R$ {betAmount}</span>
                            </div>
                            <div className="border-l border-neutral-850 pl-4">
                              <span className="text-[9px] text-neutral-500 uppercase block">Retorno Potencial</span>
                              <span className="text-sm font-mono font-extrabold text-green-400">R$ {(betAmount * generatedSlipResult.odds).toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                let clipText = `🎯 *BILHETE INTELIGENTE IA - BETVISION PRO* 🎯\n\n`;
                                generatedSlipResult.games.forEach((g: any, i: number) => {
                                  clipText += `${i + 1}. ⚽ *${g.match}*\n   Palpite: *${g.market}* | Cotação: @${g.odd.toFixed(2)} (${g.confidence}% confiança)\n\n`;
                                });
                                clipText += `📊 *Odd Final:* @${generatedSlipResult.odds.toFixed(2)}\n`;
                                clipText += `💰 *Stake:* R$ ${betAmount}\n`;
                                clipText += `🏆 *Retorno:* R$ ${(betAmount * generatedSlipResult.odds).toFixed(2)}\n`;
                                navigator.clipboard.writeText(clipText);
                                alert("✓ Conteúdo do bilhete copiado para a área de transferência!");
                              }}
                              className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Copiar texto formatado"
                            >
                              <Share2 className="w-3 h-3 text-green-400" />
                              Copiar Texto
                            </button>

                            <button
                              onClick={() => {
                                // Add all selections to bet slip
                                generatedSlipResult.games.forEach((game: any) => {
                                  if (game.matchRef) {
                                    addToBetSlip(game.matchRef, game.selection, game.odd);
                                  }
                                });
                                triggerPushNotification(
                                  "Cupom Importado",
                                  "As seleções do Bilhete Inteligente IA foram transferidas com sucesso para seu cupom de apostas do dia!",
                                  "info"
                                );
                                alert("✓ Seleções importadas para seu Cupom Ativo do Dia!");
                              }}
                              className="bg-green-500 hover:bg-green-400 text-black px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-transform active:scale-95 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Carregar Cupom Ativo
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-400 text-xs flex-1 flex flex-col items-center justify-center space-y-2">
                        <span>🔮</span>
                        <p>Nenhum bilhete ativo gerado ainda.</p>
                        <p className="text-[10px] text-neutral-500">Configure as opções ao lado e clique em "Gerar Bilhete Inteligente" para iniciar.</p>
                      </div>
                    )}
                  </div>
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
                {filteredMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.05, 0.4) }}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3 relative overflow-hidden"
                  >
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
                      <LeagueBadge league={match.league} isLive={match.isLive} />
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
                  </motion.div>
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
                {matches.filter(m => m.isLive).map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.05, 0.4) }}
                    className="bg-neutral-900 border border-green-500/30 rounded-lg p-4 space-y-4"
                  >
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
                      <LeagueBadge league={match.league} isLive={match.isLive} />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-8 justify-center w-full md:w-auto">
                        <div className="text-center flex flex-col items-center">
                          <TeamShield teamName={match.homeTeam} size="md" className="mb-1.5" />
                          <div className="text-xs font-bold text-white mt-1">{match.homeTeam}</div>
                        </div>
                        <div className="text-2xl font-mono font-bold text-green-400 bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800 tracking-wider">
                          {match.liveScore?.[0]} - {match.liveScore?.[1]}
                        </div>
                        <div className="text-center flex flex-col items-center">
                          <TeamShield teamName={match.awayTeam} size="md" className="mb-1.5" />
                          <div className="text-xs font-bold text-white mt-1">{match.awayTeam}</div>
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
                        <div className="flex justify-between text-[10px] text-neutral-500 font-mono items-center">
                          <LiveProbabilityText label={match.homeTeam} value={match.probabilities.home} />
                          <LiveProbabilityText label="Empate" value={match.probabilities.draw} />
                          <LiveProbabilityText label={match.awayTeam} value={match.probabilities.away} />
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
                  </motion.div>
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

          {/* DYNAMIC INTEGRATION: SMART BETS IA RECOMMENDATIONS */}
          {activeTab === "smart_bets" && (
            <SmartBets 
              isVIPUser={isVIPSubscriber}
              onOpenVIPModal={() => setShowVIPModal(true)}
              onAddToBetslip={(match, market, odd) => {
                let selection: "home" | "draw" | "away" = "draw";
                if (market.toLowerCase().includes("vitória " + match.homeTeam.toLowerCase()) || market === "1") {
                  selection = "home";
                } else if (market.toLowerCase().includes("vitória " + match.awayTeam.toLowerCase()) || market === "2") {
                  selection = "away";
                }
                addToBetSlip(match, selection, odd);
              }}
              selectedSlip={betSlip.map(item => ({ 
                matchId: item.match.id, 
                market: item.selection === "home" ? "Vitória " + item.match.homeTeam : item.selection === "away" ? "Vitória " + item.match.awayTeam : "Empate", 
                odd: item.odd 
              }))}
            />
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
              currentUser={currentUser}
              onCurrentUserChange={(newPlan) => {
                if (currentUser) {
                  const updated = { ...currentUser, plan: newPlan };
                  setCurrentUser(updated);
                  localStorage.setItem("betvision_user", JSON.stringify(updated));
                }
              }}
            />
          )}

          {/* USER PREFERENCES PANEL */}
          {activeTab === "configuracoes" && (
            <UserPreferencesPanel />
          )}

        </div>

        {/* RIGHT PANEL: BILHETE DO DIA & RECENT PROMPTS - HIDDEN ON MOBILE/TABLET, SHOWN ON lg+ */}
        <div className="hidden lg:flex w-80 shrink-0 border-l border-neutral-800 bg-neutral-900/40 p-4 flex-col justify-between overflow-y-auto">
          
          {/* Active Bet Slip (Bilhete do Dia) */}
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-neutral-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-green-500" /> Bilhete Inteligente IA
                </h3>
                <span className="text-[9px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                  Sugestão
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

                    {/* Real-Time Bet Slip Simulator */}
                    <div className="bg-[#131722] border border-neutral-800/80 rounded-xl p-3 space-y-2.5 my-1">
                      <div className="text-[10px] uppercase font-black text-neutral-400 tracking-wider flex items-center justify-between">
                        <span>Simulador de Bilhete</span>
                        <span className="text-[#00D26A] font-mono text-[9px] font-black animate-pulse">● LIVE PROJECTION</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                        <div className="bg-neutral-900/50 p-2 rounded-lg border border-neutral-850">
                          <span className="text-[9px] text-neutral-500 block leading-none mb-1 uppercase font-bold">Probabilidade</span>
                          <span className="font-mono text-white font-extrabold text-xs">
                            {betSlip.length === 0 ? "0%" : `${Math.round(betSlip.reduce((acc, curr) => acc * (curr.match.iaConfidence / 100), 1) * 100)}%`}
                          </span>
                        </div>
                        <div className="bg-neutral-900/50 p-2 rounded-lg border border-neutral-850">
                          <span className="text-[9px] text-neutral-500 block leading-none mb-1 uppercase font-bold">Nível de Risco</span>
                          <span className={`font-extrabold text-xs font-mono ${totalOdds < 2.0 ? "text-green-400" : totalOdds < 4.5 ? "text-amber-400" : "text-red-400"}`}>
                            {betSlip.length === 0 ? "-" : totalOdds < 2.0 ? "Baixo" : totalOdds < 4.5 ? "Moderado" : "Elevado"}
                          </span>
                        </div>
                      </div>
                    </div>

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

                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={copySlipToClipboard}
                        className={`font-bold text-[11px] py-3 px-1 rounded shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 w-full ${
                          hasCopiedSlip
                            ? "bg-neutral-800 text-green-400 border border-green-500/30"
                            : "bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 cursor-pointer"
                        }`}
                      >
                        {hasCopiedSlip ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar
                          </>
                        )}
                      </button>

                      <button
                        onClick={shareSlipViaWebAPI}
                        className="font-bold text-[11px] py-3 px-1 rounded shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 bg-green-500 hover:bg-green-400 text-black cursor-pointer w-full"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Compartilhar
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
      <PremiumSaaSModal
        isOpen={showVIPModal}
        onClose={() => setShowVIPModal(false)}
        currentUser={currentUser}
        onPlanActivated={(newPlan) => {
          if (currentUser) {
            const updated = { ...currentUser, plan: newPlan };
            setCurrentUser(updated);
            localStorage.setItem("betvision_user", JSON.stringify(updated));
            addAdminLog(`COBRANCA_APROVADA_ASSINATURA_${newPlan.toUpperCase()}`, currentUser.name, "success");
            triggerPushNotification(
              "Upgrade de Assinatura",
              `Parabéns! Sua conta agora está no nível ${newPlan.toUpperCase()}. Recursos premium liberados!`,
              "status"
            );
          }
        }}
        addLog={addAdminLog}
        addNotification={(title, message, type) => triggerPushNotification(title, message, type)}
      />

      {/* SHARE PREDICTION CARD SNAPSHOT MODAL */}
      <SharePredictionModal
        match={shareMatch}
        onClose={() => setShareMatch(null)}
      />

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
            userBalance={userBalance}
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
          onClick={() => { setActiveTab("smart_bets"); }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded transition-colors ${
            activeTab === "smart_bets" ? "text-green-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Sugestões</span>
        </button>
        <button
          onClick={() => { setActiveTab("multiplas"); }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded transition-colors ${
            activeTab === "multiplas" ? "text-green-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Múltiplas</span>
        </button>
        <button
          onClick={() => { setActiveTab("dashboard_ia"); }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded transition-colors ${
            activeTab === "dashboard_ia" ? "text-green-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Análises</span>
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

                  {/* Real-Time Bet Slip Simulator */}
                  <div className="bg-[#131722] border border-neutral-800/80 rounded-xl p-3 space-y-2.5 my-1">
                    <div className="text-[10px] uppercase font-black text-neutral-400 tracking-wider flex items-center justify-between">
                      <span>Simulador de Bilhete</span>
                      <span className="text-[#00D26A] font-mono text-[9px] font-black animate-pulse">● LIVE PROJECTION</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                      <div className="bg-neutral-900/50 p-2 rounded-lg border border-neutral-850">
                        <span className="text-[9px] text-neutral-500 block leading-none mb-1 uppercase font-bold">Probabilidade</span>
                        <span className="font-mono text-white font-extrabold text-xs">
                          {betSlip.length === 0 ? "0%" : `${Math.round(betSlip.reduce((acc, curr) => acc * (curr.match.iaConfidence / 100), 1) * 100)}%`}
                        </span>
                      </div>
                      <div className="bg-neutral-900/50 p-2 rounded-lg border border-neutral-850">
                        <span className="text-[9px] text-neutral-500 block leading-none mb-1 uppercase font-bold">Nível de Risco</span>
                        <span className={`font-extrabold text-xs font-mono ${totalOdds < 2.0 ? "text-green-400" : totalOdds < 4.5 ? "text-amber-400" : "text-red-400"}`}>
                          {betSlip.length === 0 ? "-" : totalOdds < 2.0 ? "Baixo" : totalOdds < 4.5 ? "Moderado" : "Elevado"}
                        </span>
                      </div>
                    </div>
                  </div>

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

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={copySlipToClipboard}
                      className={`font-bold text-xs py-3 px-1 rounded shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 w-full ${
                        hasCopiedSlip
                          ? "bg-neutral-800 text-green-400 border border-green-500/30"
                          : "bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 cursor-pointer"
                      }`}
                    >
                      {hasCopiedSlip ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </button>

                    <button
                      onClick={shareSlipViaWebAPI}
                      className="font-bold text-xs py-3 px-1 rounded shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 bg-green-500 hover:bg-green-400 text-black cursor-pointer w-full"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Glowing Robot Copilot avatar */}
      <div className="fixed bottom-24 right-6 z-40 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00D26A] to-blue-500 rounded-full blur opacity-45 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
          <button
            onClick={() => {
              setActiveTab("dashboard");
              triggerPushNotification(
                "Copilot de Apostas",
                "🤖 Olá! Sou o robô de inteligência da BetVision. Estou escaneando dados em tempo real no momento para você!",
                "status"
              );
            }}
            className="relative w-12 h-12 bg-[#1b212b] border border-neutral-800 hover:border-[#00D26A] rounded-full flex items-center justify-center text-xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] cursor-pointer active:scale-95 transition-all"
            title="Abrir Copilot de Apostas"
          >
            🤖
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1b212b] animate-ping"></span>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1b212b]"></span>
          </button>
        </div>
      </div>

      {/* Mock Push Notification Toast Floating Container */}
      <PushNotificationToastContainer 
        toasts={activeToasts} 
        onClose={(id) => setActiveToasts((prev) => prev.filter((t) => t.id !== id))} 
      />

    </div>
  );
}
