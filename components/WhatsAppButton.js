const NUMERO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5511920502244';

export default function WhatsAppButton() {
  const link = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent('Olá! Vim do site da AGALU e queria tirar uma dúvida 😊')}`;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="whatsapp-flutuante" aria-label="Falar no WhatsApp">
      💬
    </a>
  );
}
