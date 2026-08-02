import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.atlasinvest.app",
  appName: "Atlas Invest",
  webDir: "dist",
  server: {
    // Durante o desenvolvimento, aponte para o IP da sua máquina rodando
    // "npm run dev" para ver mudanças ao vivo dentro do app instalado no
    // celular. Para o build final (APK de produção), comente/apague esta
    // seção "server" inteira - o app vai embutir os arquivos de dist/
    // diretamente, sem depender de nenhum servidor rodando.
    // url: "http://SEU_IP_LOCAL:5173",
    // cleartext: true,
    androidScheme: "https",
  },
};

export default config;
