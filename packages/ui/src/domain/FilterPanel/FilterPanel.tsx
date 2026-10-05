import {
  AMENITIES,
  AMENITY_CATEGORIES,
  AMENITY_CATEGORY_LABELS,
  type AmenityCode,
  FILTER_SLIDER_SCALES,
  formatBRL,
  MIN_COUNT_FILTER_MAX,
  normalizeFilters,
  PROPERTY_TYPE_FILTER_LABELS,
  PROPERTY_TYPES,
  type PropertyFilters,
  PUBLISHED_WITHIN,
  PUBLISHED_WITHIN_LABELS,
  type Range,
  validatePropertyFilters,
} from "@qa/shared";
import type { ReactNode } from "react";
import { Checkbox } from "../../components/Checkbox/Checkbox.tsx";
import { ChoiceChips } from "../../components/ChoiceChips/ChoiceChips.tsx";
import { CounterSelector } from "../../components/CounterSelector/CounterSelector.tsx";
import { RangeField, type RangeValue } from "../../components/RangeField/RangeField.tsx";
import { Toggle } from "../../components/Toggle/Toggle.tsx";
import { cx } from "../../utils/cx.ts";
import "./FilterPanel.css";

/** Toda seção recebe os filtros inteiros e devolve os filtros inteiros (já normalizados). */
export type FilterSectionProps = {
  value: PropertyFilters;
  onChange: (next: PropertyFilters) => void;
};

const patch = (value: PropertyFilters, changes: Partial<PropertyFilters>) =>
  normalizeFilters({ ...value, ...changes });

const toRangeValue = (range?: Range): RangeValue => ({
  min: range?.min ?? null,
  max: range?.max ?? null,
});
const fromRangeValue = (range: RangeValue): Range | undefined => {
  const result: Range = {
    ...(range.min !== null && { min: range.min }),
    ...(range.max !== null && { max: range.max }),
  };
  return result.min === undefined && result.max === undefined ? undefined : result;
};

/** Escalas dos sliders — regra de `shared` (FILTER_SLIDER_SCALES), reexportada por conveniência. */
export const RANGE_SCALES = FILTER_SLIDER_SCALES;

export function PriceFilter({ value, onChange }: FilterSectionProps) {
  return (
    <RangeField
      label="Valor do imóvel"
      prefix="R$"
      value={toRangeValue(value.price)}
      onChange={(r) => onChange(patch(value, { price: fromRangeValue(r) }))}
      sliderMin={0}
      sliderMax={RANGE_SCALES.price.max}
      step={RANGE_SCALES.price.step}
      formatValue={formatBRL}
      error={validatePropertyFilters(value).price}
    />
  );
}

export function MonthlyCostFilter({ value, onChange }: FilterSectionProps) {
  return (
    <RangeField
      label="Condomínio + IPTU"
      prefix="R$"
      value={toRangeValue(value.monthlyCost)}
      onChange={(r) => onChange(patch(value, { monthlyCost: fromRangeValue(r) }))}
      sliderMin={0}
      sliderMax={RANGE_SCALES.monthlyCost.max}
      step={RANGE_SCALES.monthlyCost.step}
      formatValue={formatBRL}
      error={validatePropertyFilters(value).monthlyCost}
    />
  );
}

export function AreaFilter({ value, onChange }: FilterSectionProps) {
  return (
    <RangeField
      label="Área"
      suffix="m²"
      value={toRangeValue(value.area)}
      onChange={(r) => onChange(patch(value, { area: fromRangeValue(r) }))}
      sliderMin={0}
      sliderMax={RANGE_SCALES.area.max}
      step={RANGE_SCALES.area.step}
      formatValue={(v) => `${v.toLocaleString("pt-BR")} m²`}
      error={validatePropertyFilters(value).area}
    />
  );
}

export function PropertyTypesFilter({ value, onChange }: FilterSectionProps) {
  const selected = value.types ?? [];
  return (
    <fieldset className="qa-filter-panel__fieldset">
      <legend className="qa-filter-panel__legend">Tipos de imóvel</legend>
      <div className="qa-filter-panel__grid">
        {PROPERTY_TYPES.map((type) => (
          <Checkbox
            key={type}
            label={PROPERTY_TYPE_FILTER_LABELS[type]}
            checked={selected.includes(type)}
            onChange={(e) =>
              onChange(
                patch(value, {
                  types: e.target.checked
                    ? PROPERTY_TYPES.filter((t) => t === type || selected.includes(t))
                    : selected.filter((t) => t !== type),
                }),
              )
            }
          />
        ))}
      </div>
    </fieldset>
  );
}

const MIN_COUNT_FIELDS = {
  bedrooms: { key: "minBedrooms", label: "Quartos", max: MIN_COUNT_FILTER_MAX.bedrooms },
  bathrooms: { key: "minBathrooms", label: "Banheiros", max: MIN_COUNT_FILTER_MAX.bathrooms },
  suites: { key: "minSuites", label: "Suítes", max: MIN_COUNT_FILTER_MAX.suites },
  parkingSpaces: {
    key: "minParkingSpaces",
    label: "Vagas de garagem",
    max: MIN_COUNT_FILTER_MAX.parkingSpaces,
  },
} as const;

export function MinCountFilter({
  field,
  value,
  onChange,
}: FilterSectionProps & { field: keyof typeof MIN_COUNT_FIELDS }) {
  const config = MIN_COUNT_FIELDS[field];
  return (
    <CounterSelector
      label={config.label}
      max={config.max}
      value={value[config.key] ?? null}
      onChange={(n) => onChange(patch(value, { [config.key]: n ?? undefined }))}
    />
  );
}

export function PublishedWithinFilter({ value, onChange }: FilterSectionProps) {
  return (
    <ChoiceChips
      label="Data de publicação"
      value={value.publishedWithin}
      onChange={(publishedWithin) => onChange(patch(value, { publishedWithin }))}
      options={[
        { value: undefined, label: "Tanto faz" },
        ...PUBLISHED_WITHIN.map((v) => ({ value: v, label: PUBLISHED_WITHIN_LABELS[v] })),
      ]}
    />
  );
}

const YES_NO_FIELDS = {
  furnished: "Mobiliado",
  nearSubway: "Próximo ao metrô",
  exclusive: "Exclusivos QuintoAndar",
} as const;

export function YesNoFilter({
  field,
  value,
  onChange,
}: FilterSectionProps & { field: keyof typeof YES_NO_FIELDS }) {
  return (
    <ChoiceChips
      label={YES_NO_FIELDS[field]}
      value={value[field]}
      onChange={(answer) => onChange(patch(value, { [field]: answer }))}
      options={[
        { value: undefined, label: "Tanto faz" },
        { value: true, label: "Sim" },
        { value: false, label: "Não" },
      ]}
    />
  );
}

export function RentedFilter({ value, onChange }: FilterSectionProps) {
  return (
    <div className="qa-filter-panel__group">
      <span className="qa-filter-panel__legend">Compra para investir</span>
      <Toggle
        label="Compre já alugado"
        description="Só imóveis vendidos com inquilino"
        checked={value.rented === true}
        onChange={(checked) => onChange(patch(value, { rented: checked || undefined }))}
      />
    </div>
  );
}

export function AmenitiesFilter({ value, onChange }: FilterSectionProps) {
  const selected = value.amenities ?? [];
  const toggle = (code: AmenityCode, checked: boolean) =>
    onChange(
      patch(value, {
        amenities: checked
          ? AMENITIES.map((a) => a.code).filter((c) => c === code || selected.includes(c))
          : selected.filter((c) => c !== code),
      }),
    );
  return (
    <>
      {AMENITY_CATEGORIES.map((category) => (
        <fieldset key={category} className="qa-filter-panel__fieldset">
          <legend className="qa-filter-panel__legend">{AMENITY_CATEGORY_LABELS[category]}</legend>
          <div className="qa-filter-panel__grid">
            {AMENITIES.filter((a) => a.category === category).map((a) => (
              <Checkbox
                key={a.code}
                label={a.label}
                checked={selected.includes(a.code)}
                onChange={(e) => toggle(a.code, e.target.checked)}
              />
            ))}
          </div>
        </fieldset>
      ))}
    </>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <div className="qa-filter-panel__section">{children}</div>;
}

export type FilterPanelProps = FilterSectionProps & { className?: string };

/**
 * Todos os filtros de atributos, na ordem do painel "Mais filtros" do original. Controlado:
 * recebe e devolve `PropertyFilters` (@qa/shared). Use dentro de um Drawer; o rodapé
 * ("Limpar" / "Ver N imóveis") é do dono.
 */
export function FilterPanel({ value, onChange, className }: FilterPanelProps) {
  const props = { value, onChange };
  return (
    <div className={cx("qa-filter-panel", className)}>
      <Section>
        <PriceFilter {...props} />
      </Section>
      <Section>
        <MonthlyCostFilter {...props} />
      </Section>
      <Section>
        <PropertyTypesFilter {...props} />
      </Section>
      <Section>
        <PublishedWithinFilter {...props} />
      </Section>
      <Section>
        <MinCountFilter field="bedrooms" {...props} />
        <MinCountFilter field="bathrooms" {...props} />
        <MinCountFilter field="parkingSpaces" {...props} />
      </Section>
      <Section>
        <AreaFilter {...props} />
      </Section>
      <Section>
        <YesNoFilter field="furnished" {...props} />
        <YesNoFilter field="nearSubway" {...props} />
        <YesNoFilter field="exclusive" {...props} />
        <MinCountFilter field="suites" {...props} />
      </Section>
      <Section>
        <RentedFilter {...props} />
      </Section>
      <Section>
        <AmenitiesFilter {...props} />
      </Section>
    </div>
  );
}
