'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCartAtacado } from '../../../lib/CartAtacadoContext';

const NUMERO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5511920502244';

export default function CarrinhoAtacadoPage() {
  const { itens, remover, atualizarQuantidade, limpar, total, totalPacotes, totalPecas } = useCartAtacado();
  const [form, setForm] = useState({ nome: '', telefone: '', email: '' });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [linkWhats, setLinkWhats] = useState(null);

  function handleChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function montarMensagem(pedidoId) {
    const linhas = itens.map(
      (i) =>
        `• ${i.nome} — Tam. ${i.tamanho} — Pacote ${i.genero} (${i.pacote} peças) x${i.quantidadePacotes} = ${i.pacote * i.quantidadePacotes} peças`
    );
    return (
      `Olá! Quero confirmar meu pedido de atacado AGALU 📦\n\n` +
      `Pedido: ${pedidoId || ''}\n` +
      `Nome: ${form.nome}\n` +
      `Telefone: ${form.telefone}\n\n` +
      linhas.join('\n') +
      `\n\nTotal de pacotes: ${totalPacotes}\n` +
      `Total de peças: ${totalPecas}\n` +
      `Total: R$ ${total.toFixed(2)}`
    );
  }

  async function finalizarPedido() {
    setErro('');
    if (!form.nome || !form.telefone) {
      setErro('Preencha nome e telefone antes de confirmar.');
      return;
    }
    if (itens.length === 0) {
      setErro('Seu carrinho de atacado está vazio.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('/api/pedidos/atacado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens, cliente: form, total }),
      });
      const data = await res.json();
      if (data.erro) {
        setErro(data.erro);
      } else {
        const mensagem = montarMensagem(data.pedidoId);
        setLinkWhats(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`);
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
        <div style={{ fontSize: 50, marginBottom: 10 }}>✅</div>
        <h1>Pedido gerado!</h1>
        <p style={{ color: '#8a827e', marginBottom: 24 }}>
          Falta só um passo: clique no botão abaixo pra confirmar o pedido com a gente pelo WhatsApp.
        </p>
        
          href={linkWhats}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ background: '#25D366', display: 'inline-block' }}
        >
          💬 Confirmar pedido no WhatsApp
        </a>
        <div style={{ marginTop: 24 }}>
          <Link href="/atacado" className="btn btn-secundario">Voltar ao catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Carrinho de Atacado</h1>

      {itens.length === 0 && <p>Seu carrinho de atacado está vazio.</p>}

      {itens.map((item, i) => (
        <div className="linha-carrinho" key={`${item.ref}-${item.tamanho}-${item.genero}`}>
          <div>
            <strong>{item.nome}</strong>
            <p style={{ color: '#8a827e', margin: '4px 0' }}>
              Tam. {item.tamanho} • Pacote {item.genero} ({item.pacote} peças) • {item.tecido}
            </p>
          </div>
          <input
            type="number"
            min="1"
            value={item.quantidadePacotes}
            style={{ width: 60 }}
            onChange={(e) =>
              atualizarQuantidade(item.ref, item.tamanho, item.genero, Math.max(1, parseInt(e.target.value) || 1))
            }
          />
          <span>R$ {(item.precoAtacado * item.pacote * item.quantidadePacotes).toFixed(2)}</span>
          <button className="btn-remover" onClick={() => remover(item.ref,
