/**
 * Teste de fumaça de ponta a ponta no navegador real (Chrome/Edge instalados, via Playwright).
 * Pré-requisito: `bun run dev` rodando (api + web) e banco populado (`bun run seed`).
 * Uso: `bun run e2e` (raiz). Variáveis: E2E_URL (padrão http://localhost:5173), CHROME_PATH,
 * HEADED=1 (abre a janela). Prints de cada passo em apps/web/e2e/screenshots/ (fora do git).
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "playwright-core";
import { BASE_URL as BASE, launchBrowser, settle } from "./browser.ts";

const SHOTS = join(import.meta.dir, "screenshots");
mkdirSync(SHOTS, { recursive: true });

const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
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
      error: error instanceof Error ? error.message.split("\n")[0] : String(error),
    });
  }
  shot += 1;
  await page
    .screenshot({
      path: join(SHOTS, `${String(shot).padStart(2, "0")}-${name.replace(/\W+/g, "-")}.png`),
    })
    .catch(() => {});
}

const TIMEOUT = { timeout: 10_000 };
const waitForUrl = (p: Page, fragment: string) =>
  p.waitForFunction((f) => location.href.includes(f), fragment, TIMEOUT);
const waitForUrlWithout = (p: Page, fragment: string) =>
  p.waitForFunction((f) => !location.href.includes(f), fragment, TIMEOUT);
const waitForText = (p: Page, text: string) =>
  p.waitForFunction((t) => document.body.innerText.includes(t), text, TIMEOUT);
const cardCount = (p: Page) => p.locator("article.qa-property-card").count();
/** Clica no primeiro botão cujo texto começa com `text` dentro de `scope`. */
async function clickButton(p: Page, text: string, scope = "body") {
  const clicked = await p.evaluate(
    ([t, s]) => {
      const root = document.querySelector(s) ?? document.body;
      const button = [...root.querySelectorAll("button")].find((b) =>
        b.textContent?.trim().startsWith(t),
      );
      button?.click();
      return Boolean(button);
    },
    [text, scope] as const,
  );
  if (!clicked) throw new Error(`botão "${text}" não encontrado`);
}
const firstPrices = (p: Page) =>
  p.$$eval(".qa-price__sale", (els) =>
    els.slice(0, 6).map((e) => Number((e.textContent ?? "").replace(/\D/g, ""))),
  );
const goto = (url: string) => page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });

await step("home busca por quartos", async () => {
  await goto("/");
  await waitForText(page, "Compre um lar para chamar de seu");
  await page.getByLabel("Quartos").selectOption("3");
  await page.getByRole("button", { name: "Buscar imóveis" }).click();
  await waitForUrl(page, "/comprar/imovel?quartos=3");
  await waitForText(page, "com 3 quartos à venda em São Paulo, SP");
});

await step("busca por bairro", async () => {
  await goto("/comprar/imovel/pinheiros");
  await waitForText(page, "à venda em Pinheiros, São Paulo, SP");
  if ((await cardCount(page)) < 1) throw new Error("nenhum card");
  const markers = await page.locator(".leaflet-marker-icon").count();
  if (markers < 2) throw new Error(`mapa com ${markers} marcadores`);
});

await step("hover no card destaca o mapa", async () => {
  await page.locator("article.qa-property-card").first().hover();
  await page.waitForSelector(".qa-map-cluster--highlighted", { timeout: 5_000 });
});

await step("filtro rapido de quartos", async () => {
  await clickButton(page, "Quartos", ".qa-filter-bar__chips");
  await page.waitForSelector('[role="dialog"][aria-label="Quartos"]');
  await settle(page);
  await page.click('[role="dialog"][aria-label="Quartos"] [aria-label="3 ou mais"]');
  await page.waitForFunction(
    () => /Ver [\d.]+ imóve/.test(document.querySelector(".qa-popover__footer")?.textContent ?? ""),
    undefined,
    TIMEOUT,
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
  await page.waitForTimeout(500);
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
    before,
    TIMEOUT,
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
    undefined,
    TIMEOUT,
  );
  await clickButton(page, "Ver", ".qa-dialog__footer");
  await waitForUrl(page, "itens=pool");
});

await step("chip do mapa remove filtro", async () => {
  await page.click('[aria-label="Remover filtro Piscina"]');
  await waitForUrlWithout(page, "itens=pool");
});

await step("mover o mapa busca na area", async () => {
  const box = await page.locator(".search-map__canvas").boundingBox();
  if (!box) throw new Error("mapa sem tamanho");
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  await page.mouse.move(center.x - 150, center.y - 80, { steps: 12 });
  await page.mouse.up();
  await waitForUrl(page, "area-mapa=");
  await waitForText(page, "à venda em Pinheiros"); // o bairro continua como contexto
});

await step("desenhar area de busca", async () => {
  await page.getByRole("button", { name: "Desenhar área de busca" }).click();
  const box = await page.locator(".search-map__canvas").boundingBox();
  if (!box) throw new Error("mapa sem tamanho");
  const at = (x: number, y: number) => ({ x: box.x + box.width * x, y: box.y + box.height * y });
  const path = [at(0.3, 0.3), at(0.7, 0.3), at(0.7, 0.7), at(0.3, 0.7), at(0.3, 0.32)];
  const [start, ...rest] = path;
  if (!start) return;
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (const point of rest) await page.mouse.move(point.x, point.y, { steps: 10 });
  await page.mouse.up();
  await waitForUrl(page, "area-desenhada=");
  await waitForText(page, "à venda na área desenhada no mapa");
  if (page.url().includes("/pinheiros")) throw new Error("o desenho deveria substituir o bairro");
  await page.getByRole("button", { name: "Apagar desenho" }).click();
  await waitForUrlWithout(page, "area-desenhada=");
});

await step("criar alerta de imovel", async () => {
  await page.getByRole("button", { name: "Criar alerta de imóvel" }).click();
  await page.getByRole("dialog").waitFor();
  await settle(page);
  await page.getByRole("switch", { name: "Whatsapp" }).click();
  await page.getByRole("button", { name: "Criar alerta de imóveis" }).click();
  await waitForText(page, "Alerta criado!");
  await page.getByRole("button", { name: "Continuar buscando" }).click();
});

await step("autocomplete de bairro", async () => {
  await page.click('.qa-filter-bar input[role="combobox"]');
  await page.keyboard.type("moema", { delay: 30 });
  await page.waitForSelector('[role="option"]', TIMEOUT);
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
  await goto("/comprar/imovel/se?preco-max=60000&quartos=4");
  await waitForText(page, "Nenhum imóvel encontrado");
});

await step("estado de erro", async () => {
  expectingErrors = true;
  await page.route("**/graphql", (route) =>
    route.request().postData()?.includes("SearchProperties")
      ? route.fulfill({ status: 500, contentType: "application/json", body: "{}" })
      : route.continue(),
  );
  await goto("/comprar/imovel/pinheiros?quartos=2");
  await waitForText(page, "Não foi possível carregar os imóveis");
  await page.unroute("**/graphql");
  expectingErrors = false;
});

await step("url invalida nao quebra a pagina", async () => {
  await goto("/comprar/imovel?quartos=99&ordem=xyz&preco-min=abc");
  await waitForText(page, "à venda em São Paulo, SP");
});

/** Botão "Favoritos (N)" do cabeçalho. */
const FAVORITES_BUTTON = ".qa-app-header__actions button";
const favoritesButtonText = () =>
  page.locator(FAVORITES_BUTTON, { hasText: "Favoritos" }).innerText();

await step("favoritar no card atualiza o cabecalho", async () => {
  await goto("/comprar/imovel/pinheiros?quartos=2");
  await page.locator("article.qa-property-card button.qa-favorite").first().click();
  await page.waitForSelector('article.qa-property-card button.qa-favorite[aria-pressed="true"]');
  await page.waitForFunction(
    (sel) =>
      [...document.querySelectorAll(sel)].some((b) => b.textContent?.includes("Favoritos (1)")),
    FAVORITES_BUTTON,
    TIMEOUT,
  );
});

await step("ver favoritos lista so favoritos", async () => {
  await clickButton(page, "Favoritos", ".qa-app-header__actions");
  await waitForUrl(page, "favoritos=sim");
  await waitForText(page, "nos seus favoritos");
  await page.waitForFunction(
    () => document.querySelectorAll("article.qa-property-card").length === 1,
    undefined,
    TIMEOUT,
  );
});

await step("detalhe do imovel com galeria", async () => {
  await page.click("article.qa-property-card a.qa-property-card__link");
  await waitForUrl(page, "/imovel/");
  await waitForText(page, "Descrição do proprietário");
  for (const text of ["Itens disponíveis", "Condo. + IPTU", "Localização", "Publicado"]) {
    await waitForText(page, text);
  }
  // O pane do Leaflet tem 0×0 px (os tiles ficam dentro): basta existir.
  await page.waitForSelector(".property-map .leaflet-tile-pane", { state: "attached" });
  await clickButton(page, "", ".qa-gallery__bottom"); // "N Fotos"
  await page.waitForSelector(".qa-gallery__viewer img");
  await settle(page);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector(".qa-gallery__viewer"));
});

await step("acao fora do escopo mostra aviso", async () => {
  await clickButton(page, "Converse conosco agora");
  await waitForText(page, "não faz parte deste projeto");
  await page.getByRole("button", { name: "Entendi" }).click();
});

await step("voltar para a busca mantem os filtros", async () => {
  await clickButton(page, "Voltar para a busca");
  await waitForUrl(page, "favoritos=sim");
  // "Ver favoritos" do cabeçalho mostra todos os favoritos: o voltar volta exatamente para ela.
  if (new URL(page.url()).search !== "?favoritos=sim")
    throw new Error(`URL inesperada: ${page.url()}`);
});

await step("desfavoritar no detalhe", async () => {
  await page.click("article.qa-property-card a.qa-property-card__link");
  await waitForText(page, "Descrição do proprietário");
  await clickButton(page, "Favoritado", ".qa-price-summary");
  await page.waitForFunction(
    (sel) => [...document.querySelectorAll(sel)].some((b) => b.textContent?.trim() === "Favoritos"),
    FAVORITES_BUTTON,
    TIMEOUT,
  );
  if ((await favoritesButtonText()).includes("(")) throw new Error("contador não zerou");
});

await step("imovel inexistente", async () => {
  await goto("/imovel/123");
  await waitForText(page, "Imóvel não encontrado");
});

await step("mobile alterna lista e mapa", async () => {
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const m = await mobile.newPage();
  await m.goto(`${BASE}/comprar/imovel/pinheiros`, { waitUntil: "networkidle" });
  await waitForText(m, "à venda em Pinheiros");
  const listDisplay = () =>
    m.$eval(".qa-search-layout__list", (el) => getComputedStyle(el).display);
  const mapHidden = await m.$eval(
    ".qa-search-layout__map",
    (el) => getComputedStyle(el).display === "none",
  );
  if (!mapHidden) throw new Error("mapa deveria estar escondido no modo Lista");
  await m.click('.qa-search-layout__toggle [role="radio"]:last-child');
  await m.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".qa-search-layout__list") as Element).display ===
      "none",
  );
  await m.waitForFunction(
    () => document.querySelectorAll(".leaflet-marker-icon").length > 1,
    undefined,
    TIMEOUT,
  );
  if (m.url().includes("area-mapa"))
    throw new Error("mostrar o mapa não pode virar busca por área");
  // O botão "Lista" precisa continuar visível por cima do mapa (não coberto pelo Leaflet).
  const toggleOnTop = await m.$eval(".qa-search-layout__toggle", (el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 4, r.y + r.height / 2);
    return Boolean(hit && el.contains(hit));
  });
  if (!toggleOnTop) throw new Error("botão Lista/Mapa está coberto pelo mapa");
  await m.click('.qa-search-layout__toggle [role="radio"]:first-child');
  await m.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".qa-search-layout__list") as Element).display !==
      "none",
  );
  if ((await listDisplay()) === "none") throw new Error("lista não voltou");
  await m.screenshot({ path: join(SHOTS, "mobile-lista.png") });
  await mobile.close();
});

await browser.close();

const failed = results.filter((r) => !r.ok);
for (const r of results)
  console.log(`${r.ok ? "✔" : "✘"} ${r.name}${r.error ? ` — ${r.error}` : ""}`);
if (consoleErrors.length)
  console.log(`\nErros no console do navegador:\n${consoleErrors.slice(0, 10).join("\n")}`);
console.log(`\n${results.length - failed.length}/${results.length} passos ok. Prints em ${SHOTS}`);
process.exit(failed.length > 0 ? 1 : 0);
