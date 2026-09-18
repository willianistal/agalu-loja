'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProdutoPorRef, imagemProduto } from '../../../../lib/produtos';
import { formatarNomeProduto, getComposicaoTecido } from '../../../../lib/produtoDisplay';
import { useCartAtacado } from '../../../../lib/CartAtacadoContext';

const GENEROS = ['Masculino', 'Feminino'];

export default function ProdutoAtacadoDetalhe() {
  const { ref } = useParams();
  const router = useRouter();
  const produto = getProdutoPorRef(ref);
  const { adicionar } = useCartAtacado();

  const tamanhosDisponiveis = produto ? produto.tamanhos.split('.') : [];
  const [tamanho, setTamanho] = useState(tamanhosDisponiveis[0] || '');
  const [genero, setGenero] = useState(GENEROS[0]);
  const [quantidadePacotes, setQuantidadePacotes] = useState(1);
  const [mensagem, setMensagem] = useState('');
  const [precoAtacado, setPrecoAtacado] = useState(12);
  const [pacote, setPacote] = useState(produto?.pacote || 3);
  const [esgotado, setEsgotado] = useState(false);

  useEffect(() => {
    fetch('/api/produtos')
      .then((r) => r.json())
      .then((data) => {
        const encontrado = (data.produtos || []).find((p) => p.ref === ref);
        if (encontrado) {
          setPrecoAtacado(encontrado.precoAtacado ?? 12);
          setPacote(encontrado.pacote ?? produto?.pacote ?? 3);
          setEsgotado(encontrado.esgotado ?? false);
        }
      });
  }, [ref]);

  if (!produto) {
    return <div className="container"><p>Produto não encontrado.</p></div>;
  }

  const totalPecas = pacote * quantidadePacotes;
  const subtotal = precoAtacado * pacote * quantidadePacotes;

  function handleAdicionar() {
    adicionar(
      { ref: produto.ref, nome: formatarNomeProduto(produto.nome), tecido: produto.tecido, pacote, precoAtacado },
      tamanho,
      genero,
      quantidadePacotes
    );
    setMensagem('Adicionado ao carrinho de atacado!');
    setTimeout(() => setMensagem(''), 2000);
  }

  return (
    <div className="container">
      <div className="produto-detalhe">
        <img src={imagemProduto(produto.ref)} alt={produto.nome} />
        <div>
          <h1>{formatarNomeProduto(produto.nome)}</h1>
          <p style={{ color: '#8a827e' }}>Tecido: {produto.tecido} • Estação: {produto.estacao} • REF {produto.ref}</p>
          <p style={{ color: '#8a827e' }}>Composição: {getComposicaoTecido(produto.tecido)}</p>
          <p style={{ background: '#eaf5f1', display: 'inline-block', padding: '4px 10px', borderRadius: 8, fontWeight: 600, color: '#3d8570' }}>
            Pacote sortido com {pacote} peças (cores variadas, de acordo com estoque!)
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, color: '#6fb8a8', marginTop: 10 }}>
            R$ {(Number(precoAtacado) * pacote).toFixed(2)} <span style={{ fontSize: 16, fontWeight: 500, color: '#8a827e' }}>por pacote</span>
          </p>
          {esgotado && (
            <p style={{ color: '#c0392b', fontWeight: 700, fontSize: 18 }}>Produto esgotado no momento</p>
          )}

          <p style={{ fontWeight: 700 }}>Pacote sortido (cores variadas) - Masculino ou Feminino:</p>
          <div className="tamanhos">
            {GENEROS.map((g) => (
              <div
                key={g}
                className={`tamanho-opt ${genero === g ? 'selecionado' : ''}`}
                onClick={() => setGenero(g)}
              >
                {g}
              </div>
            ))}
          </div>

          <p style={{ fontWeight: 700, marginTop: 14 }}>Tamanho:</p>
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

          <div className="form-linha" style={{ maxWidth: 160 }}>
            <label>Quantidade de pacotes</label>
            <input
              type="number"
              min="1"
              value={quantidadePacotes}
              onChange={(e) => setQuantidadePacotes(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <p style={{ color: '#8a827e' }}>
            = {totalPecas} peças • Subtotal: <strong>R$ {subtotal.toFixed(2)}</strong>
          </p>

          <button className="btn" onClick={handleAdicionar} disabled={esgotado} style={{ background: '#6fb8a8' }}>
            {esgotado ? 'Indisponível' : 'Adicionar ao carrinho'}
          </button>
          {mensagem && <p style={{ color: '#6fb8a8', fontWeight: 700 }}>{mensagem}</p>}

          <div style={{ marginTop: 20 }}>
            <button className="btn btn-secundario" onClick={() => router.push('/atacado/carrinho')}>
              Ir para o carrinho de atacado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
