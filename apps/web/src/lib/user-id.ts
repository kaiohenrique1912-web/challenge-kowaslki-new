const STORAGE_KEY = "qa:user-id";
let memoryId: string | null = null;

/**
 * Usuário anônimo (sem login — business-rules §2.3): UUID gerado uma vez e guardado no
 * navegador. Vai no header `x-user-id` de toda request (favoritos).
 */
export function getUserId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage indisponível (modo privado restrito): id só desta sessão.
    memoryId ??= crypto.randomUUID();
    return memoryId;
  }
}
