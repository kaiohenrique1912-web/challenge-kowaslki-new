import { type KeyboardEvent, useRef } from "react";

/**
 * Navegação por teclado de um grupo de escolha única (padrão WAI-ARIA "radio group"):
 * só a opção marcada fica no Tab; setas/Home/End movem e selecionam.
 */
export function useRadioGroup<T>(options: readonly T[], value: T, onChange: (value: T) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(0, options.indexOf(value));

  const select = (index: number) => {
    const option = options[index];
    if (option === undefined) return;
    onChange(option);
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const last = options.length - 1;
    const keys: Record<string, number> = {
      ArrowRight: selectedIndex === last ? 0 : selectedIndex + 1,
      ArrowDown: selectedIndex === last ? 0 : selectedIndex + 1,
      ArrowLeft: selectedIndex === 0 ? last : selectedIndex - 1,
      ArrowUp: selectedIndex === 0 ? last : selectedIndex - 1,
      Home: 0,
      End: last,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };

  const itemProps = (index: number) => ({
    ref: (el: HTMLButtonElement | null) => {
      refs.current[index] = el;
    },
    role: "radio" as const,
    "aria-checked": index === selectedIndex && options.includes(value),
    tabIndex: index === selectedIndex ? 0 : -1,
    onClick: () => select(index),
    onKeyDown,
  });

  return { itemProps };
}
