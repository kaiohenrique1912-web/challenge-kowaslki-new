import { type ReactNode, useState } from "react";
import { Button } from "../../components/Button/Button.tsx";
import { IconButton } from "../../components/IconButton/IconButton.tsx";
import { Modal } from "../../components/Modal/Modal.tsx";
import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./PropertyGallery.css";

export type PropertyGalleryProps = {
  photos: readonly string[];
  /** Base do texto alternativo das fotos (ex.: o headline do imóvel). */
  alt: string;
  /** Botões sobre a foto, no canto superior esquerdo (compartilhar, favoritar). */
  actions?: ReactNode;
  /** Botão "Mapa" (ex.: rolar até o mapa da localização). Sem isso, o botão não aparece. */
  onShowMap?: () => void;
  className?: string;
};

/**
 * Galeria do detalhe: duas fotos lado a lado (uma no mobile) com setas, "N Fotos" abre a
 * galeria completa (modal com ← → e miniaturas) e "Mapa" leva à localização.
 */
export function PropertyGallery({
  photos,
  alt,
  actions,
  onShowMap,
  className,
}: PropertyGalleryProps) {
  const [start, setStart] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const total = photos.length;
  const visible = [photos[start], photos[(start + 1) % Math.max(total, 1)]].filter(
    (p, i): p is string => Boolean(p) && (i === 0 || total > 1),
  );
  const move = (delta: number) => setStart((s) => (s + delta + total) % total);
  const view = (delta: number) => setViewer((v) => (v === null ? v : (v + delta + total) % total));

  return (
    <section className={cx("qa-gallery", className)} aria-label="Fotos do imóvel">
      <div className="qa-gallery__hero">
        {visible.length === 0 ? (
          <div className="qa-gallery__empty">
            <Icon name="image" size={40} />
            Sem fotos
          </div>
        ) : (
          visible.map((url, i) => {
            const index = (start + i) % total;
            return (
              <button
                key={`${url}-${index}`}
                type="button"
                className="qa-gallery__photo"
                onClick={() => setViewer(index)}
                aria-label={`Ampliar foto ${index + 1} de ${total}`}
              >
                <img
                  src={url}
                  alt={`Foto ${index + 1} de ${total} — ${alt}`}
                  loading={i ? "lazy" : "eager"}
                />
              </button>
            );
          })
        )}
      </div>
      {actions && <div className="qa-gallery__actions">{actions}</div>}
      <div className="qa-gallery__bottom">
        {total > 0 && (
          <Button variant="outline" size="sm" iconLeft="image" onClick={() => setViewer(start)}>
            {total} {total === 1 ? "Foto" : "Fotos"}
          </Button>
        )}
        {onShowMap && (
          <Button variant="outline" size="sm" iconLeft="location" onClick={onShowMap}>
            Mapa
          </Button>
        )}
      </div>
      {total > 2 && (
        <div className="qa-gallery__arrows">
          <IconButton
            icon="chevronLeft"
            label="Fotos anteriores"
            variant="surface"
            onClick={() => move(-1)}
          />
          <IconButton
            icon="chevronRight"
            label="Próximas fotos"
            variant="surface"
            onClick={() => move(1)}
          />
        </div>
      )}

      <Modal
        open={viewer !== null}
        onClose={() => setViewer(null)}
        title={viewer === null ? "Fotos" : `Foto ${viewer + 1} de ${total}`}
        className="qa-gallery__viewer"
      >
        {viewer !== null && (
          // biome-ignore lint/a11y/noStaticElementInteractions: ← → navegam entre as fotos do modal
          <div
            className="qa-gallery__viewer-body"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") view(1);
              if (e.key === "ArrowLeft") view(-1);
            }}
          >
            <div className="qa-gallery__viewer-stage">
              <IconButton
                icon="chevronLeft"
                label="Foto anterior"
                variant="surface"
                onClick={() => view(-1)}
              />
              <img
                className="qa-gallery__viewer-image"
                src={photos[viewer]}
                alt={`Foto ${viewer + 1} de ${total} — ${alt}`}
              />
              <IconButton
                icon="chevronRight"
                label="Próxima foto"
                variant="surface"
                onClick={() => view(1)}
              />
            </div>
            <div className="qa-gallery__thumbs">
              {photos.map((url, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: a mesma URL pode se repetir
                  key={`${url}-${i}`}
                  type="button"
                  className={cx("qa-gallery__thumb", i === viewer && "qa-gallery__thumb--active")}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === viewer || undefined}
                  onClick={() => setViewer(i)}
                >
                  <img className="qa-gallery__thumb-image" src={url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
