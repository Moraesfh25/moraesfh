# Documento de Requisitos do Produto (PRD.md)

## 1. Visão Geral do Produto
O **BetVision Pro** é um SaaS (Software as a Service) focado em Inteligência Esportiva de Alto Nível. Ele combina inteligência de máquina, análises preditivas automatizadas baseadas em xG e força ofensiva/defensiva para oferecer recomendações, simulações de banca e relatórios detalhados aos apostadores.

---

## 2. Requisitos de Funcionalidades (Escopo Principal)

### 🔑 Autenticação e Gestão de Usuários
*   **Cadastro e Login:** Suporte a e-mail/senha com persistência de token local (JWT).
*   **Controle de Acesso (RBAC):** Níveis de usuário (Gratuito, VIP/Premium, Admin).
*   **Nível de Segurança:** Proteção de rotas sensíveis e ocultação de odds/previsões de alta precisão para usuários não assinantes.

### 📊 Dashboard Analítico (Partidas em Tempo Real & Próximos Jogos)
*   **Ligas Filtradas:** Exibição ágil das principais ligas do mundo (Premier League, La Liga, Brasileirão, Serie A, Champions League).
*   **Jogos ao Vivo (Live Ticker):** Atualização automática de estatísticas simuladas (posse, escanteios, cartões, chutes e xG) com indicador de minuto e placar ativo.
*   **Filtros Customizados:** Filtragem rápida de partidas por nível de confiança da IA, mercado recomendado (Over Gols, Ambas Marcam, Vencedor) e status (Ao Vivo / Hoje).

### 🤖 Bilhete Inteligente (Simulador de Risco e Inteligência Artificial)
*   **Múltiplas Assistidas:** Geração inteligente de bilhetes combinados (duplas, triplas, múltiplas de valor esperado positivo) baseadas no perfil do investidor (Conservador, Moderado, Agressivo).
*   **Explicação Textual:** A IA escreve um parágrafo detalhando por que aquela seleção foi feita, listando forças relativas e probabilidade intrínseca calibrada contra a odd justa do mercado.
*   **Gestor de Banca:** Calculadora integrada para controle de stakes com base no Critério de Kelly, prevenindo a quebra de capital do usuário.

### 🛡️ Área Administrativa (Painel de Métricas e Logs)
*   **Log de Auditoria:** Monitoramento de ações do sistema (promoções, atualizações de licenças, acessos).
*   **Métricas Gerais:** ROI médio da plataforma, taxa de acerto (%) acumulada histórica e faturamento simulado de assinaturas.

---

## 3. Estrutura de Monetização (SaaS Pricing Model)

| Funcionalidade | Plano Gratuito | Plano VIP/Premium |
| :--- | :--- | :--- |
| **Acesso a Partidas** | Apenas comuns (Confiança <85%) | Acesso total (inclui VIPs/Anomalias) |
| **Análise Detalhada** | Estatísticas Básicas | Análise Completa + Explicação IA |
| **Bilhete Inteligente** | Simulação de 1 bilhete por dia | Geração ilimitada e personalizada |
| **Chat com Consultor IA**| Limite de 3 perguntas diárias | Ilimitado + Insights exclusivos |
| **Suporte** | Comum | VIP Prioritário |
