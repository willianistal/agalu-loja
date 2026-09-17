'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getProdutos, imagemProduto } from '../../lib/produtos';
import { formatarNomeProduto } from '../../lib/produtoDisplay';

export default function AtacadoPage() {
  const [estacao, setEstacao] = useState('todos');
  const [tecido, setTecido] = useState('todos');
  const [dadosBanco, setDadosBanco] = useState({});

  useEffect(() => {
    fetch('/api/produtos')
      .then((r) => r.json())
      .then((data) => {
        const mapa = {};
        (data.produtos || []).forEach((p) => { mapa[p.ref] = p; });
        setDadosBanco(mapa);
      });
  }, []);

  const produtosBase = getProdutos();
  const produtos = produtosBase.map((p) => ({
    ...p,
    precoAtacado: dadosBanco[p.ref]?.precoAtacado ?? 12,
    pacote: dadosBanco[p.ref]?.pacote ?? p.pacote,
    esgotado: dadosBanco[p.ref]?.esgotado ?? false,
  }));

  const tecidos = useMemo(() => [...new Set(produtosBase.map((p) => p.tecido))], [produtosBase]);

  const filtrados = produtos.filter((p) => {
    if (estacao !== 'todos' && p.estacao !== estacao) return false;
    if (tecido !== 'todos' && p.tecido !== tecido) return false;
    return true;
  });

  return (
    <div className="container">
      <div
        style={{
          background: '#eaf5f1',
          border: '1px solid #d8ece5',
          borderRadius: 12,
          padding: '14px 18px',
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <strong>Atacado AGALU 📦</strong> — venda por pacotes fechados (Masculino ou Feminino).
        Escolha o produto, o tamanho e quantos pacotes quer. No fim, você confirma o pedido
        direto pelo WhatsApp com a gente.
      </div>

      <h1>Catálogo Atacado</h1>
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
        <span style={{ color: '#8a827e', fontWeight: 600 }}>{filtrados.length} produtos</span>
      </div>

      <div className="grid-produtos">
        {filtrados.map((p) => (
          <Link key={p.ref} href={`/atacado/produto/${p.ref}`} className="produto-card" style={p.esgotado ? { opacity: 0.5 } : {}}>
            <img src={imagemProduto(p.ref)} alt={p.nome} onError={(e) => { e.target.src = '/images/placeholder.jpg'; }} />
            <div className="info">
              <p className="nome">{formatarNomeProduto(p.nome)}</p>
              <p className="tecido">{p.tecido} • Tam. {p.tamanhos} • REF {p.ref}</p>
              <p className="preco">
                Pacote de {p.pacote} — R$ {(Number(p.precoAtacado) * p.pacote).toFixed(2)}
              </p>
              {p.esgotado && <p style={{ color: '#c0392b', fontWeight: 700 }}>Esgotado</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
