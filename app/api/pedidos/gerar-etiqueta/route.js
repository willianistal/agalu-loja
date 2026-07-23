import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';

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
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AGALU <onboarding@resend.dev>',
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
  } catch (e) {}
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
    'User-Agent': 'AGALU (contato@agalu.com.br)',
  };

  const pesoTotal = Math.max(0.3, (pedido.itens || []).reduce((acc, i) => acc + i.quantidade * 0.15, 0));

  const from = {
    name: process.env.REMETENTE_NOME,
    phone: process.env.REMETENTE_TELEFONE,
    email: process.env.REMETENTE_EMAIL,
    document: process.env.REMETENTE_CNPJ,
    company_document: process.env.REMETENTE_CNPJ,
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

  try {
    // 1. Adiciona no carrinho
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
    const cartData = await cartResp.json();
    if (!cartResp.ok || !cartData.id) {
      return NextResponse.json({ erro: 'Erro ao adicionar no carrinho: ' + JSON.stringify(cartData) }, { status: 400 });
    }
    const orderId = cartData.id;

    // 2. Paga com o saldo da carteira
    const checkoutResp = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify({ orders: [orderId] }),
    });
    const checkoutData = await checkoutResp.json();
    if (!checkoutResp.ok) {
      return NextResponse.json({ erro: 'Erro ao pagar o frete: ' + JSON.stringify(checkoutData) }, { status: 400 });
    }

    // 3. Gera a etiqueta
    const generateResp = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ orders: [orderId] }),
    });
    const generateData = await generateResp.json();
    if (!generateResp.ok) {
      return NextResponse.json({ erro: 'Erro ao gerar etiqueta: ' + JSON.stringify(generateData) }, { status: 400 });
    }

    // 4. Busca o código de rastreio
    const trackResp = await fetch(`https://melhorenvio.com.br/api/v2/me/orders/${orderId}`, { headers });
    const trackData = await trackResp.json();
    const codigoRastreio = trackData?.tracking || null;

    const { data: pedidoAtualizado } = await supabase
      .from('pedidos')
      .update({
        codigo_rastreio: codigoRastreio,
        status_envio: 'enviado',
      })
      .eq('id', id)
      .select()
      .single();

    await enviarEmailRastreio(pedidoAtualizado);

    return NextResponse.json({ ok: true, codigo_rastreio: codigoRastreio });
  } catch (e) {
    return NextResponse.json({ erro: 'Erro inesperado: ' + e.message }, { status: 500 });
  }
}
