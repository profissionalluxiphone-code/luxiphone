# Lux iPhones Store — Black Friday

Loja de iPhones (novos e recondicionados) com carrinho, checkout, painel admin e banco de dados. Preços especiais de Black Friday com contagem regressiva.

## Rodando localmente

```bash
npm install
npm start
```

Abra `http://localhost:3000`. O painel admin fica em `http://localhost:3000/admin.html` (token padrão: `luxiphones-admin`, configurável via variável `ADMIN_TOKEN`).

Em desenvolvimento, o servidor usa automaticamente um banco **SQLite local** (arquivo `server/data/luxiphones.sqlite`, criado na primeira execução). Não precisa instalar nada — é o módulo nativo `node:sqlite` do próprio Node.js.

## Colocando no ar (Render)

O projeto já vem com um `render.yaml` pronto que cria **o site e o banco PostgreSQL juntos**, automaticamente conectados.

1. Crie um repositório no GitHub e suba este projeto para ele:
   ```bash
   git init
   git add .
   git commit -m "Loja Lux iPhones — Black Friday"
   git branch -M main
   git remote add origin <url-do-seu-repositorio>
   git push -u origin main
   ```
2. Acesse [render.com](https://render.com) e crie uma conta gratuita (dá pra entrar direto com o GitHub).
3. No painel do Render, clique em **New +** → **Blueprint**.
4. Selecione o repositório que você acabou de criar. O Render vai ler o `render.yaml` automaticamente e mostrar 2 recursos a criar:
   - `lux-iphones-store` (o site, plano Free)
   - `lux-iphones-db` (o banco PostgreSQL, plano Free)
5. Clique em **Apply**. Em alguns minutos o site estará no ar em uma URL como `https://lux-iphones-store.onrender.com`.
6. O banco é criado e conectado automaticamente (variável `DATABASE_URL`) e o catálogo é populado sozinho na primeira execução.
7. Um `ADMIN_TOKEN` aleatório e seguro também é gerado automaticamente — para descobrir qual foi gerado, vá em **lux-iphones-store** → aba **Environment** no painel do Render.

**Importante sobre o banco gratuito do Render:** o plano Free do PostgreSQL expira depois de 90 dias (o Render avisa por e-mail antes). Quando isso acontecer, basta criar um novo banco gratuito (ou migrar para o plano pago, ~R$35/mês) para manter os pedidos e o estoque sem interrupção.

## Login com Google (obrigatório para comprar)

Desde que essa funcionalidade foi adicionada, o cliente precisa entrar com a conta Google antes de finalizar o pedido (o formulário de checkout só aparece depois do login). Os dados do cliente (nome e e-mail) ficam guardados na tabela **`users`** do nosso próprio banco — nada fica em um serviço de terceiros, e o painel `/admin.html` lista todos os cadastros.

### Como ativar

1. Acesse [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) (grátis, não pede cartão) e crie um projeto, se ainda não tiver um.
2. Clique em **Criar credenciais** → **ID do cliente OAuth** → tipo **Aplicativo da Web**.
3. Em **Origens JavaScript autorizadas**, adicione as URLs do site:
   - `http://localhost:3000` (para testar local)
   - `https://<seu-site>.onrender.com` (ou seu domínio próprio, em produção)
4. Copie o **ID do cliente** gerado (algo como `123456789-abc.apps.googleusercontent.com`) e coloque na variável `GOOGLE_CLIENT_ID`:
   - Local: no seu `.env`.
   - Render: aba **Environment** do serviço `lux-iphones-store`.
5. Não precisa configurar mais nada — o `SESSION_SECRET` (usado para assinar o cookie de login) já é gerado automaticamente pelo `render.yaml` no Render; em local, o servidor usa um valor padrão de desenvolvimento.

Sem o `GOOGLE_CLIENT_ID` configurado, o botão de login não aparece e ninguém consegue finalizar pedidos — então essa variável é obrigatória em produção.

## Gateway de pagamento (Mercado Pago)

O checkout tem três formas de operar, dependendo do que estiver configurado:

- **Sem credenciais (padrão):** o pedido é registrado e sua equipe confirma o pagamento manualmente pelo WhatsApp — como o site funcionava antes. Nenhum dado de cartão é pedido nessa modalidade.
- **Com `MP_ACCESS_TOKEN` (sem `MP_PUBLIC_KEY`):** Pix, cartão e boleto redirecionam o cliente para o checkout hospedado do Mercado Pago; ele volta pro site já com o pagamento confirmado.
- **Com `MP_ACCESS_TOKEN` E `MP_PUBLIC_KEY`:** Pix e boleto continuam redirecionando; **cartão de crédito é cobrado direto no site**, num formulário seguro embutido no checkout (Card Payment Brick do Mercado Pago) — o número do cartão é criptografado no navegador e nunca passa pelo nosso servidor. O pedido só é confirmado depois da resposta real da cobrança.

### Como ativar

1. Crie uma conta em [mercadopago.com.br](https://www.mercadopago.com.br) (grátis).
2. Vá em [mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app) → sua aplicação → **Credenciais de teste** (para simular pagamentos sem dinheiro real) ou **Credenciais de produção**.
3. Copie as duas credenciais:
   - **Access Token** → variável `MP_ACCESS_TOKEN` (secreta, só no servidor).
   - **Public Key** → variável `MP_PUBLIC_KEY` (pública, ativa o formulário de cartão embutido).
   - Local: no seu `.env` (crie a partir do `.env.example`).
   - Render: aba **Environment** do serviço `lux-iphones-store`.
   - Tokens de teste começam com `TEST-` — o site detecta isso sozinho e usa o checkout de sandbox (simulação) automaticamente.
4. (Recomendado) Configure o **webhook** no painel do Mercado Pago (**Sua aplicação → Webhooks**) apontando para `https://<seu-site>/api/payments/webhook`, evento **Pagamentos**. Copie a "Assinatura secreta" gerada e coloque em `MP_WEBHOOK_SECRET` — sem isso, o servidor ainda funciona, mas não consegue verificar se a notificação realmente veio do Mercado Pago. O webhook é o principal mecanismo de confirmação para Pix e boleto; para cartão, a confirmação já acontece na hora, mas o webhook serve como reforço (ex.: estorno posterior).

### Testando pagamentos sem gastar dinheiro de verdade

Com um token `TEST-...`, use os [cartões de teste do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards) (número, CVV e validade fictícios) na página de checkout para simular aprovação, recusa etc. Pix e boleto de teste são aprovados automaticamente após alguns segundos no ambiente sandbox.

**Webhook em localhost:** o Mercado Pago não consegue chamar `http://localhost:3000`. Para testar o webhook localmente, use um túnel (ex.: `npx localtunnel --port 3000` ou `ngrok http 3000`) e configure `PUBLIC_BASE_URL` com a URL pública gerada antes de criar o pedido — em produção (Render) isso já é automático.

## Estrutura do banco de dados

- **`products`** — catálogo, preços (Black Friday e cheio), estoque por condição (novo/recondicionado).
- **`orders`** — pedidos recebidos pelo checkout, incluindo status de pagamento (`payment_status`), o ID do pagamento no Mercado Pago (`payment_id`) e o cliente que fez o pedido (`user_id`), quando aplicável.
- **`users`** — clientes cadastrados via login com Google (nome, e-mail, data de cadastro e último login). Listados no painel `/admin.html`.
- **`counters`** — contador sequencial dos números de pedido (`NC100001`, `NC100002`, ...).

O código de acesso ao banco fica em `server/database/` (`postgres.js` para produção, `sqlite.js` para desenvolvimento local, escolhidos automaticamente conforme a variável `DATABASE_URL`).

## Arquivos legados

`server/data/products.json`, `server/data/orders.json` e `server/data/counters.json` eram usados pela versão antiga (armazenamento em arquivo) e **não são mais lidos pelo servidor** — todo dado agora vive no banco de dados. Pode apagá-los quando quiser.
