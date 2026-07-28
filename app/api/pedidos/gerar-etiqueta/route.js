import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';

export async function POST(req) {
  const senha = req.headers.get('x-admin-password');
  if (senha !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ erro: 'Senha inválida.' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ erro: 'Banco de dados não configurado.' }, { status: 400 });
  }

  const { id } = await req.json();
  const { data: pedido, error: erroBusca } = await supabase.from('pedidos').select('*').eq('id', id).single();
  if (erroBusca || !pedido) {
    return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 });
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) {
    return NextResponse.json({ erro: 'Token do Melhor Envio não configurado.' }, { status: 400 });
  }
  if (!pedido.frete || !pedido.frete.id) {
    return NextResponse.json({ erro: 'Este pedido não tem um frete válido (ID do serviço) salvo.' }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'AGALU (contato@agalu.com.br)',
  };

  const pesoTotal = Math.max(0.3, (pedido.itens || []).reduce((acc, i) => acc + i.quantidade * 0.15, 0));

  const from = {
    name: process.env.REMETENTE_NOME,
    phone: process.env.REMETENTE_TELEFONE,
    email: process.env.REMETENTE_EMAIL,
    document: (process.env.REMETENTE_CPF || '').replace(/\D/g, ''),
    company_document: (process.env.REMETENTE_CNPJ || '').replace(/\D/g, ''),
    address: process.env.REMETENTE_ENDERECO,
    number: process.env.REMETENTE_NUMERO,
    district: process.env.REMETENTE_BAIRRO,
    city: process.env.REMETENTE_CIDADE,
    state_abbr: process.env.REMETENTE_UF,
    postal_code: (process.env.CEP_ORIGEM_LOJA || '').replace(/\D/g, ''),
    country_id: 'BR',
  };

  const to = {
    name: pedido.cliente_nome,
    phone: pedido.cliente_telefone,
    email: pedido.cliente_email,
    document: (pedido.cliente_cpf || '').replace(/\D/g, ''),
    address: pedido.endereco?.endereco,
    number: pedido.endereco?.numero,
    complement: pedido.endereco?.complemento,
    district: pedido.endereco?.bairro,
    city: pedido.endereco?.cidade,
    state_abbr: pedido.endereco?.uf,
    postal_code: (pedido.endereco?.cep || '').replace(/\D/g, ''),
    country_id: 'BR',
  };

  async function parseRespostaSegura(resp) {
    const texto = await resp.text();
    try {
      return { data: JSON.parse(texto), bruto: texto };
    } catch {
      return { data: null, bruto: texto };
    }
  }

  try {
    const cartResp = await fetch('https://melhorenvio.com.br/api/v2/me/cart', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        service: pedido.frete.id,
        from,
        to,
        products: (pedido.itens || []).map((i) => ({
          name: i.nome,
          quantity: i.quantidade,
          unitary_value: i.preco,
        })),
        volumes: [{ height: 10, width: 20, length: 20, weight: pesoTotal }],
        options: { insurance_value: pedido.total || 0, receipt: false, own_hand: false, non_commercial: true },
      }),
    });
    const { data: cartData, bruto: cartBruto } = await parseRespostaSegura(cartResp);
    if (!cartResp.ok || !cartData || !cartData.id) {
      return NextResponse.json({
        erro: `Erro ao adicionar no carrinho (status ${cartResp.status}): ` +
          (cartData ? JSON.stringify(cartData) : cartBruto.slice(0, 500)),
      }, { status: 400 });
    }
    const orderId = cartData.id;

    const checkoutResp = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify({ orders: [orderId] }),
    });
    const { data: checkoutData, bruto: checkoutBruto } = await parseRespostaSegura(checkoutResp);
    if (!checkoutResp.ok) {
      return NextResponse.json({
        erro: `Erro ao pagar o frete (status ${checkoutResp.status}): ` +
          (checkoutData ? JSON.stringify(checkoutData) : checkoutBruto.slice(0, 500)),
      }, { status: 400 });
    }

    const generateResp = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ orders: [orderId] }),
    });
    const { data: generateData, bruto: generateBruto } = await parseRespostaSegura(generateResp);
    if (!generateResp.ok) {
      return NextResponse.json({
        erro: `Erro ao gerar etiqueta (status ${generateResp.status}): ` +
          (generateData ? JSON.stringify(generateData) : generateBruto.slice(0, 500)),
      }, { status: 400 });
    }

    // 4. Busca o código de rastreio (endpoint correto: shipment/tracking)
    const trackResp = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/tracking', {
      method: 'POST',
      headers,
      body: JSON.stringify({ orders: [orderId] }),
    });
    const { data: trackData, bruto: trackBruto } = await parseRespostaSegura(trackResp);
    // Log temporário: aparece nos "Runtime Logs" da Vercel e mostra o formato
    // exato que a API devolveu, para confirmarmos o campo certo do rastreio.
    console.log(`[Rastreio] orderId=${orderId} status=${trackResp.status} resposta=${trackBruto.slice(0, 800)}`);
    const codigoRastreio = trackData?.[orderId]?.tracking || trackData?.tracking || null;

    const { data: pedidoAtualizado } = await supabase
      .from('pedidos')
      .update({
        codigo_rastreio: codigoRastreio,
        status_envio: 'etiqueta_gerada',
      })
      .eq('id', id)
      .select()
      .single();

    return NextResponse.json({ ok: true, codigo_rastreio: codigoRastreio });
  } catch (e) {
    return NextResponse.json({ erro: 'Erro inesperado: ' + e.message }, { status: 500 });
  }
}
