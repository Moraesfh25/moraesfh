# Estrada de Evolução do Produto (ROADMAP.md)

Este documento descreve os marcos temporais, objetivos estratégicos e prioridades de engenharia para o desenvolvimento do **BetVision Pro**. Ele é estruturado de forma incremental, garantindo que a base de dados e a segurança estejam maduras antes do lançamento de recursos voltados para a monetização ou engajamento de usuários em larga escala.

---

## 🗺️ Visão de Longo Prazo

O objetivo do BetVision Pro é se tornar a plataforma número um de Inteligência Esportiva de Alto Nível para investidores em futebol, unindo estatísticas brutas (xG, forças defensivas e ofensivas de ligas globais) e modelos avançados de IA para geração automatizada de bilhetes e relatórios.

---

## 📌 Linha do Tempo e Marcos

### 🟢 Fase 1: Infraestrutura de Dados & Tipagem Segura (Atual)
*   **Foco:** Estabelecer a arquitetura de dados e garantir robustez.
*   **Entregas:**
    *   [x] Criação da camada de serviços no frontend (`src/services/`): `apiFootball.ts`, `matchService.ts`, `teamService.ts`, `statisticsService.ts` e `predictionsService.ts`.
    *   [x] Implementação de tipagens TypeScript robustas no `src/types/` cobrindo fixtures, estatísticas, escalações, previsões e classificações da API-Football.
    *   [x] Sistema de cache em memória no cliente com expiração de 5 minutos para evitar chamadas duplicadas e estouro de cota da API.
    *   [x] Documentos de governança técnica inicializados (`NON_NEGOTIABLE_RULES.md`, `DECISIONS.md`, `PRD.md`, `DATABASE.md`, `API_SPEC.md`).
*   **Métricas de Sucesso:** 100% de compilação livre de erros TypeScript (`npm run lint` verde) e zero requisições redundantes de rede no mesmo ciclo de cache.

### 🟡 Fase 2: Integração de APIs & Proxy Backend (Próxima)
*   **Foco:** Integrar o ambiente cliente-servidor real protegendo credenciais.
*   **Entregas:**
    *   [ ] Implementação das rotas proxy seguras em `/api/football` no backend Express (`server.ts`).
    *   [ ] Conexão de produção com a API-Football (v3.football.api-sports.io) via chaves de ambiente seguras (`API_FOOTBALL_KEY`).
    *   [ ] Pipeline de sincronização e cálculo de Valor Esperado (+EV) e Níveis de Risco no servidor utilizando dados das cotações da API The Odds.
    *   [ ] Substituição completa de geradores estáticos por dados reais do proxy nos cards visuais de partidas e estatísticas ao vivo.
*   **Métricas de Sucesso:** Tempo de resposta do proxy abaixo de 300ms e chaves confidenciais 100% ocultas do navegador do usuário.

### 🟠 Fase 3: Inteligência Artificial (Análises Preditivas Avançadas)
*   **Foco:** Transformar estatísticas brutas em decisões de valor através de IA.
*   **Entregas:**
    *   [ ] Integração do SDK oficial `@google/genai` no backend utilizando o modelo Gemini Pro/Flash.
    *   [ ] Criação do gerador automático de relatórios textuais de partidas (explicando forças de ataque/defesa e sugerindo mercados).
    *   [ ] Chat Inteligente Conversacional integrado para aconselhamento estatístico individualizado.
    *   [ ] Implementação do algoritmo do Bilhete Inteligente (geração automática de duplas, triplas e combinadas com controle de risco e cálculo de banca pelo Critério de Kelly).
*   **Métricas de Sucesso:** Geração de análises em menos de 3 segundos com coerência gramatical em português e 100% baseadas em fatos estatísticos reais das partidas.

### 🔴 Fase 4: Persistência de Dados & Sistema SaaS
*   **Foco:** Autenticação real, controle de acessos (RBAC) e monetização.
*   **Entregas:**
    *   [ ] Provisionamento do banco de dados relacional (PostgreSQL) e do Prisma ORM para gestão de contas e assinaturas.
    *   [ ] Fluxo de autenticação segura via e-mail/senha com JWT persistente e controle de planos (Free, VIP/Premium).
    *   [ ] Restrição de visualização de análises com mais de 85% de confiança e bilhetes gerados por IA exclusivamente para usuários VIP.
    *   [ ] Integração com gateway de pagamentos (Stripe ou Mercado Pago) para ativação instantânea de planos VIP.
*   **Métricas de Sucesso:** Banco de dados estruturado, tokens criptografados de ponta a ponta e barreira de paywall ativa sem vazamento de dados de recomendação de alta confiança.
