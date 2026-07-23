'use client';
import { useState } from 'react';

const statusPagamentoOpcoes = ['pendente', 'pago', 'recusado', 'cancelado'];
const statusEnvioOpcoes = ['aguardando_envio', 'enviado', 'entregue'];

export default function PedidosAdminPage() {
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(false);

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

  async function atualizarStatus(pedido, campo, valor) {
    setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, [campo]: valor } : p)));
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': senha },
      body: JSON.stringify({ id: pedido.id, campo, valor }),
    });
    const data = await res.json();
    if (data.erro) setErro(data.erro);
  }

  if (!autenticado) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: 400 }}>
        <h1>Painel AGALU — Pedidos</h1>
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

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1>Painel AGALU — Pedidos</h1>
      <button className="btn btn-secundario" onClick={() => carregarPedidos(senha)} style={{ marginBottom: 16 }}>
        Atualizar lista
      </button>
      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      {pedidos.length === 0 && <p>Nenhum pedido ainda.</p>}
      {pedidos.map((p) => (
        <div key={p.id} style={{ border: '1px solid #f0e4de', borderRadius: 10, padding: 16, marginBottom: 14, background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong>{p.cliente_nome || 'Sem nome'}</strong>
              <div style={{ color: '#8a827e', fontSize: 14 }}>{p.cliente_email} · {p.cliente_telefone}</div>
              <div style={{ color: '#8a827e', fontSize: 14 }}>
                {new Date(p.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: 18 }}>R$ {Number(p.total || 0).toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Endereço:</strong>{' '}
            {p.endereco ? (
              <span>
                {p.endereco.endereco}, {p.endereco.numero} {p.endereco.complemento} — {p.endereco.bairro},{' '}
                {p.endereco.cidade}/{p.endereco.uf} — CEP {p.endereco.cep}
              </span>
            ) : (
              '—'
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Itens:</strong>
            <ul style={{ margin: '6px 0' }}>
              {(p.itens || []).map((item, i) => (
                <li key={i}>
                  {item.quantidade}x {item.nome} (Tam. {item.tamanho}) — REF {item.ref}
                </li>
              ))}
            </ul>
            {p.frete && <div>Frete: {p.frete.nome} — R$ {Number(p.frete.preco || 0).toFixed(2)}</div>}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Pagamento</label>
              <select
                value={p.status_pagamento}
                onChange={(e) => atualizarStatus(p, 'status_pagamento', e.target.value)}
              >
                {statusPagamentoOpcoes.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Envio</label>
              <select
                value={p.status_envio}
                onChange={(e) => atualizarStatus(p, 'status_envio', e.target.value)}
              >
                {statusEnvioOpcoes.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
