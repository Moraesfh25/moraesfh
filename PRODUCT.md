# Visão e Diretrizes do Produto (PRODUCT.md)

Este documento estabelece o posicionamento do **BetVision Pro**, detalhando a proposta de valor, regras de experiência de usuário, escopo de funcionalidades e os critérios de validação de novas ideias para manter o produto coeso, focado e de alta qualidade.

---

## 🎯 Proposta de Valor

O **BetVision Pro** não é uma plataforma de apostas (casa de apostas) e sim um **Assistente Inteligente de Análise Esportiva**. Nós transformamos dados massivos e complexos de ligas de futebol do mundo inteiro em palpites analíticos compreensíveis, gerando inteligência acionável e ajudando os apostadores a tratarem o mercado de apostas esportivas como um investimento financeiro de alto retorno com controle estrito de risco.

---

## 👥 Público-Alvo e Persona

*   **Apostadores Recreativos Avançados:** Usuários que desejam sair do palpite informal (achismo) e querem embasamento estatístico sólido (xG, tendências de Over/Under gols e probabilidade calculada) sem passar horas preenchendo planilhas manuais.
*   **Investidores Esportivos / Traders:** Profissionais focados na busca por **Valor Esperado Positivo (+EV)**, comparando as odds oferecidas pelas casas de apostas contra as odds reais (justas) computadas pelo modelo do BetVision Pro.

---

## 💎 Estrutura e Escopo de Funcionalidades

### 📈 1. Dashboard de Partidas (Acesso a Dados)
*   **Visualização Consolidada:** Lista de partidas ao vivo ou próximas de acontecer com placares ativos, minutos jogados e odds do mercado principal (Vencedor, Ambas Marcam, Over/Under).
*   **Aparência Premium (Dark Mode):** Visualização elegante com excelente espaçamento, reduzindo o cansaço ocular dos investidores que monitoram múltiplas telas de jogos em tempo real.
*   **Dados Detalhados:** Escalações oficiais, lesões, confrontos diretos recentes (H2H) e gráfico visualizador de poder ofensivo e defensivo em barras ou barras sobrepostas.

### 🤖 2. Bilhete Inteligente (Múltiplas de Valor)
*   **Simulador de Bilhetes:** Permite selecionar de 2 a 5 partidas e simular a taxa de retorno ponderada contra o risco selecionado (Conservador, Moderado ou Agressivo).
*   **Controle de Banca:** O sistema calcula automaticamente o percentual sugerido de investimento com base no capital disponível (Stake) utilizando a fórmula do Critério de Kelly.
*   **Explicação por IA (Resumo de Valor):** O modelo do Gemini escreve um texto curto e impactante argumentando a razão matemática por trás das escolhas sugeridas do bilhete.

### 💬 3. Chat de Consultoria Esportiva
*   **Interatividade Total:** Um chat direto com o modelo do Gemini especializado em estatísticas esportivas, onde o usuário pode tirar dúvidas rápidas (Ex: *"Como está a força do Flamengo jogando no Maracanã com chuva?"*).

---

## 💵 Modelo de Negócios (Monetização SaaS)

O BetVision Pro funciona em formato **Freemium**, separando acessos com base em barreiras visuais de paywall:

| Recurso | Nível Gratuito | Nível VIP/Premium |
| :--- | :--- | :--- |
| **Jogos Disponíveis** | Apenas jogos comuns (Confiança < 85%) | Acesso total sem restrições a todas as ligas |
| **Recomendação de IA** | Bloqueada com desfoque visual (Blur) | Exibição limpa da probabilidade justa da IA |
| **Bilhete Inteligente** | Simulação limitada (1 bilhete por dia) | Geração ilimitada com ajuste do Critério de Kelly |
| **Chat de IA** | Limite de 3 perguntas por período diário | Respostas ilimitadas com insights de valor de IA |

---

## 🚫 Regras de UX / Experiência de Usuário

1.  **Sem Elementos Gráficos Exagerados:** Proibido o uso de animações excessivas, banners piscantes de propaganda ou popups intrusivos. O visual deve seguir um design "SaaS Financeiro" minimalista e limpo.
2.  **Transparência Estatística:** Toda probabilidade de vitória gerada pela IA deve vir acompanhada da indicação visual da "Odd Justa" (Ex: IA diz 50% de vitória -> Odd Justa: 2.00). Isso educa o usuário a procurar apenas odds acima de 2.00 nas casas de apostas.
3.  **Tratamento de Erros Amigável:** Se a rede externa falhar ou a API-Football estiver offline, mostre uma mensagem informativa de fallback, mantendo os recursos locais da aplicação utilizáveis.
