import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';

// Pedido de atacado NÃO passa pelo Mercado Pago: o site só registra o pedido
// (pra aparecer no painel /admin/pedidos) e devolve os dados prontos pro
// front-end montar o link do WhatsApp que o cliente usa pra confirmar.
export async function POST(req) {
  const { itens, cliente, total } = await req.json();

  if (!itens || itens.length === 0) {
    return NextResponse.json({ erro: 'Carrinho vazio.' }, { status: 400 });
  }

  const supabase = getSupabase();
  let pedidoId = null;

  if (supabase) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        cliente_nome: cliente?.nome,
        cliente_email: cliente?.email,
        cliente_telefone: cliente?.telefone,
        itens,
        total,
        tipo: 'atacado',
        status_pagamento: 'aguardando_confirmacao',
        status_envio: 'aguardando_envio',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ erro: 'Erro ao salvar pedido: ' + error.message }, { status: 400 });
    }
    pedidoId = data.id;
  }

  return NextResponse.json({ ok: true, pedidoId });
}
