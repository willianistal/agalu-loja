import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';

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
  if (!['status_pagamento', 'status_envio'].includes(campo)) {
    return NextResponse.json({ erro: 'Campo inválido.' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('pedidos')
    .update({ [campo]: valor })
    .eq('id', id)
    .select();
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
  return NextResponse.json({ pedido: data[0] });
}
