// Cores extraídas por amostragem de pixel direto das fotos do catálogo AGALU
export const CORES_POR_TECIDO = {
  Canelado: [
    { nome: 'Azul Piscina', hex: '#A8CCD2' },
    { nome: 'Suzy', hex: '#E9A8BA' },
    { nome: 'Rosa', hex: '#E4B2C6' },
    { nome: 'Verde', hex: '#99B7B0' },
    { nome: 'Azul-bebê', hex: '#B0DCF3' },
    { nome: 'Cinza', hex: '#D1CCC8' },
    { nome: 'Branco', hex: '#FFFFFF' },
    { nome: 'Bege', hex: '#E9D9CA' },
  ],
  Reativa: [
    { nome: 'Azul', hex: '#39BAE8' },
    { nome: 'Jade', hex: '#17A6C1' },
    { nome: 'Vermelho', hex: '#D52F34' },
    { nome: 'Chiclete', hex: '#DB88A7' },
    { nome: 'Azul Marinho', hex: '#202949' },
    { nome: 'Pink', hex: '#F768AC' },
  ],
  Pastel: [
    { nome: 'Azul Piscina', hex: '#A8CCD2' },
    { nome: 'Suzy', hex: '#E9A8BA' },
    { nome: 'Rosa', hex: '#E4B2C6' },
    { nome: 'Verde', hex: '#99B7B0' },
    { nome: 'Azul-bebê', hex: '#B0DCF3' },
    { nome: 'Bege', hex: '#E9D9CA' },
  ],
  Suedine: [
    { nome: 'Azul Piscina', hex: '#A8CCD2' },
    { nome: 'Suzy', hex: '#E9A8BA' },
    { nome: 'Rosa', hex: '#E4B2C6' },
    { nome: 'Verde', hex: '#99B7B0' },
    { nome: 'Azul-bebê', hex: '#B0DCF3' },
    { nome: 'Branco', hex: '#FFFFFF' },
    { nome: 'Bege', hex: '#E9D9CA' },
  ],
};

export function getCoresPorTecido(tecido) {
  return CORES_POR_TECIDO[tecido] || [];
}
