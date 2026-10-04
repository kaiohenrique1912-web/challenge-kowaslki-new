/**
 * Fotos placeholder geradas localmente (sem serviços externos). A URL
 * `/static/photos/{room}-{variant}.svg` sempre gera a mesma ilustração.
 */

export const PHOTO_ROOMS = [
  "living",
  "bedroom",
  "kitchen",
  "bathroom",
  "facade",
  "balcony",
] as const;
export type PhotoRoom = (typeof PHOTO_ROOMS)[number];
export const PHOTO_VARIANT_COUNT = 8;

const ROOM_LABELS: Record<PhotoRoom, string> = {
  living: "Sala",
  bedroom: "Quarto",
  kitchen: "Cozinha",
  bathroom: "Banheiro",
  facade: "Fachada",
  balcony: "Varanda",
};

/** Paredes e pisos em tons neutros, como fotos reais de imóveis. */
const PALETTES = [
  { wall: "#efe9e1", floor: "#b98b5e", accent: "#4a6fa5" },
  { wall: "#e8ecef", floor: "#a47551", accent: "#6b8f71" },
  { wall: "#f4f1ea", floor: "#c9a27e", accent: "#b5651d" },
  { wall: "#e6e2dc", floor: "#8d6346", accent: "#3b5bc2" },
  { wall: "#f0ece4", floor: "#d2b48c", accent: "#7d5a50" },
  { wall: "#e3e7e3", floor: "#9c7a5b", accent: "#c0504d" },
  { wall: "#f2efe9", floor: "#b08968", accent: "#2f6f73" },
  { wall: "#ebe6df", floor: "#7f5539", accent: "#8a6fb0" },
] as const;

const FILE_PATTERN = new RegExp(`^(${PHOTO_ROOMS.join("|")})-([1-${PHOTO_VARIANT_COUNT}])\\.svg$`);

export function parsePhotoFileName(file: string): { room: PhotoRoom; variant: number } | null {
  const match = FILE_PATTERN.exec(file);
  if (!match) return null;
  return { room: match[1] as PhotoRoom, variant: Number(match[2]) };
}

function furniture(room: PhotoRoom, accent: string): string {
  switch (room) {
    case "living":
      return `<rect x="230" y="370" width="340" height="90" rx="18" fill="${accent}"/>
        <rect x="210" y="340" width="380" height="50" rx="20" fill="${accent}" opacity="0.85"/>
        <rect x="330" y="470" width="140" height="18" rx="4" fill="#5b4636"/>`;
    case "bedroom":
      return `<rect x="220" y="330" width="360" height="40" rx="8" fill="#5b4636"/>
        <rect x="220" y="370" width="360" height="110" rx="10" fill="#fafafa"/>
        <rect x="240" y="350" width="130" height="40" rx="12" fill="${accent}" opacity="0.6"/>
        <rect x="430" y="350" width="130" height="40" rx="12" fill="${accent}" opacity="0.6"/>`;
    case "kitchen":
      return `<rect x="120" y="360" width="560" height="120" fill="#d9d4cc"/>
        <rect x="120" y="350" width="560" height="16" fill="#6d6875"/>
        <rect x="140" y="200" width="520" height="80" fill="${accent}" opacity="0.75"/>
        <circle cx="300" cy="358" r="10" fill="#333"/><circle cx="340" cy="358" r="10" fill="#333"/>`;
    case "bathroom":
      return `<rect x="150" y="380" width="260" height="90" rx="40" fill="#fdfdfd" stroke="#ccc" stroke-width="4"/>
        <rect x="500" y="300" width="120" height="170" rx="6" fill="${accent}" opacity="0.35"/>
        <circle cx="560" cy="250" r="34" fill="#cfd8dc"/>`;
    case "facade":
      return `<polygon points="200,260 400,140 600,260" fill="${accent}"/>
        <rect x="230" y="260" width="340" height="230" fill="#f7f3ec"/>
        <rect x="370" y="380" width="60" height="110" fill="#5b4636"/>
        <rect x="260" y="300" width="70" height="60" fill="#9ec5e8"/>
        <rect x="470" y="300" width="70" height="60" fill="#9ec5e8"/>`;
    case "balcony":
      return `<rect x="80" y="380" width="640" height="10" fill="#555"/>
        ${Array.from({ length: 17 }, (_, i) => `<rect x="${90 + i * 38}" y="390" width="6" height="90" fill="#555"/>`).join("")}
        <circle cx="620" cy="330" r="40" fill="#6b8f71"/>
        <rect x="610" y="360" width="20" height="40" fill="#8d6346"/>`;
  }
}

export function renderPlaceholderPhoto(room: PhotoRoom, variant: number): string {
  const palette = PALETTES[(variant - 1) % PALETTES.length] ?? PALETTES[0];
  const isOutdoor = room === "facade" || room === "balcony";
  const background = isOutdoor
    ? `<rect width="800" height="600" fill="#bcdcf5"/><rect y="490" width="800" height="110" fill="#8fb47a"/>`
    : `<rect width="800" height="600" fill="${palette.wall}"/>
       <polygon points="0,480 800,480 800,600 0,600" fill="${palette.floor}"/>
       <rect x="${variant % 2 === 0 ? 90 : 560}" y="110" width="150" height="170" fill="#cfe6f7" stroke="#fff" stroke-width="10"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img" aria-label="${ROOM_LABELS[room]}">
  ${background}
  ${furniture(room, palette.accent)}
  <text x="24" y="572" font-family="system-ui, sans-serif" font-size="22" fill="#000" opacity="0.35">${ROOM_LABELS[room]} · foto ilustrativa</text>
</svg>`;
}
