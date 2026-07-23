'use client';
import { useEffect, useState } from 'react';

export default function Avaliacoes({ produtoRef, titulo }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const url = produtoRef ? `/api/avaliacoes?produto=${produtoRef}` : '/api/avaliacoes';
    fetch(url)
      .then((r) => r.json())
      .then((data) => setAvaliacoes(data.avaliacoes || []))
      .finally(() => setCarregando(false));
  }, [produtoRef]);

  const media =
    avaliacoes.length > 0 ? (avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length).toFixed(1) : null;

  if (!carregando && avaliacoes.length === 0) return null;

  return (
    <div style={{ padding: '30px 0' }}>
      <h2 className="titulo-secao">{titulo || 'Avaliações de clientes'}</h2>
      {media && (
        <p style={{ textAlign: 'center', fontSize: 18, marginBottom: 20 }}>
          {'⭐'.repeat(Math.round(media))} <strong>{media}</strong> ({avaliacoes.length} avaliações)
        </p>
      )}

      {carregando ? (
        <p style={{ textAlign: 'center' }}>Carregando avaliações...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, margin: '0 auto' }}>
          {avaliacoes.map((a, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 10, padding: 16, border: '1px solid #f0e4de' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{a.nome}</strong>
                <span>{'⭐'.repeat(a.nota)}</span>
              </div>
              <p style={{ color: '#6b6360', marginTop: 6 }}>{a.comentario}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
