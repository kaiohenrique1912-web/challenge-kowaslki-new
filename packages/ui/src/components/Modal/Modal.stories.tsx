import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button.tsx";
import { Modal } from "./Modal.tsx";

const meta = {
  title: "Base/Modal",
  component: Modal,
  args: {
    open: true,
    onClose: () => {},
    title: "Compartilhar imóvel",
    children: <p>O link do imóvel foi copiado para a área de transferência.</p>,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        <Modal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const WithFooter: Story = {
  args: {
    title: "Remover dos favoritos?",
    children: <p>O imóvel sai da sua lista de favoritos.</p>,
    footer: (
      <>
        <Button variant="link">Cancelar</Button>
        <Button>Remover</Button>
      </>
    ),
  },
};
export const Closed: Story = { args: { open: false } };
