/**
 * Check-up contra o site AO VIVO do QuintoAndar (skill /checkup-original).
 *
 * Roda as MESMAS sondas no original (www.quintoandar.com.br) e no nosso site e compara o que dá
 * para medir: ordem e texto dos chips, conteúdo e valores padrão do "Mais filtros", tipografia
 * e medidas da página, comportamento do hover nas bolinhas do mapa e do teclado no
 * autocomplete. Também tira prints dos mesmos estados nos dois sites, lado a lado.
 * Complementa `bun run visual` (que compara com prints parados em docs/reference/).
 *
 * Acesso ao original autorizado pelo QuintoAndar para este projeto. Seja gentil: uma execução
 * abre poucas páginas, em sequência, sem paralelismo. Não aumente isso para raspagem de dados.
 *
 * Pré-requisito: `bun run dev` rodando. Uso: `bun run checkup` (todas as sondas) ou
 * `bun run checkup chips` (só as sondas cujo nome contém "chips").
 * Saída (fora do git): apps/web/e2e/checkup/report.md, results.json e <estado>.compare.png.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Browser, Page } from "playwright-core";
import { BASE_URL, composeSideBySide, launchBrowser, settle } from "./browser.ts";

const OUT = join(import.meta.dir, "checkup");
mkdirSync(OUT, { recursive: true });

type Site = { id: "original" | "nosso"; label: string; searchUrl: string };
const SITES: Site[] = [
  {
    id: "original",
    label: "QuintoAndar",
    searchUrl: "https://www.quintoandar.com.br/comprar/imovel/sao-paulo-sp-brasil",
  },
  { id: "nosso", label: "Nosso", searchUrl: `${BASE_URL}/comprar/imovel` },
];

/** Mesma janela dos prints de referência (notebook 1920×1080 com Windows em 125%). */
const VIEWPORT = { width: 1536, height: 694 };

/** Seletores que diferem entre os sites. Todo o resto das sondas é igual para os dois. */
const SELECTORS = {
  chips: { original: ".Cozy__ChipFilterModal", nosso: ".qa-filter-bar__chips .qa-chip" },
  cluster: { original: ".gmaps-cluster", nosso: ".qa-map-cluster" },
  location: {
    original: 'input[role="combobox"]',
    nosso: '.qa-filter-bar input[role="combobox"]',
  },
} as const;

type Value = string | number | boolean | null | Value[] | { [key: string]: Value };
type ProbeResult = Record<string, Value>;
type Probe = {
  name: string;
  /** O que esta sonda confere (vai para o relatório). */
  about: string;
  run: (page: Page, site: Site) => Promise<ProbeResult>;
  /** Campos só informativos (ℹ️): mostrados, mas não comparados — com o motivo. */
  info?: Record<string, string>;
  /** Campos numéricos (px) iguais dentro de ± esta tolerância. */
  tolerance?: Record<string, number>;
};

async function openSearch(page: Page, site: Site) {
  await page.goto(site.searchUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(site.id === "original" ? 4_000 : 1_000);
  // A lista do original chega depois do mapa: espera o título "N imóveis".
  await page
    .waitForFunction(() => /\d (imóve|apartamento)/.test(document.body.innerText), undefined, {
      timeout: 15_000,
    })
    .catch(() => {});
  await settle(page);
}

/** Painel aberto pelo "Mais filtros": o ancestral do botão "Ver N imóveis" (vale nos dois). */
const PANEL_SCRIPT = () => {
  const button = [...document.querySelectorAll("button")].find((b) =>
    /^Ver [\d.]+ im/.test((b.textContent ?? "").trim()),
  );
  let panel: Element | null = button ?? null;
  while (panel && panel.getBoundingClientRect().height < 400) panel = panel.parentElement;
  if (!panel) return null;
  // Folha de texto visível (ignora textos só para leitor de tela).
  const leaf = (el: Element) =>
    el.children.length === 0 &&
    (el.textContent ?? "").trim() !== "" &&
    el.getBoundingClientRect().width > 2;
  /** Opções de escolha única sem duplicar input + rótulo: o input, ou o [role=radio] sem input. */
  const isOption = (el: Element) =>
    el.matches('input[type="radio"]') ||
    (el.matches('[role="radio"]') && !el.querySelector('input[type="radio"]'));
  const optionsIn = (root: Element) =>
    [...root.querySelectorAll('input[type="radio"], [role="radio"]')].filter(isOption);
  const headings = [...panel.querySelectorAll("*")]
    .filter(
      (el) =>
        leaf(el) &&
        Number(getComputedStyle(el).fontWeight) >= 600 &&
        Number.parseFloat(getComputedStyle(el).fontSize) >= 14.5 &&
        !el.closest("button"),
    )
    .map((el) => (el.textContent ?? "").trim());
  const textInputs = [...panel.querySelectorAll("input")]
    .filter((i) => i.type === "text" || i.type === "number" || i.inputMode === "numeric")
    .map((i) => i.value || `(vazio: ${i.placeholder})`);
  const radioLabel = (el: Element) =>
    el instanceof HTMLInputElement
      ? (el.labels?.[0]?.textContent ?? el.value).trim()
      : (el.textContent ?? "").trim();
  const selected = optionsIn(panel)
    .filter((el) =>
      el instanceof HTMLInputElement ? el.checked : el.getAttribute("aria-checked") === "true",
    )
    .map(radioLabel);
  /** Opções do grupo: menor ancestral do título que contém pelo menos 2 opções. */
  const options = (group: string) => {
    const head = [...panel.querySelectorAll("*")].find(
      (el) => leaf(el) && (el.textContent ?? "").trim() === group,
    );
    const radios = optionsIn;
    let box: Element | null = head ?? null;
    while (box && radios(box).length < 2) box = box.parentElement;
    return box ? radios(box).map(radioLabel) : [];
  };
  return {
    headings,
    textInputs,
    selected,
    quartos: options("Quartos"),
    banheiros: options("Banheiros"),
    side: panel.getBoundingClientRect().left < 100 ? "esquerda" : "direita",
  };
};

const PROBES: Probe[] = [
  {
    name: "chips",
    about: "Chips rápidos da barra: ordem, texto e quais aparecem selecionados por padrão.",
    run: async (page, site) => {
      await openSearch(page, site);
      return page.$$eval(SELECTORS.chips[site.id], (chips) => {
        const backgrounds = chips.map((c) => getComputedStyle(c).backgroundColor);
        const common = backgrounds
          .slice()
          .sort(
            (a, b) =>
              backgrounds.filter((x) => x === b).length - backgrounds.filter((x) => x === a).length,
          )[0];
        return {
          labels: chips.map((c) =>
            (c.getAttribute("aria-label") ?? c.textContent ?? "").replace(/, filtrar$/, "").trim(),
          ),
          selecionados: chips
            .filter((_, i) => backgrounds[i] !== common)
            .map((c) => (c.textContent ?? "").trim()),
        };
      });
    },
  },
  {
    name: "mais-filtros",
    about:
      "Painel 'Mais filtros': lado, ordem das seções, valores padrão dos campos e opções marcadas.",
    run: async (page, site) => {
      await openSearch(page, site);
      await page
        .getByRole("button", { name: /Mais filtros/ })
        .first()
        .click();
      await page.waitForTimeout(1_500);
      await settle(page);
      await page.screenshot({ path: join(OUT, `mais-filtros.${site.id}.png`) });
      return (await page.evaluate(PANEL_SCRIPT)) ?? { erro: "painel não encontrado" };
    },
  },
  {
    name: "tipografia",
    about: "Fonte, tamanhos e medidas da página de busca (título, preço do card, chip, cabeçalho).",
    run: async (page, site) => {
      await openSearch(page, site);
      await page.screenshot({ path: join(OUT, `busca.${site.id}.png`) });
      return page.evaluate(() => {
        const all = [...document.querySelectorAll("body *")];
        const text = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
        /** Menor elemento visível cujo texto casa com o padrão. */
        const find = (re: RegExp) =>
          all.find(
            (el) =>
              el.getBoundingClientRect().width > 2 &&
              el.checkVisibility({ visibilityProperty: true, opacityProperty: true }) &&
              el.getBoundingClientRect().top < innerHeight && // só o que está na tela
              re.test(text(el)) &&
              ![...el.children].some((c) => re.test(text(c))),
          );
        const measure = (prefix: string, el: Element | undefined) => {
          if (!el) return { [`${prefix}`]: "não encontrado" };
          const st = getComputedStyle(el);
          return {
            [`${prefix}Tamanho`]: st.fontSize,
            [`${prefix}Peso`]: st.fontWeight,
            [`${prefix}Cor`]: st.color,
            [`${prefix}X`]: Math.round(el.getBoundingClientRect().left),
          };
        };
        // Foto do primeiro card da lista (coluna da esquerda, abaixo do cabeçalho).
        const photo = [...document.querySelectorAll("img")].find((img) => {
          const r = img.getBoundingClientRect();
          return r.width > 200 && r.top > 250 && r.right < 900;
        });
        // A "moldura" da foto: primeiro ancestral que corta o conteúdo (cantos arredondados).
        let frame: Element | null = photo ?? null;
        while (frame && getComputedStyle(frame).overflow !== "hidden") frame = frame.parentElement;
        const frameBox = frame?.getBoundingClientRect();
        const map = [...document.querySelectorAll("div")].find(
          (d) => d.getBoundingClientRect().left > 900 && d.getBoundingClientRect().height > 400,
        );
        // Aceita um prefixo só para leitor de tela ("Valor de venda: R$ 980.000").
        const price = find(/(^|: )R\$\s[\d.]+$/);
        // Título da lista: o primeiro texto "378.722" / "58.248 imóveis" no topo da lista (no
        // original o número fica num elemento próprio e "Imóveis" vira minúsculo por CSS).
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let title: Element | undefined;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const parent = node.parentElement;
          const top = parent?.getBoundingClientRect().top ?? 0;
          if (
            parent?.checkVisibility() &&
            top > 180 &&
            top < 400 &&
            (parent?.getBoundingClientRect().left ?? 0) < 400 && // início da coluna da lista
            /^\d[\d.]*(\s+(imóveis|apartamentos|imóvel))?$/i.test((node.textContent ?? "").trim())
          ) {
            title = parent;
            break;
          }
        }
        return {
          fonte:
            getComputedStyle(document.body).fontFamily.split(",")[0]?.replaceAll('"', "") ?? "",
          ...measure("titulo", title),
          ...measure("preco", price),
          ...measure("condominio", find(/^R\$\s[\d.]+ Condo\. \+ IPTU$/)),
          ...measure("maisFiltros", find(/^Mais filtros$/)?.closest("button") ?? undefined),
          fotoLargura: frameBox ? Math.round(frameBox.width) : null,
          fotoAltura: frameBox ? Math.round(frameBox.height) : null,
          fotoRaio: frame ? getComputedStyle(frame).borderTopLeftRadius : null,
          mapaX: map ? Math.round(map.getBoundingClientRect().left) : null,
        };
      });
    },
    info: {
      fonte: "fonte do original (Oatmeal Pro) é paga; usamos Albert Sans",
      fotoRaio: "o original arredonda a foto por outro meio (clip); compare em busca.compare.png",
    },
    tolerance: {
      tituloX: 4,
      precoX: 4,
      condominioX: 4,
      maisFiltrosX: 8,
      fotoLargura: 8,
      fotoAltura: 8,
      mapaX: 4,
    },
  },
  {
    name: "hover-mapa",
    about:
      "Bolinha do mapa com o mouse em cima: quanto ela se desloca (deve ficar parada) e o que muda.",
    run: async (page, site) => {
      await openSearch(page, site);
      const selector = SELECTORS.cluster[site.id];
      await page.locator(selector).first().waitFor({ timeout: 10_000 });
      // Uma bolinha com número, inteira dentro do mapa visível (longe das bordas).
      const index = await page.$$eval(selector, (els) =>
        els.findIndex((el) => {
          const r = el.getBoundingClientRect();
          return (
            /\d/.test(el.textContent ?? "") &&
            r.width > 10 &&
            r.left > 1000 &&
            r.right < innerWidth - 80 &&
            r.top > 280 &&
            r.bottom < innerHeight - 80
          );
        }),
      );
      if (index < 0) return { erro: "nenhuma bolinha visível" };
      const handle = await page.locator(selector).nth(index).elementHandle();
      if (!handle) return { erro: "nenhuma bolinha" };
      const center = () =>
        handle.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return { x: r.left + r.width / 2, y: r.top + r.height / 2, bg: s.backgroundColor };
        });
      const before = await center();
      const clip = { x: before.x - 60, y: before.y - 45, width: 120, height: 90 };
      await page.screenshot({ path: join(OUT, `hover-antes.${site.id}.png`), clip });
      // Mouse parado em cima por ~1 s; registra a posição a cada quadro (pega "tremidas").
      const record = handle.evaluate(
        (el) =>
          new Promise<{ x: number; y: number }[]>((resolve) => {
            const frames: { x: number; y: number }[] = [];
            const start = performance.now();
            const tick = () => {
              const r = el.getBoundingClientRect();
              frames.push({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              if (performance.now() - start < 1_000) requestAnimationFrame(tick);
              else resolve(frames);
            };
            requestAnimationFrame(tick);
          }),
      );
      await page.mouse.move(before.x, before.y, { steps: 5 });
      const frames = await record;
      const after = await center();
      await page.screenshot({ path: join(OUT, `hover-depois.${site.id}.png`), clip });
      const drift = Math.max(...frames.map((f) => Math.hypot(f.x - before.x, f.y - before.y)));
      let changes = 0;
      for (let i = 1; i < frames.length; i++) {
        const a = frames[i - 1];
        const b = frames[i];
        if (a && b && Math.hypot(a.x - b.x, a.y - b.y) > 1) changes++;
      }
      return {
        deslocamentoMaxPx: Math.round(drift),
        trocasDePosicaoEm1s: changes,
        corAntes: before.bg,
        corNoHover: after.bg,
      };
    },
    info: {
      corAntes: "o original pinta a bolinha numa imagem; compare em hover-antes.compare.png",
      corNoHover: "idem; compare em hover-depois.compare.png",
    },
  },
  {
    name: "autocomplete",
    about:
      "Campo de local: digitar 'vila' e descer com ↓ por todas as sugestões — a opção ativa precisa ficar visível.",
    run: async (page, site) => {
      await openSearch(page, site);
      const input = page.locator(SELECTORS.location[site.id]).first();
      await input.click();
      await page.keyboard.type("vila", { delay: 80 });
      await page.waitForSelector('[role="option"]', { timeout: 10_000 });
      await page.waitForTimeout(800);
      const total = await page.locator('[role="option"]').count();
      const hidden: number[] = [];
      for (let i = 1; i <= total + 1; i++) {
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(150);
        const visible = await page.evaluate(() => {
          const input = document.activeElement;
          const id = input?.getAttribute("aria-activedescendant");
          const active =
            (id && document.getElementById(id)) ||
            document.querySelector('[role="option"][aria-selected="true"]') ||
            document.querySelector('[role="option"].Mui-focused');
          const list =
            active?.closest('[role="listbox"]') ?? document.querySelector('[role="listbox"]');
          if (!active || !list) return null;
          const a = active.getBoundingClientRect();
          const l = list.getBoundingClientRect();
          return a.top >= l.top - 1 && a.bottom <= l.bottom + 1;
        });
        if (visible === false) hidden.push(i);
      }
      await page.screenshot({ path: join(OUT, `autocomplete.${site.id}.png`) });
      const listbox = await page.$eval('[role="listbox"]', (l) => ({
        altura: l.clientHeight,
        rolavel: l.scrollHeight > l.clientHeight,
      }));
      return { sugestoes: total, ...listbox, setasComOpcaoEscondida: hidden };
    },
    info: {
      sugestoes: "depende da base e do tempo de resposta de cada site",
      altura: "segue a quantidade de sugestões",
      rolavel: "segue a quantidade de sugestões",
    },
  },
];

const filter = process.argv[2];
const probes = PROBES.filter((p) => !filter || p.name.includes(filter));
const browser: Browser = await launchBrowser();
const results: Record<string, Record<string, ProbeResult | { erro: string }>> = {};

for (const probe of probes) {
  results[probe.name] = {};
  for (const site of SITES) {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1.25,
      locale: "pt-BR",
    });
    const page = await context.newPage();
    try {
      results[probe.name][site.id] = await probe.run(page, site);
    } catch (e) {
      results[probe.name][site.id] = {
        erro: e instanceof Error ? (e.message.split("\n")[0] ?? "") : String(e),
      };
    }
    await context.close();
    console.log(`· ${probe.name} — ${site.label}`);
  }
}

// Prints lado a lado dos estados fotografados pelas sondas.
for (const state of ["busca", "mais-filtros", "autocomplete", "hover-antes", "hover-depois"]) {
  await composeSideBySide(browser, {
    left: { label: "QuintoAndar (ao vivo)", path: join(OUT, `${state}.original.png`) },
    right: { label: "Nosso", path: join(OUT, `${state}.nosso.png`) },
    out: join(OUT, `${state}.compare.png`),
  }).catch(() => {});
}
await browser.close();

/** Compara campo a campo e monta o relatório. */
const show = (v: unknown) => (v === undefined ? "—" : JSON.stringify(v));
const lines = [
  "# Check-up contra o site ao vivo",
  "",
  `Gerado em ${new Date().toLocaleString("pt-BR")}. ✅ = igual; ❌ = diferente (decida: corrigir, feature faltando ou aceito).`,
  "Prints lado a lado: `busca`, `mais-filtros`, `autocomplete`, `hover-antes`, `hover-depois` (`<estado>.compare.png`).",
  "",
];
for (const probe of probes) {
  const original = results[probe.name]?.original ?? {};
  const nosso = results[probe.name]?.nosso ?? {};
  lines.push(
    `## ${probe.name}`,
    "",
    probe.about,
    "",
    "| Campo | Original | Nosso | |",
    "|---|---|---|---|",
  );
  const keys = [...new Set([...Object.keys(original), ...Object.keys(nosso)])];
  for (const key of keys) {
    const a = (original as Record<string, unknown>)[key];
    const b = (nosso as Record<string, unknown>)[key];
    const tolerance = probe.tolerance?.[key];
    const same =
      show(a) === show(b) ||
      (tolerance !== undefined &&
        typeof a === "number" &&
        typeof b === "number" &&
        Math.abs(a - b) <= tolerance);
    const why = probe.info?.[key];
    const mark = why ? `ℹ️ ${why}` : same ? "✅" : "❌";
    lines.push(`| ${key} | \`${show(a)}\` | \`${show(b)}\` | ${mark} |`);
  }
  lines.push("");
}
writeFileSync(join(OUT, "results.json"), JSON.stringify(results, null, 2));
writeFileSync(join(OUT, "report.md"), `${lines.join("\n")}\n`);
console.log(`\nRelatório em ${join(OUT, "report.md")}`);
