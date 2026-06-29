import { LucideIcon } from "lucide-react";

export interface Match {
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
  expectedValue?: number; // Calculated EV
  riskLevel?: "Baixo" | "Médio" | "Alto";
  stadium?: string;
  referee?: string;
  stats?: {
    possession: [number, number]; // [home, away]
    corners: [number, number];
    yellowCards: [number, number];
    redCards: [number, number];
    shotsOnTarget: [number, number];
    shotsOffTarget: [number, number];
    xg: [number, number];
  };
  lineups?: {
    home: string[];
    away: string[];
  };
  injuries?: {
    home: string[];
    away: string[];
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface BetSlipItem {
  match: Match;
  selection: "home" | "draw" | "away";
  odd: number;
}

export interface UserBet {
  id: string;
  selections: Array<{ match: string; market: string; odd: number }>;
  oddTotal: number;
  amount: number;
  potentialPayout: number;
  status: "pending" | "won" | "lost";
  date: string;
}

export interface GeneratedMultiple {
  id: string;
  matches: Match[];
  oddTotal: number;
  confidence: number;
  riskLevel: "conservador" | "moderado" | "agressivo";
  marketType: "gols" | "vencedor" | "misto";
  explanation: string;
}

export interface PlatformStats {
  roi: number;
  accuracy: number;
  profit: number;
  wins: number;
  losses: number;
  mostProfitableMarket: string;
  mostProfitableLeague: string;
}

export interface AdminLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

export interface PersonalFilter {
  id: string;
  name: string;
  league: string; // e.g. "all" or specific league
  filter: string; // e.g. "high_confidence", "favorites", "over_gols", "btts", "vip"
}

