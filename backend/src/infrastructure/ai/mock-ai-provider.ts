import { AiProvider, AiChatContext } from "@domain/ai-provider";

// Implementação padrão enquanto nenhum provedor de IA real (Claude, GPT etc.)
// está integrado. Segue os princípios obrigatórios da Parte 17/24:
// transparência, educação financeira antes de recomendações, e nunca
// prometer rentabilidade ou emitir recomendação de compra/venda.
//
// Para plugar um provedor real, basta implementar AiProvider (ex: chamando
// a API da Anthropic) e trocar a instância exportada em ai.service.ts -
// nenhum outro módulo precisa mudar.
export class MockAiProvider implements AiProvider {
  async gerarResposta(context: AiChatContext): Promise<string> {
    const pergunta = context.novaMensagem.toLowerCase();

    if (pergunta.includes("comprar") || pergunta.includes("vender") || pergunta.includes("recomend")) {
      return (
        "Não posso recomendar a compra ou venda de nenhum ativo específico — meu papel é " +
        "educativo. Posso explicar indicadores, riscos e fundamentos para te ajudar a " +
        "formar sua própria decisão. Quer que eu explique algum conceito ou ativo em particular?"
      );
    }

    if (pergunta.includes("score") || pergunta.includes("atlas score")) {
      return (
        "O Atlas Score é uma pontuação educativa baseada em critérios objetivos como " +
        "liquidez, volatilidade e histórico de fundamentos. Ele não é uma recomendação de " +
        "investimento, apenas um resumo visual para apoiar sua própria análise."
      );
    }

    if (pergunta.includes("risco")) {
      return (
        "Todo investimento envolve riscos — de mercado, liquidez e, em alguns casos, " +
        "crédito. Diversificação e horizonte de tempo adequado costumam ajudar a reduzir " +
        "o impacto de oscilações. Quer que eu detalhe os riscos de algum tipo de ativo?"
      );
    }

    return (
      "Essa é uma resposta educativa de exemplo (provedor de IA ainda não integrado). " +
      "Posso te ajudar a entender conceitos financeiros, indicadores e riscos de ativos, " +
      "sempre deixando claro que não ofereço recomendações personalizadas de investimento."
    );
  }
}

export const aiProvider: AiProvider = new MockAiProvider();
