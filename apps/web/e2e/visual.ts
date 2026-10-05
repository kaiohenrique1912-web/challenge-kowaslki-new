/**
 * Conferência visual contra o QuintoAndar original (skill /conferir-visual).
 *
 * Para cada print de referência em docs/reference/, leva o NOSSO site ao mesmo estado (mesma
 * largura de janela, mesmos filtros, mesmo painel aberto), tira um print e monta uma imagem lado
 * a lado: referência à esquerda, nosso à direita. Quem compara é o agente (ou você), lendo as
 * imagens — não é um diff de pixels: os dados e o mapa (Google × OpenStreetMap) nunca vão bater.
 *
 * Pré-requisito: `bun run dev` rodando e banco populado (`bun run seed`).
 * Uso: `bun run visual` (raiz) ou `bun run visual busca` (só cenas cujo nome contém "busca").
 * Saída (fora do git): apps/web/e2e/visual/<cena>.ours.png, <cena>.compare.png e report.md.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "playwright-core";
import { BASE_URL, launchBrowser, settle, waitForResults } from "./browser.ts";

const REFERENCE_DIR = join(import.meta.dir, "../../../docs/reference");
const OUT = join(import.meta.dir, "visual");
mkdirSync(OUT, { recursive: true });

type Scene = {
  /** Nome curto (arquivo de saída e filtro da linha de comando). */
  name: string;
  /** Print de referência em docs/reference/. */
  reference: string;
  /** Altura útil da referência em px da imagem (corta a barra de tarefas do Windows). */
  referenceCrop?: number;
  /** Janela do navegador em px CSS — a mesma da tela em que a referência foi tirada. */
  viewport: { width: number; height: number };
  /** Leva o nosso site ao estado do print. */
  setup: (page: Page) => Promise<void>;
  /** Seletor a fotografar (padrão: a janela inteira). */
  clip?: string;
  /** O que conferir com atenção nesta cena (vai para o report.md). */
  checklist: string[];
};

// Os prints foram tirados num notebook 1920×1080 com o Windows em 125%: a janela tem ~1536×694 px
// CSS (os .png de 1917 px estão em tamanho físico; os .jpeg de 1600 px são os mesmos 1920 px
// reduzidos). Por isso todas as cenas usam essa janela com deviceScaleFactor 1,25.
const SCREEN = { width: 1536, height: 694 };
const DEVICE_SCALE = 1.25;

const openSearch = async (page: Page, url: string) => {
  await page.goto(`${BASE_URL}${url}`);
  await waitForResults(page);
  await settle(page);
};

const openMoreFilters = async (page: Page) => {
  await page.getByRole("button", { name: /Mais filtros/ }).click();
  await page.locator(".qa-dialog--drawer .qa-dialog__panel").waitFor();
  await settle(page);
};

const scrollPanelTo = async (page: Page, heading: string) => {
  await page.locator(".qa-dialog--drawer .qa-dialog__body").evaluate((body, text) => {
    const target = [
      ...body.querySelectorAll(
        ".qa-filter-panel__legend, .qa-counter__label, .qa-range-field__legend",
      ),
    ].find((el) => el.textContent?.trim().startsWith(text));
    if (target) {
      body.scrollTop += target.getBoundingClientRect().top - body.getBoundingClientRect().top - 16;
    }
  }, heading);
  await settle(page);
};

const openFirstProperty = async (page: Page) => {
  await openSearch(page, "/comprar/imovel/barra-funda?quartos=3");
  await page.locator("article.qa-property-card a").first().click();
  await page.locator("h1").waitFor();
  await page.waitForLoadState("networkidle").catch(() => {});
  await settle(page);
};

const SCENES: Scene[] = [
  {
    name: "busca-compra",
    reference: "busca_compra.png",
    viewport: SCREEN,
    setup: (page) => openSearch(page, "/comprar/imovel?tipos=apartamento&banheiros=1"),
    checklist: [
      "Cabeçalho: logo, itens de menu, botão Entrar.",
      "Barra de filtros: campo de local, chips (texto, altura, cor do chip ativo), setas de rolagem, 'Mais filtros', 'Criar alerta de imóvel'.",
      "Título da lista ('N apartamentos' / subtítulo) e botão de ordenação.",
      "Card: cantos da foto, selos, título, preço, linha 'R$ X Condo. + IPTU', atributos, endereço, coração.",
      "Mapa: estilo dos tiles, clusters, chip do filtro no mapa, '+/−', 'Desenhar área de busca'.",
    ],
  },
  {
    name: "busca-bairro",
    reference: "tela_apos_busca.jpeg",
    referenceCrop: 722,
    viewport: SCREEN,
    setup: (page) => openSearch(page, "/comprar/imovel/barra-funda?quartos=3"),
    checklist: [
      "Campo de local com o bairro, chips ativos em azul-claro com o valor ('3+ quartos').",
      "Subtítulo 'com 3 quartos à venda em Barra Funda, São Paulo, SP'.",
      "Pino vermelho do bairro e clusters pequenos.",
      "Ignorar: aluguel × venda (só compra no escopo).",
    ],
  },
  {
    name: "mapa-zoom-out",
    reference: "mapa_zoom_out.png",
    viewport: SCREEN,
    setup: async (page) => {
      await openSearch(page, "/comprar/imovel/barra-funda?quartos=3&preco-max=1000000");
      for (let i = 0; i < 3; i++) {
        await page.locator(".leaflet-control-zoom-out").click();
        await page.waitForTimeout(400);
      }
      await page.waitForLoadState("networkidle").catch(() => {});
      await settle(page);
    },
    clip: ".qa-search-layout__map",
    checklist: [
      "Chips dos filtros no topo do mapa (azul-claro, com X).",
      "Clusters: círculo branco, número em negrito, sombra.",
      "Controles de zoom (círculos brancos no canto inferior direito) e 'Desenhar área de busca'.",
      "Tiles: tons claros parecidos com o Google Maps (o original usa Google; nós, tiles abertos).",
    ],
  },
  {
    name: "mais-filtros-compra",
    reference: "mais_filtros_compra.png",
    viewport: { width: 1536, height: 708 },
    setup: async (page) => {
      await openSearch(page, "/comprar/imovel?tipos=apartamento&banheiros=1");
      await openMoreFilters(page);
    },
    checklist: [
      "Painel lateral à ESQUERDA, largura, botão X, rodapé 'Limpar' + 'Ver N imóveis'.",
      "Seções 'Valor do imóvel' e 'Condomínio + IPTU': rótulos Mínimo/Máximo, campos com 'R$', slider.",
    ],
  },
  ...(
    [
      ["mais-filtros-1", "mais_filtros1.jpeg", "Tipos de imóvel"],
      ["mais-filtros-2", "mais_filtros2.jpeg", "Exclusivos QuintoAndar"],
      ["mais-filtros-3", "mais_filtros3.jpeg", "Mobília"],
      ["mais-filtros-4", "mais_filtros4.jpeg", "Eletrodomésticos"],
    ] as const
  ).map(
    ([name, reference, heading]): Scene => ({
      name,
      reference,
      viewport: SCREEN,
      setup: async (page) => {
        await openSearch(page, "/comprar/imovel/barra-funda?quartos=3");
        await openMoreFilters(page);
        await scrollPanelTo(page, heading);
      },
      clip: ".qa-dialog--drawer .qa-dialog__panel",
      checklist: [
        "Títulos de seção (peso, tamanho), pílulas 'Tanto faz/1+/2+' (cor da selecionada), checkboxes em 2 colunas.",
        "Ordem e nomes das seções e dos itens.",
        "Ignorar: Alugar/Comprar e 'Valor total/Aluguel' (só compra no escopo).",
      ],
    }),
  ),
  {
    name: "area-desenhada",
    reference: "area_desenhada.png",
    referenceCrop: 867,
    viewport: SCREEN,
    setup: async (page) => {
      await openSearch(page, "/comprar/imovel?tipos=apartamento&banheiros=1");
      const draw = page.getByRole("button", { name: "Desenhar área de busca" });
      if ((await draw.count()) === 0) return;
      await draw.click();
      const box = await page.locator(".qa-search-layout__map").boundingBox();
      if (!box) return;
      const points = [
        [0.38, 0.4],
        [0.62, 0.38],
        [0.72, 0.68],
        [0.38, 0.7],
        [0.38, 0.4],
      ];
      const [first] = points;
      await page.mouse.move(box.x + box.width * first[0], box.y + box.height * first[1]);
      await page.mouse.down();
      for (const [x, y] of points.slice(1)) {
        await page.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 12 });
      }
      await page.mouse.up();
      await waitForResults(page);
      await page.waitForLoadState("networkidle").catch(() => {});
      await settle(page);
    },
    checklist: [
      "Campo de local vira 'Área desenhada no mapa'; subtítulo 'à venda na área desenhada no mapa'.",
      "Polígono cinza no mapa, clusters só dentro dele, botão 'Apagar desenho'.",
    ],
  },
  {
    name: "criar-alerta",
    reference: "criar_alerta.png",
    viewport: SCREEN,
    setup: async (page) => {
      await openSearch(page, "/comprar/imovel?tipos=apartamento&banheiros=1");
      const button = page.getByRole("button", { name: "Criar alerta de imóvel" });
      if ((await button.count()) === 0) return;
      await button.click();
      await page.getByRole("dialog").waitFor();
      await settle(page);
    },
    checklist: [
      "Modal centralizado: título grande em 2 linhas, toggles (app, WhatsApp, e-mail), texto de apoio, botão largo.",
    ],
  },
  {
    name: "detalhe-topo",
    reference: "abrir_oferta.png",
    referenceCrop: 867,
    viewport: SCREEN,
    setup: openFirstProperty,
    checklist: [
      "Cabeçalho do detalhe: só o símbolo do logo + campo 'Rua, bairro ou código'.",
      "Hero: fundo cinza à esquerda, título grande, preço grande, 'Total'/'Condo. + IPTU', botões.",
      "Galeria: 2 fotos lado a lado, botões redondos (compartilhar, favoritar), 'N Fotos', 'Mapa', setas.",
    ],
  },
  {
    name: "detalhe-precos",
    reference: "abrir_oferta2.png",
    referenceCrop: 869,
    viewport: SCREEN,
    setup: async (page) => {
      await openFirstProperty(page);
      await page.evaluate(() => {
        const crumbs = document.querySelector("nav[aria-label='Você está aqui']");
        const top = crumbs ? crumbs.getBoundingClientRect().top + window.scrollY - 110 : 600;
        window.scrollTo(0, top);
      });
      await settle(page);
    },
    checklist: [
      "Trilha (breadcrumb), card do endereço com fundo de mapa, ícones das características em grade.",
      "Card de preços fixo à direita: linhas com ícone de info, total, botões, Favoritar/Compartilhar.",
      "Itens disponíveis (✓) e indisponíveis (riscados, cinza).",
    ],
  },
  {
    name: "home",
    reference: "buscar_imoveis.jpeg",
    referenceCrop: 724,
    viewport: SCREEN,
    setup: async (page) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState("networkidle").catch(() => {});
      await settle(page);
    },
    checklist: [
      "Card branco à esquerda sobre foto: abas 'Buscar imóveis/Anunciar imóveis', título grande, abas, campos, botão.",
      "Ignorar: aba Alugar (só compra no escopo).",
    ],
  },
];

/** Referências sem cena (para o report dizer por quê). */
const NOT_COVERED: Record<string, string> = {
  "anunciar_imoveis.jpeg": "cadastro de imóveis — feature nova, ainda não existe (teste one-shot).",
  "exemplo_pergunta_extra1.jpeg": "onboarding por perguntas — fora do escopo.",
  "exemplo_pergunta_extra2.jpeg": "onboarding por perguntas — fora do escopo.",
};

const dataUrl = (path: string) => {
  const mime = path.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
};

const filter = process.argv[2];
const scenes = SCENES.filter((s) => !filter || s.name.includes(filter));
const browser = await launchBrowser();
const report: string[] = [
  "# Conferência visual",
  "",
  `Gerado em ${new Date().toLocaleString("pt-BR")} contra ${BASE_URL}.`,
  "Para cada cena: abra `<cena>.compare.png` (referência à esquerda, nosso à direita) e confira o checklist.",
  "",
];

for (const scene of scenes) {
  const page = await browser.newPage({ viewport: scene.viewport, deviceScaleFactor: DEVICE_SCALE });
  const oursPath = join(OUT, `${scene.name}.ours.png`);
  let error: string | undefined;
  try {
    await scene.setup(page);
    if (scene.clip) await page.locator(scene.clip).screenshot({ path: oursPath });
    else await page.screenshot({ path: oursPath });
  } catch (e) {
    error = e instanceof Error ? e.message.split("\n")[0] : String(e);
    await page.screenshot({ path: oursPath }).catch(() => {});
  }
  await page.close();

  // Lado a lado na mesma escala: as duas imagens com a mesma largura de exibição.
  const compare = await browser.newPage({ viewport: { width: 1920, height: 800 } });
  const crop = scene.referenceCrop;
  await compare.setContent(`<!doctype html><html><body style="margin:0;font:600 18px system-ui;background:#fff">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:12px">
      <div>Referência — ${scene.reference}</div><div>Nosso — ${scene.name}</div>
      <div style="${crop ? `aspect-ratio:var(--r);overflow:hidden` : ""}" id="ref">
        <img src="${dataUrl(join(REFERENCE_DIR, scene.reference))}" style="width:100%;display:block">
      </div>
      <div><img src="${dataUrl(oursPath)}" style="width:100%;display:block;outline:1px solid #ccc"></div>
    </div></body></html>`);
  if (crop) {
    await compare.evaluate((h) => {
      const img = document.querySelector<HTMLImageElement>("#ref img");
      const box = document.getElementById("ref");
      if (img && box) box.style.setProperty("--r", `${img.naturalWidth} / ${h}`);
    }, crop);
  }
  await compare.screenshot({ path: join(OUT, `${scene.name}.compare.png`), fullPage: true });
  await compare.close();

  report.push(`## ${scene.name}`, "");
  report.push(`- Referência: \`docs/reference/${scene.reference}\``);
  report.push(`- Nosso: \`apps/web/e2e/visual/${scene.name}.ours.png\``);
  report.push(`- Lado a lado: \`apps/web/e2e/visual/${scene.name}.compare.png\``);
  if (error) report.push(`- ⚠️ A cena não chegou ao estado esperado: ${error}`);
  report.push("", "Conferir:", ...scene.checklist.map((c) => `- [ ] ${c}`), "");
  console.log(`${error ? "⚠️ " : "✓ "} ${scene.name}${error ? ` — ${error}` : ""}`);
}

if (!filter) {
  report.push("## Referências sem cena", "");
  for (const [file, why] of Object.entries(NOT_COVERED)) report.push(`- \`${file}\`: ${why}`);
}
writeFileSync(join(OUT, "report.md"), `${report.join("\n")}\n`);
await browser.close();
console.log(`\nImagens e report em ${OUT}`);
