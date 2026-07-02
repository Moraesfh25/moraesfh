# Regras Inegociáveis (NON_NEGOTIABLE_RULES.md)

Este documento contém as diretrizes técnicas e operacionais que devem ser seguidas **sem exceções** por qualquer desenvolvedor ou inteligência artificial que participe da evolução do **BetVision Pro**. Qualquer desvio destas regras resultará em falha crítica de integração.

---

## 🚫 Restrições de Código e Estrutura

1.  **Nunca quebrar funcionalidades existentes:** Todo recurso preexistente (como chat de IA, simulações de odds, calculadoras, gerenciador de banca, etc.) deve ser mantido intacto e operacional. Se for necessário modificar a estrutura, garanta compatibilidade reversa absoluta.
2.  **Nunca remover código sem justificativa:** É expressamente proibida a deleção ou simplificação preguiçosa de blocos de lógica analítica, animações suaves ou tratamento de dados.
3.  **Nunca alterar nomes públicos de APIs ou propriedades:** Propriedades dos tipos principais (como `Match`, `ChatMessage`, `BetSlipItem`) e rotas públicas do backend não devem sofrer renomeações para não gerar quebras no fluxo do cliente.
4.  **Nunca duplicar código:** Lógicas repetitivas (como cálculos de probabilidade, retornos financeiros, formatações de data ou odds) devem ser centralizadas em arquivos de utilitários (`src/utils/`) ou hooks especializados (`src/hooks/`).
5.  **Nunca colocar lógica de negócio complexa direta em telas:** O React deve funcionar como uma camada de visualização e controle de UI leve. Lógicas complexas de busca de partidas, cálculo estatístico de valor esperado (+EV) ou predições por IA devem ser tratadas em serviços (`src/services/`), hooks ou rotas seguras do Express (`server.ts`).
6.  **Nunca acessar APIs externas diretamente no Frontend:** Chamadas para APIs que exijam chaves confidenciais (ex: API-Football, The Odds API, Gemini API, OpenAI, gateways de pagamentos) **devem** obrigatoriamente passar por proxies ou rotas controladas no backend (`server.ts`) para evitar vazamento de credenciais no navegador do cliente.
7.  **Nunca ultrapassar 300 linhas em novos componentes visuais:** Se um componente visual começar a crescer excessivamente, ele deve ser dividido em sub-componentes modulares e reutilizáveis organizados no diretório correspondente.

---

## 📝 Qualidade e Testabilidade

1.  **Tipagem Estrita Obrigatoriamente:** Proibido o uso de `any` em novos desenvolvimentos. Se uma estrutura for complexa ou flexível, defina interfaces explícitas no `src/types/index.ts` ou tipos utilitários como `Record<string, unknown>`.
2.  **Manter o Linter Verde:** Toda modificação deve passar sem avisos ou erros no verificador estático (`npm run lint`).
3.  **Geração Pronta Para Produção:** Não adicione placeholders temporários (como `// TODO: implementar depois`), dados fixos ou estruturas simuladas "hardcoded" se já possuirmos integração disponível. Todo código deve ser robusto e limpo.
4.  **Preservação e Explicação Técnica:** Ao finalizar qualquer etapa de alteração, explique rigorosamente quais arquivos foram alterados, as decisões tomadas, possíveis riscos observados e planos de teste recomendados.
