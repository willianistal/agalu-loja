import produtosData from '../produtos.json';

// Preço fixo padrão - pode ser sobrescrito por produto no futuro (admin)
export const PRECO_FIXO = 12;

export function getProdutos() {
  return produtosData;
}

export function getProdutoPorRef(ref) {
  return produtosData.find((p) => p.ref === ref);
}

export function getProdutosPorEstacao(estacao) {
  if (!estacao || estacao === 'todos') return produtosData;
  return produtosData.filter((p) => p.estacao === estacao);
}

export function getTecidos() {
  return [...new Set(produtosData.map((p) => p.tecido))];
}

export function imagemProduto(ref) {
  return `/images/${ref}.jpg`;
}
