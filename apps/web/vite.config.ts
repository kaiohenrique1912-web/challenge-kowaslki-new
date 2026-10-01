import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // O navegador chama /graphql na mesma origem; o Vite repassa para a API (sem CORS).
    proxy: { "/graphql": apiUrl },
  },
});
