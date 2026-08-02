export interface Asset {
  id: string;
  ticker: string;
  nome: string;
  tipo: string;
  mercado?: string | null;
  moeda: string;
}

export interface WalletAsset {
  id: string;
  quantidade: string;
  precoMedio: string;
  asset: Asset;
}

export interface Wallet {
  id: string;
  nome: string;
  moedaBase: string;
  walletAssets: WalletAsset[];
}

export interface Transaction {
  id: string;
  tipo: "COMPRA" | "VENDA" | "APORTE" | "RETIRADA" | "AJUSTE";
  quantidade: string;
  preco: string;
  data: string;
  walletAsset: WalletAsset;
}

export interface AtlasScore {
  id: string;
  score: string;
  fundamentos: Record<string, unknown> | null;
  ultimaAtualizacao: string;
}

export interface NewsItem {
  id: string;
  titulo: string;
  resumo: string;
  categoria?: string | null;
  fonteOrigem?: string | null;
  publicadoEm: string;
}

export interface AiConversation {
  id: string;
  titulo?: string | null;
  updatedAt: string;
  messages: Array<{ mensagem: string; papel: string; timestamp: string }>;
}

export interface AiMessage {
  id: string;
  papel: "USER" | "ASSISTANT" | "SYSTEM";
  mensagem: string;
  timestamp: string;
}

export interface Subscription {
  id: string;
  plano: "FREE" | "PREMIUM";
  status: string;
  trialUtilizado: boolean;
  inicio?: string | null;
  renovacao?: string | null;
}

export interface NotificationItem {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}
