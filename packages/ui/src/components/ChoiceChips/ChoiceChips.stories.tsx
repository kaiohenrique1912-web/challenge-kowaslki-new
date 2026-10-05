import { PUBLISHED_WITHIN, PUBLISHED_WITHIN_LABELS, type PublishedWithin } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ChoiceChips } from "./ChoiceChips.tsx";

function YesNo() {
  const [value, setValue] = useState<boolean | undefined>(undefined);
  return (
    <ChoiceChips
      label="Mobiliado"
      value={value}
      onChange={setValue}
      options={[
        { value: undefined, label: "Tanto faz" },
        { value: true, label: "Sim" },
        { value: false, label: "Não" },
      ]}
    />
  );
}

function Published() {
  const [value, setValue] = useState<PublishedWithin | undefined>("LAST_7_DAYS");
  return (
    <div style={{ width: 460 }}>
      <ChoiceChips
        label="Data de publicação"
        value={value}
        onChange={setValue}
        options={[
          { value: undefined, label: "Tanto faz" },
          ...PUBLISHED_WITHIN.map((v) => ({ value: v, label: PUBLISHED_WITHIN_LABELS[v] })),
        ]}
      />
    </div>
  );
}

const meta = {
  title: "Base/ChoiceChips",
  component: ChoiceChips,
  args: { label: "", options: [], value: undefined, onChange: () => {} },
} satisfies Meta<typeof ChoiceChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AnyYesNo: Story = { render: () => <YesNo /> };
export const PublicationDate: Story = { render: () => <Published /> };
