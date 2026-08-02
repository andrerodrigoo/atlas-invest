// Parte 17/24: "A IA deve ser modular, permitindo troca de modelos sem
// alterar o restante da aplicação." Este contrato isola o restante do
// sistema da implementação concreta do provedor de IA.

export interface AiChatContext {
  historico: Array<{ papel: "USER" | "ASSISTANT"; mensagem: string }>;
  novaMensagem: string;
}

export interface AiProvider {
  gerarResposta(context: AiChatContext): Promise<string>;
}
