import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button.tsx";
import { Pagination } from "./Pagination.tsx";

const meta = {
  title: "Base/Pagination",
  component: Pagination,
  args: { page: 5, totalPages: 20, onPageChange: () => {} },
  render: function Render(args) {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Middle: Story = {};
export const FirstPage: Story = { args: { page: 1 } };
export const FewPages: Story = { args: { page: 2, totalPages: 3 } };

/** Padrão usado na busca (o original não tem páginas numeradas). */
export const LoadMore: Story = {
  render: () => (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <Button variant="secondary">Ver mais</Button>
      <Button variant="secondary" loading>
        Ver mais
      </Button>
    </div>
  ),
};
