import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import produtosEstaticos from '../../../produtos.json';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ produtos: produtosEstaticos, editavel: false });
  }
  const { data, error } = await supabase.from('produtos').select('*').order('ref');
  if (error || !data || data.length === 0) {
    return NextResponse.json({ produtos: produtosEstaticos, editavel: false });
  }
  return NextResponse.json({ produtos: data, editavel: true });
}

export async function POST(req) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ erro: 'Painel admin ainda não tem banco de dados conectado. Configure o Supabase (veja README) para poder editar produtos direto pelo site.' }, { status: 400 });
  }
  const body = await req.json();
  const senha = req.headers.get('x-admin-password');
  if (senha !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ erro: 'Senha inválida.' }, { status: 401 });
  }
  const { data, error } = await supabase.from('produtos').upsert(body).select();
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
  return NextResponse.json({ produto: data[0] });
}
