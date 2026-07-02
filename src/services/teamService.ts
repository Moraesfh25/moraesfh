import { APIFootballClient } from "./apiFootball";
import { TeamDetail, VenueDetail, APIFootballTeamResponse } from "../types";


export class TeamService {
  // Fetch specific team data by ID
  static async getTeamDetails(teamId: number): Promise<APIFootballTeamResponse | null> {
    try {
      const response = await APIFootballClient.request<APIFootballTeamResponse>("teams", {
        id: teamId.toString()
      });
      if (response && response.length > 0) {
        return response[0];
      }
    } catch (err) {
      console.error(`[TeamService] Failed to load team ${teamId}:`, err);
    }
    return null;
  }

  // Fetch team details by name search
  static async searchTeamByName(name: string): Promise<APIFootballTeamResponse[]> {
    try {
      return await APIFootballClient.request<APIFootballTeamResponse>("teams", {
        search: name
      });
    } catch (err) {
      console.error(`[TeamService] Failed to search team by name (${name}):`, err);
      return [];
    }
  }
}
