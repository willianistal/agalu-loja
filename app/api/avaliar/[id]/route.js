import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';

export async function GET(req, { params }) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ erro: 'Banco de dados não configurado.' }, { status: 400 });

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('id, cliente_nome, itens, status_envio, avaliado')
    .eq('id', params.id)
    .single();

  if (error || !pedido) return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 });
  if (pedido.status_envio !== 'entregue') {
    return NextResponse.json({ erro: 'Este pedido ainda não foi marcado como entregue.' }, { status: 400 });
  }
  if (pedido.avaliado) {
    return NextResponse.json({ erro: 'Você já avaliou este pedido. Obrigado!' }, { status: 400 });
  }

  return NextResponse.json({ pedido });
}

export async function POST(req, { params }) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ erro: 'Banco de dados não configurado.' }, { status: 400 });

  const { nome, avaliacoes } = await req.json();

  const { data: pedido, error: erroBusca } = await supabase
    .from('pedidos')
    .select('id, status_envio, avaliado')
    .eq('id', params.id)
    .single();

  if (erroBusca || !pedido) return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 });
  if (pedido.status_envio !== 'entregue') {
    return NextResponse.json({ erro: 'Pedido ainda não entregue.' }, { status: 400 });
  }
  if (pedido.avaliado) {
    return NextResponse.json({ erro: 'Pedido já avaliado.' }, { status: 400 });
  }

  const linhas = (avaliacoes || []).map((a) => ({
    produto_ref: a.produtoRef,
    pedido_id: pedido.id,
    nome,
    nota: a.nota,
    comentario: a.comentario,
    aprovado: true,
  }));

  const { error: erroInsert } = await supabase.from('avaliacoes').insert(linhas);
  if (erroInsert) return NextResponse.json({ erro: erroInsert.message }, { status: 400 });

  await supabase.from('pedidos').update({ avaliado: true }).eq('id', pedido.id);

  return NextResponse.json({ ok: true });
}
