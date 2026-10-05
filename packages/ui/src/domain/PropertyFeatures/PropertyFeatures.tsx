import type { FeatureKind, PropertyFeature } from "@qa/shared";
import { Tag } from "../../components/Tag/Tag.tsx";
import type { IconName } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./PropertyFeatures.css";

const ICONS: Record<FeatureKind, IconName> = {
  area: "area",
  bedrooms: "bed",
  suites: "bath",
  bathrooms: "bath",
  parking: "car",
  floor: "building",
  pets: "paw",
  furnished: "sofa",
  subway: "train",
};

export type PropertyFeaturesProps = {
  /** Use `propertyFeatures(imóvel)` de @qa/shared (ordem e textos das regras). */
  features: readonly PropertyFeature[];
  className?: string;
};

/** Grade de características do detalhe: "90 m²", "3 quartos", "Sem vaga", "Aceita pet"… */
export function PropertyFeatures({ features, className }: PropertyFeaturesProps) {
  return (
    <ul className={cx("qa-features", className)} aria-label="Características">
      {features.map((f) => (
        <li key={f.kind}>
          <Tag icon={ICONS[f.kind]}>{f.label}</Tag>
        </li>
      ))}
    </ul>
  );
}
