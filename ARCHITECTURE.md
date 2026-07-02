# Arquitetura do Sistema (ARCHITECTURE.md)

Este documento descreve as camadas técnicas, o fluxo de dados e os princípios de design arquitetônico adotados no **BetVision Pro**. Ele serve como guia para que qualquer alteração de código respeite a modularidade, o isolamento de lógica e a segurança do ecossistema.

---

## 🏗️ Visão Geral da Arquitetura

O **BetVision Pro** é estruturado como uma aplicação Full-Stack unificada que separa de forma clara a visualização do usuário, a orquestração de negócios e a comunicação com serviços e bancos externos.

```
┌────────────────────────────────────────────────────────┐
│                   Camada de Cliente                    │
│   ┌─────────────────┐           ┌──────────────────┐   │
│   │     React UI    ├──────────►│  Camada Serviços │   │
│   │   (Componentes) │◄──────────┤  (matchService)  │   │
│   └─────────────────┘           └────────┬─────────┘   │
└──────────────────────────────────────────┼─────────────┘
                                           │ (HTTP / JSON)
┌──────────────────────────────────────────▼─────────────┐
│                   Camada de Servidor                   │
│   ┌────────────────────────────────────────────────┐   │
│   │                 Express Router                 │   │
│   │    (Proxy API-Football / Chat Gemini / Auth)   │   │
│   └──────┬────────────────────┬─────────────────┬──┘   │
└──────────┼────────────────────┼─────────────────┼──────┘
           │                    │                 │
┌──────────▼─────────┐   ┌──────▼───────┐   ┌─────▼──────┐
│    API-Football    │   │  Gemini API  │   │ PostgreSQL │
│ (Dados Esportivos) │   │ (Inteligência)│   │  (Prisma)  │
└────────────────────┘   └──────────────┘   └────────────┘
```

---

## 🎨 1. Camada de Cliente (Frontend)

Construída sobre o **React 18** e empacotada com o **Vite**, o frontend é projetado para ser leve, reativo e estritamente focado em visualização e controle básico de fluxo.

*   **Padrão de UI:** Tailwind CSS para estilização rápida e adaptável de telas, seguindo regras de contraste estrito e design elegante e sóbrio em tom escuro (*Slate*).
*   **Controle de Estado:** Gerenciamento local via hooks padrão de ciclo de vida (`useState`, `useEffect`, `useCallback`) e contextos segmentados.
*   **Abstração de Dados (Serviços):** Componentes visuais **nunca** realizam buscas diretas à rede ou formatam respostas brutas de APIs. Toda interação passa pela pasta `src/services/` (`matchService.ts`, `predictionsService.ts`, etc.).
*   **Sistema de Cache Local:**
    *   No frontend, o arquivo `src/services/apiFootball.ts` implementa uma lógica estrita de cache em memória:
    *   Ao solicitar recursos como fixtures ou estatísticas, o serviço armazena em cache o resultado mapeado pela URL/parâmetros concatenados.
    *   O cache expira automaticamente após **5 minutos** para garantir que dados ao vivo e odds se mantenham atualizados sem sobrecarregar as chamadas do cliente.

---

## ⚙️ 2. Camada de Servidor (Backend)

Escrito em **Node.js** com **Express** e **TypeScript**, o backend atua como porta de entrada única para o mundo externo.

*   **Ponto de Entrada (`server.ts`):** Orquestra rotas, serve o bundle estático do frontend em ambientes de produção e gerencia middlewares de desenvolvimento do Vite em tempo real.
*   **Ocultação de Chaves (Security Proxy):**
    *   Qualquer API que exija autenticação (API-Football, Gemini API, The Odds API) é acessada estritamente no backend.
    *   O servidor Express expõe a rota `/api/football` para atuar como proxy das credenciais RapidAPI / API-Football. O frontend faz requisições limpas para esta rota local e o servidor injeta os cabeçalhos confidenciais correspondentes.
*   **Processamento Analítico:** Cálculos estatísticos de força ofensiva/defensiva baseados no histórico de xG do time, classificação e comparação mútua de cabeçalho a cabeçalho (H2H) são agregados no servidor e entregues limpos ao cliente.

---

## 🗄️ 3. Camada de Armazenamento e Integrações

*   **Banco de Dados:** PostgreSQL hospedado de forma relacional. O mapeamento é feito por meio de modelos estruturados no **Prisma ORM** (Modelagem de usuários, transações de faturamento e históricos de bilhetes salvos).
*   **API-Football:** Fornece o ecossistema completo de dados futebolísticos (classificação, estatísticas de equipes, dados de jogadores lesionados, locais de partidas).
*   **Gemini API:** Processa prompts customizados contendo estatísticas da partida enviadas pelo backend Express para gerar resumos de palpites ricos em contexto com o modelo Gemini Pro.

---

## 🔄 Fluxo de Dados de Palpite (Exemplo)

1.  O usuário clica em um jogo no Dashboard.
2.  O `matchService` verifica se há dados válidos no cache local em memória.
3.  **Se sim:** Os dados são instantaneamente entregues na tela do usuário.
4.  **Se não:** O serviço dispara uma requisição de rede para `/api/football?endpoint=fixtures&id=...`.
5.  O Express intercepta no `server.ts`, anexa a chave de ambiente `API_FOOTBALL_KEY` e bate na API-Football.
6.  A API-Football responde para o Express, que formata e responde para o `apiFootballClient` no navegador.
7.  O cliente grava o retorno no cache em memória por 5 minutos e atualiza o estado de tela do usuário de forma reativa.
