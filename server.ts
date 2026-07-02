import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Google GenAI client lazily to avoid startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI | null => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
        console.log("✓ Google GenAI Client initialized successfully using gemini-2.5-flash");
      } catch (err) {
        console.error("⚠ Failed to initialize Google GenAI client:", err);
      }
    }
  }
  return aiClient;
};

// API Route: Predict Match probabilities and rationale
app.post("/api/predict", async (req, res) => {
  const { match } = req.body;
  if (!match) {
    return res.status(400).json({ error: "Dados da partida são obrigatórios." });
  }

  const client = getAiClient();
  if (!client) {
    console.log("GEMINI_API_KEY is not configured. Returning deterministic local math analysis.");
    return res.json({ usingFallback: true });
  }

  try {
    const prompt = `
      Você é o BetVision Pro, uma Inteligência Artificial especialista em análise tática e matemática esportiva para apostas de futebol.
      Gere uma análise profissional, profunda e detalhada para o seguinte confronto de futebol:
      
      - Time Mandante: ${match.homeTeam} (Força de Ataque: ${match.attackingStrength?.home}, Força de Defesa: ${match.defendingStrength?.home})
      - Time Visitante: ${match.awayTeam} (Força de Ataque: ${match.attackingStrength?.away}, Força de Defesa: ${match.defendingStrength?.away})
      - Campeonato: ${match.league}
      - Retrospecto H2H Recente: ${match.recentH2H || "Equilibrado"}
      - Guia de Forma Recente Mandante: ${match.formGuide?.home?.join(", ") || "Sem dados"}
      - Guia de Forma Recente Visitante: ${match.formGuide?.away?.join(", ") || "Sem dados"}
      - Sugestão de Mercado Pré-definida: ${match.iaMarketSuggestion || "Over 1.5 Gols"}
      
      Escreva uma análise tática (em português) de 2 a 3 parágrafos curtos e concisos. Use jargões de futebol modernos e profissionais (ex: transições ofensivas, bloco baixo, compactação tática, xG estimado, flutuação de odds). 
      Não prometa ganhos garantidos ou resultados 100% certeiros (mantenha conformidade de Jogo Responsável).
      Termine com uma recomendação analítica fundamentada sobre a melhor opção de investimento para essa partida.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const text = response.text || "";
    return res.json({ analysis: text, usingFallback: false });
  } catch (error) {
    console.error("Gemini API predict endpoint failed:", error);
    return res.json({ usingFallback: true, error: "Falha na conexão com Gemini API." });
  }
});

// API Route: Football API Proxy to protect credentials
app.get("/api/football", async (req, res) => {
  const { endpoint, ...queryParams } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: "Endpoint do API-Football é obrigatório." });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey || apiKey === "MY_API_FOOTBALL_KEY" || apiKey.trim() === "") {
    // Return an empty success structure to avoid crashes when API is not configured yet
    return res.json({
      get: endpoint,
      parameters: queryParams,
      errors: [],
      results: 0,
      paging: { current: 1, total: 1 },
      response: []
    });
  }

  try {
    const urlParams = new URLSearchParams(queryParams as Record<string, string>).toString();
    const targetUrl = `https://v3.football.api-sports.io/${endpoint}?${urlParams}`;

    const apiResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`RapidAPI responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return res.json(data);
  } catch (error: any) {
    console.error("API-Football proxy call failed:", error);
    return res.status(500).json({ error: "Falha ao se conectar com API-Football", details: error?.message });
  }
});

// API Route: AI chat consultant with history
app.post("/api/chat", async (req, res) => {
  const { message, chatHistory, relevantMatch } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  const client = getAiClient();
  if (!client) {
    console.log("GEMINI_API_KEY is not configured. Chat running on deterministic simulation.");
    return res.json({ usingFallback: true });
  }

  try {
    let matchContext = "";
    if (relevantMatch) {
      matchContext = `
        CONTEÚDO DA PARTIDA ATIVA SELECIONADA PARA ANÁLISE:
        Confronto: ${relevantMatch.homeTeam} x ${relevantMatch.awayTeam} (${relevantMatch.league})
        Confiança IA: ${relevantMatch.iaConfidence}%
        Probabilidades Estimadas: Mandante ${relevantMatch.probabilities.home}%, Empate ${relevantMatch.probabilities.draw}%, Visitante ${relevantMatch.probabilities.away}%
        Sugestão Oficial: ${relevantMatch.iaMarketSuggestion}
        Análise Prévia: ${relevantMatch.iaAnalysis}
        Retrospecto H2H: ${relevantMatch.recentH2H}
        Desfalques Mandante: ${relevantMatch.injuries?.home?.join(", ") || "Nenhum significativo"}
        Desfalques Visitante: ${relevantMatch.injuries?.away?.join(", ") || "Nenhum significativo"}
      `;
    }

    const systemInstruction = `
      Você é o Consultor Tático IA do BetVision Pro, uma plataforma SaaS de análise esportiva profissional.
      Você ajuda os usuários analisando times, escalações, lesões, expected value (EV), critérios de stake (como Kelly Criterion), gestão de banca e estratégias de apostas de futebol.
      
      Diretrizes:
      - Seja profissional, técnico e objetivo. Use jargões de futebol de alto nível.
      - NUNCA garanta lucros ou prometa retornos fáceis. Seja 100% transparente sobre os riscos inerentes às apostas de futebol (Mantenha rígida conformidade de Jogo Responsável).
      - Responda de forma clara, amigável e com excelente formatação em Markdown (tópicos, negritos).
      - Limite sua resposta a 150-200 palavras no máximo para manter a legibilidade.
      - Idioma: Português.
      
      ${matchContext}
    `;

    // Map history to the structure required by the SDK
    const contents = chatHistory.map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));
    
    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 400
      }
    });

    const reply = response.text || "Desculpe, tive um problema para processar a resposta.";
    return res.json({ text: reply, usingFallback: false });
  } catch (error) {
    console.error("Gemini API chat endpoint failed:", error);
    return res.json({ usingFallback: true, error: "Falha ao consultar a inteligência artificial." });
  }
});

// Mount Vite middleware or static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode. Serving pre-compiled static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ BetVision Pro server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
