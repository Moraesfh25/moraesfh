# Especificação de APIs (API_SPEC.md)

Este documento especifica todos os endpoints integrados ao backend do **BetVision Pro**, detalhando formatos de payload, autenticação e parâmetros.

---

## 🔒 1. Endpoints de Segurança e Autenticação

### 🔑 `POST /api/auth/register`
Realiza o cadastro de novos usuários na plataforma.

*   **Request Body:**
    ```json
    {
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "password": "senha_segura_123"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "u_984128",
        "name": "João Silva",
        "email": "joao@exemplo.com",
        "role": "FREE"
      }
    }
    ```

### 🔑 `POST /api/auth/login`
Autentica o usuário e retorna o token JWT persistente.

*   **Request Body:**
    ```json
    {
      "email": "joao@exemplo.com",
      "password": "senha_segura_123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "u_984128",
        "name": "João Silva",
        "email": "joao@exemplo.com",
        "role": "FREE"
      }
    }
    ```

---

## 📡 2. Proxies e Integrações Externas

### ⚽ `GET /api/football`
Proxy seguro para a **API-Football** protegendo a chave `API_FOOTBALL_KEY` de vazamentos no navegador.

*   **Query Parameters:**
    *   `endpoint`: Endpoint específico da API-Football (ex: `'fixtures'`, `'teams/statistics'`).
    *   `next` (opcional): Número de próximas partidas.
    *   `league` (opcional): ID da liga.
    *   `season` (opcional): Ano da temporada.
*   **Response (200 OK):**
    Retorna a resposta íntegra da API-Football com dados agregados de partidas ou estatísticas detalhadas.

---

## 🤖 3. Endpoints de Inteligência Artificial

### 💬 `POST /api/chat`
Conversa em tempo real com o consultor de palpites e estatísticas do BetVision Pro, alimentado pelo Gemini API.

*   **Request Body:**
    ```json
    {
      "message": "Qual é a melhor dica de aposta para o clássico de hoje?",
      "chatHistory": [
        { "id": "1", "sender": "user", "text": "Olá!" },
        { "id": "2", "sender": "ai", "text": "Olá! Sou seu consultor analítico BetVision Pro." }
      ],
      "relevantMatch": {
        "homeTeam": "Arsenal",
        "awayTeam": "Chelsea",
        "league": "Premier League",
        "odds": { "home": 1.75, "draw": 3.80, "away": 4.50 }
      }
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "id": "msg_9841245",
      "sender": "ai",
      "text": "O Arsenal entra como favorito jogando no Emirates Stadium com 57% de posse projetada. A odd de 1.75 possui valor esperado positivo devido à força ofensiva de 89% em casa contra uma linha de defesa desfalcada do Chelsea. Minha recomendação é Handicap Asiático -0.5 Arsenal ou Over 2.5 gols.",
      "timestamp": "2026-07-01T18:25:00-07:00"
    }
    ```
