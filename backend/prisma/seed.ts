import { PrismaClient, AccountStatus, AssetType, AdminRole, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do Atlas Invest...");

  // ---------------------------------------------------------------------
  // Usuário de teste (já com e-mail confirmado, pronto para login)
  // ---------------------------------------------------------------------
  const senhaHash = await bcrypt.hash("Teste123", 12);

  const user = await prisma.user.upsert({
    where: { email: "teste@atlasinvest.com.br" },
    update: {},
    create: {
      email: "teste@atlasinvest.com.br",
      senhaHash,
      status: AccountStatus.ACTIVE,
      emailVerificadoEm: new Date(),
      profile: { create: { nomeCompleto: "Usuário de Teste", perfilRisco: "MODERADO" } },
      subscriptions: { create: {} },
    },
  });
  console.log(`Usuário de teste: teste@atlasinvest.com.br / Teste123 (id: ${user.id})`);

  // ---------------------------------------------------------------------
  // Admin de teste
  // ---------------------------------------------------------------------
  const adminSenhaHash = await bcrypt.hash("Admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@atlasinvest.com.br" },
    update: {},
    create: {
      email: "admin@atlasinvest.com.br",
      senhaHash: adminSenhaHash,
      role: AdminRole.ADMINISTRADOR,
    },
  });
  console.log("Admin de teste: admin@atlasinvest.com.br / Admin123");

  // ---------------------------------------------------------------------
  // Ativos + Atlas Score + Dividendos
  // ---------------------------------------------------------------------
  const ativosSeed = [
    { ticker: "PETR4", nome: "Petrobras PN", tipo: AssetType.ACAO, score: 78.5 },
    { ticker: "MXRF11", nome: "Maxi Renda FII", tipo: AssetType.FII, score: 82.0 },
    { ticker: "IVVB11", nome: "iShares S&P 500 ETF", tipo: AssetType.ETF, score: 74.2 },
    { ticker: "BTC", nome: "Bitcoin", tipo: AssetType.CRIPTO, score: 65.0 },
  ];

  for (const a of ativosSeed) {
    const asset = await prisma.asset.upsert({
      where: { ticker: a.ticker },
      update: {},
      create: { ticker: a.ticker, nome: a.nome, tipo: a.tipo, moeda: "BRL" },
    });

    await prisma.atlasScore.create({
      data: {
        assetId: asset.id,
        score: a.score,
        fundamentos: { liquidez: "alta", volatilidade: "media", consistencia: "boa" },
      },
    });

    if (a.tipo !== AssetType.CRIPTO) {
      await prisma.dividend.create({
        data: { assetId: asset.id, dataPagamento: new Date(), valorPorCota: 0.85 },
      });
    }
  }
  console.log(`${ativosSeed.length} ativos criados com Atlas Score.`);

  // ---------------------------------------------------------------------
  // Carteira de exemplo com uma transação de compra
  // ---------------------------------------------------------------------
  const petr4 = await prisma.asset.findUniqueOrThrow({ where: { ticker: "PETR4" } });

  const wallet = await prisma.wallet.create({
    data: { userId: user.id, nome: "Carteira Principal", moedaBase: "BRL" },
  });

  const walletAsset = await prisma.walletAsset.create({
    data: { walletId: wallet.id, assetId: petr4.id, quantidade: 100, precoMedio: 32.5 },
  });

  await prisma.transaction.create({
    data: {
      walletAssetId: walletAsset.id,
      tipo: TransactionType.COMPRA,
      quantidade: 100,
      preco: 32.5,
      data: new Date(),
    },
  });
  console.log("Carteira de exemplo criada com 100 PETR4 a R$32,50.");

  // ---------------------------------------------------------------------
  // Notícias
  // ---------------------------------------------------------------------
  await prisma.news.createMany({
    data: [
      {
        titulo: "Selic é mantida pelo Copom",
        resumo:
          "O Comitê de Política Monetária decidiu manter a taxa básica de juros, citando cenário externo e inflação controlada.",
        categoria: "Macroeconomia",
        fonteOrigem: "Fonte pública de exemplo",
        publicadoEm: new Date(),
      },
      {
        titulo: "FIIs de papel seguem em destaque",
        resumo:
          "Fundos imobiliários de recebíveis continuam atraindo investidores por conta da renda indexada à inflação.",
        categoria: "FIIs",
        fonteOrigem: "Fonte pública de exemplo",
        publicadoEm: new Date(),
      },
    ],
  });
  console.log("Notícias de exemplo criadas.");

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
