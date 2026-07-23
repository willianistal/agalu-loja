import { NextResponse } from 'next/server';
import { Payment, MercadoPagoConfig } from 'mercadopago';
import { getSupabase } from '../../../lib/supabase';

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
      await supabase
        .from('pedidos')
        .update({ status_pagamento: statusMap[status] || status })
        .eq('id', pedidoId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
