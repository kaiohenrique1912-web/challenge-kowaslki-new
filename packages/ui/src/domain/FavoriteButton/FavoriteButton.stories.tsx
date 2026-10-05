import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FavoriteButton } from "./FavoriteButton.tsx";

const meta = {
  title: "Domain/FavoriteButton",
  component: FavoriteButton,
  args: { favorite: false, onToggle: () => {} },
  render: function Render(args) {
    const [favorite, setFavorite] = useState(args.favorite);
    return <FavoriteButton {...args} favorite={favorite} onToggle={setFavorite} />;
  },
} satisfies Meta<typeof FavoriteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotFavorite: Story = {};
export const Favorite: Story = { args: { favorite: true } };
export const OnPhoto: Story = {
  args: { variant: "surface" },
  decorators: [(Story) => <div style={{ background: "#8d6346", padding: 24 }}>{Story()}</div>],
};
export const WithLabel: Story = { args: { showLabel: true } };
export const Disabled: Story = { args: { disabled: true } };
