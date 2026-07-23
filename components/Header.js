'use client';
import Link from 'next/link';
import { useCart } from '../lib/CartContext';

export default function Header() {
  const { totalItens } = useCart();
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo-link">
          <img src="/images/marca/logo.png" alt="AGALU Confecções" className="logo-img" />
        </Link>
        <nav className="nav">
          <Link href="/produtos?estacao=Verao">Verão</Link>
          <Link href="/produtos?estacao=Inverno">Inverno</Link>
          <Link href="/produtos">Todos os produtos</Link>
          <Link href="/carrinho" className="cart-btn">
            🛒 Carrinho {totalItens > 0 ? `(${totalItens})` : ''}
          </Link>
        </nav>
      </div>
    </header>
  );
}
