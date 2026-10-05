import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchAlertDialog } from "./SearchAlertDialog.tsx";

const meta = {
  title: "Domain/SearchAlertDialog",
  component: SearchAlertDialog,
  args: { open: true, onClose: () => {}, onSubmit: () => {} },
} satisfies Meta<typeof SearchAlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Saving: Story = { args: { status: "saving" } };
export const Saved: Story = { args: { status: "saved" } };
export const ErrorState: Story = {
  args: { status: "error", errorMessage: "Escolha pelo menos uma forma de receber o alerta." },
};
