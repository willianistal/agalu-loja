'use client';
import { useState } from 'react';
import { useCart } from '../../lib/CartContext';

export default function CheckoutPage() {
  const { itens, total } = useCart();
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '',
    cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  });
  const [frete, setFrete] = useState(null);
  const [opcoesFrete, setOpcoesFrete] = useState([]);
  const [carregandoFrete, setCarregandoFrete] = useState(false);
  const [carregandoPagamento, setCarregandoPagamento] = useState(false);
  const [erro, setErro] = useState('');

  function handleChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function buscarCep() {
    const cepLimpo = form.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          endereco: data.logradouro || f.endereco,
          bairro: data.bairro || f.bairro,
          cidade: data.localidade || f.cidade,
          uf: data.uf || f.uf,
        }));
      }
    } catch (e) {}
  }

  async function calcularFrete() {
    setErro('');
    setCarregandoFrete(true);
    setOpcoesFrete([]);
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: form.cep, itens }),
      });
      const data = await res.json();
      if (data.erro) {
        setErro(data.erro);
      } else {
        setOpcoesFrete(data.opcoes || []);
      }
    } catch (e) {
      setErro('Não consegui calcular o frete agora. Tente novamente.');
    }
    setCarregandoFrete(false);
  }

  async function finalizarPagamento() {
    if (!frete) {
      setErro('Escolha uma opção de frete antes de continuar.');
      return;
    }
    setCarregandoPagamento(true);
    setErro('');
    try {
      const res = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens, frete, cliente: form, total: total + frete.preco }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setErro(data.erro || 'Não foi possível iniciar o pagamento.');
      }
    } catch (e) {
      setErro('Erro ao iniciar pagamento. Tente novamente.');
    }
    setCarregandoPagamento(false);
  }

  const totalComFrete = total + (frete ? frete.preco : 0);

  return (
    <div className="container" style={{ padding: '30px 20px', maxWidth: 700 }}>
      <h1>Checkout</h1>

      <h3>Seus dados</h3>
      <div className="form-linha">
        <label>Nome completo</label>
        <input value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} />
      </div>
      <div className="form-linha">
        <label>E-mail</label>
        <input value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
      </div>
      <div className="form-linha">
        <label>Telefone / WhatsApp</label>
        <input value={form.telefone} onChange={(e) => handleChange('telefone', e.target.value)} />
      </div>

      <h3>Endereço de entrega</h3>
      <div className="form-linha">
        <label>CEP</label>
        <input value={form.cep} onChange={(e) => handleChange('cep', e.target.value)} onBlur={buscarCep} placeholder="00000-000" />
      </div>
      <div className="form-linha">
        <label>Endereço</label>
        <input value={form.endereco} onChange={(e) => handleChange('endereco', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="form-linha" style={{ flex: 1 }}>
          <label>Número</label>
          <input value={form.numero} onChange={(e) => handleChange('numero', e.target.value)} />
        </div>
        <div className="form-linha" style={{ flex: 2 }}>
          <label>Complemento</label>
          <input value={form.complemento} onChange={(e) => handleChange('complemento', e.target.value)} />
        </div>
      </div>
      <div className="form-linha">
        <label>Bairro</label>
        <input value={form.bairro} onChange={(e) => handleChange('bairro', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="form-linha" style={{ flex: 2 }}>
          <label>Cidade</label>
          <input value={form.cidade} onChange={(e) => handleChange('cidade', e.target.value)} />
        </div>
        <div className="form-linha" style={{ flex: 1 }}>
          <label>UF</label>
          <input value={form.uf} onChange={(e) => handleChange('uf', e.target.value)} />
        </div>
      </div>

      <button className="btn btn-secundario" onClick={calcularFrete} disabled={carregandoFrete}>
        {carregandoFrete ? 'Calculando...' : 'Calcular frete'}
      </button>

      {opcoesFrete.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {opcoesFrete.map((op) => (
            <div
              key={op.id}
              onClick={() => setFrete(op)}
              style={{
                border: frete?.id === op.id ? '2px solid #d97b93' : '1px solid #f0e4de',
                borderRadius: 10, padding: 12, marginBottom: 8, cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between',
              }}
            >
              <span>{op.nome} ({op.prazo} dias úteis)</span>
              <strong>R$ {op.preco.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}

      {erro && <p style={{ color: '#c0392b', fontWeight: 600 }}>{erro}</p>}

      <div className="resumo-total">
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span><span>R$ {total.toFixed(2)}</span>
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Frete</span><span>{frete ? `R$ ${frete.preco.toFixed(2)}` : '—'}</span>
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
          <span>Total</span><span>R$ {totalComFrete.toFixed(2)}</span>
        </p>
        <button className="btn" style={{ width: '100%', marginTop: 10 }} onClick={finalizarPagamento} disabled={carregandoPagamento}>
          {carregandoPagamento ? 'Redirecionando...' : 'Pagar com Pix, Cartão ou Boleto'}
        </button>
      </div>
    </div>
  );
}
