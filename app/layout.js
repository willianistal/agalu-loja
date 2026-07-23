import './globals.css';
import { CartProvider } from '../lib/CartContext';
import Header from '../components/Header';
import WhatsAppButton from '../components/WhatsAppButton';

export const metadata = {
  title: 'AGALU - Roupas Infantis Direto da Fábrica',
  description: 'Roupas infantis a preço fixo de R$12. Verão e Inverno, direto da fábrica pra você.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <Header />
          {children}
          <WhatsAppButton />
          <footer>
            AGALU © {new Date().getFullYear()} — Roupas infantis direto da fábrica
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
