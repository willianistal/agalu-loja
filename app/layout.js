import './globals.css';
import Script from 'next/script';
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1390080133089451');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1390080133089451&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

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
