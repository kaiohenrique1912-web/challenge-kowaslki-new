import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../components/Button/Button.tsx";
import { AppHeader } from "./AppHeader.tsx";

const meta = {
  title: "Domain/AppHeader",
  component: AppHeader,
  parameters: { layout: "fullscreen" },
  args: {
    links: [
      { label: "Comprar", href: "#comprar", active: true },
      { label: "Favoritos", href: "#favoritos" },
    ],
    actions: (
      <Button variant="secondary" size="sm">
        Entrar
      </Button>
    ),
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const BrandOnly: Story = { args: { links: [], actions: undefined } };
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
