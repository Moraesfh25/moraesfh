import { APIFootballClient } from "./apiFootball";
import { TeamStatistics } from "../types";


export class StatisticsService {
  // Fetch team statistics for a specific league and season
  static async getTeamStatistics(params: {
    leagueId: number;
    teamId: number;
    season: number;
  }): Promise<TeamStatistics | null> {
    try {
      const stats = await APIFootballClient.request<TeamStatistics>("teams/statistics", {
        league: params.leagueId.toString(),
        team: params.teamId.toString(),
        season: params.season.toString()
      });
      if (stats && stats.length > 0) {
        return stats[0];
      }
    } catch (err) {
      console.error(`[StatisticsService] Failed to load statistics:`, err);
    }
    return null;
  }
}
