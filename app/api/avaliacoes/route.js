import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';

export async function GET(req) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ avaliacoes: [] });

  const url = new URL(req.url);
  const produto = url.searchParams.get('produto');

  let query = supabase.from('avaliacoes').select('*').eq('aprovado', true).order('criado_em', { ascending: false });
  query = produto ? query.eq('produto_ref', produto) : query.is('produto_ref', null);

  const { data, error } = await query;
  if (error) return NextResponse.json({ avaliacoes: [] });
  return NextResponse.json({ avaliacoes: data });
}

export async function POST(req) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ erro: 'Banco de dados não configurado.' }, { status: 400 });

  const { produtoRef, nome, nota, comentario } = await req.json();
  if (!nome || !nota) {
    return NextResponse.json({ erro: 'Nome e nota são obrigatórios.' }, { status: 400 });
  }

  const { error } = await supabase.from('avaliacoes').insert({
    produto_ref: produtoRef || null,
    nome,
    nota: Math.min(5, Math.max(1, parseInt(nota))),
    comentario,
    aprovado: true,
  });

  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
