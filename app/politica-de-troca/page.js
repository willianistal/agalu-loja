export const metadata = {
  title: 'Política de Troca e Devolução — AGALU',
  description: 'Conheça nossa política de troca, devolução e direito de arrependimento.',
};

export default function PoliticaDeTrocaPage() {
  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: 800 }}>
      <h1>Política de Troca e Devolução</h1>

      <h3>Direito de arrependimento (7 dias)</h3>
      <p>
        De acordo com o Código de Defesa do Consumidor (Art. 49), você tem até <strong>7 dias corridos</strong> a
        partir do recebimento do produto para desistir da compra, sem precisar justificar o motivo. Nesse caso, o
        valor pago (incluindo o frete) será integralmente reembolsado.
      </p>

      <h3>Trocas por defeito ou tamanho</h3>
      <p>
        Caso o produto apresente algum defeito de fabricação, ou você tenha escolhido o tamanho errado, entre em
        contato conosco em até <strong>30 dias</strong> após o recebimento para combinarmos a troca.
      </p>

      <h3>Como solicitar troca ou devolução</h3>
      <p>
        Entre em contato pelo WhatsApp ou e-mail informando o número do pedido, o motivo da troca/devolução e fotos
        do produto (em caso de defeito). Vamos te orientar sobre como e para onde enviar a peça de volta.
      </p>

      <h3>Condições do produto</h3>
      <p>
        Para trocas e devoluções, o produto deve estar sem uso, com etiquetas originais e na embalagem em que foi
        recebido.
      </p>

      <h3>Prazo de entrega</h3>
      <p>
        O prazo de entrega varia conforme a modalidade de frete escolhida no checkout (PAC ou SEDEX) e a região de
        destino, sendo informado antes da finalização da compra.
      </p>

      <h3>Contato</h3>
      <p>
        E-mail: pedidos@agalu.com.br<br />
        WhatsApp: disponível pelo botão flutuante no site
      </p>
    </div>
  );
}
