export interface APIFootballPrediction {
  predictions: {
    winner: { id: number; name: string; comment: string | null };
    win_or_draw: boolean;
    under_over: string | null;
    goals: { home: string | null; away: string | null };
    advice: string;
    percent: { home: string; draw: string; away: string };
  };
  teams: {
    home: { id: number; name: string; last_5: any };
    away: { id: number; name: string; last_5: any };
  };
  comparison: {
    form: { home: string; away: string };
    att: { home: string; away: string };
    def: { home: string; away: string };
    h2h: { home: string; away: string };
  };
}
