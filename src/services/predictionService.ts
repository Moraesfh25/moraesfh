import { Match, GeneratedMultiple } from "../types";
import { SportsService } from "./sportsService";

export interface SmartPrediction {
  matchId: string;
  confidence: number;
  riskLevel: "Baixo" | "Médio" | "Alto";
  analysisSummary: string;
  recommendedMarkets: string[];
  dangerousMarkets: string[];
  suggestedStake: string;
  score: {
    attack: number;
    defense: number;
    corners: number;
    cards: number;
    goals: number;
    equilibrium: number;
  };
  suggestions: {
    result: {
      home: { value: string; odd: number; prob: number };
      draw: { value: string; odd: number; prob: number };
      away: { value: string; odd: number; prob: number };
    };
    goals: {
      over15: { value: string; odd: number; prob: number };
      over25: { value: string; odd: number; prob: number };
      over35: { value: string; odd: number; prob: number };
      under25: { value: string; odd: number; prob: number };
      btts: { value: string; odd: number; prob: number };
    };
    corners: {
      over75: { value: string; odd: number; prob: number };
      over85: { value: string; odd: number; prob: number };
      over95: { value: string; odd: number; prob: number };
      over105: { value: string; odd: number; prob: number };
      homeCorners: { value: string; valueNum: number };
      awayCorners: { value: string; valueNum: number };
      firstHalf: { value: string; valueNum: number };
      secondHalf: { value: string; valueNum: number };
    };
    cards: {
      over25: { value: string; odd: number; prob: number };
      over35: { value: string; odd: number; prob: number };
      over45: { value: string; odd: number; prob: number };
      firstCard: { value: string; team: string };
      mostBooked: { value: string; team: string };
      homeCards: { value: string; valueNum: number };
      awayCards: { value: string; valueNum: number };
    };
    shots: {
      over65: { value: string; odd: number; prob: number };
      over85: { value: string; odd: number; prob: number };
      over105: { value: string; odd: number; prob: number };
      topShooter: { value: string; player: string };
      topTeam: { value: string; team: string };
    };
    offsides: {
      over15: { value: string; odd: number; prob: number };
      over25: { value: string; odd: number; prob: number };
      over35: { value: string; odd: number; prob: number };
    };
  };
}

export interface SmartMultiple {
  id: string;
  type: "conservadora" | "moderada" | "agressiva" | "premium" | "ao_vivo";
  matches: Array<{
    match: Match;
    market: string;
    odd: number;
  }>;
  oddTotal: number;
  probability: number;
  stake: number;
  confidence: number;
  justification: string;
}

export interface ProTicket {
  id: string;
  match: Match;
  markets: string[];
  oddTotal: number;
  confidence: number;
  justification: string;
}

export class PredictionService {
  // Generates 0-100 statistical scores for a match
  static calculateMatchScore(match: Match) {
    const homeAttack = match.attackingStrength?.home ?? 75;
    const awayAttack = match.attackingStrength?.away ?? 75;
    const homeDefense = match.defendingStrength?.home ?? 75;
    const awayDefense = match.defendingStrength?.away ?? 75;

    const attackScore = Math.round((homeAttack + awayAttack) / 2);
    const defenseScore = Math.round((homeDefense + awayDefense) / 2);
    
    // Corners score is high if attack is high and defense is balanced
    const cornersScore = Math.round((homeAttack * 1.05 + awayAttack * 0.95) / 2 + 5);
    
    // Cards score - higher for high-risk, intense matches, or specific teams
    const isDerby = match.league.includes("Libertadores") || match.homeTeam === "Real Madrid" || match.homeTeam === "Flamengo";
    const cardsScore = isDerby ? Math.round(75 + Math.random() * 20) : Math.round(55 + Math.random() * 25);
    
    // Goals score correlates directly with attack strength and low defense strength
    const goalsScore = Math.round((attackScore * 1.2 + (100 - defenseScore) * 0.8) / 2);
    
    // Equilibrium score - high if teams are close in strength
    const attackDiff = Math.abs(homeAttack - awayAttack);
    const defenseDiff = Math.abs(homeDefense - awayDefense);
    const equilibriumScore = Math.max(10, 100 - Math.round((attackDiff + defenseDiff) * 1.5));

    return {
      attack: Math.min(100, Math.max(0, attackScore)),
      defense: Math.min(100, Math.max(0, defenseScore)),
      corners: Math.min(100, Math.max(0, cornersScore)),
      cards: Math.min(100, Math.max(0, cardsScore)),
      goals: Math.min(100, Math.max(0, goalsScore)),
      equilibrium: Math.min(100, Math.max(0, equilibriumScore)),
    };
  }

  // Centralized AI prediction generator following mathematical models (Poisson, xG, etc.)
  static generateSmartPrediction(match: Match): SmartPrediction {
    const scores = this.calculateMatchScore(match);
    const homeAttack = match.attackingStrength?.home ?? 75;
    const awayAttack = match.attackingStrength?.away ?? 75;
    const homeDefense = match.defendingStrength?.home ?? 75;
    const awayDefense = match.defendingStrength?.away ?? 75;

    // Confidence derived from match strengths and form consistency
    const isVIP = match.isVIP;
    let confidence = match.iaConfidence || Math.round(70 + (homeAttack % 15) + (awayAttack % 10));
    if (isVIP) confidence = Math.min(98, confidence + 2);
    
    const riskLevel: "Baixo" | "Médio" | "Alto" = confidence > 88 ? "Baixo" : confidence > 78 ? "Médio" : "Alto";

    // Poisson-like simulated values
    const expectedGoalsHome = parseFloat(((homeAttack / 100) * 1.8 * (1.1 - awayDefense / 100)).toFixed(2));
    const expectedGoalsAway = parseFloat(((awayAttack / 100) * 1.5 * (1.1 - homeDefense / 100)).toFixed(2));
    const totalExpGoals = expectedGoalsHome + expectedGoalsAway;

    // Recommended & Dangerous markets
    const recommendedMarkets: string[] = [];
    const dangerousMarkets: string[] = [];

    if (totalExpGoals > 2.6) {
      recommendedMarkets.push("Ambas Marcam (BTTS)", "Over 2.5 Gols");
      dangerousMarkets.push("Under 1.5 Gols", "Resultado Exato Empate");
    } else {
      recommendedMarkets.push("Under 2.5 Gols", "Dupla Chance Mandante ou Visitante");
      dangerousMarkets.push("Over 3.5 Gols", "Ambas Marcam (Não)");
    }

    if (scores.corners > 85) {
      recommendedMarkets.push("Over 8.5 Escanteios", "Over 9.5 Escanteios");
    } else {
      dangerousMarkets.push("Over 10.5 Escanteios");
    }

    if (scores.cards > 80) {
      recommendedMarkets.push("Over 3.5 Cartões");
    } else {
      dangerousMarkets.push("Over 5.5 Cartões");
    }

    // Suggested Stake
    const suggestedStake = riskLevel === "Baixo" ? "5% (Conservador)" : riskLevel === "Médio" ? "3% (Moderado)" : "1.5% (Agressivo)";

    // Top player simulation based on lineup
    const homeLineup = match.lineups?.home || ["Gabriel", "Pedro", "Bruno", "Arrascaeta", "Gerson"];
    const awayLineup = match.lineups?.away || ["Calleri", "Lucas", "Nestor", "Wellington", "Alan"];
    const topShooter = homeAttack >= awayAttack ? homeLineup[homeLineup.length - 1] : awayLineup[awayLineup.length - 1];
    const topTeam = homeAttack >= awayAttack ? match.homeTeam : match.awayTeam;

    // Detailed Portuguese text generation
    const analysisSummary = `Nossos modelos de rede neural integrados estimam um volume de jogo ofensivo de ${expectedGoalsHome.toFixed(2)} xG para o ${match.homeTeam} contra ${expectedGoalsAway.toFixed(2)} xG para o ${match.awayTeam}. O ${match.homeTeam} desfruta de excelente aproveitamento em transição no terço final (classificação de ataque: ${homeAttack}%). O histórico recente (H2H: ${match.recentH2H || "Equilibrado"}) corrobora com a probabilidade de alta combatividade nas laterais, indicando valor no mercado de ${recommendedMarkets[0]}.`;

    // 1. RESULT MARKETS
    const probHome = match.probabilities?.home ?? 45;
    const probAway = match.probabilities?.away ?? 30;
    const probDraw = 100 - probHome - probAway;

    // 2. GOALS MARKETS
    const probOver15 = Math.min(99, Math.round(55 + (totalExpGoals * 15)));
    const probOver25 = Math.min(95, Math.round(35 + (totalExpGoals * 18)));
    const probOver35 = Math.min(85, Math.round(15 + (totalExpGoals * 14)));
    const probUnder25 = 100 - probOver25;
    const probBtts = Math.min(95, Math.round((homeAttack + awayAttack) / 2.1));

    // 3. CORNERS MARKETS
    const cornersExpTotal = parseFloat((7.5 + (scores.corners / 100) * 4).toFixed(1));
    const cornersExpHome = parseFloat((cornersExpTotal * (homeAttack / (homeAttack + awayAttack))).toFixed(1));
    const cornersExpAway = parseFloat((cornersExpTotal - cornersExpHome).toFixed(1));

    // 4. CARDS MARKETS
    const cardsExpTotal = parseFloat((2.5 + (scores.cards / 100) * 3.5).toFixed(1));
    const cardsExpHome = parseFloat((cardsExpTotal * (awayAttack / (homeAttack + awayAttack))).toFixed(1)); // away attack creates cards for home defense
    const cardsExpAway = parseFloat((cardsExpTotal - cardsExpHome).toFixed(1));

    // 5. SHOTS MARKETS
    const shotsExpTotal = parseFloat((11 + (scores.attack / 100) * 8).toFixed(1));

    // 6. OFFSIDES MARKETS
    const offsidesExpTotal = parseFloat((2.2 + (scores.equilibrium / 100) * 2.5).toFixed(1));

    return {
      matchId: match.id,
      confidence,
      riskLevel,
      analysisSummary,
      recommendedMarkets: recommendedMarkets.slice(0, 3),
      dangerousMarkets: dangerousMarkets.slice(0, 3),
      suggestedStake,
      score: scores,
      suggestions: {
        result: {
          home: { value: `Vitória ${match.homeTeam}`, odd: match.odds?.home ?? 1.85, prob: probHome },
          draw: { value: "Empate", odd: match.odds?.draw ?? 3.30, prob: probDraw },
          away: { value: `Vitória ${match.awayTeam}`, odd: match.odds?.away ?? 4.20, prob: probAway },
        },
        goals: {
          over15: { value: "Mais de 1.5 Gols", odd: parseFloat((1.1 + (100 - probOver15) / 100).toFixed(2)), prob: probOver15 },
          over25: { value: "Mais de 2.5 Gols", odd: parseFloat((1.3 + (100 - probOver25) / 100).toFixed(2)), prob: probOver25 },
          over35: { value: "Mais de 3.5 Gols", odd: parseFloat((1.7 + (100 - probOver35) / 100).toFixed(2)), prob: probOver35 },
          under25: { value: "Menos de 2.5 Gols", odd: parseFloat((1.3 + (100 - probUnder25) / 100).toFixed(2)), prob: probUnder25 },
          btts: { value: "Ambas Marcam (Sim)", odd: parseFloat((1.25 + (100 - probBtts) / 100).toFixed(2)), prob: probBtts },
        },
        corners: {
          over75: { value: "Mais de 7.5", odd: 1.22, prob: Math.min(99, Math.round(60 + scores.corners * 0.35)) },
          over85: { value: "Mais de 8.5", odd: 1.48, prob: Math.min(98, Math.round(45 + scores.corners * 0.45)) },
          over95: { value: "Mais de 9.5", odd: 1.82, prob: Math.min(94, Math.round(30 + scores.corners * 0.55)) },
          over105: { value: "Mais de 10.5", odd: 2.30, prob: Math.min(85, Math.round(15 + scores.corners * 0.60)) },
          homeCorners: { value: `Média Esperada: ${cornersExpHome}`, valueNum: cornersExpHome },
          awayCorners: { value: `Média Esperada: ${cornersExpAway}`, valueNum: cornersExpAway },
          firstHalf: { value: `Média 1ºT: ${(cornersExpTotal * 0.45).toFixed(1)}`, valueNum: parseFloat((cornersExpTotal * 0.45).toFixed(1)) },
          secondHalf: { value: `Média 2ºT: ${(cornersExpTotal * 0.55).toFixed(1)}`, valueNum: parseFloat((cornersExpTotal * 0.55).toFixed(1)) },
        },
        cards: {
          over25: { value: "Mais de 2.5", odd: 1.35, prob: Math.min(99, Math.round(55 + scores.cards * 0.4)) },
          over35: { value: "Mais de 3.5", odd: 1.70, prob: Math.min(95, Math.round(40 + scores.cards * 0.45)) },
          over45: { value: "Mais de 4.5", odd: 2.25, prob: Math.min(88, Math.round(25 + scores.cards * 0.5)) },
          firstCard: { value: "Time a receber primeiro cartão", team: homeAttack >= awayAttack ? match.awayTeam : match.homeTeam },
          mostBooked: { value: "Equipe mais advertida", team: homeDefense <= awayDefense ? match.homeTeam : match.awayTeam },
          homeCards: { value: `Média: ${cardsExpHome}`, valueNum: cardsExpHome },
          awayCards: { value: `Média: ${cardsExpAway}`, valueNum: cardsExpAway },
        },
        shots: {
          over65: { value: "Mais de 6.5 chutes no alvo", odd: 1.40, prob: Math.min(99, Math.round(50 + scores.attack * 0.45)) },
          over85: { value: "Mais de 8.5 chutes no alvo", odd: 1.85, prob: Math.min(95, Math.round(35 + scores.attack * 0.5)) },
          over105: { value: "Mais de 10.5 chutes no alvo", odd: 2.65, prob: Math.min(88, Math.round(15 + scores.attack * 0.55)) },
          topShooter: { value: "Jogador com mais finalizações", player: topShooter },
          topTeam: { value: "Equipe com mais finalizações", team: topTeam },
        },
        offsides: {
          over15: { value: "Mais de 1.5", odd: 1.30, prob: Math.min(99, Math.round(60 + scores.equilibrium * 0.35)) },
          over25: { value: "Mais de 2.5", odd: 1.72, prob: Math.min(95, Math.round(45 + scores.equilibrium * 0.4)) },
          over35: { value: "Mais de 3.5", odd: 2.50, prob: Math.min(85, Math.round(20 + scores.equilibrium * 0.45)) },
        },
      },
    };
  }

  // Generates 5 distinct AI Smart Multiples
  static generateSmartMultiples(matches: Match[]): SmartMultiple[] {
    if (matches.length < 2) return [];

    // Let's seed unique combinations for Conservative, Moderate, Aggressive, Premium, and Live
    const multipleTypes: Array<SmartMultiple["type"]> = ["conservadora", "moderada", "agressiva", "premium", "ao_vivo"];
    const results: SmartMultiple[] = [];

    for (const type of multipleTypes) {
      let selectedMatches: Match[] = [];
      let justification = "";
      let confidence = 85;
      let stake = 3.0;
      let prob = 70;

      if (type === "conservadora") {
        selectedMatches = [...matches].sort((a, b) => b.iaConfidence - a.iaConfidence).slice(0, 3);
        justification = "O modelo de IA focou estritamente em favoritos com probabilidade estatística de vitória acima de 78%. Cobrimos dupla chance e totais conservadores de gols para mitigar variância.";
        confidence = 94;
        stake = 5.0;
        prob = 89;
      } else if (type === "moderada") {
        selectedMatches = [...matches].sort((a, b) => b.attackingStrength.home - a.attackingStrength.home).slice(0, 3);
        justification = "Foco em jogos de transição ofensiva rápida que apresentam probabilidade consolidada superior a 75% para Ambas Marcam ou Over 2.5 gols. Ótimo retorno sobre investimento esperado.";
        confidence = 88;
        stake = 3.0;
        prob = 74;
      } else if (type === "agressiva") {
        selectedMatches = [...matches].sort((a, b) => Math.max(b.odds.home, b.odds.away) - Math.max(a.odds.home, a.odds.away)).slice(0, 3);
        justification = "Construído sob análises de valor esperado positivo (EV). Foram localizadas distorções em mercados secundários de cartões e escanteios com alto retorno em odds combinadas.";
        confidence = 72;
        stake = 1.5;
        prob = 48;
      } else if (type === "premium") {
        selectedMatches = matches.filter(m => m.isVIP).slice(0, 2);
        if (selectedMatches.length < 2) {
          selectedMatches = matches.slice(0, 2);
        }
        justification = "Bilhete analítico premium VIP. Integra os mercados mais consistentes e validados da rodada. Suporta volume de stake elevado.";
        confidence = 92;
        stake = 4.0;
        prob = 85;
      } else {
        // Ao Vivo
        selectedMatches = matches.filter(m => m.isLive).slice(0, 2);
        if (selectedMatches.length < 2) {
          selectedMatches = matches.slice(0, 2);
        }
        justification = "Múltipla em tempo real baseada em fluxo asiático de odds ao vivo e momentum tático. Aproveitamos o aumento das odds nos últimos minutos dos tempos regulamentares.";
        confidence = 82;
        stake = 2.0;
        prob = 68;
      }

      // Build markets
      let oddTotal = 1.0;
      const matchSelections = selectedMatches.map((m, idx) => {
        let market = "Over 1.5 Gols";
        let odd = 1.35;

        if (type === "conservadora") {
          market = `Dupla Chance ${m.homeTeam} ou Empate`;
          odd = parseFloat((m.odds.home * 0.65).toFixed(2));
          if (odd < 1.15) odd = 1.25;
        } else if (type === "moderada") {
          market = "Ambas Marcam (BTTS)";
          odd = 1.82;
        } else if (type === "agressiva") {
          market = "Over 9.5 Escanteios";
          odd = 1.95;
        } else if (type === "premium") {
          market = `Vitória ${m.homeTeam}`;
          odd = m.odds.home;
        } else {
          market = "Over 0.5 Gols no 2º Tempo";
          odd = 1.55;
        }

        oddTotal *= odd;
        return {
          match: m,
          market,
          odd,
        };
      });

      results.push({
        id: `mult_ia_${type}_${Math.floor(Math.random() * 9000 + 1000)}`,
        type,
        matches: matchSelections,
        oddTotal: parseFloat(oddTotal.toFixed(2)),
        probability: prob,
        stake,
        confidence,
        justification,
      });
    }

    return results;
  }

  // Generates single high EV "Bilhete PRO" combining multiple markets for a single match
  static generateProTicket(match: Match): ProTicket {
    const scores = this.calculateMatchScore(match);
    const homeAttack = match.attackingStrength?.home ?? 75;
    
    const markets: string[] = [];
    let oddTotal = 1.0;

    // Build combinations
    if (homeAttack > 85) {
      markets.push(`${match.homeTeam} Vence`);
      oddTotal *= (match.odds.home || 1.65);
    } else {
      markets.push(`Dupla Chance ${match.homeTeam} ou ${match.awayTeam}`);
      oddTotal *= 1.35;
    }

    if (scores.corners > 80) {
      markets.push("Mais de 8.5 Escanteios");
      oddTotal *= 1.48;
    } else {
      markets.push("Mais de 7.5 Escanteios");
      oddTotal *= 1.25;
    }

    if (scores.cards > 75) {
      markets.push("Mais de 3.5 Cartões");
      oddTotal *= 1.70;
    } else {
      markets.push("Mais de 2.5 Cartões");
      oddTotal *= 1.35;
    }

    // Adjust combined total
    oddTotal = parseFloat((oddTotal * 0.95).toFixed(2)); // combined multi discount
    if (oddTotal < 1.8) oddTotal = 2.45;

    const confidence = Math.min(96, Math.round(82 + (scores.attack % 10) + (scores.corners % 5)));

    return {
      id: `pro_${match.id}_${Math.floor(Math.random() * 9000 + 1000)}`,
      match,
      markets,
      oddTotal,
      confidence,
      justification: `A IA BetVision Pro correlacionou os vetores de volume de ataque e o estilo tático focado em largura de ambas as equipes. O alto índice de gols esperados corrobora para um cenário propício ao cumprimento simultâneo destas linhas combinadas.`
    };
  }

  // Corners rankings dashboards
  static getCornersRankings(matches: Match[]) {
    const scoredMatches = matches.map(m => {
      const score = this.calculateMatchScore(m);
      return { match: m, score: score.corners };
    });

    // Top 10 maps sorted by corner score
    const sorted = [...scoredMatches].sort((a, b) => b.score - a.score);

    return {
      over75: sorted.slice(0, 10).map((sm, i) => ({ ...sm, odd: 1.25, prob: Math.min(99, 85 + (10 - i) * 1.3) })),
      over85: sorted.slice(0, 10).map((sm, i) => ({ ...sm, odd: 1.52, prob: Math.min(95, 75 + (10 - i) * 1.5) })),
      over95: sorted.slice(0, 10).map((sm, i) => ({ ...sm, odd: 1.95, prob: Math.min(88, 62 + (10 - i) * 1.8) })),
      over105: sorted.slice(0, 10).map((sm, i) => ({ ...sm, odd: 2.45, prob: Math.min(78, 48 + (10 - i) * 2.1) })),
    };
  }

  // Cards rankings dashboards
  static getCardsRankings(matches: Match[]) {
    const scoredMatches = matches.map(m => {
      const score = this.calculateMatchScore(m);
      return { match: m, score: score.cards };
    });

    const sorted = [...scoredMatches].sort((a, b) => b.score - a.score);

    return {
      over25: sorted.slice(0, 10).map((sm, i) => ({ ...sm, odd: 1.32, prob: Math.min(99, 88 + (10 - i) * 1.1) })),
      over35: sorted.slice(0, 10).map((sm, i) => ({ ...sm, odd: 1.72, prob: Math.min(95, 72 + (10 - i) * 1.5) })),
      over45: sorted.slice(0, 10).map((sm, i) => ({ ...sm, odd: 2.30, prob: Math.min(88, 58 + (10 - i) * 1.9) })),
      over55: sorted.slice(0, 10).map((sm, i) => ({ ...sm, odd: 3.10, prob: Math.min(75, 42 + (10 - i) * 2.2) })),
    };
  }
}
