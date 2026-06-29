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
  HelpCircle
} from "lucide-react";

// Matches Interface
interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  time: string;
  date: string;
  isVIP: boolean;
  isLive: boolean;
  liveMinute?: number;
  liveScore?: [number, number];
  iaConfidence: number; // 0 to 100
  iaStars: number; // 1 to 5
  odds: { home: number; draw: number; away: number };
  probabilities: { home: number; draw: number; away: number };
  iaMarketSuggestion: string;
  iaAnalysis: string;
  attackingStrength: { home: number; away: number };
  defendingStrength: { home: number; away: number };
  recentH2H: string;
  formGuide: { home: string[]; away: string[] };
}

// Chat message interface
interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function App() {
  // Navigation tabs: "dashboard" | "partidas" | "simulador" | "multiplas" | "minhas_apostas"
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // VIP Subscription state
  const [isVIPSubscriber, setIsVIPSubscriber] = useState<boolean>(false);
  const [showVIPModal, setShowVIPModal] = useState<boolean>(false);

  // Filter states
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("high_confidence");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Active Selected Match for deep analysis drawer
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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
  ]);

  // Initial Matches Data
  const [matches, setMatches] = useState<Match[]>([
    {
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
      iaAnalysis: "Arsenal exhibits highly cohesive attacking transitions at home, scoring 2.4 goals per match on average. Liverpool's center-back pairing is vulnerable due to a key recent injury to Konaté, presenting a 78% probability of over 2.5 match goals.",
      attackingStrength: { home: 92, away: 86 },
      defendingStrength: { home: 88, away: 82 },
      recentH2H: "Arsenal 3-1 Liverpool (Feb 2026), Liverpool 1-1 Arsenal (Dec 2025)",
      formGuide: { home: ["W", "W", "D", "W", "L"], away: ["W", "D", "W", "L", "W"] }
    },
    {
      id: "m2",
      homeTeam: "Flamengo",
      awayTeam: "River Plate",
      league: "Libertadores",
      time: "21:00",
      date: "Hoje",
      isVIP: true,
      isLive: false,
      iaConfidence: 89,
      iaStars: 5,
      odds: { home: 1.80, draw: 3.50, away: 4.40 },
      probabilities: { home: 61, draw: 22, away: 17 },
      iaMarketSuggestion: "Vitória Mandante",
      iaAnalysis: "Flamengo maintains a strong domestic record at Maracanã (unbeaten in 14 matches). River Plate struggles to maintain high-tempo defensive pressure when playing away, having conceded in 5 of their last 6 away continental matches.",
      attackingStrength: { home: 90, away: 78 },
      defendingStrength: { home: 85, away: 80 },
      recentH2H: "Flamengo 2-1 River Plate (Nov 2024), River Plate 1-1 Flamengo (May 2024)",
      formGuide: { home: ["W", "W", "W", "D", "W"], away: ["D", "W", "L", "D", "W"] }
    },
    {
      id: "m3",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      league: "La Liga",
      time: "LIVE",
      date: "Hoje",
      isVIP: false,
      isLive: true,
      liveMinute: 72,
      liveScore: [1, 1],
      iaConfidence: 85,
      iaStars: 4,
      odds: { home: 2.10, draw: 3.10, away: 3.60 },
      probabilities: { home: 42, draw: 31, away: 27 },
      iaMarketSuggestion: "Barcelona +1.5 Gols (Live)",
      iaAnalysis: "El Clásico has entered an intense physical phase in the final 20 minutes. Barcelona is executing counter-pressing with high efficiency, exploiting tired Madrid wingers. Expect a late goal or tight finish.",
      attackingStrength: { home: 95, away: 94 },
      defendingStrength: { home: 79, away: 81 },
      recentH2H: "Real Madrid 3-2 Barcelona (Apr 2026), Barcelona 1-2 Real Madrid (Oct 2025)",
      formGuide: { home: ["W", "L", "W", "W", "W"], away: ["W", "W", "W", "D", "W"] }
    },
    {
      id: "m4",
      homeTeam: "Manchester City",
      awayTeam: "Chelsea",
      league: "Premier League",
      time: "18:30",
      date: "Amanhã",
      isVIP: false,
      isLive: false,
      iaConfidence: 92,
      iaStars: 5,
      odds: { home: 1.40, draw: 4.80, away: 7.00 },
      probabilities: { home: 68, draw: 20, away: 12 },
      iaMarketSuggestion: "Man City & Over 1.5 Gols",
      iaAnalysis: "Manchester City displays an excellent home game control index (66% average possession). Chelsea's transitions are rapid but prone to structural breakdown under elite defensive counter-pressing.",
      attackingStrength: { home: 96, away: 79 },
      defendingStrength: { home: 91, away: 72 },
      recentH2H: "Chelsea 1-1 City (Feb 2026), City 2-1 Chelsea (Nov 2025)",
      formGuide: { home: ["W", "W", "D", "W", "W"], away: ["D", "W", "L", "W", "L"] }
    },
    {
      id: "m5",
      homeTeam: "São Paulo",
      awayTeam: "Palmeiras",
      league: "Brasileirão",
      time: "16:00",
      date: "Amanhã",
      isVIP: false,
      isLive: false,
      iaConfidence: 78,
      iaStars: 4,
      odds: { home: 2.60, draw: 3.10, away: 2.80 },
      probabilities: { home: 35, draw: 38, away: 27 },
      iaMarketSuggestion: "Menos de 2.5 Gols",
      iaAnalysis: "A highly defensive derby Choque-Rei. Both sides deploy tight double pivots to block final-third penetration. 4 of their last 5 clashes resulted in 2 goals or fewer.",
      attackingStrength: { home: 81, away: 83 },
      defendingStrength: { home: 85, away: 88 },
      recentH2H: "Palmeiras 1-0 São Paulo (Jan 2026), São Paulo 1-1 Palmeiras (Oct 2025)",
      formGuide: { home: ["D", "W", "D", "L", "W"], away: ["W", "W", "D", "W", "D"] }
    },
    {
      id: "m6",
      homeTeam: "Bayern Munich",
      awayTeam: "Borussia Dortmund",
      league: "Champions League",
      time: "20:00",
      date: "Quarta",
      isVIP: true,
      isLive: false,
      iaConfidence: 91,
      iaStars: 5,
      odds: { home: 1.45, draw: 4.50, away: 6.00 },
      probabilities: { home: 64, draw: 21, away: 15 },
      iaMarketSuggestion: "Ambas Marcam (BTTS)",
      iaAnalysis: "Der Klassiker always yields stellar attacking output. Bayern scoring run is active at 21 direct matches, while Dortmund averages 2.3 goals on away European nights this year.",
      attackingStrength: { home: 94, away: 88 },
      defendingStrength: { home: 80, away: 76 },
      recentH2H: "Bayern 4-2 Dortmund (Apr 2026), Dortmund 2-3 Bayern (Nov 2025)",
      formGuide: { home: ["W", "W", "W", "W", "D"], away: ["W", "D", "W", "L", "W"] }
    }
  ]);

  // Real-time live match ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches((prevMatches) => {
        return prevMatches.map((match) => {
          if (match.isLive) {
            const currentMin = match.liveMinute || 72;
            const newMin = currentMin >= 90 ? 90 : currentMin + 1;
            let currentScore = match.liveScore || [1, 1];
            
            // Periodically simulate live goal!
            if (newMin === 79 && currentScore[0] === 1 && currentScore[1] === 1) {
              currentScore = [2, 1]; // Real Madrid scores
            } else if (newMin === 88 && currentScore[0] === 2 && currentScore[1] === 1) {
              // High impact event alert or change probabilities
            }

            // Fluctuating odds based on match time and goals
            const homeOdds = newMin > 80 ? (currentScore[0] > currentScore[1] ? 1.25 : 4.50) : 1.95;
            const drawOdds = newMin > 80 ? (currentScore[0] === currentScore[1] ? 1.80 : 5.50) : 2.80;
            const awayOdds = newMin > 80 ? (currentScore[0] < currentScore[1] ? 1.35 : 12.0) : 4.10;

            return {
              ...match,
              liveMinute: newMin,
              liveScore: currentScore,
              odds: { home: parseFloat(homeOdds.toFixed(2)), draw: parseFloat(drawOdds.toFixed(2)), away: parseFloat(awayOdds.toFixed(2)) }
            };
          }
          return match;
        });
      });
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
      return match.odds.home < 1.60;
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

  // Copy Ticket Hash Code
  const copySlipToClipboard = () => {
    const codes = ["BV-8821X-PRO", "BV-9901A-MAX", "BV-2139P-VIP", "BV-3342E-SLIP"];
    const randomHash = codes[Math.floor(Math.random() * codes.length)];
    navigator.clipboard.writeText(randomHash).then(() => {
      setHasCopiedSlip(true);
      setTimeout(() => setHasCopiedSlip(false), 2000);
    });
  };

  // Multi slip generator simulation
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
            // Generate mock results
            let gamesGenerated: any[] = [];
            if (genRiskLevel === "conservative") {
              gamesGenerated = [
                { match: "Arsenal x Liverpool", market: "Over 1.5 Gols", odd: 1.25, confidence: 96 },
                { match: "Man City x Chelsea", market: "Vitória Man City (DNB)", odd: 1.18, confidence: 94 },
                { match: "Bayern Munich x Dortmund", market: "Over 2.5 Gols", odd: 1.35, confidence: 92 }
              ];
            } else if (genRiskLevel === "moderate") {
              gamesGenerated = [
                { match: "Arsenal x Liverpool", market: "Over 2.5 Gols", odd: 1.55, confidence: 94 },
                { match: "Man City x Chelsea", market: "Vitória Mandante", odd: 1.40, confidence: 92 },
                { match: "São Paulo x Palmeiras", market: "Menos de 2.5 Gols", odd: 1.50, confidence: 85 }
              ];
            } else {
              gamesGenerated = [
                { match: "Flamengo x River Plate", market: "Vitória Flamengo & Ambos Marcam", odd: 3.40, confidence: 81 },
                { match: "Real Madrid x Barcelona", market: "Empate técnico", odd: 3.20, confidence: 75 },
                { match: "Bayern Munich x Dortmund", market: "Bayern Munich ganha & Ambos Marcam", odd: 2.70, confidence: 79 }
              ];
            }

            const combinedOdds = parseFloat(gamesGenerated.reduce((acc, curr) => acc * curr.odd, 1).toFixed(2));
            setGeneratedSlipResult({
              odds: combinedOdds,
              risk: genRiskLevel.toUpperCase(),
              games: gamesGenerated,
              hash: "BV-" + Math.floor(100000 + Math.random() * 900000)
            });
            setIsGenerating(false);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const addGeneratedToSlip = () => {
    if (!generatedSlipResult) return;
    // Map items from generator to bets list or add to slip directly if mapping found
    alert("✓ Jogos gerados pela IA integrados ao seu Bilhete Principal!");
    
    // Convert first item as example
    const matchRef = matches[0]; // Arsenal
    addToBetSlip(matchRef, "home", matchRef.odds.home);
    setGeneratedSlipResult(null);
  };

  // AI Chat Consultant triggers simulated responses
  const sendChatMessage = () => {
    if (!userChatInput.trim() || !selectedMatch) return;

    const userMsgId = "msg_" + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: userChatInput,
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

    // Dynamic AI feedback depending on keyword
    setTimeout(() => {
      let aiResponseText = `Excelente pergunta! Analisando o confronto entre ${selectedMatch.homeTeam} e ${selectedMatch.awayTeam}, nosso algoritmo quantitativo observa que o fluxo de apostas globais está concentrado no mercado de ${selectedMatch.iaMarketSuggestion}.`;
      
      const query = userChatInput.toLowerCase();
      if (query.includes("gol") || query.includes("gols") || query.includes("over") || query.includes("under")) {
        aiResponseText = `Para gols, nosso índice aponta um ataque mandante de ${selectedMatch.attackingStrength.home}% contra defesa visitante de ${selectedMatch.defendingStrength.away}%. Isso sugere alta propensão para ataques verticais rápidos. Nossa sugestão ideal continua sendo ${selectedMatch.iaMarketSuggestion}.`;
      } else if (query.includes("vencedor") || query.includes("ganha") || query.includes("favorito")) {
        aiResponseText = `A probabilidade real calculada é de: Vitória ${selectedMatch.homeTeam} (${selectedMatch.probabilities.home}%), Empate (${selectedMatch.probabilities.draw}%), Vitória ${selectedMatch.awayTeam} (${selectedMatch.probabilities.away}%). O valor matemático está na odd de ${selectedMatch.odds.home} para o Mandante.`;
      } else if (query.includes("vip") || query.includes("premium")) {
        aiResponseText = "Nossos modelos preditivos VIP realizam cross-reference de até 42 variáveis em tempo real (incluindo clima, biometria de atletas e fluxo asiático de odds).";
      }

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
    }, 1500);
  };

  // Simulate manual event for live match
  const triggerLiveEvent = () => {
    setMatches((prevMatches) => {
      return prevMatches.map((match) => {
        if (match.isLive) {
          const currentScore = match.liveScore || [1, 1];
          const updatedScore: [number, number] = [currentScore[0], currentScore[1] + 1]; // Barcelona scores!
          alert(`⚡ GOL DO BARCELONA! O placar agora é Real Madrid ${updatedScore[0]} x ${updatedScore[1]} Barcelona!`);
          return {
            ...match,
            liveScore: updatedScore,
            iaMarketSuggestion: "Over 3.5 Gols em alta",
            probabilities: { home: 25, draw: 35, away: 40 }
          };
        }
        return match;
      });
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-950 text-neutral-200 font-sans overflow-hidden">
      
      {/* TOP NAVIGATION BAR */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-black text-sm">BV</div>
            <span className="text-xl font-bold tracking-tighter text-white">
              BETVISION<span className="text-green-500">PRO</span>
            </span>
          </div>
          <nav className="flex gap-4 text-xs font-medium">
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
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isVIPSubscriber) {
                setIsVIPSubscriber(false);
              } else {
                setShowVIPModal(true);
              }
            }}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isVIPSubscriber
                ? "bg-amber-500 text-black border border-amber-600 shadow-md animate-pulse"
                : "bg-neutral-800 text-amber-400 border border-neutral-700 hover:bg-neutral-700"
            }`}
          >
            ★ {isVIPSubscriber ? "VIP ATIVO" : "Upgrade VIP"}
          </button>
          
          <div className="bg-neutral-800 px-3 py-1.5 rounded text-xs border border-neutral-700 flex items-center gap-2">
            <span className="text-neutral-400">Saldo:</span>
            <span className="text-green-400 font-mono font-bold">R$ {userBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            <button
              onClick={() => {
                setUserBalance(2450.0);
                alert("✓ Saldo redefinido para R$ 2.450,00 para fins de simulação!");
              }}
              title="Recarregar Saldo de Demonstração"
              className="p-0.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center font-bold text-neutral-950 text-xs">
            FP
          </div>
        </div>
      </header>

      {/* MAIN INTERFACE */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR FILTERS (Only visible on dashboard and matches list) */}
        {(activeTab === "dashboard" || activeTab === "partidas") && (
          <aside className="w-56 border-r border-neutral-800 bg-neutral-900/40 p-4 flex flex-col shrink-0">
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
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-950 overflow-y-auto">
          
          {/* DASHBOARD TAB VIEW */}
          {activeTab === "dashboard" && (
            <div className="p-4 space-y-4">
              
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
                                <div className="text-[9px] text-neutral-400 font-mono flex items-center gap-1.5 mb-2">
                                  <span>{match.league}</span>
                                  <span>•</span>
                                  <span className={match.isLive ? "text-green-500 font-bold animate-pulse" : ""}>
                                    {match.isLive ? `LIVE ${match.liveMinute}'` : `${match.date}, ${match.time}`}
                                  </span>
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
                  {selectedMatch && (
                    <div className="w-full xl:w-80 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col shrink-0 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <div>
                          <h3 className="font-bold text-xs text-white">Consul de Análise Preditiva</h3>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {selectedMatch.homeTeam} x {selectedMatch.awayTeam}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedMatch(null)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Visual Attacking/Defending indicators */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Métricas Comparativas</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                              <span>Força Ofensiva ({selectedMatch.homeTeam})</span>
                              <span className="font-mono text-green-400">{selectedMatch.attackingStrength.home}%</span>
                            </div>
                            <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-green-500 h-full" style={{ width: `${selectedMatch.attackingStrength.home}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                              <span>Força Ofensiva ({selectedMatch.awayTeam})</span>
                              <span className="font-mono text-red-400">{selectedMatch.attackingStrength.away}%</span>
                            </div>
                            <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-red-500 h-full" style={{ width: `${selectedMatch.attackingStrength.away}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                              <span>Compactação Defensiva</span>
                              <span className="font-mono text-white">
                                {selectedMatch.defendingStrength.home} vs {selectedMatch.defendingStrength.away}
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
                          "{selectedMatch.iaAnalysis}"
                        </p>
                      </div>

                      {/* Real-time Interactive AI Consultation Chat */}
                      <div className="space-y-2 border-t border-neutral-800 pt-3">
                        <h4 className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-green-500" /> Pergunte à Inteligência Artificial
                        </h4>
                        
                        {/* Chat history wrapper */}
                        <div className="h-32 bg-neutral-950 rounded p-2 overflow-y-auto space-y-2 border border-neutral-850">
                          {(!chatMessages[selectedMatch.id] || chatMessages[selectedMatch.id].length === 0) ? (
                            <p className="text-[10px] text-neutral-500 text-center italic mt-6">
                              "Arsenal vai manter a baliza intransponível?" ou "Aposta ideal para cantos?" Pergunte abaixo.
                            </p>
                          ) : (
                            chatMessages[selectedMatch.id].map((msg) => (
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

                </div>
              </div>

            </div>
          )}

          {/* PARTIDAS PREDITAS FULL LIST TAB VIEW */}
          {activeTab === "partidas" && (
            <div className="p-4 space-y-4">
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
                      <span className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                        LIVE - MINUTO {match.liveMinute}'
                      </span>
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

        </div>

        {/* RIGHT PANEL: BILHETE DO DIA & RECENT PROMPTS */}
        <div className="w-80 shrink-0 border-l border-neutral-800 bg-neutral-900/40 p-4 flex flex-col justify-between overflow-y-auto">
          
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
                        className="bg-green-500 hover:bg-green-400 text-black font-bold text-xs py-2 rounded shadow-md"
                      >
                        Registrar Aposta
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

    </div>
  );
}
