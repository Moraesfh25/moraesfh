import { APIFootballClient } from "./apiFootball";
import { APIFootballPrediction } from "../types";


export class PredictionsService {
  // Fetch detailed API predictions for a fixture
  static async getFixturePredictions(fixtureId: number): Promise<APIFootballPrediction | null> {
    try {
      const results = await APIFootballClient.request<APIFootballPrediction>("predictions", {
        fixture: fixtureId.toString()
      });
      if (results && results.length > 0) {
        return results[0];
      }
    } catch (err) {
      console.error(`[PredictionsService] Failed to load prediction for fixture ${fixtureId}:`, err);
    }
    return null;
  }
}
