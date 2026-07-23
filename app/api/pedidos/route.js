import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';

async function enviarEmailRastreio(pedido) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !pedido.cliente_email) return;

  const itensTexto = (pedido.itens || [])
    .map((i) => `${i.quantidade}x ${i.nome} (Tam. ${i.tamanho})`)
    .join('<br>');

  const rastreioTexto = pedido.codigo_rastreio
    ? `<p>Código de rastreio: <strong>${pedido.codigo_rastreio}</strong></p><p>Você pode acompanhar em <a href="https://www.linkcorreios.com.br/?id=${pedido.codigo_rastreio}">linkcorreios.com.br</a></p>`
    : '<p>Assim que o código de rastreio estiver disponível, avisaremos novamente.</p>';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AGALU <pedidos@agalu.com.br>',
        to: pedido.cliente_email,
        subject: 'Seu pedido AGALU foi enviado! 📦',
        html: `
          <div style="font-family: sans-serif; color: #4a4442;">
            <h2 style="color: #d97b93;">Seu pedido saiu para entrega!</h2>
            <p>Olá, ${pedido.cliente_nome || ''}!</p>
            <p>Seu pedido foi postado e está a caminho.</p>
            ${rastreioTexto}
            <p><strong>Itens:</strong><br>${itensTexto}</p>
            <p>Obrigado por comprar na AGALU! 💛</p>
          </div>
        `,
      }),
    });
  } catch (e) {
    // não bloqueia o fluxo se o e-mail falhar
  }
}

async function enviarEmailAvaliacao(pedido) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !pedido.cliente_email) return;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.agalu.com.br';
  const link = `${baseUrl}/avaliar/${pedido.id}`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AGALU <pedidos@agalu.com.br>',
        to: pedido.cliente_email,
        subject: 'Como foi sua compra na AGALU? 💛',
        html: `
          <div style="font-family: sans-serif; color: #4a4442;">
            <h2 style="color: #d97b93;">Seu pedido chegou!</h2>
            <p>Olá, ${pedido.cliente_nome || ''}!</p>
            <p>Esperamos que tenha gostado das peças. Poderia avaliar sua compra? Leva só 1 minuto:</p>
            <p><a href="${link}" style="background: #d97b93; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Avaliar minha compra</a></p>
            <p>Obrigado por comprar na AGALU! 💛</p>
          </div>
        `,
      }),
    });
  } catch (e) {}
}

export async function GET(req) {
  const senha = req.headers.get('x-admin-password');
  if (senha !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ erro: 'Senha inválida.' }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ erro: 'Banco de dados não configurado.' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
  return NextResponse.json({ pedidos: data });
}

export async function POST(req) {
  const senha = req.headers.get('x-admin-password');
  if (senha !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ erro: 'Senha inválida.' }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ erro: 'Banco de dados não configurado.' }, { status: 400 });
  }
  const { id, campo, valor } = await req.json();
  if (!['status_pagamento', 'status_envio', 'codigo_rastreio'].includes(campo)) {
    return NextResponse.json({ erro: 'Campo inválido.' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('pedidos')
    .update({ [campo]: valor })
    .eq('id', id)
    .select();
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });

  const pedidoAtualizado = data[0];

  if (campo === 'status_envio' && valor === 'enviado') {
    await enviarEmailRastreio(pedidoAtualizado);
  }

  if (campo === 'status_envio' && valor === 'entregue') {
    await enviarEmailAvaliacao(pedidoAtualizado);
  }

  return NextResponse.json({ pedido: pedidoAtualizado });
}
