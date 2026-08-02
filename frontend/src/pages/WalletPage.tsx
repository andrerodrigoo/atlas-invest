import { useEffect, useState } from "react";
import { api, ApiError } from "@/api/client";
import { Wallet } from "@/api/types";
import { Button, Card, EmptyState, ErrorBanner, Input, LoadingScreen } from "@/components/ui";

export default function WalletPage() {
  const [wallets, setWallets] = useState<Wallet[] | null>(null);
  const [novaCarteira, setNovaCarteira] = useState("");
  const [criandoCarteira, setCriandoCarteira] = useState(false);
  const [carteiraSelecionada, setCarteiraSelecionada] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    const data = await api.get<Wallet[]>("/wallets");
    setWallets(data);
    if (!carteiraSelecionada && data.length > 0) setCarteiraSelecionada(data[0].id);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCriarCarteira(e: React.FormEvent) {
    e.preventDefault();
    if (!novaCarteira.trim()) return;
    setErro(null);
    try {
      await api.post("/wallets", { nome: novaCarteira });
      setNovaCarteira("");
      setCriandoCarteira(false);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível criar a carteira.");
    }
  }

  if (!wallets) return <LoadingScreen />;

  const carteira = wallets.find((w) => w.id === carteiraSelecionada);

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Carteira</h1>
        <Button variant="ghost" className="w-auto px-4 py-2 text-sm" onClick={() => setCriandoCarteira((v) => !v)}>
          + Nova carteira
        </Button>
      </div>

      {criandoCarteira && (
        <form onSubmit={handleCriarCarteira} className="flex gap-2 fade-in">
          <Input
            placeholder="Nome da carteira"
            value={novaCarteira}
            onChange={(e) => setNovaCarteira(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-auto px-4">
            Criar
          </Button>
        </form>
      )}

      <ErrorBanner message={erro} />

      {wallets.length === 0 ? (
        <EmptyState label="Você ainda não tem nenhuma carteira. Crie a primeira acima." />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {wallets.map((w) => (
              <button
                key={w.id}
                onClick={() => setCarteiraSelecionada(w.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border ${
                  w.id === carteiraSelecionada
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 text-gray-600 dark:text-gray-300"
                }`}
              >
                {w.nome}
              </button>
            ))}
          </div>

          {carteira && <CarteiraDetalhe carteira={carteira} onAtualizado={carregar} />}
        </>
      )}
    </div>
  );
}

function CarteiraDetalhe({ carteira, onAtualizado }: { carteira: Wallet; onAtualizado: () => void }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [ticker, setTicker] = useState("");
  const [tipo, setTipo] = useState<"COMPRA" | "VENDA">("COMPRA");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const valorTotal = carteira.walletAssets.reduce(
    (sum, wa) => sum + Number(wa.quantidade) * Number(wa.precoMedio),
    0
  );

  async function handleRegistrarTransacao(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await api.post("/transactions", {
        walletId: carteira.id,
        ticker: ticker.toUpperCase(),
        tipo,
        quantidade: Number(quantidade),
        preco: Number(preco),
      });
      setTicker("");
      setQuantidade("");
      setPreco("");
      setMostrarForm(false);
      onAtualizado();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível registrar a transação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-3 fade-in">
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Valor total (custo médio)</p>
        <p className="text-2xl font-bold">
          {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </Card>

      <Button className="w-auto px-4 py-2 text-sm" onClick={() => setMostrarForm((v) => !v)}>
        + Registrar transação
      </Button>

      {mostrarForm && (
        <Card className="space-y-3 fade-in">
          <ErrorBanner message={erro} />
          <form onSubmit={handleRegistrarTransacao} className="space-y-3">
            <Input
              placeholder="Ticker (ex: PETR4)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo("COMPRA")}
                className={`flex-1 py-2 rounded-xl2 text-sm font-medium ${
                  tipo === "COMPRA" ? "bg-primary text-white" : "border border-gray-300"
                }`}
              >
                Compra
              </button>
              <button
                type="button"
                onClick={() => setTipo("VENDA")}
                className={`flex-1 py-2 rounded-xl2 text-sm font-medium ${
                  tipo === "VENDA" ? "bg-primary text-white" : "border border-gray-300"
                }`}
              >
                Venda
              </button>
            </div>
            <Input
              type="number"
              step="any"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              required
            />
            <Input
              type="number"
              step="any"
              placeholder="Preço unitário (R$)"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
            />
            <Button type="submit" disabled={enviando}>
              {enviando ? "Registrando..." : "Confirmar"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {carteira.walletAssets.length === 0 && (
          <EmptyState label="Nenhum ativo nesta carteira ainda. Registre sua primeira transação acima." />
        )}
        {carteira.walletAssets.map((wa) => (
          <Card key={wa.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{wa.asset.ticker}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{wa.asset.nome}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{Number(wa.quantidade).toLocaleString("pt-BR")} un.</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1">
                PM: {Number(wa.precoMedio).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
