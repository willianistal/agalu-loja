'use client';
import { useEffect, useState } from 'react';

export default function Avaliacoes({ produtoRef, titulo }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const url = produtoRef ? `/api/avaliacoes?produto=${produtoRef}` : '/api/avaliacoes';
    fetch(url)
      .then((r) => r.json())
      .then((data) => setAvaliacoes(data.avaliacoes || []))
      .finally(() => setCarregando(false));
  }, [produtoRef]);

  async function enviarAvaliacao() {
    if (!nome || !comentario) {
      setMensagem('Preencha seu nome e o comentário.');
      return;
    }
    setEnviando(true);
    setMensagem('');
    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoRef, nome, nota, comentario }),
      });
      const data = await res.json();
      if (data.erro) {
        setMensagem(data.erro);
      } else {
        setAvaliacoes((prev) => [{ nome, nota, comentario, criado_em: new Date().toISOString() }, ...prev]);
        setNome('');
        setComentario('');
        setNota(5);
        setMostrarForm(false);
        setMensagem('Obrigado pela sua avaliação!');
      }
    } catch (e) {
      setMensagem('Erro ao enviar. Tente novamente.');
    }
    setEnviando(false);
  }

  const media =
    avaliacoes.length > 0 ? (avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length).toFixed(1) : null;

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

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {!mostrarForm ? (
          <button className="btn btn-secundario" onClick={() => setMostrarForm(true)}>
            Deixar minha avaliação
          </button>
        ) : (
          <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
            <div className="form-linha">
              <label>Seu nome</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="form-linha">
              <label>Nota</label>
              <select value={nota} onChange={(e) => setNota(parseInt(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{'⭐'.repeat(n)}</option>
                ))}
              </select>
            </div>
            <div className="form-linha">
              <label>Comentário</label>
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} />
            </div>
            <button className="btn" onClick={enviarAvaliacao} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        )}
        {mensagem && <p style={{ marginTop: 10, color: '#6fb8a8', fontWeight: 600 }}>{mensagem}</p>}
      </div>
    </div>
  );
}
