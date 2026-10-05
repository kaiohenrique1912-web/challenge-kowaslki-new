/**
 * Utilitários comuns dos testes no navegador (smoke.ts e visual.ts), via Playwright usando o
 * Chrome ou Edge já instalado — nada de baixar navegador.
 */
import { type Browser, chromium, type Page } from "playwright-core";

export const BASE_URL = process.env.E2E_URL ?? "http://localhost:5173";

/** Abre o Chrome instalado; se não houver, o Edge; ou o executável em CHROME_PATH. */
export async function launchBrowser(): Promise<Browser> {
  const headless = process.env.HEADED !== "1";
  if (process.env.CHROME_PATH) {
    return chromium.launch({ executablePath: process.env.CHROME_PATH, headless });
  }
  for (const channel of ["chrome", "msedge"]) {
    try {
      return await chromium.launch({ channel, headless });
    } catch {
      // tenta o próximo
    }
  }
  console.error("Nenhum Chrome/Edge encontrado. Instale um deles ou defina CHROME_PATH.");
  process.exit(1);
}

/** Espera transições e animações CSS terminarem (popover, drawer, modal). */
export async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
  );
  await page.waitForTimeout(150);
}

/** Espera a lista de resultados (ou o estado vazio) aparecer e o mapa carregar. */
export async function waitForResults(page: Page) {
  await page
    .locator("article.qa-property-card, .qa-status-message")
    .first()
    .waitFor({ timeout: 15_000 });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
}

/** Monta uma imagem lado a lado (esquerda × direita, mesma largura de exibição). */
export async function composeSideBySide(
  browser: Browser,
  opts: {
    left: { label: string; path: string };
    right: { label: string; path: string };
    out: string;
  },
) {
  const { readFileSync } = await import("node:fs");
  const url = (path: string) =>
    `data:${path.endsWith(".png") ? "image/png" : "image/jpeg"};base64,${readFileSync(path).toString("base64")}`;
  const page = await browser.newPage({ viewport: { width: 1920, height: 800 } });
  await page.setContent(`<!doctype html><body style="margin:0;font:600 18px system-ui;background:#fff">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:12px">
      <div>${opts.left.label}</div><div>${opts.right.label}</div>
      <img src="${url(opts.left.path)}" style="width:100%;outline:1px solid #ccc">
      <img src="${url(opts.right.path)}" style="width:100%;outline:1px solid #ccc">
    </div></body>`);
  await page.screenshot({ path: opts.out, fullPage: true });
  await page.close();
}
