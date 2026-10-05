import { cx } from "../../utils/cx.ts";
import { IconButton } from "../IconButton/IconButton.tsx";
import "./Pagination.css";

export type PaginationProps = {
  /** Página atual, começando em 1. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Quantas páginas mostrar ao redor da atual. */
  siblings?: number;
  className?: string;
};

/** Lista de páginas com reticências: [1] … [4] [5] [6] … [20]. */
export function pageItems(page: number, totalPages: number, siblings = 1): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);
  items.push(1);
  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis");
  if (totalPages > 1) items.push(totalPages);
  return items;
}

/**
 * Paginação numerada. A busca usa "Ver mais" (Button `variant="secondary"`) com cursor;
 * use Pagination em listas com páginas fixas (ex.: favoritos, painel administrativo).
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblings = 1,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginação" className={cx("qa-pagination", className)}>
      <IconButton
        icon="chevronLeft"
        label="Página anterior"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      <ol className="qa-pagination__list">
        {pageItems(page, totalPages, siblings).map((item, index) =>
          item === "ellipsis" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: reticências não têm id estável
            <li key={`ellipsis-${index}`} className="qa-pagination__ellipsis" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="qa-pagination__page"
                aria-current={item === page ? "page" : undefined}
                aria-label={`Página ${item}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>
      <IconButton
        icon="chevronRight"
        label="Próxima página"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}
