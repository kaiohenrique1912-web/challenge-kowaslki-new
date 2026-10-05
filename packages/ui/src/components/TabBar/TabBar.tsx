import { cx } from "../../utils/cx.ts";
import "./TabBar.css";

export type TabBarItem<T extends string> = { value: T; label: string };

export type TabBarProps<T extends string> = {
  /** Nome acessível da lista de abas. */
  label: string;
  items: readonly TabBarItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Abas de texto com sublinhado azul na ativa ("Alugar | Comprar" da home do original).
 * Para alternâncias em pílula use SegmentedControl.
 */
export function TabBar<T extends string>({
  label,
  items,
  value,
  onChange,
  className,
}: TabBarProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={cx("qa-tab-bar", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          className="qa-tab-bar__tab"
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
