import { useState, useEffect, useCallback } from "react";
import { Match, APIFootballPrediction } from "../types";
import { PredictionsService } from "../services/predictionsService";
import { AIService } from "../services/aiService";

export function usePredictions(selectedMatch: Match | null) {
  const [prediction, setPrediction] = useState<APIFootballPrediction | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictionData = useCallback(async () => {
    if (!selectedMatch) {
      setPrediction(null);
      setAiAnalysis("");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Load AI-powered textual context from AIService
      const textAnalysis = await AIService.getAIAnalysis(selectedMatch);
      setAiAnalysis(textAnalysis);

      // 2. Load API-Football predictive metrics if it's an API match
      if (selectedMatch.id.startsWith("api_")) {
        const fixtureId = parseInt(selectedMatch.id.replace("api_", ""), 10);
        if (!isNaN(fixtureId)) {
          const apiPred = await PredictionsService.getFixturePredictions(fixtureId);
          setPrediction(apiPred);
        }
      } else {
        setPrediction(null);
      }
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar prognósticos");
    } finally {
      setLoading(false);
    }
  }, [selectedMatch]);

  useEffect(() => {
    fetchPredictionData();
  }, [fetchPredictionData]);

  return {
    prediction,
    aiAnalysis,
    loading,
    error,
    refresh: fetchPredictionData
  };
}
