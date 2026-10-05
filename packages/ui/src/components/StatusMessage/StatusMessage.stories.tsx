import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { StatusMessage } from "./StatusMessage.tsx";

const meta = {
  title: "Base/StatusMessage",
  component: StatusMessage,
  args: {
    title: "Nenhum imóvel encontrado",
    description: "Tente remover alguns filtros ou mover o mapa para outra região.",
    action: <Button variant="secondary">Limpar filtros</Button>,
  },
} satisfies Meta<typeof StatusMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const ErrorState: Story = {
  args: {
    tone: "error",
    title: "Não foi possível carregar os imóveis",
    description: "Verifique sua conexão e tente novamente.",
    action: <Button variant="secondary">Tentar novamente</Button>,
  },
};
export const WithoutAction: Story = { args: { action: undefined } };
