import { useEffect, useRef, useState } from "react";
import { api } from "@/api/client";
import { Button, Input } from "@/components/ui";
import { Send } from "@/components/icons";

interface Mensagem {
  papel: "USER" | "ASSISTANT";
  mensagem: string;
}

const sugestoes = [
  "O que é o Atlas Score?",
  "Quais os riscos de investir em FIIs?",
  "Como funciona diversificação de carteira?",
];

export default function AiChatPage() {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(mensagem: string) {
    if (!mensagem.trim() || enviando) return;
    setMensagens((prev) => [...prev, { papel: "USER", mensagem }]);
    setTexto("");
    setEnviando(true);
    try {
      const resposta = await api.post<{ conversationId: string; resposta: string }>("/ai/chat", {
        mensagem,
        conversationId,
      });
      setConversationId(resposta.conversationId);
      setMensagens((prev) => [...prev, { papel: "ASSISTANT", mensagem: resposta.resposta }]);
    } catch {
      setMensagens((prev) => [
        ...prev,
        { papel: "ASSISTANT", mensagem: "Não foi possível obter uma resposta agora. Tente novamente." },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="p-4 border-b border-gray-200 dark:border-primary-light">
        <h1 className="text-lg font-bold">Assistente Atlas</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Conteúdo educativo — nunca uma recomendação de investimento.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensagens.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Experimente perguntar:</p>
            {sugestoes.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="block w-full text-left px-4 py-3 rounded-xl2 border border-gray-200 dark:border-primary-light text-sm hover:bg-gray-50 dark:hover:bg-primary/30"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {mensagens.map((m, i) => (
          <div key={i} className={`flex ${m.papel === "USER" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl2 text-sm fade-in ${
                m.papel === "USER"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-gray-100 dark:bg-primary/40 rounded-bl-sm"
              }`}
            >
              {m.mensagem}
            </div>
          </div>
        ))}
        {enviando && <p className="text-xs text-gray-400 px-2">Digitando...</p>}
        <div ref={fimRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="p-3 border-t border-gray-200 dark:border-primary-light flex gap-2"
      >
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pergunte algo sobre investimentos..."
        />
        <Button type="submit" className="w-auto px-4" disabled={enviando}>
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
