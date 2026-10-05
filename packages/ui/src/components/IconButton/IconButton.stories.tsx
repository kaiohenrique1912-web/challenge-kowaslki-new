import type { Meta, StoryObj } from "@storybook/react-vite";
import { ICON_NAMES, Icon } from "../../icons/Icon.tsx";
import { IconButton } from "./IconButton.tsx";

const meta = {
  title: "Base/IconButton",
  component: IconButton,
  args: { icon: "close", label: "Fechar" },
  argTypes: { icon: { control: "select", options: ICON_NAMES } },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {};
export const Muted: Story = { args: { variant: "muted", icon: "chevronRight", label: "Próximo" } };
export const OnPhoto: Story = {
  args: { variant: "surface", icon: "share", label: "Compartilhar" },
  parameters: { backgrounds: { value: "dark" } },
  globals: { backgrounds: { value: "dark" } },
};
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = { args: { disabled: true, icon: "chevronLeft", label: "Anterior" } };

/** Todos os ícones disponíveis em `Icon`. */
export const IconGallery: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 96px)", gap: 16 }}>
      {ICON_NAMES.map((name) => (
        <div key={name} style={{ display: "grid", justifyItems: "center", gap: 4, fontSize: 12 }}>
          <Icon name={name} size={24} />
          {name}
        </div>
      ))}
    </div>
  ),
};
