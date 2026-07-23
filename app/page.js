import Link from 'next/link';
import { getProdutos, imagemProduto } from '../lib/produtos';
import { formatarNomeProduto } from '../lib/produtoDisplay';
import HeroCarousel from '../components/HeroCarousel';

export default function Home() {
  const produtos = getProdutos();
  // pega uma peça com estampa (mais bonita pra vitrine) de cada estação, tecidos variados
  const destaques = produtos
    .filter((p) => p.detalhe)
    .filter((p, i, arr) => arr.findIndex((x) => x.tecido === p.tecido && x.estacao === p.estacao) === i)
    .slice(0, 8);

  return (
    <>
      <HeroCarousel />

      <div className="faixa-confianca">
        <div className="faixa-confianca-inner">
          <div className="selo-confianca-item"><span className="icone">🏷️</span>Preço único R$12</div>
          <div className="selo-confianca-item"><span className="icone">🧵</span>4 tipos de tecido</div>
          <div className="selo-confianca-item"><span className="icone">🚚</span>Frete calculado pelo CEP</div>
          <div className="selo-confianca-item"><span className="icone">💳</span>Pix, Cartão e Boleto</div>
        </div>
      </div>

      <h2 className="titulo-secao">Escolha a estação</h2>
      <p className="subtitulo-secao">Peças leves pro calor ou quentinhas pro frio, no mesmo lugar</p>
      <div className="secoes-home">
        <Link href="/produtos?estacao=Verao" className="card-estacao">
          <img src="/images/capas/verao.jpg" alt="Coleção Verão" />
          <div className="card-overlay" />
          <span>☀️ Coleção Verão<small>Regatas, camisetas e shorts leves</small></span>
        </Link>
        <Link href="/produtos?estacao=Inverno" className="card-estacao">
          <img src="/images/capas/inverno.jpg" alt="Coleção Inverno" />
          <div className="card-overlay" />
          <span>❄️ Coleção Inverno<small>Manga longa, canelado e suedine</small></span>
        </Link>
      </div>

      <h2 className="titulo-secao">Destaques do catálogo</h2>
      <p className="subtitulo-secao">Uma amostra dos tecidos e estampas disponíveis</p>
      <div className="destaques-grid">
        {destaques.map((p) => (
          <Link key={p.ref} href={`/produto/${p.ref}`} className="produto-card">
            <img src={imagemProduto(p.ref)} alt={p.nome} />
            <div className="info">
              <p className="nome">{formatarNomeProduto(p.nome)}</p>
              <p className="tecido">{p.tecido} • {p.estacao === 'Verao' ? 'Verão' : 'Inverno'}</p>
              <p className="preco">R$ 12,00</p>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ textAlign: 'center', paddingBottom: 50 }}>
        <Link href="/produtos" className="btn btn-secundario">Ver catálogo completo</Link>
      </div>
    </>
  );
}
