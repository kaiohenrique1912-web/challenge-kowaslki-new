import { type ReactNode, useState } from "react";
import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./PhotoCarousel.css";

export type PhotoCarouselProps = {
  photos: readonly string[];
  /** Base do texto alternativo: "Foto 2 de 12 — {alt}". */
  alt: string;
  /** Conteúdo sobreposto no canto superior esquerdo (ex.: PropertyBadges). */
  overlay?: ReactNode;
  /** Máximo de bolinhas de paginação exibidas. */
  maxDots?: number;
  aspectRatio?: string;
  className?: string;
};

/**
 * Carrossel de fotos do card: setas aparecem no hover/foco, bolinhas embaixo, setas do teclado
 * navegam quando focado. Só a foto atual é carregada (as demais sob demanda).
 */
export function PhotoCarousel({
  photos,
  alt,
  overlay,
  maxDots = 7,
  aspectRatio = "3 / 2",
  className,
}: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const go = (delta: number) => setIndex((current) => (current + delta + total) % total);
  const current = photos[index];
  const firstDot = Math.min(
    Math.max(0, index - Math.floor(maxDots / 2)),
    Math.max(0, total - maxDots),
  );
  const dots = Array.from({ length: Math.min(total, maxDots) }, (_, i) => firstDot + i);

  return (
    <section
      className={cx("qa-carousel", className)}
      style={{ aspectRatio }}
      aria-roledescription="carrossel"
      aria-label={`Fotos — ${alt}`}
      onKeyDown={(e) => {
        if (total < 2) return;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      {current ? (
        <img
          key={current}
          src={current}
          alt={`Foto ${index + 1} de ${total} — ${alt}`}
          className="qa-carousel__image"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="qa-carousel__empty">
          <Icon name="image" size={32} />
          <span>Sem fotos</span>
        </div>
      )}
      {overlay && <div className="qa-carousel__overlay">{overlay}</div>}
      {total > 1 && (
        <>
          <button
            type="button"
            className="qa-carousel__nav qa-carousel__nav--prev"
            aria-label="Foto anterior"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(-1);
            }}
          >
            <Icon name="chevronLeft" size={18} />
          </button>
          <button
            type="button"
            className="qa-carousel__nav qa-carousel__nav--next"
            aria-label="Próxima foto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(1);
            }}
          >
            <Icon name="chevronRight" size={18} />
          </button>
          <div className="qa-carousel__dots" aria-hidden="true">
            {dots.map((dot) => (
              <span
                key={dot}
                className={cx(
                  "qa-carousel__dot",
                  dot === index && "qa-carousel__dot--active",
                  (dot === dots[0] && dot > 0) || (dot === dots.at(-1) && dot < total - 1)
                    ? "qa-carousel__dot--edge"
                    : false,
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
