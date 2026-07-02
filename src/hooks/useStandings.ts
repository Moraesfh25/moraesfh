import { useState, useEffect, useCallback } from "react";
import { SportsService } from "../services/sportsService";

export interface StandingTeam {
  pos: number;
  team: string;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  pts: number;
}

export function useStandings(initialLeague = "Premier League") {
  const [league, setLeague] = useState<string>(initialLeague);
  const [standings, setStandings] = useState<StandingTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch standings from local service with mock/API data support
      const data = SportsService.getStandings(league);
      setStandings(data || []);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar a classificação");
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return {
    standings,
    league,
    setLeague,
    loading,
    error,
    refresh: fetchStandings
  };
}
