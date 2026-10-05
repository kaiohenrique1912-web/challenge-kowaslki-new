import {
  type PropertyBadge,
  type PropertyType,
  propertyAttributesLine,
  publicAddress,
} from "@qa/shared";
import { type MouseEvent, memo } from "react";
import { Skeleton } from "../../components/Skeleton/Skeleton.tsx";
import { cx } from "../../utils/cx.ts";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton.tsx";
import { PhotoCarousel } from "../PhotoCarousel/PhotoCarousel.tsx";
import { PriceTag } from "../PriceTag/PriceTag.tsx";
import { PropertyBadges } from "../PropertyBadges/PropertyBadges.tsx";
import "./PropertyCard.css";

/** Dados do card — os mesmos campos que `searchProperties { nodes { … } }` devolve. */
export type PropertyCardData = {
  id: string;
  type: PropertyType;
  /** "Apartamento à venda em Pinheiros com 3 quartos" (gerado pela API). */
  title: string;
  salePrice: number;
  monthlyCost: number;
  area: number;
  bedrooms: number;
  parkingSpaces: number;
  street: string;
  neighborhoodName: string;
  photos: readonly string[];
  badges: readonly PropertyBadge[];
  isFavorite: boolean;
};

export type PropertyCardProps = {
  property: PropertyCardData;
  /** Link do detalhe. O card inteiro é clicável (o título é o link real, acessível). */
  href: string;
  /** Intercepta a navegação (ex.: React Router). Sem isso, segue o href normalmente. */
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void;
  openInNewTab?: boolean;
  onFavoriteToggle?: (favorite: boolean) => void;
  /** Destaque visual quando o pin correspondente está sob o mouse no mapa. */
  highlighted?: boolean;
  /** Avisa o mapa para destacar o pin deste imóvel. */
  onHoverChange?: (hovering: boolean) => void;
  className?: string;
};

/**
 * Card da lista de resultados (business-rules §6). Memorizado: com callbacks estáveis, o hover de
 * um card não redesenha os outros.
 */
export const PropertyCard = memo(function PropertyCard({
  property: p,
  href,
  onNavigate,
  openInNewTab = false,
  onFavoriteToggle,
  highlighted = false,
  onHoverChange,
  className,
}: PropertyCardProps) {
  return (
    <article
      className={cx("qa-property-card", highlighted && "qa-property-card--highlighted", className)}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <PhotoCarousel
        photos={p.photos}
        alt={p.title}
        overlay={<PropertyBadges badges={p.badges} />}
      />
      <div className="qa-property-card__body">
        <h3 className="qa-property-card__title">
          <a
            href={href}
            className="qa-property-card__link"
            target={openInNewTab ? "_blank" : undefined}
            rel={openInNewTab ? "noopener" : undefined}
            onClick={onNavigate}
            onFocus={() => onHoverChange?.(true)}
            onBlur={() => onHoverChange?.(false)}
          >
            {p.title}
          </a>
        </h3>
        <div className="qa-property-card__price-row">
          <PriceTag salePrice={p.salePrice} monthlyCost={p.monthlyCost} />
          {onFavoriteToggle && (
            <FavoriteButton
              favorite={p.isFavorite}
              onToggle={onFavoriteToggle}
              className="qa-property-card__favorite"
            />
          )}
        </div>
        <p className="qa-property-card__attributes">{propertyAttributesLine(p)}</p>
        <p className="qa-property-card__address">{publicAddress(p.street, p.neighborhoodName)}</p>
      </div>
    </article>
  );
});

/** Placeholder do card enquanto a lista carrega (mesmas dimensões). */
export function PropertyCardSkeleton() {
  return (
    <div className="qa-property-card qa-property-card--skeleton" aria-hidden="true">
      <Skeleton shape="rect" height="auto" className="qa-property-card__photo-skeleton" />
      <div className="qa-property-card__body">
        <Skeleton width="80%" height={12} />
        <Skeleton width="55%" height={20} />
        <Skeleton width="45%" height={14} />
        <Skeleton width="70%" height={14} />
        <Skeleton width="60%" height={14} />
      </div>
    </div>
  );
}
