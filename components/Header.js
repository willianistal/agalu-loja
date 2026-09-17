'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../lib/CartContext';
import { useCartAtacado } from '../lib/CartAtacadoContext';

export default function Header() {
  const pathname = usePathname();
  const { totalItens } = useCart();
  const { totalPacotes } = useCartAtacado();
  const emAtacado = pathname?.startsWith('/atacado');

  return (
    <header className="header">
      <div className="header-inner">
        <Link href={emAtacado ? '/atacado' : '/varejo'} className="logo-link">
          <img src="/images/marca/logo.png" alt="AGALU Confecções" className="logo-img" />
        </Link>
        {emAtacado ? (
          <nav className="nav">
            <Link href="/atacado">Catálogo Atacado</Link>
            <Link href="/varejo" style={{ fontSize: 13, color: '#8a827e' }}>Ir para o Varejo</Link>
            <Link href="/atacado/carrinho" className="cart-btn">
              🛒 Carrinho {totalPacotes > 0 ? `(${totalPacotes})` : ''}
            </Link>
          </nav>
        ) : (
          <nav className="nav">
            <Link href="/produtos?estacao=Verao">Verão</Link>
            <Link href="/produtos?estacao=Inverno">Inverno</Link>
            <Link href="/produtos">Todos os produtos</Link>
            <Link href="/atacado" style={{ fontSize: 13, color: '#8a827e' }}>Sou lojista (Atacado)</Link>
            <Link href="/carrinho" className="cart-btn">
              🛒 Carrinho {totalItens > 0 ? `(${totalItens})` : ''}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
