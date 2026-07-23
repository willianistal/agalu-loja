import { NextResponse } from 'next/server';

const CEP_ORIGEM = process.env.CEP_ORIGEM_LOJA || '12940-000'; // Atibaia/SP como padrão, troque no .env

export async function POST(req) {
  const { cep, itens } = await req.json();
  const cepLimpo = (cep || '').replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    return NextResponse.json({ erro: 'Digite um CEP válido.' });
  }

  const pesoTotal = Math.max(0.3, (itens || []).reduce((acc, i) => acc + i.quantidade * 0.11, 0));
  const token = process.env.MELHOR_ENVIO_TOKEN;

  // MODO REAL: se o token do Melhor Envio estiver configurado
  if (token) {
    try {
      const resp = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AGALU (contato@agalu.com.br)',
        },
        body: JSON.stringify({
          from: { postal_code: CEP_ORIGEM.replace(/\D/g, '') },
          to: { postal_code: cepLimpo },
          products: [{ id: '1', width: 20, height: 10, length: 20, weight: pesoTotal, insurance_value: 12, quantity: 1 }],
        }),
      });
      const data = await resp.json();
      const opcoes = (Array.isArray(data) ? data : [])
        .filter((o) => !o.error)
        .filter((o) => (o.company?.name || '').toLowerCase().includes('correios'))
        .filter((o) => /pac|sedex/i.test(o.name || ''))
        .map((o) => ({ id: String(o.id), nome: `${o.company?.name || ''} - ${o.name}`, preco: parseFloat(o.price), prazo: o.delivery_time }));
      if (opcoes.length > 0) return NextResponse.json({ opcoes });
    } catch (e) {
      // se der erro na API real, cai pro modo simulado abaixo
    }
  }

  // MODO SIMULADO: enquanto o token do Melhor Envio não está configurado.
  // Estimativa aproximada baseada na região do CEP, só para o site funcionar de ponta a ponta.
  const regiao = cepLimpo.slice(0, 2);
  const base = regiaoParaFaixa(regiao);
  const opcoes = [
    { id: 'pac', nome: 'PAC (simulado)', preco: base.pac, prazo: base.prazoPac },
    { id: 'sedex', nome: 'SEDEX (simulado)', preco: base.sedex, prazo: base.prazoSedex },
  ];
  return NextResponse.json({ opcoes, simulado: true });
}

function regiaoParaFaixa(regiao) {
  const n = parseInt(regiao, 10);
  // SP/região próxima
  if (n >= 1 && n <= 19) return { pac: 14.9, sedex: 24.9, prazoPac: 5, prazoSedex: 2 };
  // Sul/Sudeste
  if (n >= 20 && n <= 39) return { pac: 18.9, sedex: 29.9, prazoPac: 6, prazoSedex: 3 };
  // Demais regiões
  return { pac: 24.9, sedex: 39.9, prazoPac: 9, prazoSedex: 4 };
}
