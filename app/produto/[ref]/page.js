'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProdutoPorRef, imagemProduto } from '../../../lib/produtos';
import { formatarNomeProduto, AVISO_ESTAMPA_SORTIDA } from '../../../lib/produtoDisplay';
import { getCoresPorTecido } from '../../../lib/cores';
import { useCart } from '../../../lib/CartContext';

export default function ProdutoDetalhe() {
  const { ref } = useParams();
  const router = useRouter();
  const produto = getProdutoPorRef(ref);
  const { adicionar } = useCart();

  const tamanhosDisponiveis = produto ? produto.tamanhos.split('.') : [];
  const cores = produto ? getCoresPorTecido(produto.tecido) : [];
  const [tamanho, setTamanho] = useState(tamanhosDisponiveis[0] || '');
  const [cor, setCor] = useState(cores[0]?.nome || '');
  const [quantidade, setQuantidade] = useState(1);
  const [mensagem, setMensagem] = useState('');

  if (!produto) {
    return <div className="container"><p>Produto não encontrado.</p></div>;
  }

  function handleAdicionar() {
    adicionar({ ...produto, nome: formatarNomeProduto(produto.nome) }, tamanho, quantidade, cor);
    setMensagem('Adicionado ao carrinho!');
    setTimeout(() => setMensagem(''), 2000);
  }

  return (
    <div className="container">
      <div className="produto-detalhe">
        <img src={imagemProduto(produto.ref)} alt={produto.nome} />
        <div>
          <h1>{formatarNomeProduto(produto.nome)}</h1>
          <p style={{ color: '#8a827e' }}>Tecido: {produto.tecido} • Estação: {produto.estacao} • REF {produto.ref}</p>
          {produto.detalhe && (
            <p className="aviso-estampa">🎨 {AVISO_ESTAMPA_SORTIDA}</p>
          )}
          <p style={{ fontSize: 32, fontWeight: 800, color: '#d97b93' }}>R$ 12,00</p>

          {cores.length > 0 && (
            <>
              <p style={{ fontWeight: 700 }}>Cor: <span style={{ fontWeight: 400, color: '#8a827e' }}>{cor}</span></p>
              <div className="cores-opcoes">
                {cores.map((c) => (
                  <div
                    key={c.nome}
                    className={`cor-opt ${cor === c.nome ? 'selecionada' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => setCor(c.nome)}
                    title={c.nome}
                  />
                ))}
              </div>
            </>
          )}

          <p style={{ fontWeight: 700 }}>Tamanho:</p>
          <div className="tamanhos">
            {tamanhosDisponiveis.map((t) => (
              <div
                key={t}
                className={`tamanho-opt ${tamanho === t ? 'selecionado' : ''}`}
                onClick={() => setTamanho(t)}
              >
                {t}
              </div>
            ))}
          </div>

          <div className="form-linha" style={{ maxWidth: 120 }}>
            <label>Quantidade</label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <button className="btn" onClick={handleAdicionar}>Adicionar ao carrinho</button>
          {mensagem && <p style={{ color: '#6fb8a8', fontWeight: 700 }}>{mensagem}</p>}

          <div style={{ marginTop: 20 }}>
            <button className="btn btn-secundario" onClick={() => router.push('/carrinho')}>
              Ir para o carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
