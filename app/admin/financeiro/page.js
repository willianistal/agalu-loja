'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinanceiroPage() {
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [somentePagos, setSomentePagos] = useState(true);

  async function carregarPedidos(senhaAtual) {
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch('/api/pedidos', { headers: { 'x-admin-password': senhaAtual } });
      const data = await res.json();
      if (data.erro) {
        setErro(data.erro);
        setAutenticado(false);
      } else {
        setPedidos(data.pedidos || []);
        setAutenticado(true);
      }
    } catch (e) {
      setErro('Erro ao carregar pedidos.');
    }
    setCarregando(false);
  }

  function handleLogin() {
    if (senha.length > 0) {
      carregarPedidos(senha);
    } else {
      setErro('Digite a senha.');
    }
  }

  if (!autenticado) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: 400 }}>
        <h1>Painel AGALU — Financeiro</h1>
        <div className="form-linha">
          <label>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        <button className="btn" onClick={handleLogin} disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
        {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      </div>
    );
  }

  const dentroDoIntervalo = (p) => {
    if (!dataInicio && !dataFim) return true;
    const dataPedido = new Date(p.criado_em);
    if (dataInicio && dataPedido < new Date(dataInicio + 'T00:00:00')) return false;
    if (dataFim && dataPedido > new Date(dataFim + 'T23:59:59')) return false;
    return true;
  };

  const base = pedidos
    .filter((p) => (somentePagos ? p.status_pagamento === 'pago' : true))
    .filter(dentroDoIntervalo);

  const totalVendaProdutos = base.reduce(
    (acc, p) => acc + (p.total || 0) - (p.frete?.preco || 0),
    0
  );
  const totalFrete = base.reduce((acc, p) => acc + (p.frete?.preco || 0), 0);
  const totalGeral = totalVendaProdutos + totalFrete;
  const qtdPedidos = base.length;
  const ticketMedio = qtdPedidos > 0 ? totalGeral / qtdPedidos : 0;

  const porDia = {};
  base.forEach((p) => {
    const dia = new Date(p.criado_em).toLocaleDateString('pt-BR');
    if (!porDia[dia]) porDia[dia] = { dia, vendas: 0, frete: 0 };
    porDia[dia].vendas += (p.total || 0) - (p.frete?.preco || 0);
    porDia[dia].frete += p.frete?.preco || 0;
  });
  const dadosGrafico = Object.values(porDia).sort(
    (a, b) => new Date(a.dia.split('/').reverse().join('-')) - new Date(b.dia.split('/').reverse().join('-'))
  );

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1>Painel AGALU — Financeiro</h1>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-secundario" onClick={() => carregarPedidos(senha)}>
          Atualizar dados
        </button>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>De</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Até</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18 }}>
          <input type="checkbox" checked={somentePagos} onChange={(e) => setSomentePagos(e.target.checked)} />
          Somente pedidos pagos
        </label>
        {(dataInicio || dataFim) && (
          <button
            className="btn btn-secundario"
            style={{ marginTop: 18 }}
            onClick={() => { setDataInicio(''); setDataFim(''); }}
          >
            Limpar filtro de data
          </button>
        )}
      </div>

      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 30 }}>
        <div className="cartao-financeiro" style={cardStyle}>
          <span style={labelStyle}>Total geral (venda + frete)</span>
          <strong style={valorStyle}>R$ {totalGeral.toFixed(2)}</strong>
        </div>
        <div className="cartao-financeiro" style={cardStyle}>
          <span style={labelStyle}>Total só de produtos</span>
          <strong style={valorStyle}>R$ {totalVendaProdutos.toFixed(2)}</strong>
        </div>
        <div className="cartao-financeiro" style={cardStyle}>
          <span style={labelStyle}>Total só de frete</span>
          <strong style={valorStyle}>R$ {totalFrete.toFixed(2)}</strong>
        </div>
        <div className="cartao-financeiro" style={cardStyle}>
          <span style={labelStyle}>Pedidos no período</span>
          <strong style={valorStyle}>{qtdPedidos}</strong>
        </div>
        <div className="cartao-financeiro" style={cardStyle}>
          <span style={labelStyle}>Ticket médio</span>
          <strong style={valorStyle}>R$ {ticketMedio.toFixed(2)}</strong>
        </div>
      </div>

      <h3>Vendas por dia</h3>
      {dadosGrafico.length === 0 ? (
        <p>Sem dados para o período selecionado.</p>
      ) : (
        <div style={{ width: '100%', height: 320, background: 'white', borderRadius: 12, padding: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e4de" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
              <Line type="monotone" dataKey="vendas" stroke="#d97b93" strokeWidth={2} name="Vendas (produtos)" />
              <Line type="monotone" dataKey="frete" stroke="#6fb8a8" strokeWidth={2} name="Frete" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: 'white',
  borderRadius: 12,
  padding: '16px 20px',
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  border: '1px solid #f0e4de',
};
const labelStyle = { fontSize: 13, color: '#8a827e' };
const valorStyle = { fontSize: 22, color: '#4a4442' };
