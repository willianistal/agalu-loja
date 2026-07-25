import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import produtosEstaticos from '../../../produtos.json';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({
      produtos: produtosEstaticos.map((p) => ({ ...p, preco: 12, esgotado: false })),
      editavel: false,
    });
  }

  const { data, error } = await supabase.from('produtos').select('*');
  if (error || !data) {
    return NextResponse.json({
      produtos: produtosEstaticos.map((p) => ({ ...p, preco: 12, esgotado: false })),
      editavel: false,
    });
  }

  const mapaOverrides = {};
  data.forEach((d) => { mapaOverrides[d.ref] = d; });

  const produtosMesclados = produtosEstaticos.map((p) => ({
    ...p,
    preco: mapaOverrides[p.ref]?.preco ?? 12,
    esgotado: mapaOverrides[p.ref]?.esgotado ?? false,
  }));

  return NextResponse.json({ produtos: produtosMesclados, editavel: true });
}

export async function POST(req) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ erro: 'Banco de dados não configurado.' }, { status: 400 });
  }
  const senha = req.headers.get('x-admin-password');
  if (senha !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ erro: 'Senha inválida.' }, { status: 401 });
  }

  const body = await req.json();
  const { ref, preco, esgotado } = body;

  const { data, error } = await supabase
    .from('produtos')
    .upsert({ ref, preco, esgotado })
    .select();

  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
  return NextResponse.json({ produto: data[0] });
}
