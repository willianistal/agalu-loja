'use client';
import { useEffect, useState } from 'react';
import { imagemProduto } from '../../lib/produtos';

export default function AdminPage() {
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [editavel, setEditavel] = useState(false);

  useEffect(() => {
    if (autenticado) {
      fetch('/api/produtos')
        .then((r) => r.json())
        .then((data) => {
          setProdutos(data.produtos || []);
          setEditavel(data.editavel);
        });
    }
  }, [autenticado]);

  function handleLogin() {
    if (senha.length > 0) {
      setAutenticado(true);
    } else {
      setErro('Digite a senha.');
    }
  }

  async function salvarProduto(produto, campo, valor) {
    const atualizado = { ...produto, [campo]: valor };
    setProdutos((prev) => prev.map((p) => (p.ref === produto.ref ? atualizado : p)));

    const corpo = {
      ref: produto.ref,
      preco: campo === 'preco' ? valor : produto.preco,
      esgotado: campo === 'esgotado' ? valor : produto.esgotado,
    };

    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': senha },
      body: JSON.stringify(corpo),
    });
    const data = await res.json();
    if (data.erro) setErro(data.erro);
  }

  if (!autenticado) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: 400 }}>
        <h1>Painel AGALU</h1>
        <div className="form-linha">
          <label>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        <button className="btn" onClick={handleLogin}>Entrar</button>
        {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1>Painel AGALU — Produtos</h1>
      {!editavel && (
        <p style={{ background: '#fde3ea', padding: 14, borderRadius: 10, color: '#a8546b' }}>
          Modo somente leitura: banco de dados não está retornando produtos editáveis ainda.
        </p>
      )}
      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0e4de' }}>
            <th style={{ padding: 8 }}>Foto</th>
            <th>REF</th>
            <th>Nome</th>
            <th>Tecido</th>
            <th>Estação</th>
            <th>Preço</th>
            <th>Estoque</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.ref} style={{ borderBottom: '1px solid #f0e4de' }}>
              <td style={{ padding: 8 }}><img src={imagemProduto(p.ref)} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} /></td>
              <td>{p.ref}</td>
              <td>{p.nome}</td>
              <td>{p.tecido}</td>
              <td>{p.estacao}</td>
              <td>
                <input
                  type="number"
                  defaultValue={p.preco || 12}
                  disabled={!editavel}
                  style={{ width: 70 }}
                  onBlur={(e) => salvarProduto(p, 'preco', parseFloat(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={p.esgotado ? 'Esgotado' : 'Disponível'}
                  disabled
                  style={{ width: 90 }}
                />
                <button
                  disabled={!editavel}
                  onClick={() => salvarProduto(p, 'esgotado', !p.esgotado)}
                  style={{ marginLeft: 6 }}
                >
                  Alternar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
