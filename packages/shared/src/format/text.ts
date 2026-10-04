/** Minúsculas e sem acentos — usado em colunas `*_normalized` e no autocomplete. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** "Vila Madalena" → "vila-madalena". */
export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 1234567 → "01234-567". */
export function formatCep(digits: number): string {
  const raw = String(digits).padStart(8, "0");
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}
