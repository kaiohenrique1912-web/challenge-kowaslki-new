import { searchResultsHeading } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SortMenu } from "../SortMenu/SortMenu.tsx";
import { ResultsHeader } from "./ResultsHeader.tsx";

const heading = searchResultsHeading({
  count: 7887,
  types: ["APARTMENT"],
  minBedrooms: 3,
  neighborhoodName: "Pinheiros",
});

const meta = {
  title: "Domain/ResultsHeader",
  component: ResultsHeader,
  parameters: { layout: "padded" },
  args: { ...heading, actions: <SortMenu value="RELEVANCE" onChange={() => {}} /> },
  decorators: [(Story) => <div style={{ width: 820 }}>{Story()}</div>],
} satisfies Meta<typeof ResultsHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithFilters: Story = {};
export const WholeCity: Story = { args: searchResultsHeading({ count: 58248 }) };
export const Loading: Story = { args: { loading: true } };
