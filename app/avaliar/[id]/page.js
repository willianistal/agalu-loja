'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AvaliarPedidoPage() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState('');
  const [notas, setNotas] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    fetch(`/api/avaliar/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) {
          setErro(data.erro);
        } else {
          setPedido(data.pedido);
          setNome(data.pedido.cliente_nome || '');
          const notasIniciais = {};
          (data.pedido.itens || []).forEach((item) => {
            notasIniciais[item.ref] = 5;
          });
          setNotas(notasIniciais);
        }
      })
      .catch(() => setErro('Erro ao carregar pedido.'))
      .finally(() => setCarregando(false));
  }, [id]);

  async function enviar() {
    setEnviando(true);
    setErro('');
    try {
      const avaliacoes = (pedido.itens || []).map((item) => ({
        produtoRef: item.ref,
        nota: notas[item.ref] || 5,
        comentario: comentarios[item.ref] || '',
      }));

      const res = await fetch(`/api/avaliar/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, avaliacoes }),
      });
      const data = await res.json();
      if (data.erro) {
        setErro(data.erro);
      } else {
        setSucesso(true);
      }
    } catch (e) {
      setErro('Erro ao enviar avaliação.');
    }
    setEnviando(false);
  }

  if (carregando) return <div className="container" style={{ padding: 40 }}><p>Carregando...</p></div>;

  if (erro) {
    return (
      <div className="container" style={{ padding: 40, maxWidth: 500 }}>
        <h1>Avaliar pedido</h1>
        <p style={{ color: '#c0392b' }}>{erro}</p>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="container" style={{ padding: 40, maxWidth: 500, textAlign: 'center' }}>
        <h1>Obrigado! 💛</h1>
        <p>Sua avaliação foi enviada com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 40, maxWidth: 600 }}>
      <h1>Como foi sua compra?</h1>
      <p style={{ color: '#8a827e' }}>Avalie cada peça do seu pedido:</p>

      <div className="form-linha">
        <label>Seu nome</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>

      {(pedido.itens || []).map((item, i) => (
        <div key={i} style={{ border: '1px solid #f0e4de', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <strong>{item.nome} (Tam. {item.tamanho})</strong>
          <div className="form-linha" style={{ marginTop: 10 }}>
            <label>Nota</label>
            <select
              value={notas[item.ref] || 5}
              onChange={(e) => setNotas((prev) => ({ ...prev, [item.ref]: parseInt(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{'⭐'.repeat(n)}</option>
              ))}
            </select>
          </div>
          <div className="form-linha">
            <label>Comentário (opcional)</label>
            <textarea
              rows={2}
              value={comentarios[item.ref] || ''}
              onChange={(e) => setComentarios((prev) => ({ ...prev, [item.ref]: e.target.value }))}
            />
          </div>
        </div>
      ))}

      <button className="btn" onClick={enviar} disabled={enviando || !nome}>
        {enviando ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </div>
  );
}
