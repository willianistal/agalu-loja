import Link from 'next/link';

export default function PedidoConfirmado() {
  return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h1>🎉 Pedido recebido!</h1>
      <p>Assim que o pagamento for confirmado, vamos separar seu pedido e te avisar pelo WhatsApp.</p>
      <Link href="/produtos" className="btn">Continuar comprando</Link>
    </div>
  );
}
