import { type CSSProperties, useId, useState } from "react";
import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./ExpandableText.css";

export type ExpandableTextProps = {
  text: string;
  /** Linhas visíveis antes do "Ver mais". */
  lines?: number;
  /** Textos curtos (abaixo disso) não mostram o botão. */
  minLengthToCollapse?: number;
  className?: string;
};

/** Texto longo recolhido em N linhas com "Ver mais / Ver menos" (descrição do imóvel). */
export function ExpandableText({
  text,
  lines = 2,
  minLengthToCollapse = 160,
  className,
}: ExpandableTextProps) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const collapsible = text.length > minLengthToCollapse;
  const collapsed = collapsible && !expanded;
  return (
    <div className={cx("qa-expandable", className)}>
      <p
        id={id}
        className={cx("qa-expandable__text", collapsed && "qa-expandable__text--collapsed")}
        style={{ "--lines": lines } as CSSProperties}
      >
        {text}
      </p>
      {collapsible && (
        <button
          type="button"
          className="qa-expandable__toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          <Icon name={expanded ? "chevronUp" : "chevronDown"} size={18} />
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </div>
  );
}
