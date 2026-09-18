'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCartAtacado } from '../../../lib/CartAtacadoContext';

const NUMERO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5511920502244';

export default function CarrinhoAtacadoPage() {
  const { itens, remover, atualizarQuantidade, limpar, total, totalPacotes, totalPecas } = useCartAtacado();
  const [form, setForm] = useState({ nome: '', cnpj: '', telefone: '', email: '' });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [linkWhats, setLinkWhats] = useState(null);

  function handleChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function montarMensagem(pedidoId) {
    const linhas = itens.map(
      function (i) {
        return '- ' + i.nome + ' - Tam. ' + i.tamanho + ' - Pacote ' + i.genero + ' (' + i.pacote + ' pecas) x' + i.quantidadePacotes + ' = ' + (i.pacote * i.quantidadePacotes) + ' pecas';
      }
    );
    return (
      'Ola! Quero confirmar meu pedido de atacado AGALU\n\n' +
      'Pedido: ' + (pedidoId || '') + '\n' +
      'Nome/Empresa: ' + form.nome + '\n' +
      'CNPJ: ' + form.cnpj + '\n' +
      'Telefone: ' + form.telefone + '\n\n' +
      linhas.join('\n') +
      '\n\nTotal de pacotes: ' + totalPacotes + '\n' +
      'Total de pecas: ' + totalPecas + '\n' +
      'Total (mercadoria): R$ ' + total.toFixed(2) + '\n' +
      'Frete: por conta do comprador (a combinar)'
    );
  }

  async function finalizarPedido() {
    setErro('');
    if (!form.nome || !form.telefone) {
      setErro('Preencha nome e telefone antes de confirmar.');
      return;
    }
    const cnpjLimpo = (form.cnpj || '').replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      setErro('Vendas no atacado exigem CNPJ valido (14 digitos). Compras com CPF devem ser feitas no varejo.');
      return;
    }
    if (itens.length === 0) {
      setErro('Seu carrinho de atacado esta vazio.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('/api/pedidos/atacado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: itens, cliente: form, total: total }),
      });
      const data = await res.json();
      if (data.erro) {
        setErro(data.erro);
      } else {
        const mensagem = montarMensagem(data.pedidoId);
        setLinkWhats('https://wa.me/' + NUMERO_WHATSAPP + '?text=' + encodeURIComponent(mensagem));
        limpar();
      }
    } catch (e) {
      setErro('Erro inesperado ao gerar o pedido.');
    }
    setEnviando(false);
  }

  if (linkWhats) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontSize: 50, marginBottom: 10 }}>OK</div>
        <h1>Pedido gerado!</h1>
        <p style={{ color: '#8a827e', marginBottom: 24 }}>
          Falta so um passo: clique no botao abaixo pra confirmar o pedido com a gente pelo WhatsApp.
        </p>
        <a href={linkWhats} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          Confirmar pedido no WhatsApp
        </a>
        <div style={{ marginTop: 24 }}>
          <Link href="/atacado" className="btn btn-secundario">Voltar ao catalogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Carrinho de Atacado</h1>

      {itens.length === 0 && <p>Seu carrinho de atacado esta vazio.</p>}

      {itens.map(function (item, i) {
        return (
          <div className="linha-carrinho" key={item.ref + '-' + item.tamanho + '-' + item.genero}>
            <div>
              <strong>{item.nome}</strong>
              <p style={{ color: '#8a827e', margin: '4px 0' }}>
                Tam. {item.tamanho} - Pacote {item.genero} ({item.pacote} pecas) - {item.tecido}
              </p>
            </div>
            <input
              type="number"
              min="1"
              value={item.quantidadePacotes}
              style={{ width: 60 }}
              onChange={function (e) {
                atualizarQuantidade(item.ref, item.tamanho, item.genero, Math.max(1, parseInt(e.target.value) || 1));
              }}
            />
            <span>R$ {(item.precoAtacado * item.pacote * item.quantidadePacotes).toFixed(2)}</span>
            <button className="btn-remover" onClick={function () { remover(item.ref, item.tamanho, item.genero); }}>
              Remover
            </button>
          </div>
        );
      })}

      {itens.length > 0 && (
        <div>
          <p style={{ textAlign: 'right', fontSize: 18 }}>
            Total: {totalPacotes} pacotes - {totalPecas} pecas - <strong>R$ {total.toFixed(2)}</strong>
          </p>

          <div style={{ background: '#fff8e6', border: '1px solid #f0dca0', borderRadius: 10, padding: 14, marginTop: 16, maxWidth: 420, fontSize: 13, color: '#8a6d1e' }}>
            <strong>Atencao:</strong> vendas no atacado sao exclusivas para pessoa juridica (CNPJ). O frete e por conta do comprador e o valor sera combinado apos a confirmacao do pedido.
          </div>

          <div style={{ background: 'white', border: '1px solid #f0e4de', borderRadius: 12, padding: 20, marginTop: 20, maxWidth: 420 }}>
            <h2 style={{ marginTop: 0 }}>Seus dados</h2>
            <div className="form-linha">
              <label>Nome / Empresa</label>
              <input value={form.nome} onChange={function (e) { handleChange('nome', e.target.value); }} />
            </div>
            <div className="form-linha">
              <label>CNPJ</label>
              <input value={form.cnpj} onChange={function (e) { handleChange('cnpj', e.target.value); }} placeholder="00.000.000/0000-00" />
            </div>
            <div className="form-linha">
              <label>Telefone (WhatsApp)</label>
              <input value={form.telefone} onChange={function (e) { handleChange('telefone', e.target.value); }} placeholder="(11) 99999-9999" />
            </div>
            <div className="form-linha">
              <label>E-mail (opcional)</label>
              <input value={form.email} onChange={function (e) { handleChange('email', e.target.value); }} />
            </div>

            {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}

            <button className="btn btn-atacado-confirmar" onClick={finalizarPedido} disabled={enviando}>
              {enviando ? 'Gerando pedido...' : 'Gerar pedido e confirmar no WhatsApp'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
