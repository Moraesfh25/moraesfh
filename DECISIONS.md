# Registro de Decisões Técnicas (DECISIONS.md)

Este documento registra formalmente as escolhas de arquitetura, ferramentas e integrações do **BetVision Pro**, servindo como fonte única da verdade técnica para justificar caminhos de desenvolvimento adotados e evitar retrabalho.

---

## 📅 Histórico de Decisões

### 🟢 2026-06-30: Escolha da API-Football (v3.football.api-sports.io)
*   **Decisão:** Utilizar a **API-Football** como provedor de dados padrão de partidas, escalações, classificações e palpites estatísticos.
*   **Motivo:** Cobertura global imbatível de mais de 900 campeonatos, estabilidade excelente de xG, odds preliminares e dados ao vivo rápidos via WebSocket ou polling.
*   **Status:** Integrado via proxies seguros e cache no backend.

---

### 🟢 2026-07-01: Arquitetura de Cache Local no Cliente e no Servidor
*   **Decisão:** Implementar um cache duplo — `localStorage` no frontend com expiração de 5 minutos, e cache local em variáveis na rota proxy do `server.ts`.
*   **Motivo:** Evitar o esgotamento precoce de requisições do plano da API-Football e acelerar drasticamente a transição de telas para o usuário final, eliminando lags de requisição de rede persistentes.
*   **Status:** Implementado no `src/services/apiFootball.ts` e preparado na camada proxy.

---

### 🟢 2026-07-01: Integração de Proxy no Backend do Express
*   **Decisão:** Criar a rota `/api/football` para atuar como proxy das credenciais RapidAPI / API-Football.
*   **Motivo:** Proteger as chaves sensíveis de produção contra inspeção de código nas ferramentas de desenvolvedor (F12 / DevTools) do navegador.
*   **Status:** Implementado no `server.ts` e exportado nos serviços correspondentes.

---

### 🟢 2026-07-01: Utilização do @google/genai SDK (Gemini API)
*   **Decisão:** Adotar o SDK oficial do Google (`@google/genai`) para processamento inteligente, geração de análises estatísticas em português e conversação fluida no chat.
*   **Motivo:** Alinhamento nativo com o ecossistema de alta velocidade do Gemini 2.5/3.5, permitindo prompts com altíssima taxa de contexto e custos eficientes.
*   **Status:** Integrado nativamente e implementado para análises esportivas em tempo real.
