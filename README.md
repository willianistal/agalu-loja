# Site AGALU — Guia de publicação (passo a passo)

O site já vem pronto: loja com os 76 produtos reais (fotos + preço fixo R$12),
filtro Verão/Inverno/tecido/tamanho, carrinho, checkout com frete e pagamento,
e painel admin. Só falta publicar e ligar as 2 integrações (frete e pagamento).

## 1. Publicar o site (grátis, ~10 minutos)

1. Crie uma conta em **https://github.com** (grátis).
2. Crie um repositório novo (ex: `agalu-loja`) e suba esta pasta inteira nele
   (pode arrastar os arquivos direto pela interface do GitHub, sem precisar
   saber usar linha de comando).
3. Crie uma conta em **https://vercel.com** usando o mesmo login do GitHub.
4. Na Vercel, clique em "Add New Project", escolha o repositório `agalu-loja`
   e clique em "Deploy". Em 2 minutos o site já está no ar, com um link tipo
   `agalu-loja.vercel.app`.

## 2. Domínio próprio (opcional, ~R$40/ano)

1. Compre um domínio (ex: `agalu.com.br`) em **https://registro.br** ou na
   Hostinger.
2. Na Vercel, vá em Project Settings → Domains → adicione seu domínio.
3. A Vercel mostra 2 registros de DNS pra você colar no painel do Registro.br
   (é só copiar e colar, a Vercel explica exatamente onde).

## 3. Ligar o pagamento (Mercado Pago)

1. Crie conta em **https://www.mercadopago.com.br**
2. Vá em "Seu negócio" → "Configurações" → "Credenciais de produção".
3. Copie o **Access Token de produção**.
4. Na Vercel: Project Settings → Environment Variables → adicione:
   `MP_ACCESS_TOKEN = seu_token_aqui`
5. Redeploy o projeto (Vercel faz isso automaticamente).

Assim que isso estiver preenchido, o botão "Pagar com Pix, Cartão ou Boleto"
passa a abrir o checkout de verdade do Mercado Pago.

## 4. Ligar o frete real (Melhor Envio)

1. Crie conta em **https://melhorenvio.com.br**
2. Gere um token de API em "Integrações" → "Tokens".
3. Na Vercel, adicione a variável:
   `MELHOR_ENVIO_TOKEN = seu_token_aqui`
   `CEP_ORIGEM_LOJA = CEP de onde você despacha`
4. Redeploy.

Até isso ser configurado, o site calcula um **frete estimado** (PAC/SEDEX por
faixa de região) só para o cliente conseguir simular a compra — não é
oficial dos Correios ainda.

## 5. Painel admin (opcional, para editar preço/estoque pelo site)

Sem isso configurado, o painel `/admin` mostra os produtos mas não deixa
editar. Se quiser editar preço e marcar "esgotado" direto pelo navegador:

1. Crie conta grátis em **https://supabase.com**
2. Crie um projeto novo, e dentro dele uma tabela chamada `produtos` com as
   mesmas colunas do arquivo `produtos.json` (ref, nome, tamanhos, tecido,
   estacao, pacote, detalhe, botao, preco, esgotado).
3. Copie a "Project URL" e a "service_role key" (em Project Settings → API).
4. Na Vercel, adicione:
   `SUPABASE_URL = ...`
   `SUPABASE_SERVICE_KEY = ...`
5. Defina também `ADMIN_PASSWORD = sua-senha` na Vercel — é a senha de acesso
   ao `/admin`.

## O que já funciona 100% sem nenhuma configuração extra

- Loja completa com fotos reais, filtros Verão/Inverno/tecido/tamanho
- Página de cada produto com seleção de tamanho
- Carrinho de compras
- Cálculo de frete (modo estimado até ligar o Melhor Envio)
- Fluxo de checkout completo (só falta o token do Mercado Pago para o
  pagamento processar de verdade)

## Estrutura de pastas

- `produtos.json` — banco de dados dos 76 produtos (pode editar na mão se quiser)
- `public/images/` — fotos dos produtos (nome do arquivo = REF)
- `app/` — todas as páginas do site
- `app/api/` — as 3 rotas de backend (frete, pagamento, produtos)
