'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem('agalu_carrinho');
      if (salvo) setItens(JSON.parse(salvo));
    } catch (e) {}
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem('agalu_carrinho', JSON.stringify(itens));
    }
  }, [itens, carregado]);

  function adicionar(produto, tamanho, quantidade = 1, cor = null) {
    setItens((prev) => {
      const idx = prev.findIndex(
        (i) => i.ref === produto.ref && i.tamanho === tamanho && i.cor === cor
      );
      if (idx >= 0) {
        const novo = [...prev];
        novo[idx].quantidade += quantidade;
        return novo;
      }
      return [
        ...prev,
        {
          ref: produto.ref,
          nome: produto.nome,
          tecido: produto.tecido,
          preco: 12,
          tamanho,
          cor,
          quantidade,
        },
      ];
    });
  }

  function remover(ref, tamanho, cor) {
    setItens((prev) => prev.filter((i) => !(i.ref === ref && i.tamanho === tamanho && i.cor === cor)));
  }

  function atualizarQuantidade(ref, tamanho, cor, quantidade) {
    setItens((prev) =>
      prev.map((i) =>
        i.ref === ref && i.tamanho === tamanho && i.cor === cor ? { ...i, quantidade } : i
      )
    );
  }

  function limpar() {
    setItens([]);
  }

  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ itens, adicionar, remover, atualizarQuantidade, limpar, total, totalItens }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de CartProvider');
  return ctx;
}
