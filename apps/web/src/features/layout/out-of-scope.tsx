import { Button, Modal } from "@qa/ui";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

const OutOfScopeContext = createContext<(feature: string) => void>(() => {});

/**
 * Aviso único para o que existe no site original mas está fora do escopo deste clone
 * (menus do cabeçalho, "Entrar", "Agendar visita"…). Envolve a app em main.tsx.
 */
export function OutOfScopeProvider({ children }: { children: ReactNode }) {
  const [feature, setFeature] = useState<string | null>(null);
  const show = useCallback((name: string) => setFeature(name), []);
  const close = () => setFeature(null);
  return (
    <OutOfScopeContext.Provider value={show}>
      {children}
      <Modal
        open={feature !== null}
        onClose={close}
        title={feature ?? ""}
        footer={<Button onClick={close}>Entendi</Button>}
      >
        <p>
          Esta demonstração cobre a compra de imóveis em São Paulo. "{feature}" existe no site
          original, mas não faz parte deste projeto — use o coração para guardar imóveis nos seus
          favoritos.
        </p>
      </Modal>
    </OutOfScopeContext.Provider>
  );
}

/** `const notAvailable = useOutOfScope(); notAvailable("Agendar visita")`. */
export function useOutOfScope() {
  return useContext(OutOfScopeContext);
}
