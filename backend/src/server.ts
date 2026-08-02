import { createApp } from "./app";
import { env } from "@config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Atlas Invest API rodando na porta ${env.port} [${env.nodeEnv}]`);
  console.log(`Base: /api/${env.apiVersion}`);
});
