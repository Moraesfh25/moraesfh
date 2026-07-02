# Regras para Inteligências Artificiais (AI_RULES.md)

Este documento estabelece as diretrizes comportamentais, as restrições técnicas e as instruções de execução para qualquer **Inteligência Artificial (IA) ou Agente de Código** que realize alterações no repositório do **BetVision Pro**. Leia este arquivo atentamente antes de sugerir ou implementar qualquer mudança de código.

---

## 🧭 Diretriz Suprema: Respeito ao Escopo e à Intencionalidade

*   **Implemente APENAS o solicitado:** Não adicione funcionalidades não solicitadas ou "playground-ify" a aplicação para torná-la robusta de maneira artificial. Se o usuário pediu para consertar um erro de tipagem, apenas conserte o erro de tipagem.
*   **Aparência sobre Complexidade Inútil:** A excelência do BetVision Pro está na precisão de seu design visual, espaçamentos consistentes, tipografia elegante e integridade do código. Nunca tente "enriquecer" o aplicativo adicionando abas visuais extras ou botões decorativos que não funcionam.

---

## 🛠️ Moderação de Código e Arquitetura

1.  **Strict Read-Before-Write (Ler Antes de Editar):**
    *   Você é obrigado a ler o conteúdo completo de um arquivo (`view_file`) antes de disparar uma edição (`edit_file` ou `multi_edit_file`). Nunca assuma que sabe o conteúdo de um arquivo baseado em templates genéricos ou inferências.
2.  **Modularização Exigida:**
    *   Nunca empilhe toda a lógica no `App.tsx` ou em um único componente gigante. Se um novo componente ultrapassar **300 linhas de código**, ele deve obrigatoriamente ser quebrado em componentes menores no diretório `/src/components/`.
3.  **Preservação das Lógicas Analíticas Existentes:**
    *   O BetVision Pro conta com algoritmos refinados de simulação de xG, geradores de múltiplos de IA, simuladores de controle de banca e gerenciadores de histórico de apostas. É estritamente proibido deletar, simplificar de forma preguiçosa ou substituir esses algoritmos analíticos por dados simulados fixos de texto plano (*hardcoded*).

---

## 🗂️ Gestão e Tipagem TypeScript

*   **Sem Tipo `any`:** O uso de `any` para novas implementações é proibido. Toda estrutura complexa deve possuir sua respectiva interface mapeada no diretório `/src/types/`.
*   **Exports Limpos:** Novos arquivos de tipagem em `/src/types/` devem ser exportados globalmente no ponto de entrada `/src/types/index.ts` usando o padrão `export * from "./arquivo"`.
*   **Enums Estritos:** Use declarações padrão de `enum` em TypeScript para representar status, níveis de risco ou perfis de investidor. Não utilize `const enum`.

---

## 🔐 Segurança e Chaves Confidenciais

*   **Isolamento Absoluto:** Nunca coloque chaves confidenciais da API-Football, do Gemini API ou de gateways de pagamento no código do frontend.
*   **Tráfego pelo Backend:** Qualquer requisição de API externa que demande autenticação privada deve passar estritamente pela rota proxy Express em `/api/` configurada no servidor Node (`server.ts`).

---

## 🟢 Checklist de Verificação de Tarefas

Ao finalizar qualquer alteração ou implementação de recurso, execute obrigatoriamente os seguintes passos antes de entregar a resposta ao usuário:

1.  **Lint Estático:** Rode o comando de verificação de linter (`lint_applet` ou `npm run lint`) e garanta que não existem problemas de importações pendentes ou erros de sintaxe.
2.  **Compilação Completa:** Dispare o comando de compilação da aplicação (`compile_applet`) para garantir que o bundle de produção está íntegro e pronto para deploy.
3.  **Sumarização Sucinta:** Descreva as alterações de forma clara e profissional, sem adjetivos pretensiosos, focando puramente nas soluções de engenharia visual e de dados alcançadas.
