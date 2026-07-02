export interface TeamStatistics {
  league: { id: number; name: string; country: string; logo: string; season: number };
  team: { id: number; name: string; logo: string };
  form: string;
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } };
    against: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } };
  };
}
