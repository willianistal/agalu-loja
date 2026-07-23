'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getProdutos, imagemProduto } from '../../lib/produtos';
import { formatarNomeProduto } from '../../lib/produtoDisplay';

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="container"><p>Carregando...</p></div>}>
      <ProdutosConteudo />
    </Suspense>
  );
}

function ProdutosConteudo() {
  const searchParams = useSearchParams();
  const estacaoInicial = searchParams.get('estacao') || 'todos';

  const [estacao, setEstacao] = useState(estacaoInicial);
  const [tecido, setTecido] = useState('todos');
  const [tamanho, setTamanho] = useState('todos');

  const produtos = getProdutos();
  const tecidos = useMemo(() => [...new Set(produtos.map((p) => p.tecido))], [produtos]);

  const filtrados = produtos.filter((p) => {
    if (estacao !== 'todos' && p.estacao !== estacao) return false;
    if (tecido !== 'todos' && p.tecido !== tecido) return false;
    if (tamanho !== 'todos' && !p.tamanhos.includes(tamanho)) return false;
    return true;
  });

  return (
    <div className="container">
      <h1>Produtos</h1>
      <div className="filtros">
        <select value={estacao} onChange={(e) => setEstacao(e.target.value)}>
          <option value="todos">Todas as estações</option>
          <option value="Verao">Verão</option>
          <option value="Inverno">Inverno</option>
        </select>
        <select value={tecido} onChange={(e) => setTecido(e.target.value)}>
          <option value="todos">Todos os tecidos</option>
          {tecidos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={tamanho} onChange={(e) => setTamanho(e.target.value)}>
          <option value="todos">Todos os tamanhos</option>
          <option value="RN">RN</option>
          <option value="P">P</option>
          <option value="M">M</option>
          <option value="G">G</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <span style={{ color: '#8a827e', fontWeight: 600 }}>{filtrados.length} produtos</span>
      </div>

      <div className="grid-produtos">
        {filtrados.map((p) => (
          <Link key={p.ref} href={`/produto/${p.ref}`} className="produto-card">
            <img src={imagemProduto(p.ref)} alt={p.nome} onError={(e) => { e.target.src = '/images/placeholder.jpg'; }} />
            <div className="info">
              <p className="nome">{formatarNomeProduto(p.nome)}</p>
              {p.detalhe && <p className="badge-estampa">Estampa sortida</p>}
              <p className="tecido">{p.tecido} • Tam. {p.tamanhos} • REF {p.ref}</p>
              <p className="preco">R$ {p.preco || 12},00</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
