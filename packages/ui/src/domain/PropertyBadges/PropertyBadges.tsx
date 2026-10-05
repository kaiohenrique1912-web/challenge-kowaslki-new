import {
  MAX_CARD_BADGES,
  PROPERTY_BADGE_LABELS,
  PROPERTY_BADGES,
  type PropertyBadge,
} from "@qa/shared";
import { Badge } from "../../components/Badge/Badge.tsx";

export type PropertyBadgesProps = {
  badges: readonly PropertyBadge[];
  /** Máximo exibido (card: 2, business-rules §5). Use Infinity no detalhe. */
  limit?: number;
  tone?: "overlay" | "neutral";
};

/** Selos do imóvel ("Exclusivo", "Baixou o preço"…) na ordem de prioridade das regras. */
export function PropertyBadges({
  badges,
  limit = MAX_CARD_BADGES,
  tone = "overlay",
}: PropertyBadgesProps) {
  const ordered = PROPERTY_BADGES.filter((b) => badges.includes(b)).slice(0, limit);
  if (ordered.length === 0) return null;
  return (
    <>
      {ordered.map((badge) => (
        <Badge key={badge} tone={tone}>
          {PROPERTY_BADGE_LABELS[badge]}
        </Badge>
      ))}
    </>
  );
}
