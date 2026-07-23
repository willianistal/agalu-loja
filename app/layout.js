import './globals.css';
import { CartProvider } from '../lib/CartContext';
import Header from '../components/Header';
import WhatsAppButton from '../components/WhatsAppButton';

export const metadata = {
  metadataBase: new URL('https://www.agalu.com.br'),
  title: 'AGALU - Roupas Infantis Direto da Fábrica',
  description: 'Roupas infantis a preço fixo de R$12. Verão e Inverno, direto da fábrica pra você, com frete calculado pelo CEP e pagamento por Pix, Cartão ou Boleto.',
  keywords: ['roupas infantis', 'roupa infantil barata', 'confecção infantil', 'roupa de bebê', 'atacado roupa infantil'],
  openGraph: {
    title: 'AGALU - Roupas Infantis Direto da Fábrica',
    description: 'Roupas infantis a preço fixo de R$12, direto da fábrica pra você.',
    url: 'https://www.agalu.com.br',
    siteName: 'AGALU',
    locale: 'pt_BR',
    type: 'website',
  },
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
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
              <a href="/politica-de-troca">Política de Troca</a>
            </div>
            AGALU © {new Date().getFullYear()} — Roupas infantis direto da fábrica
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
