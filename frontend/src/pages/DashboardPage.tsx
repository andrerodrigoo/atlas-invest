import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Wallet, NewsItem } from "@/api/types";
import { useAuth } from "@/context/AuthContext";
import { Card, LoadingScreen } from "@/components/ui";
import { MessageCircle, Newspaper, Star, Wallet as WalletIcon } from "@/components/icons";

export default function DashboardPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[] | null>(null);
  const [news, setNews] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    api.get<Wallet[]>("/wallets").then(setWallets).catch(() => setWallets([]));
    api
      .get<{ items: NewsItem[] }>("/news?pageSize=3", false)
      .then((r) => setNews(r.items))
      .catch(() => setNews([]));
  }, []);

  if (!wallets || !news) return <LoadingScreen />;

  const patrimonio = wallets.reduce(
    (total, w) =>
      total +
      w.walletAssets.reduce((sum, wa) => sum + Number(wa.quantidade) * Number(wa.precoMedio), 0),
    0
  );

  return (
    <div className="p-5 space-y-5 max-w-2xl mx-auto">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Olá,</p>
        <h1 className="text-xl font-bold">{user?.profile?.nomeCompleto ?? user?.email}</h1>
      </div>

      <Card className="bg-primary text-white">
        <p className="text-sm opacity-80">Patrimônio total (custo)</p>
        <p className="text-3xl font-bold mt-1">
          {patrimonio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
        <p className="text-xs opacity-70 mt-2">
          {wallets.length} carteira{wallets.length !== 1 ? "s" : ""} • valor a custo médio
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <AtalhoCard to="/carteira" Icon={WalletIcon} label="Carteira" />
        <AtalhoCard to="/ia" Icon={MessageCircle} label="IA" />
        <AtalhoCard to="/premium" Icon={Star} label="Premium" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold flex items-center gap-2">
            <Newspaper size={18} /> Notícias
          </h2>
          <Link to="/noticias" className="text-sm text-primary dark:text-gold">
            Ver todas
          </Link>
        </div>
        <div className="space-y-3">
          {news.length === 0 && (
            <Card>
              <p className="text-sm text-gray-500">Nenhuma notícia disponível no momento.</p>
            </Card>
          )}
          {news.map((n) => (
            <Card key={n.id}>
              <p className="font-semibold text-sm">{n.titulo}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{n.resumo}</p>
              {n.categoria && (
                <span className="inline-block mt-2 text-xs bg-secondary/10 text-secondary dark:text-gold px-2 py-0.5 rounded-full">
                  {n.categoria}
                </span>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AtalhoCard({
  to,
  Icon,
  label,
}: {
  to: string;
  Icon: (p: { size?: number }) => JSX.Element;
  label: string;
}) {
  return (
    <Link to={to}>
      <Card className="flex flex-col items-center justify-center gap-2 py-4 hover:shadow-md transition-shadow">
        <Icon size={22} />
        <span className="text-xs font-medium">{label}</span>
      </Card>
    </Link>
  );
}
