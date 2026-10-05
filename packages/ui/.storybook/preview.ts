import type { Preview } from "@storybook/react-vite";
import "../src/styles/global.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    // Painel "Accessibility" (axe): violações aparecem como erro.
    a11y: { test: "error" },
    backgrounds: {
      options: {
        light: { name: "Branco", value: "#ffffff" },
        muted: { name: "Cinza", value: "#f3f3f3" },
        dark: { name: "Escuro", value: "#1f1f1f" },
      },
    },
    controls: { expanded: true },
  },
  initialGlobals: {
    backgrounds: { value: "light" },
  },
};

export default preview;
