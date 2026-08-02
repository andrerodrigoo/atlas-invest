import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { NewsItem } from "@/api/types";
import { Card, EmptyState, LoadingScreen } from "@/components/ui";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    api
      .get<{ items: NewsItem[] }>("/news?pageSize=20", false)
      .then((r) => setNews(r.items))
      .catch(() => setNews([]));
  }, []);

  if (!news) return <LoadingScreen />;

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Notícias</h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
        Resumos gerados a partir de fontes públicas. Podem estar desatualizados.
      </p>

      {news.length === 0 && <EmptyState label="Nenhuma notícia disponível no momento." />}

      <div className="space-y-3">
        {news.map((n) => (
          <Card key={n.id}>
            <div className="flex items-center justify-between mb-1">
              {n.categoria && (
                <span className="text-xs bg-secondary/10 text-secondary dark:text-gold px-2 py-0.5 rounded-full">
                  {n.categoria}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {new Date(n.publicadoEm).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <p className="font-semibold text-sm">{n.titulo}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.resumo}</p>
            {n.fonteOrigem && <p className="text-xs text-gray-400 mt-2">Fonte: {n.fonteOrigem}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
