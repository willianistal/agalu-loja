export default function SobreNos() {
  return (
    <div className="secao-sobre-nos" style={{ padding: '50px 20px', background: '#fff9f6' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2 className="titulo-secao" style={{ textAlign: 'center' }}>Nossa história</h2>
        <p style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 30px', color: '#6b6360' }}>
          A AGALU nasceu da confecção Nistal, com mais de 20 anos de experiência produzindo roupas infantis.
          Vendemos direto da fábrica pra você, sem intermediários — por isso conseguimos manter um preço único
          e justo em todas as peças.
        </p>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          <div style={cardEstilo}>
            <span style={{ fontSize: 28 }}>🎯</span>
            <h4>Missão</h4>
            <p>Vestir crianças com qualidade e conforto, a um preço acessível para todas as famílias.</p>
          </div>
          <div style={cardEstilo}>
            <span style={{ fontSize: 28 }}>👁️</span>
            <h4>Visão</h4>
            <p>Ser referência em roupa infantil direto de fábrica, com confiança e transparência.</p>
          </div>
          <div style={cardEstilo}>
            <span style={{ fontSize: 28 }}>💛</span>
            <h4>Valores</h4>
            <p>Honestidade, qualidade artesanal e respeito com cada família que compra com a gente.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
          <div className="selo-confianca-item"><span className="icone">🔒</span>Site seguro (SSL)</div>
          <div className="selo-confianca-item"><span className="icone">✅</span>Compra garantida</div>
          <div className="selo-confianca-item"><span className="icone">🏭</span>Direto da fábrica</div>
          <div className="selo-confianca-item"><span className="icone">↩️</span>7 dias para troca</div>
        </div>
      </div>
    </div>
  );
}

const cardEstilo = {
  background: 'white',
  borderRadius: 14,
  padding: '24px 28px',
  maxWidth: 260,
  textAlign: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
};
