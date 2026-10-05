import { useEffect, useState } from "react";

/** Valor que só muda depois de `delay` ms sem mudanças (busca enquanto digita, mapa). */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** useState persistido no localStorage (preferências do usuário, ex.: "Buscar ao mover o mapa"). */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initial : (JSON.parse(stored) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // sem persistência: segue só em memória
    }
  }, [key, value]);
  return [value, setValue] as const;
}
