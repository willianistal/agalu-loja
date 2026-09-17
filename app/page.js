import Link from 'next/link';

export default function Home() {
  return (
    <div className="container" style={{ padding: '50px 20px', textAlign: 'center' }}>
      <img
        src="/images/marca/logo.png"
        alt="AGALU Confecções"
        style={{ maxWidth: 180, margin: '0 auto 20px' }}
      />
      <h1 style={{ marginBottom: 6 }}>Bem-vindo à AGALU</h1>
      <p style={{ color: '#8a827e', fontSize: 18, marginBottom: 40 }}>
        Como você quer comprar hoje?
      </p>

      <div
        style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <Link
          href="/varejo"
          style={{
            flex: '1 1 300px',
            maxWidth: 340,
            background: 'white',
            border: '2px solid #f0e4de',
            borderRadius: 16,
            padding: '36px 24px',
            textDecoration: 'none',
            color: '#4a4442',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🛍️</div>
          <h2 style={{ margin: '0 0 8px', color: '#d97b93' }}>Comprar no Varejo</h2>
          <p style={{ color: '#8a827e', margin: 0 }}>
            Peça por peça, escolha a cor e o tamanho. Pagamento por Pix, Cartão ou Boleto.
          </p>
        </Link>

        <Link
          href="/atacado"
          style={{
            flex: '1 1 300px',
            maxWidth: 340,
            background: 'white',
            border: '2px solid #f0e4de',
            borderRadius: 16,
            padding: '36px 24px',
            textDecoration: 'none',
            color: '#4a4442',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
          <h2 style={{ margin: '0 0 8px', color: '#6fb8a8' }}>Comprar no Atacado</h2>
          <p style={{ color: '#8a827e', margin: 0 }}>
            Pacotes de 3, 6 ou 10 peças, sortimento Masculino ou Feminino. Ideal para lojistas.
          </p>
        </Link>
      </div>
    </div>
  );
}
