import { getProdutos } from '../lib/produtos';

export default function sitemap() {
  const produtos = getProdutos();
  const urlsProdutos = produtos.map((p) => ({
    url: `https://www.agalu.com.br/produto/${p.ref}`,
    lastModified: new Date(),
  }));

  return [
    { url: 'https://www.agalu.com.br', lastModified: new Date() },
    { url: 'https://www.agalu.com.br/produtos', lastModified: new Date() },
    { url: 'https://www.agalu.com.br/politica-de-troca', lastModified: new Date() },
    ...urlsProdutos,
  ];
}
