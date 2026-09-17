'use client';
import { createContext, useContext, useEffect, useState } from 'react';

// Carrinho do atacado é separado do carrinho do varejo (chaves de localStorage
// diferentes), porque são fluxos de compra diferentes: aqui o item é um
// "pacote" (Masculino/Feminino, tamanho, quantidade de pacotes), não uma cor.
const CartAtacadoContext = createContext(null);

export function CartAtacadoProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem('agalu_carrinho_atacado');
      if (salvo) setItens(JSON.parse(salvo));
    } catch (e) {}
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem('agalu_carrinho_atacado', JSON.stringify(itens));
    }
  }, [itens, carregado]);

  // produto: { ref, nome, tecido, pacote (peças por pacote), precoAtacado (preço por peça) }
  // genero: 'Masculino' | 'Feminino'
  function adicionar(produto, tamanho, genero, quantidadePacotes = 1) {
    setItens((prev) => {
      const idx = prev.findIndex(
        (i) => i.ref === produto.ref && i.tamanho === tamanho && i.genero === genero
      );
      if (idx >= 0) {
        const novo = [...prev];
        novo[idx].quantidadePacotes += quantidadePacotes;
        return novo;
      }
      return [
        ...prev,
        {
          ref: produto.ref,
          nome: produto.nome,
          tecido: produto.tecido,
          pacote: produto.pacote,
          precoAtacado: produto.precoAtacado,
          tamanho,
          genero,
          quantidadePacotes,
        },
      ];
    });
  }

  function remover(ref, tamanho, genero) {
    setItens((prev) => prev.filter((i) => !(i.ref === ref && i.tamanho === tamanho && i.genero === genero)));
  }

  function atualizarQuantidade(ref, tamanho, genero, quantidadePacotes) {
    setItens((prev) =>
      prev.map((i) =>
        i.ref === ref && i.tamanho === tamanho && i.genero === genero ? { ...i, quantidadePacotes } : i
      )
    );
  }

  function limpar() {
    setItens([]);
  }

  const total = itens.reduce((acc, i) => acc + i.precoAtacado * i.pacote * i.quantidadePacotes, 0);
  const totalPacotes = itens.reduce((acc, i) => acc + i.quantidadePacotes, 0);
  const totalPecas = itens.reduce((acc, i) => acc + i.pacote * i.quantidadePacotes, 0);

  return (
    <CartAtacadoContext.Provider
      value={{ itens, adicionar, remover, atualizarQuantidade, limpar, total, totalPacotes, totalPecas }}
    >
      {children}
    </CartAtacadoContext.Provider>
  );
}

export function useCartAtacado() {
  const ctx = useContext(CartAtacadoContext);
  if (!ctx) throw new Error('useCartAtacado precisa estar dentro de CartAtacadoProvider');
  return ctx;
}
