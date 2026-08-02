# Como gerar o APK (arquivo instalável) do Atlas Invest

Este projeto já vem com um **projeto Android nativo pronto**, gerado via
[Capacitor](https://capacitorjs.com/) a partir do web app React. Ele
embrulha o web app dentro de um app Android de verdade — instalável,
com ícone próprio, sem depender do navegador.

**Importante:** gerar o arquivo `.apk` exige o **Android Studio**
instalado no seu computador. Isso não é algo que eu (Claude) consigo
fazer aqui no chat — não tenho SDK do Android disponível neste ambiente.
Mas o trabalho de programação já está pronto; o que falta é só um build,
que o próprio Android Studio faz com poucos cliques.

## Passo a passo

### 1. Instale o Android Studio
Baixe em https://developer.android.com/studio (gratuito). Na primeira
abertura, ele mesmo baixa o SDK do Android necessário.

### 2. Ajuste o endereço da API antes de gerar o build final

O app precisa saber onde está o backend. Edite (ou crie) o arquivo
`frontend/.env`:

```
VITE_API_URL=http://SEU_IP_LOCAL:3000/api/v1
```

- **Testando no emulador do Android Studio:** use `http://10.0.2.2:3000/api/v1`
  (já é o valor padrão deste projeto — `10.0.2.2` é como o emulador enxerga
  o `localhost` do seu computador).
- **Testando em um celular físico:** descubra o IP local do seu
  computador na rede Wi-Fi (`ipconfig` no Windows ou `ifconfig`/`ip a` no
  Mac/Linux, algo como `192.168.0.x`) e use esse IP. O celular e o
  computador precisam estar na mesma rede Wi-Fi, e o backend
  (`docker compose up`) precisa estar rodando nesse computador.
- **Para publicar de verdade (produção):** aponte para o endereço público
  do seu backend depois de fazer o deploy dele em algum provedor de nuvem
  (Parte 8/20 da documentação original trata disso).

### 3. Gere o build do web app e sincronize com o Android

```bash
cd frontend
npm install
npm run cap:sync
```

Esse comando builda o React (`npm run build`) e copia o resultado para
dentro do projeto Android (`android/app/src/main/assets/public`).

### 4. Abra o projeto no Android Studio

```bash
npm run cap:open:android
```

Isso abre a pasta `frontend/android` diretamente no Android Studio (ou
abra manualmente: Android Studio → Open → selecione a pasta
`frontend/android`).

### 5. Rode direto no emulador/celular (mais rápido, para testar)

Com o dispositivo (emulador ou celular via USB com "Depuração USB"
ativada) selecionado no topo do Android Studio, clique no botão ▶ Run.
O app instala e abre automaticamente — assim como um app baixado de
verdade.

### 6. Gerar o arquivo `.apk` para compartilhar/instalar manualmente

No Android Studio:
1. Menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Aguarde o build terminar (aparece uma notificação "APK(s) generated
   successfully")
3. Clique em **locate** na notificação, ou encontre o arquivo em:
   `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

Esse `app-debug.apk` já é um **arquivo instalável de verdade**. Você pode:
- Copiar para o celular (cabo USB, e-mail, Google Drive, etc.)
- Abrir o arquivo no celular e instalar (o Android vai pedir para
  permitir "instalar de fontes desconhecidas" na primeira vez — normal
  para apps fora da Play Store)

### 7. (Opcional) Gerar uma versão assinada para a Play Store

Para publicar de verdade na Google Play, é preciso gerar um **APK/AAB
assinado** (Build → Generate Signed Bundle/APK), criar uma conta de
desenvolvedor Google Play (taxa única) e passar pelo processo de revisão
da loja. Isso está fora do escopo desta entrega, mas o projeto já está
pronto para esse caminho quando você quiser seguir.

## Ícone e nome do app

O app já sai com o nome "Atlas Invest" e o identificador
`br.com.atlasinvest.app`. O ícone padrão do Capacitor está em uso — para
trocar pelo ícone oficial (o mesmo SVG usado no web app, em
`frontend/public/icon.svg`), a forma mais simples é usar o gerador de
ícones do Android Studio: clique com o botão direito em
`android/app/src/main/res` → **New → Image Asset**, e importe o SVG.

## iOS (iPhone)

Este pacote gerou apenas a plataforma **Android**. Gerar um app para iOS
exige um Mac com Xcode instalado (não existe forma de compilar para iOS
em Windows/Linux, essa é uma limitação da própria Apple). Se você tiver
um Mac, o processo é análogo: `npx cap add ios` dentro de `frontend/`,
depois abrir no Xcode.
