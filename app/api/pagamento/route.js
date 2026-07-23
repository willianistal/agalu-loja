import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(req) {
  const { itens, frete, cliente, total } = await req.json();
  const token = process.env.MP_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      erro: 'Pagamento ainda não configurado. Assim que você criar sua conta Mercado Pago e me passar o Access Token, o checkout de Pix/Cartão/Boleto entra no ar automaticamente.',
    });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);

    const items = (itens || []).map((i) => ({
      title: `${i.nome} (Tam. ${i.tamanho}) - REF ${i.ref}`,
      quantity: i.quantidade,
      unit_price: i.preco,
      currency_id: 'BRL',
    }));

    if (frete) {
      items.push({ title: `Frete - ${frete.nome}`, quantity: 1, unit_price: frete.preco, currency_id: 'BRL' });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seusite.vercel.app';

    const result = await preference.create({
      body: {
        items,
        payer: { name: cliente?.nome, email: cliente?.email },
        back_urls: {
          success: `${baseUrl}/pedido-confirmado`,
          failure: `${baseUrl}/checkout`,
          pending: `${baseUrl}/pedido-confirmado`,
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (e) {
    return NextResponse.json({ erro: 'Erro ao criar pagamento: ' + e.message });
  }
}
