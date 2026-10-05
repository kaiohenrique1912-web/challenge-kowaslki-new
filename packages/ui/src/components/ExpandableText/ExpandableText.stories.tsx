import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExpandableText } from "./ExpandableText.tsx";

const LONG =
  "Imóvel amplo e arejado, bem iluminado e próximo ao Atacadão Pacaembu, Faculdade Oswaldo Cruz, " +
  "caminho para o Bom Retiro. Comunica-se para o centro com diversas linhas de ônibus. O piso foi " +
  "trocado recentemente e as paredes acabaram de ser pintadas. A cozinha é espaçosa e tem bancada em " +
  "granito. A documentação está em dia e o imóvel está pronto para financiamento.";

const meta = {
  title: "Base/ExpandableText",
  component: ExpandableText,
  args: { text: LONG },
  decorators: [(Story) => <div style={{ width: 640 }}>{Story()}</div>],
} satisfies Meta<typeof ExpandableText>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clique em "Ver mais". */
export const Collapsed: Story = {};
export const ShortText: Story = { args: { text: "Apartamento reformado, pronto para morar." } };
export const ThreeLines: Story = { args: { lines: 3 } };
