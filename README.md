# NovaCell Store — Black Friday

Loja de iPhones (novos e recondicionados) com carrinho, checkout, painel admin e banco de dados. Preços especiais de Black Friday com contagem regressiva.

## Rodando localmente

```bash
npm install
npm start
```

Abra `http://localhost:3000`. O painel admin fica em `http://localhost:3000/admin.html` (token padrão: `novacell-admin`, configurável via variável `ADMIN_TOKEN`).

Em desenvolvimento, o servidor usa automaticamente um banco **SQLite local** (arquivo `server/data/novacell.sqlite`, criado na primeira execução). Não precisa instalar nada — é o módulo nativo `node:sqlite` do próprio Node.js.

## Colocando no ar (Render)

O projeto já vem com um `render.yaml` pronto que cria **o site e o banco PostgreSQL juntos**, automaticamente conectados.

1. Crie um repositório no GitHub e suba este projeto para ele:
   ```bash
   git init
   git add .
   git commit -m "Loja NovaCell — Black Friday"
   git branch -M main
   git remote add origin <url-do-seu-repositorio>
   git push -u origin main
   ```
2. Acesse [render.com](https://render.com) e crie uma conta gratuita (dá pra entrar direto com o GitHub).
3. No painel do Render, clique em **New +** → **Blueprint**.
4. Selecione o repositório que você acabou de criar. O Render vai ler o `render.yaml` automaticamente e mostrar 2 recursos a criar:
   - `novacell-store` (o site, plano Free)
   - `novacell-db` (o banco PostgreSQL, plano Free)
5. Clique em **Apply**. Em alguns minutos o site estará no ar em uma URL como `https://novacell-store.onrender.com`.
6. O banco é criado e conectado automaticamente (variável `DATABASE_URL`) e o catálogo é populado sozinho na primeira execução.
7. Um `ADMIN_TOKEN` aleatório e seguro também é gerado automaticamente — para descobrir qual foi gerado, vá em **novacell-store** → aba **Environment** no painel do Render.

**Importante sobre o banco gratuito do Render:** o plano Free do PostgreSQL expira depois de 90 dias (o Render avisa por e-mail antes). Quando isso acontecer, basta criar um novo banco gratuito (ou migrar para o plano pago, ~R$35/mês) para manter os pedidos e o estoque sem interrupção.

## Gateway de pagamento (Mercado Pago)

O checkout tem duas formas de operar:

- **Sem credenciais configuradas (padrão):** o pedido é registrado e sua equipe confirma o pagamento manualmente pelo WhatsApp — é como o site já funcionava antes.
- **Com `MP_ACCESS_TOKEN` configurada:** ao finalizar a compra, o cliente é redirecionado para o checkout do Mercado Pago (Pix, cartão ou boleto), e o pedido é atualizado automaticamente quando o pagamento é aprovado.

### Como ativar

1. Crie uma conta em [mercadopago.com.br](https://www.mercadopago.com.br) (grátis).
2. Vá em **Seu negócio → Configurações → Credenciais de produção** (ou use as **credenciais de teste**, que já vêm prontas para simular pagamentos sem dinheiro real) em [mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app).
3. Copie o **Access Token** e cole na variável `MP_ACCESS_TOKEN`:
   - Local: no seu `.env` (crie a partir do `.env.example`).
   - Render: aba **Environment** do serviço `novacell-store`.
   - Tokens de teste começam com `TEST-` — o site detecta isso sozinho e usa o checkout de sandbox (simulação) automaticamente.
4. (Recomendado) Configure o **webhook** no painel do Mercado Pago (**Sua aplicação → Webhooks**) apontando para `https://<seu-site>/api/payments/webhook`, evento **Pagamentos**. Copie a "Assinatura secreta" gerada e coloque em `MP_WEBHOOK_SECRET` — sem isso, o servidor ainda funciona, mas não consegue verificar se a notificação realmente veio do Mercado Pago.

### Testando pagamentos sem gastar dinheiro de verdade

Com um token `TEST-...`, use os [cartões de teste do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards) (número, CVV e validade fictícios) na página de checkout para simular aprovação, recusa etc. Pix e boleto de teste são aprovados automaticamente após alguns segundos no ambiente sandbox.

**Webhook em localhost:** o Mercado Pago não consegue chamar `http://localhost:3000`. Para testar o webhook localmente, use um túnel (ex.: `npx localtunnel --port 3000` ou `ngrok http 3000`) e configure `PUBLIC_BASE_URL` com a URL pública gerada antes de criar o pedido — em produção (Render) isso já é automático.

## Estrutura do banco de dados

- **`products`** — catálogo, preços (Black Friday e cheio), estoque por condição (novo/recondicionado).
- **`orders`** — pedidos recebidos pelo checkout, incluindo status de pagamento (`payment_status`) e o ID do pagamento no Mercado Pago (`payment_id`), quando aplicável.
- **`counters`** — contador sequencial dos números de pedido (`NC100001`, `NC100002`, ...).

O código de acesso ao banco fica em `server/database/` (`postgres.js` para produção, `sqlite.js` para desenvolvimento local, escolhidos automaticamente conforme a variável `DATABASE_URL`).

## Arquivos legados

`server/data/products.json`, `server/data/orders.json` e `server/data/counters.json` eram usados pela versão antiga (armazenamento em arquivo) e **não são mais lidos pelo servidor** — todo dado agora vive no banco de dados. Pode apagá-los quando quiser.
