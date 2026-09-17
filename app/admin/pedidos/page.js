'use client';
import { useState } from 'react';

const statusPagamentoOpcoes = ['pendente', 'aguardando_confirmacao', 'pago', 'recusado', 'cancelado'];
const statusEnvioOpcoes = ['aguardando_envio', 'etiqueta_gerada', 'enviado', 'entregue'];

const abas = [
  { chave: 'pendente', label: 'Pendente de pagamento', filtro: function (p) { return p.status_pagamento === 'pendente'; } },
  { chave: 'atacado', label: 'Atacado (aguardando confirmacao)', filtro: function (p) { return p.tipo === 'atacado' && p.status_pagamento === 'aguardando_confirmacao'; } },
  { chave: 'pago', label: 'Pago', filtro: function (p) { return p.status_pagamento === 'pago' && p.status_envio === 'aguardando_envio'; } },
  { chave: 'etiqueta', label: 'Etiqueta gerada', filtro: function (p) { return p.status_envio === 'etiqueta_gerada'; } },
  { chave: 'enviado', label: 'Enviado', filtro: function (p) { return p.status_envio === 'enviado'; } },
  { chave: 'entregue', label: 'Entregue', filtro: function (p) { return p.status_envio === 'entregue'; } },
  { chave: 'todos', label: 'Todos', filtro: function () { return true; } },
];

export default function PedidosAdminPage() {
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('pendente');
  const [gerandoEtiqueta, setGerandoEtiqueta] = useState(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

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
    setPedidos(function (prev) {
      return prev.map(function (p) {
        return p.id === pedido.id ? Object.assign({}, p, { [campo]: valor }) : p;
      });
    });
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': senha },
      body: JSON.stringify({ id: pedido.id, campo: campo, valor: valor }),
    });
    const data = await res.json();
    if (data.erro) setErro(data.erro);
  }

  async function gerarEtiqueta(pedido) {
    setGerandoEtiqueta(pedido.id);
    setErro('');
    try {
      const res = await fetch('/api/pedidos/gerar-etiqueta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': senha },
        body: JSON.stringify({ id: pedido.id }),
      });
      const data = await res.json();
      if (data.erro) {
        setErro('Erro ao gerar etiqueta: ' + data.erro);
      } else {
        setPedidos(function (prev) {
          return prev.map(function (p) {
            return p.id === pedido.id
              ? Object.assign({}, p, { codigo_rastreio: data.codigo_rastreio, status_envio: 'etiqueta_gerada' })
              : p;
          });
        });
      }
    } catch (e) {
      setErro('Erro inesperado ao gerar etiqueta.');
    }
    setGerandoEtiqueta(null);
  }

  if (!autenticado) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: 400 }}>
        <h1>Painel AGALU - Pedidos</h1>
        <div className="form-linha">
          <label>Senha</label>
          <input type="password" value={senha} onChange={function (e) { setSenha(e.target.value); }} />
        </div>
        <button className="btn" onClick={handleLogin} disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
        {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      </div>
    );
  }

  const dentroDoIntervalo = function (p) {
    if (!dataInicio && !dataFim) return true;
    const dataPedido = new Date(p.criado_em);
    if (dataInicio && dataPedido < new Date(dataInicio + 'T00:00:00')) return false;
    if (dataFim && dataPedido > new Date(dataFim + 'T23:59:59')) return false;
    return true;
  };

  const abaObj = abas.find(function (a) { return a.chave === abaAtiva; });
  const pedidosFiltrados = pedidos.filter(abaObj.filtro).filter(dentroDoIntervalo);

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1>Painel AGALU - Pedidos</h1>
      <button className="btn btn-secundario" onClick={function () { carregarPedidos(senha); }} style={{ marginBottom: 16 }}>
        Atualizar lista
      </button>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {abas.map(function (a) {
          const qtd = pedidos.filter(a.filtro).length;
          const ativa = abaAtiva === a.chave;
          return (
            <button
              key={a.chave}
              onClick={function () { setAbaAtiva(a.chave); }}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: ativa ? '2px solid #d97b93' : '1px solid #f0e4de',
                background: ativa ? '#fde3ea' : 'white',
                fontWeight: ativa ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {a.label} ({qtd})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>De</label>
          <input type="date" value={dataInicio} onChange={function (e) { setDataInicio(e.target.value); }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Ate</label>
          <input type="date" value={dataFim} onChange={function (e) { setDataFim(e.target.value); }} />
        </div>
        {(dataInicio || dataFim) && (
          <button
            className="btn btn-secundario"
            style={{ marginTop: 18 }}
            onClick={function () { setDataInicio(''); setDataFim(''); }}
          >
            Limpar filtro de data
          </button>
        )}
      </div>

      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      {pedidosFiltrados.length === 0 && <p>Nenhum pedido nessa aba/periodo.</p>}

      {pedidosFiltrados.map(function (p) {
        return (
          <div key={p.id} style={{ border: '1px solid #f0e4de', borderRadius: 10, padding: 16, marginBottom: 14, background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong>{p.cliente_nome || 'Sem nome'}</strong>
                {p.tipo === 'atacado' && (
                  <span style={{ marginLeft: 8, background: '#eaf5f1', color: '#3d8570', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                    ATACADO
                  </span>
                )}
                <div style={{ color: '#8a827e', fontSize: 14 }}>{p.cliente_email} - {p.cliente_telefone}</div>
                <div style={{ color: '#8a827e', fontSize: 14 }}>
                  {new Date(p.criado_em).toLocaleString('pt-BR')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: 18 }}>R$ {Number(p.total || 0).toFixed(2)}</strong>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <strong>Endereco:</strong>{' '}
              {p.endereco ? (
                <span>
                  {p.endereco.endereco}, {p.endereco.numero} {p.endereco.complemento} - {p.endereco.bairro},{' '}
                  {p.endereco.cidade}/{p.endereco.uf} - CEP {p.endereco.cep}
                </span>
              ) : (
                '-'
              )}
            </div>

            <div style={{ marginTop: 10 }}>
              <strong>Itens:</strong>
              <ul style={{ margin: '6px 0' }}>
                {(p.itens || []).map(function (item, i) {
                  return (
                    <li key={i}>
                      {item.pacote ? (
                        <span>
                          {item.nome} (Tam. {item.tamanho} - Pacote {item.genero}, {item.pacote} pecas) x{item.quantidadePacotes} pacote(s)
                        </span>
                      ) : (
                        <span>
                          {item.quantidade}x {item.nome} (Tam. {item.tamanho}{item.cor ? ' - Cor: ' + item.cor : ''}) - REF {item.ref}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {p.frete && <div>Frete: {p.frete.nome} - R$ {Number(p.frete.preco || 0).toFixed(2)}</div>}
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Pagamento</label>
                <select
                  value={p.status_pagamento}
                  onChange={function (e) { atualizarStatus(p, 'status_pagamento', e.target.value); }}
                >
                  {statusPagamentoOpcoes.map(function (o) {
                    return <option key={o} value={o}>{o}</option>;
                  })}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Envio</label>
                <select
                  value={p.status_envio}
                  onChange={function (e) { atualizarStatus(p, 'status_envio', e.target.value); }}
                >
                  {statusEnvioOpcoes.map(function (o) {
                    return <option key={o} value={o}>{o}</option>;
                  })}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Codigo de rastreio</label>
              <input
                type="text"
                defaultValue={p.codigo_rastreio || ''}
                placeholder="Ex: BR123456789BR"
                style={{ width: 220 }}
                onBlur={function (e) { atualizarStatus(p, 'codigo_rastreio', e.target.value); }}
              />
              <span style={{ fontSize: 12, color: '#8a827e', marginLeft: 8 }}>
                Preencha manualmente OU use o botao abaixo para gerar automatico.
              </span>
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                className="btn"
                onClick={function () { gerarEtiqueta(p); }}
                disabled={gerandoEtiqueta === p.id || p.status_pagamento !== 'pago'}
                style={{ background: '#6fb8a8' }}
              >
                {gerandoEtiqueta === p.id ? 'Gerando etiqueta...' : 'Gerar etiqueta automaticamente (Melhor Envio)'}
              </button>
              {p.status_pagamento !== 'pago' && (
                <span style={{ fontSize: 12, color: '#8a827e', marginLeft: 8 }}>
                  Disponivel so depois que o pagamento estiver "pago".
                </span>
              )}
              <p style={{ fontSize: 12, color: '#8a827e', marginTop: 6 }}>
                Depois de postar de verdade nos Correios, mude o "Envio" acima para <strong>enviado</strong> - e isso que dispara o e-mail de rastreio pro cliente.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
