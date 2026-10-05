import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "../../components/IconButton/IconButton.tsx";
import { samplePhotos } from "../../fixtures/properties.ts";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton.tsx";
import { PropertyGallery } from "./PropertyGallery.tsx";

const meta = {
  title: "Domain/PropertyGallery",
  component: PropertyGallery,
  parameters: { layout: "fullscreen" },
  args: {
    photos: samplePhotos,
    alt: "Casa à venda com 90m², 3 quartos e sem vaga",
    onShowMap: () => {},
    actions: (
      <>
        <IconButton icon="share" label="Compartilhar" variant="surface" />
        <FavoriteButton favorite={false} onToggle={() => {}} variant="surface" />
      </>
    ),
  },
  decorators: [(Story) => <div style={{ maxWidth: 1200 }}>{Story()}</div>],
} satisfies Meta<typeof PropertyGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clique numa foto ou em "N Fotos" para abrir a galeria; ← → navegam. */
export const Default: Story = {};
export const SinglePhoto: Story = { args: { photos: samplePhotos.slice(0, 1) } };
export const NoPhotos: Story = { args: { photos: [] } };
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
