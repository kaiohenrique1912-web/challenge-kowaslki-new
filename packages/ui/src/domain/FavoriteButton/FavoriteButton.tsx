import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./FavoriteButton.css";

export type FavoriteButtonProps = {
  favorite: boolean;
  onToggle: (favorite: boolean) => void;
  /** plain: coração solto (card). surface: círculo branco (sobre a foto, detalhe). */
  variant?: "plain" | "surface";
  /** Mostra o texto "Favoritar" ao lado (card de preços do detalhe). */
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
};

/** Coração de favorito. `aria-pressed` indica o estado; o clique não propaga para o card. */
export function FavoriteButton({
  favorite,
  onToggle,
  variant = "plain",
  showLabel = false,
  disabled = false,
  className,
}: FavoriteButtonProps) {
  const label = favorite ? "Remover dos favoritos" : "Favoritar";
  return (
    <button
      type="button"
      className={cx(
        "qa-favorite",
        `qa-favorite--${variant}`,
        favorite && "qa-favorite--active",
        showLabel && "qa-favorite--labeled",
        className,
      )}
      aria-pressed={favorite}
      aria-label={showLabel ? undefined : label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle(!favorite);
      }}
    >
      <Icon name="heart" size={24} filled={favorite} />
      {showLabel && (
        <span className="qa-favorite__label">{favorite ? "Favoritado" : "Favoritar"}</span>
      )}
    </button>
  );
}
