'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    img: '/images/capas/geral.jpg',
    selo: 'Verão & Inverno',
    titulo: 'Roupas infantis direto da fábrica, sem intermediário',
    texto: 'Mais de 20 anos de experiência produzindo pra confiar de olhos fechados.',
    ctaTexto: 'Ver todos os produtos',
    ctaLink: '/produtos',
  },
  {
    img: '/images/capas/verao.jpg',
    selo: '🏷️ Preço único · Coleção Verão',
    titulo: 'Qualquer peça do catálogo por R$12',
    texto: 'Regatas, camisetas e shorts leves pro calor. Sem pegadinha, sem "a partir de".',
    ctaTexto: 'Ver coleção Verão',
    ctaLink: '/produtos?estacao=Verao',
  },
  {
    img: '/images/capas/inverno.jpg',
    selo: '🚚 Frete rápido · Coleção Inverno',
    titulo: 'Frete calculado na hora pelo seu CEP',
    texto: 'Manga longa, Canelado e Suedine pros dias frios. Você escolhe PAC ou SEDEX no checkout.',
    ctaTexto: 'Ver coleção Inverno',
    ctaLink: '/produtos?estacao=Inverno',
  },
];

export default function HeroCarousel() {
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setAtivo((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero-carrossel">
      {SLIDES.map((slide, i) => (
        <div key={i} className={`hero-slide ${i === ativo ? 'ativo' : ''}`}>
          <div className="hero-texto">
            <span className="selo">{slide.selo}</span>
            <h1>{slide.titulo}</h1>
            <p>{slide.texto}</p>
            <div className="hero-cta">
              <Link href={slide.ctaLink} className="btn">{slide.ctaTexto}</Link>
            </div>
          </div>
          <div className="hero-imagem-card">
            <img src={slide.img} alt={slide.titulo} />
          </div>
        </div>
      ))}
      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === ativo ? 'ativo' : ''}`}
            onClick={() => setAtivo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
