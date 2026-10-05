import { type KeyboardEvent, useId, useState } from "react";
import { Icon, type IconName } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import { Input } from "../Input/Input.tsx";
import { Spinner } from "../Spinner/Spinner.tsx";
import "./Combobox.css";

export type ComboboxOption = {
  id: string;
  label: string;
  description?: string;
  icon?: IconName;
};

export type ComboboxProps = {
  label: string;
  hideLabel?: boolean;
  /** Texto digitado (controlado). */
  value: string;
  onValueChange: (value: string) => void;
  options: readonly ComboboxOption[];
  onSelect: (option: ComboboxOption) => void;
  loading?: boolean;
  placeholder?: string;
  icon?: IconName;
  appearance?: "outline" | "pill";
  /** Abaixo disso a lista não abre (o autocomplete da API pede 2 caracteres). */
  minChars?: number;
  emptyMessage?: string;
  className?: string;
};

/**
 * Campo com sugestões (padrão WAI-ARIA combobox + listbox): ↓/↑ percorrem, Enter escolhe,
 * Esc fecha. As sugestões vêm de fora (ex.: query `locationSuggestions`).
 */
export function Combobox({
  label,
  hideLabel = false,
  value,
  onValueChange,
  options,
  onSelect,
  loading = false,
  placeholder,
  icon,
  appearance = "outline",
  minChars = 2,
  emptyMessage = "Nenhum resultado",
  className,
}: ComboboxProps) {
  const listId = useId();
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const typedEnough = value.trim().length >= minChars;
  const open = focused && !dismissed && typedEnough;
  const activeOption = open ? options[active] : undefined;

  const choose = (option: ComboboxOption) => {
    onSelect(option);
    setDismissed(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setDismissed(false);
      if (options.length === 0) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + delta + options.length) % options.length);
    } else if (event.key === "Enter" && activeOption) {
      event.preventDefault();
      choose(activeOption);
    } else if (event.key === "Escape") {
      setDismissed(true);
    }
  };

  return (
    <div className={cx("qa-combobox", className)}>
      <Input
        label={label}
        hideLabel={hideLabel}
        icon={icon}
        appearance={appearance}
        placeholder={placeholder}
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption ? `${listId}-${activeOption.id}` : undefined}
        autoComplete="off"
        suffix={loading && focused ? <Spinner size={16} label="Buscando sugestões" /> : undefined}
        onChange={(e) => {
          onValueChange(e.target.value);
          setDismissed(false);
          setActive(0);
        }}
        onFocus={(e) => {
          setFocused(true);
          e.target.select();
        }}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
      />
      <div
        id={listId}
        role="listbox"
        aria-label={label}
        className="qa-combobox__list"
        hidden={!open}
      >
        {open && options.length === 0 && !loading && (
          <div className="qa-combobox__empty">{emptyMessage}</div>
        )}
        {open &&
          options.map((option, index) => (
            <div
              key={option.id}
              id={`${listId}-${option.id}`}
              role="option"
              tabIndex={-1}
              aria-selected={index === active}
              className={cx(
                "qa-combobox__option",
                index === active && "qa-combobox__option--active",
              )}
              // mousedown (e não click) para escolher antes do blur do input fechar a lista
              onMouseDown={(e) => {
                e.preventDefault();
                choose(option);
              }}
              onMouseEnter={() => setActive(index)}
            >
              {option.icon && <Icon name={option.icon} className="qa-combobox__icon" />}
              <span className="qa-combobox__text">
                <span className="qa-combobox__label">{option.label}</span>
                {option.description && (
                  <span className="qa-combobox__description">{option.description}</span>
                )}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
