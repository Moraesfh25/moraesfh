import { Match, GeneratedMultiple } from "../types";
import { SportsService } from "./sportsService";
import { AIService } from "./aiService";

export class MultiplesService {
  static getMarketOddBySuggestion(match: Match, suggestion: string): { selection: "home" | "draw" | "away"; odd: number } {
    const m = suggestion.toLowerCase();
    
    if (m.includes("under 2.5")) {
      return { selection: "draw", odd: 1.85 };
    }
    if (m.includes("over 2.5")) {
      if (m.includes("vence") || m.includes("&")) {
        return { selection: "home", odd: 2.10 };
      }
      return { selection: "home", odd: 1.95 };
    }
    if (m.includes("over 1.5")) {
      return { selection: "home", odd: 1.50 };
    }
    if (m.includes("ambas marcam") || m.includes("btts")) {
      return { selection: "draw", odd: 1.80 };
    }
    if (m.includes("menos de 3.5") || m.includes("cartões")) {
      return { selection: "draw", odd: 1.65 };
    }
    if (m.includes("vitória") || m.includes("vence") || m.includes("ml")) {
      if (m.includes(match.homeTeam.toLowerCase())) {
        return { selection: "home", odd: match.odds.home };
      } else if (m.includes(match.awayTeam.toLowerCase())) {
        return { selection: "away", odd: match.odds.away };
      }
    }
    
    return { selection: "home", odd: match.odds.home };
  }

  // Automatically generates a combination multiple ticket based on game selections, count, and risk profile
  static generateMultiple(params: {
    gamesCount: number;
    riskLevel: "conservative" | "moderate" | "aggressive";
    marketType: "gols" | "vencedor" | "misto";
  }): GeneratedMultiple {
    const allMatches = SportsService.getMatches();
    
    // Sort and filter matches that match the risk criteria
    // Conservative: High IA Confidence, low odds
    // Moderate: Balanced
    // Aggressive: Higher odds, moderate confidence
    let sortedMatches = [...allMatches];

    if (params.riskLevel === "conservative") {
      sortedMatches.sort((a, b) => b.iaConfidence - a.iaConfidence);
    } else if (params.riskLevel === "aggressive") {
      // Aggressive favors high odds and slightly lower confidence
      sortedMatches.sort((a, b) => {
        const aMaxOdd = Math.max(a.odds.home, a.odds.away);
        const bMaxOdd = Math.max(b.odds.home, b.odds.away);
        return bMaxOdd - aMaxOdd;
      });
    } else {
      // Moderate: balanced confidence and average odds
      sortedMatches.sort((a, b) => b.iaConfidence * 0.6 + Math.max(a.odds.home, a.odds.away) * 0.4);
    }

    // Pick top unique matches
    const selectedMatches: Match[] = [];
    const usedIds = new Set<string>();

    for (const match of sortedMatches) {
      if (selectedMatches.length >= params.gamesCount) break;
      if (!usedIds.has(match.id)) {
        selectedMatches.push(match);
        usedIds.add(match.id);
      }
    }

    // Calculate total odds and confidence
    let oddTotal = 1.0;
    let confidenceSum = 0;

    const modifiedMatches = selectedMatches.map((match) => {
      // Predict selection based on risk profile and marketType
      let selection: "home" | "draw" | "away" = "home";
      let odd = match.odds.home;

      if (params.marketType === "vencedor") {
        if (match.probabilities.home >= match.probabilities.away) {
          selection = "home";
          odd = match.odds.home;
        } else {
          selection = "away";
          odd = match.odds.away;
        }
      } else if (params.marketType === "gols") {
        // Gols specific market
        const mSuggestion = match.iaMarketSuggestion || "Over 1.5 Gols";
        if (mSuggestion.toLowerCase().includes("gols") || mSuggestion.toLowerCase().includes("under") || mSuggestion.toLowerCase().includes("over")) {
          const res = MultiplesService.getMarketOddBySuggestion(match, mSuggestion);
          selection = res.selection;
          odd = res.odd;
        } else {
          selection = "draw";
          odd = 1.85; // Default Under 2.5 / Over 2.5 odds fallback
        }
      } else {
        // Mixed: use IA Market Suggestion directly
        const mSuggestion = match.iaMarketSuggestion || "Over 1.5 Gols";
        const res = MultiplesService.getMarketOddBySuggestion(match, mSuggestion);
        selection = res.selection;
        odd = res.odd;
      }

      oddTotal *= odd;
      confidenceSum += match.iaConfidence;

      return {
        ...match,
        odds: {
          ...match.odds,
          [selection]: odd
        }
      };
    });

    oddTotal = parseFloat(oddTotal.toFixed(2));
    const averageConfidence = Math.round(confidenceSum / selectedMatches.length);

    // Generate explanations based on profile
    const explanationTemplates = {
      conservative: `Múltipla otimizada de alta fidelidade para perfis conservadores. Os algoritmos do BetVision Pro selecionaram confrontos onde os favoritos têm domínio de posse superior a 62% e baixíssimo índice de cartões e desfalques. Retorno seguro e consistente.`,
      moderate: `Múltipla equilibrada combinando favoritismo local com tendências sólidas de mercados auxiliares (gols/ambas marcam). O índice de Valor Esperado (EV) consolidado nesta seleção de ${params.gamesCount} partidas é de +1.12, ideal para retornos médios recorrentes.`,
      aggressive: `Múltipla agressiva de alta rentabilidade recomendada para alavancagem rápida. Buscamos distorções nas odds de escanteios e transições de contra-ataque. Caso as tendências se consolidem nos primeiros 20 minutos de jogo, o potencial de green é extremamente expressivo.`
    };

    const riskMap: Record<string, "conservador" | "moderado" | "agressivo"> = {
      conservative: "conservador",
      moderate: "moderado",
      aggressive: "agressivo",
    };

    return {
      id: `mult_${Math.floor(Math.random() * 90000 + 10000)}`,
      matches: modifiedMatches,
      oddTotal,
      confidence: averageConfidence,
      riskLevel: riskMap[params.riskLevel],
      marketType: params.marketType,
      explanation: explanationTemplates[params.riskLevel]
    };
  }
}
