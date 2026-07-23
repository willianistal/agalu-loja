// Converte a nomenclatura abreviada do catálogo (M/L, C/D, S/D, C/Botão...)
// em um título legível, e gera o aviso de estampa sortida quando aplicável.

const SUBSTITUICOES = [
  [/C\/Botão/gi, 'com Botão'],
  [/S\/Botão/gi, 'sem Botão'],
  [/C\/Pé/gi, 'com Pé'],
  [/S\/P\b/gi, 'sem Pé'],
  [/C\/Punho/gi, 'com Punho'],
  [/C\/D/gi, 'com Desenho'],
  [/S\/D/gi, 'sem Desenho'],
  [/M\/L/gi, 'Manga Longa'],
  [/M\/M/gi, 'Meia Manga'],
];

export function formatarNomeProduto(nomeBruto) {
  let texto = nomeBruto;
  // padroniza a ordem: Botão sempre antes de Desenho, não importa como veio no catálogo
  texto = texto.replace(/C\/D C\/Botão/gi, 'C/Botão C/D');
  texto = texto.replace(/S\/D C\/Botão/gi, 'C/Botão S/D');
  for (const [regex, substituto] of SUBSTITUICOES) {
    texto = texto.replace(regex, substituto);
  }
  // normaliza espaços duplos que podem sobrar
  texto = texto.replace(/\s+/g, ' ').trim();
  // "com Botão com Desenho" fica mais natural como "com Botão e Desenho"
  texto = texto.replace(/com Botão com Desenho/gi, 'com Botão e Desenho');
  texto = texto.replace(/sem Botão sem Desenho/gi, 'sem Botão e sem Desenho');
  // aplica "sentence case": primeira letra maiúscula, resto como veio
  // (mantém acentos e already-capitalized words como Manga Longa)
  return texto;
}

export function temEstampaSortida(produto) {
  return !!produto.detalhe;
}

export const AVISO_ESTAMPA_SORTIDA =
  'Estampa sortida — a peça vem com desenho, mas não é possível escolher qual estampa específica chega (sujeito ao que a fábrica tiver disponível no momento).';
