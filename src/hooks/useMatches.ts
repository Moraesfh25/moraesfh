import { useState, useEffect, useCallback, useRef } from "react";
import { Match } from "../types";
import { MatchService } from "../services/matchService";
import { SportsService } from "../services/sportsService";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const tickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMatches = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await MatchService.getUpcomingMatches();
      setMatches(data);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar partidas");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Update live scores incrementally just like the base SportsService tick mechanism
  const startLiveTicker = useCallback(() => {
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    
    tickTimerRef.current = setInterval(() => {
      setMatches((prevMatches) => {
        // If there are no live games in the list, just keep current
        if (!prevMatches.some((m) => m.isLive)) return prevMatches;
        
        // Use SportsService to advance live simulation
        const ticked = SportsService.tickLiveGames();
        
        // Merge the ticked simulation updates back with the current state matches
        return prevMatches.map((m) => {
          const updated = ticked.find((u) => u.id === m.id);
          return updated ? updated : m;
        });
      });
    }, 8000); // realistic 8 second update frequency
  }, []);

  useEffect(() => {
    fetchMatches();
    startLiveTicker();

    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
      }
    };
  }, [fetchMatches, startLiveTicker]);

  return {
    matches,
    loading,
    error,
    refresh: fetchMatches,
    setMatches
  };
}
