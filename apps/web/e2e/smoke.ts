/**
 * Teste de fumaça de ponta a ponta no navegador real (Chrome/Edge instalados, via puppeteer-core).
 * Pré-requisito: `bun run dev` rodando (api + web) e banco populado (`bun run seed`).
 * Uso: `bun run e2e` (raiz). Variáveis: E2E_URL (padrão http://localhost:5173), CHROME_PATH.
 * Prints de cada passo em apps/web/e2e/screenshots/ (fora do git).
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer, { type Page } from "puppeteer-core";

const BASE = process.env.E2E_URL ?? "http://localhost:5173";
const SHOTS = join(import.meta.dir, "screenshots");
mkdirSync(SHOTS, { recursive: true });

const BROWSERS = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter((p): p is string => Boolean(p));
const executablePath = BROWSERS.find((p) => existsSync(p));
if (!executablePath) {
  console.error("Nenhum Chrome/Edge encontrado. Defina CHROME_PATH.");
  process.exit(1);
}

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const consoleErrors: string[] = [];
/** Ligado durante o passo que simula a API fora do ar (os 500 são esperados). */
let expectingErrors = false;
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error" && !expectingErrors && !m.text().includes("tile.openstreetmap")) {
    consoleErrors.push(m.text());
  }
});

const results: { name: string; ok: boolean; error?: string }[] = [];
let shot = 0;
async function step(name: string, run: () => Promise<void>) {
  try {
    await run();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  shot += 1;
  await page
    .screenshot({
      path: join(SHOTS, `${String(shot).padStart(2, "0")}-${name.replace(/\W+/g, "-")}.png`),
    })
    .catch(() => {});
}

const waitForUrl = (p: Page, fragment: string) =>
  p.waitForFunction((f) => location.href.includes(f), { timeout: 10_000 }, fragment);
const waitForUrlWithout = (p: Page, fragment: string) =>
  p.waitForFunction((f) => !location.href.includes(f), { timeout: 10_000 }, fragment);
const waitForText = (p: Page, text: string) =>
  p.waitForFunction((t) => document.body.innerText.includes(t), { timeout: 10_000 }, text);
const cardCount = (p: Page) => p.$$eval("article.qa-property-card", (els) => els.length);
async function clickButton(p: Page, text: string, scope = "body") {
  const clicked = await p.evaluate(
    (t, s) => {
      const root = document.querySelector(s) ?? document.body;
      const button = [...root.querySelectorAll("button")].find((b) =>
        b.textContent?.trim().startsWith(t),
      );
      button?.click();
      return Boolean(button);
    },
    text,
    scope,
  );
  if (!clicked) throw new Error(`botão "${text}" não encontrado`);
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Espera as animações CSS (abertura de painéis) terminarem antes de clicar por coordenada. */
const settle = (p: Page) =>
  p.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"), {
    timeout: 5_000,
  });
const firstPrices = (p: Page) =>
  p.$$eval(".qa-price__sale", (els) =>
    els.slice(0, 6).map((e) => Number((e.textContent ?? "").replace(/\D/g, ""))),
  );

await step("busca por bairro", async () => {
  await page.goto(`${BASE}/comprar/imovel/pinheiros`, { waitUntil: "networkidle0" });
  await waitForText(page, "à venda em Pinheiros, São Paulo, SP");
  if ((await cardCount(page)) < 1) throw new Error("nenhum card");
  const markers = await page.$$eval(".leaflet-marker-icon", (els) => els.length);
  if (markers < 2) throw new Error(`mapa com ${markers} marcadores`);
});

await step("hover no card destaca o mapa", async () => {
  await page.hover("article.qa-property-card");
  await page.waitForSelector(".qa-map-cluster--highlighted", { timeout: 5_000 });
});

await step("filtro rapido de quartos", async () => {
  await clickButton(page, "Quartos", ".qa-filter-bar__chips");
  await page.waitForSelector('[role="dialog"][aria-label="Quartos"]');
  await settle(page);
  await page.click('[role="dialog"][aria-label="Quartos"] [aria-label="3 ou mais"]');
  await page.waitForFunction(
    () => /Ver [\d.]+ imóve/.test(document.querySelector(".qa-popover__footer")?.textContent ?? ""),
    { timeout: 10_000 },
  );
  await clickButton(page, "Ver", ".qa-popover__footer");
  await waitForUrl(page, "quartos=3");
  await waitForText(page, "com 3 quartos à venda em Pinheiros");
});

await step("ordenacao menor valor", async () => {
  await page.click('button[aria-haspopup="menu"]');
  await page.waitForSelector('[role="menuitemradio"]');
  await settle(page);
  await clickButton(page, "Menor valor", '[role="menu"]');
  await waitForUrl(page, "ordem=menor-valor");
  await page.waitForFunction(() => document.querySelectorAll(".qa-price__sale").length > 1);
  await sleep(500);
  const prices = await firstPrices(page);
  if (prices.some((v, i) => i > 0 && v < (prices[i - 1] ?? 0))) {
    throw new Error(`preços fora de ordem: ${prices.join(", ")}`);
  }
});

await step("ver mais carrega a proxima pagina", async () => {
  const before = await cardCount(page);
  await clickButton(page, "Ver mais");
  await page.waitForFunction(
    (n) => document.querySelectorAll("article.qa-property-card").length > n,
    {},
    before,
  );
});

await step("botao voltar desfaz a ordenacao", async () => {
  await page.goBack();
  await waitForUrlWithout(page, "ordem=");
  if (!page.url().includes("quartos=3")) throw new Error(`URL inesperada: ${page.url()}`);
});

await step("mais filtros com comodidade", async () => {
  await clickButton(page, "Mais filtros");
  await page.waitForSelector('[role="dialog"][aria-modal="true"]');
  await settle(page);
  await page.evaluate(() => {
    const label = [...document.querySelectorAll('[role="dialog"] label')].find(
      (l) => l.textContent?.trim() === "Piscina",
    ) as HTMLLabelElement | undefined;
    label?.click();
  });
  await page.waitForFunction(
    () => /Ver [\d.]+ imóve/.test(document.querySelector(".qa-dialog__footer")?.textContent ?? ""),
    { timeout: 10_000 },
  );
  await clickButton(page, "Ver", ".qa-dialog__footer");
  await waitForUrl(page, "itens=pool");
});

await step("chip do mapa remove filtro", async () => {
  await page.click('[aria-label="Remover filtro Piscina"]');
  await waitForUrlWithout(page, "itens=pool");
});

await step("mover o mapa busca na area", async () => {
  const box = await page.$eval(".search-map__canvas", (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await page.mouse.move(box.x - 150, box.y - 80, { steps: 12 });
  await page.mouse.up();
  await waitForUrl(page, "area-mapa=");
  await waitForText(page, "à venda em Pinheiros"); // o bairro continua como contexto
});

await step("autocomplete de bairro", async () => {
  await page.click('input[role="combobox"]');
  await page.keyboard.type("moema", { delay: 30 });
  await page.waitForSelector('[role="option"]', { timeout: 10_000 });
  await page.keyboard.press("ArrowDown");
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[role="option"]')].some((o) => o.textContent?.includes("Moema")),
  );
  await page.evaluate(() => {
    const option = [...document.querySelectorAll('[role="option"]')].find((o) =>
      o.textContent?.startsWith("Moema"),
    );
    option?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  });
  await waitForUrl(page, "/comprar/imovel/moema");
  if (page.url().includes("area-mapa"))
    throw new Error("trocar de bairro deveria limpar a área do mapa");
  await waitForText(page, "à venda em Moema");
});

await step("estado vazio", async () => {
  await page.goto(`${BASE}/comprar/imovel/se?preco-max=60000&quartos=4`, {
    waitUntil: "networkidle0",
  });
  await waitForText(page, "Nenhum imóvel encontrado");
});

await step("estado de erro", async () => {
  expectingErrors = true;
  await page.setRequestInterception(true);
  const block = (request: import("puppeteer-core").HTTPRequest) => {
    if (request.url().endsWith("/graphql") && request.postData()?.includes("SearchProperties")) {
      void request.respond({ status: 500, contentType: "application/json", body: "{}" });
    } else void request.continue();
  };
  page.on("request", block);
  await page.goto(`${BASE}/comprar/imovel/pinheiros?quartos=2`, { waitUntil: "networkidle0" });
  await waitForText(page, "Não foi possível carregar os imóveis");
  page.off("request", block);
  await page.setRequestInterception(false);
  expectingErrors = false;
});

await step("url invalida nao quebra a pagina", async () => {
  await page.goto(`${BASE}/comprar/imovel?quartos=99&ordem=xyz&preco-min=abc`, {
    waitUntil: "networkidle0",
  });
  await waitForText(page, "à venda em São Paulo, SP");
});

const FAVORITES_LINK = '.qa-app-header__nav a[href="/comprar/imovel?favoritos=sim"]';
const favoritesLinkText = (p: Page) => p.$eval(FAVORITES_LINK, (el) => el.textContent ?? "");

await step("favoritar no card atualiza o cabecalho", async () => {
  await page.goto(`${BASE}/comprar/imovel/pinheiros?quartos=2`, { waitUntil: "networkidle0" });
  await page.waitForSelector("article.qa-property-card button.qa-favorite");
  await page.click("article.qa-property-card button.qa-favorite");
  await page.waitForSelector('article.qa-property-card button.qa-favorite[aria-pressed="true"]');
  await page.waitForFunction(
    (sel) => document.querySelector(sel)?.textContent?.includes("Favoritos (1)"),
    { timeout: 10_000 },
    FAVORITES_LINK,
  );
});

await step("ver favoritos lista so favoritos", async () => {
  await clickButton(page, "Favoritos", ".qa-filter-bar");
  await waitForUrl(page, "favoritos=sim");
  await waitForText(page, "nos seus favoritos");
  await page.waitForFunction(
    () => document.querySelectorAll("article.qa-property-card").length === 1,
    {
      timeout: 10_000,
    },
  );
});

await step("detalhe do imovel com galeria", async () => {
  await page.click("article.qa-property-card a.qa-property-card__link");
  await waitForUrl(page, "/imovel/");
  await waitForText(page, "Descrição do proprietário");
  for (const text of ["Itens disponíveis", "Condo. + IPTU", "Localização", "Publicado"]) {
    await waitForText(page, text);
  }
  await page.waitForSelector(".property-map .leaflet-tile-pane");
  await clickButton(page, "", ".qa-gallery__bottom"); // "N Fotos"
  await page.waitForSelector(".qa-gallery__viewer img");
  await settle(page);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector(".qa-gallery__viewer"));
});

await step("voltar para a busca mantem os filtros", async () => {
  await clickButton(page, "Voltar para a busca");
  await waitForUrl(page, "favoritos=sim");
  if (!page.url().includes("quartos=2")) throw new Error(`filtros perdidos: ${page.url()}`);
});

await step("desfavoritar no detalhe", async () => {
  await page.click("article.qa-property-card a.qa-property-card__link");
  await waitForText(page, "Descrição do proprietário");
  await clickButton(page, "Favoritado", ".qa-price-summary");
  await page.waitForFunction(
    (sel) => document.querySelector(sel)?.textContent?.trim() === "Favoritos",
    { timeout: 10_000 },
    FAVORITES_LINK,
  );
  if ((await favoritesLinkText(page)).includes("(")) throw new Error("contador não zerou");
});

await step("imovel inexistente", async () => {
  await page.goto(`${BASE}/imovel/123`, { waitUntil: "networkidle0" });
  await waitForText(page, "Imóvel não encontrado");
});

await step("mobile alterna lista e mapa", async () => {
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}/comprar/imovel/pinheiros`, { waitUntil: "networkidle0" });
  await waitForText(page, "à venda em Pinheiros");
  const mapHidden = await page.$eval(
    ".qa-search-layout__map",
    (el) => getComputedStyle(el).display === "none",
  );
  if (!mapHidden) throw new Error("mapa deveria estar escondido no modo Lista");
  await page.click('.qa-search-layout__toggle [role="radio"]:last-child');
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".qa-search-layout__list") as Element).display ===
      "none",
  );
  await page.waitForFunction(() => document.querySelectorAll(".leaflet-marker-icon").length > 1, {
    timeout: 10_000,
  });
  if (page.url().includes("area-mapa"))
    throw new Error("mostrar o mapa não pode virar busca por área");
  // O botão "Lista" precisa continuar visível por cima do mapa (não coberto pelo Leaflet).
  const toggleOnTop = await page.$eval(".qa-search-layout__toggle", (el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 4, r.y + r.height / 2);
    return Boolean(hit && el.contains(hit));
  });
  if (!toggleOnTop) throw new Error("botão Lista/Mapa está coberto pelo mapa");
  await page.click('.qa-search-layout__toggle [role="radio"]:first-child');
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".qa-search-layout__list") as Element).display !==
      "none",
  );
});

await browser.close();

const failed = results.filter((r) => !r.ok);
for (const r of results)
  console.log(`${r.ok ? "✔" : "✘"} ${r.name}${r.error ? ` — ${r.error}` : ""}`);
if (consoleErrors.length)
  console.log(`\nErros no console do navegador:\n${consoleErrors.slice(0, 10).join("\n")}`);
console.log(`\n${results.length - failed.length}/${results.length} passos ok. Prints em ${SHOTS}`);
process.exit(failed.length > 0 ? 1 : 0);
