import { NextResponse } from 'next/server';
import { Payment, MercadoPagoConfig } from 'mercadopago';
import { getSupabase } from '../../../lib/supabase';

async function enviarEmailConfirmacao(pedido) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !pedido.cliente_email) return;

  const itensTexto = (pedido.itens || [])
    .map((i) => `${i.quantidade}x ${i.nome} (Tam. ${i.tamanho}) — R$ ${Number(i.preco).toFixed(2)}`)
    .join('<br>');

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AGALU <pedidos@agalu.com.br>',
        to: pedido.cliente_email,
        subject: 'Recebemos seu pedido AGALU! ✅',
        html: `
          <div style="font-family: sans-serif; color: #4a4442;">
            <h2 style="color: #d97b93;">Pagamento confirmado!</h2>
            <p>Olá, ${pedido.cliente_nome || ''}!</p>
            <p>Seu pagamento foi aprovado e já estamos preparando seu pedido para envio.</p>
            <p><strong>Itens:</strong><br>${itensTexto}</p>
            <p><strong>Frete:</strong> ${pedido.frete?.nome || ''} — R$ ${Number(pedido.frete?.preco || 0).toFixed(2)}</p>
            <p><strong>Total:</strong> R$ ${Number(pedido.total || 0).toFixed(2)}</p>
            <p>Assim que seu pedido for postado, você vai receber um novo e-mail com o código de rastreio.</p>
            <p>Obrigado por comprar na AGALU! 💛</p>
          </div>
        `,
      }),
    });
  } catch (e) {}
}

async function enviarWhatsAppVenda(pedido) {
  const apiKey = process.env.CALLMEBOT_APIKEY;
  const numero = process.env.WHATSAPP_NOTIFICACAO;
  if (!apiKey || !numero) return;

  const itensTexto = (pedido.itens || [])
    .map((i) => `${i.quantidade}x ${i.nome} (Tam. ${i.tamanho})`)
    .join(', ');

  const texto = `🎉 Nova venda AGALU!\nCliente: ${pedido.cliente_nome || ''}\nItens: ${itensTexto}\nTotal: R$ ${Number(pedido.total || 0).toFixed(2)}`;

  try {
    await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${numero}&text=${encodeURIComponent(texto)}&apikey=${apiKey}`
    );
  } catch (e) {}
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const paymentId = body?.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');

    if (!paymentId) return NextResponse.json({ ok: true });

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ ok: true });

    const client = new MercadoPagoConfig({ accessToken: token });
    const payment = new Payment(client);
    const info = await payment.get({ id: paymentId });

    const pedidoId = info.external_reference;
    const status = info.status;

    const supabase = getSupabase();
    if (supabase && pedidoId) {
      const statusMap = { approved: 'pago', pending: 'pendente', rejected: 'recusado', cancelled: 'cancelado' };
      const novoStatus = statusMap[status] || status;

      const { data: pedidoAtualizado } = await supabase
        .from('pedidos')
        .update({ status_pagamento: novoStatus })
        .eq('id', pedidoId)
        .select()
        .single();

      if (novoStatus === 'pago' && pedidoAtualizado) {
        await enviarEmailConfirmacao(pedidoAtualizado);
        await enviarWhatsAppVenda(pedidoAtualizado);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
