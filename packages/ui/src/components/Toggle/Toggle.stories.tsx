import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Toggle, type ToggleProps } from "./Toggle.tsx";

function Controlled(props: Omit<ToggleProps, "onChange">) {
  const [checked, setChecked] = useState(props.checked);
  return <Toggle {...props} checked={checked} onChange={setChecked} />;
}

const meta = {
  title: "Base/Toggle",
  component: Toggle,
  args: { label: "Notificações no app", checked: true, onChange: () => {} },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {};
export const Off: Story = { args: { checked: false } };
export const WithDescription: Story = {
  args: {
    label: "Compre já alugado",
    description: "Mostrar só imóveis vendidos com inquilino",
    checked: false,
  },
};
export const Disabled: Story = { args: { disabled: true } };
