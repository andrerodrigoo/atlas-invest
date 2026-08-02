import { useEffect, useState } from "react";
import { api, ApiError } from "@/api/client";
import { Subscription } from "@/api/types";
import { Button, Card, ErrorBanner, LoadingScreen } from "@/components/ui";
import { Star } from "@/components/icons";

export default function PremiumPage() {
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    try {
      const data = await api.get<Subscription>("/subscriptions");
      setSubscription(data);
    } catch {
      setSubscription(null);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function iniciarTrial() {
    setErro(null);
    setCarregando(true);
    try {
      await api.post("/subscriptions/start-trial");
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível iniciar o teste grátis.");
    } finally {
      setCarregando(false);
    }
  }

  async function cancelar() {
    setErro(null);
    setCarregando(true);
    try {
      await api.post("/subscriptions/cancel");
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível cancelar.");
    } finally {
      setCarregando(false);
    }
  }

  if (subscription === undefined) return <LoadingScreen />;

  const isPremiumAtivo = subscription?.plano === "PREMIUM" && ["ACTIVE", "TRIALING"].includes(subscription.status);

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-2">
          <Star size={26} className="text-gold" />
        </div>
        <h1 className="text-xl font-bold">Atlas Premium</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Recursos avançados de análise e IA para investidores
        </p>
      </div>

      <ErrorBanner message={erro} />

      <Card>
        <p className="text-sm font-medium mb-2">Status atual</p>
        <p className="text-2xl font-bold">
          {isPremiumAtivo ? "Premium ativo" : "Plano gratuito"}
        </p>
        {subscription?.renovacao && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Renovação/expiração: {new Date(subscription.renovacao).toLocaleDateString("pt-BR")}
          </p>
        )}
      </Card>

      <Card className="space-y-2">
        <p className="font-semibold text-sm">Comparativo</p>
        <ComparativoLinha label="Radar de oportunidades" free={false} premium />
        <ComparativoLinha label="Alertas ilimitados" free={false} premium />
        <ComparativoLinha label="Análises avançadas de IA" free={false} premium />
        <ComparativoLinha label="Carteira e Atlas Score" free premium />
      </Card>

      {!isPremiumAtivo ? (
        <Button onClick={iniciarTrial} disabled={carregando || subscription?.trialUtilizado} variant="secondary">
          {subscription?.trialUtilizado
            ? "Teste grátis já utilizado"
            : carregando
              ? "Ativando..."
              : "Iniciar teste grátis de 7 dias"}
        </Button>
      ) : (
        <Button onClick={cancelar} disabled={carregando} variant="ghost">
          {carregando ? "Cancelando..." : "Cancelar assinatura"}
        </Button>
      )}

      <p className="text-xs text-gray-400 text-center">
        Pagamento recorrente ainda não integrado nesta versão de testes — esta tela reflete apenas
        a regra de negócio (trial único por conta, ativação/cancelamento).
      </p>
    </div>
  );
}

function ComparativoLinha({ label, free, premium }: { label: string; free: boolean; premium: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span>{label}</span>
      <div className="flex gap-4 text-xs">
        <span className={free ? "text-primary dark:text-gold" : "text-gray-300"}>{free ? "✓" : "—"} Free</span>
        <span className={premium ? "text-primary dark:text-gold" : "text-gray-300"}>{premium ? "✓" : "—"} Premium</span>
      </div>
    </div>
  );
}
