'use client';
import Link from 'next/link';
import { useCart } from '../../lib/CartContext';
import { imagemProduto } from '../../lib/produtos';

export default function CarrinhoPage() {
  const { itens, remover, atualizarQuantidade, total } = useCart();

  if (itens.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1>Seu carrinho está vazio</h1>
        <Link href="/produtos" className="btn">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1>Seu carrinho</h1>
      {itens.map((item) => (
        <div className="linha-carrinho" key={`${item.ref}-${item.tamanho}-${item.cor}`}>
          <img src={imagemProduto(item.ref)} alt={item.nome} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, margin: 0 }}>{item.nome}</p>
            <p style={{ margin: 0, color: '#8a827e', fontSize: 13 }}>
              Tam. {item.tamanho}{item.cor ? ` • Cor: ${item.cor}` : ''} • {item.tecido} • REF {item.ref}
            </p>
          </div>
          <input
            type="number"
            min="1"
            value={item.quantidade}
            style={{ width: 60, padding: 6, borderRadius: 6, border: '1px solid #f0e4de' }}
            onChange={(e) =>
              atualizarQuantidade(item.ref, item.tamanho, item.cor, Math.max(1, parseInt(e.target.value) || 1))
            }
          />
          <p style={{ fontWeight: 700, width: 80, textAlign: 'right' }}>
            R$ {(item.preco * item.quantidade).toFixed(2)}
          </p>
          <button
            onClick={() => remover(item.ref, item.tamanho, item.cor)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
          >
            🗑️
          </button>
        </div>
      ))}

      <div className="resumo-total">
        <p style={{ fontSize: 20, fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>R$ {total.toFixed(2)}</span>
        </p>
        <p style={{ color: '#8a827e', fontSize: 13 }}>Frete calculado na próxima etapa</p>
        <Link href="/checkout" className="btn" style={{ display: 'block', textAlign: 'center', marginTop: 10 }}>
          Ir para o checkout
        </Link>
      </div>
    </div>
  );
}
