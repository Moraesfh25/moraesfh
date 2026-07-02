import { Match, APIFootballFixture } from "../types";
import { APIFootballClient } from "./apiFootball";
import { SportsService } from "./sportsService";

export class MatchService {
  // Convert API-Football fixture to internal Match format
  static mapToInternalMatch(f: APIFootballFixture): Match {
    const isLive = f.fixture.status.short === "1H" || f.fixture.status.short === "2H" || f.fixture.status.short === "HT";
    
    // Fallback static metrics based on team names / random high-realism hashes
    const getHashValue = (str: string, max = 20, offset = 75) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return offset + (Math.abs(hash) % max);
    };

    const homeAttack = getHashValue(f.teams.home.name, 20, 78);
    const awayAttack = getHashValue(f.teams.away.name, 20, 75);
    const homeDefend = getHashValue(f.teams.home.name, 15, 80);
    const awayDefend = getHashValue(f.teams.away.name, 15, 78);

    const confidence = getHashValue(f.teams.home.name + f.teams.away.name, 25, 70);
    const stars = Math.min(5, Math.max(1, Math.round(confidence / 19)));

    // Generate balanced dynamic odds
    const oddsHome = parseFloat((95 / homeAttack * 1.5).toFixed(2));
    const oddsAway = parseFloat((95 / awayAttack * 1.5).toFixed(2));
    const oddsDraw = parseFloat((3.0 + (Math.abs(homeAttack - awayAttack) * 0.1)).toFixed(2));

    const totalPower = homeAttack + awayAttack;
    const homeProb = Math.round((homeAttack / totalPower) * 82);
    const awayProb = Math.round((awayAttack / totalPower) * 82);
    const drawProb = 100 - homeProb - awayProb;

    return {
      id: `api_${f.fixture.id}`,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      league: f.league.name,
      country: f.league.country,
      time: isLive ? `${f.fixture.status.elapsed}'` : f.fixture.status.long,
      date: new Date(f.fixture.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      isVIP: confidence >= 90,
      isLive: isLive,
      liveMinute: f.fixture.status.elapsed || undefined,
      liveScore: isLive ? [f.goals.home || 0, f.goals.away || 0] : undefined,
      iaConfidence: confidence,
      iaStars: stars,
      odds: { home: oddsHome, draw: oddsDraw, away: oddsAway },
      probabilities: { home: homeProb, draw: drawProb, away: awayProb },
      iaMarketSuggestion: confidence > 88 ? "Ambas Marcam (Sim)" : "Over 2.5 Gols",
      iaAnalysis: `${f.teams.home.name} entra em campo exibindo uma eficiência ofensiva de ${homeAttack}%, enquanto o ${f.teams.away.name} opera com força ofensiva de ${awayAttack}%. Com base na compactação defensiva, o mercado oferece valor esperado positivo no médio prazo.`,
      attackingStrength: { home: homeAttack, away: awayAttack },
      defendingStrength: { home: homeDefend, away: awayDefend },
      recentH2H: `${f.teams.home.name} x ${f.teams.away.name} histórico parelho e equilibrado.`,
      formGuide: { home: ["W", "D", "W", "L", "W"], away: ["W", "W", "D", "W", "L"] },
      expectedValue: 1.08,
      riskLevel: confidence > 88 ? "Baixo" : "Médio",
      stadium: f.fixture.venue.name || undefined,
      referee: f.fixture.referee || undefined,
      stats: isLive ? {
        possession: [51, 49],
        corners: [4, 3],
        yellowCards: [1, 1],
        redCards: [0, 0],
        shotsOnTarget: [4, 3],
        shotsOffTarget: [5, 4],
        xg: [1.25, 0.95]
      } : undefined
    };
  }

  // Fetch upcoming matches
  static async getUpcomingMatches(): Promise<Match[]> {
    try {
      // Fetch next 30 matches from major leagues (Premier League: 39, La Liga: 140, Serie A: 135, Champions League: 2, etc.)
      const fixtures = await APIFootballClient.request<APIFootballFixture>("fixtures", {
        next: "30"
      });
      
      if (fixtures && fixtures.length > 0) {
        return fixtures.map(this.mapToInternalMatch);
      }
    } catch (err) {
      console.warn("[MatchService] Failed to load from API-Football. Using fallback local SportsService data.", err);
    }

    // Fallback to existing mock matches
    return SportsService.getMatches();
  }
}
