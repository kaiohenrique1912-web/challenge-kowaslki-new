---
name: checkup-original
description: "Check-up do nosso site contra o QuintoAndar AO VIVO (www.quintoandar.com.br) com Playwright: compara chips, painel de filtros, tipografia, hover do mapa, teclado do autocomplete e prints dos mesmos estados; corrige as diferenças e cria sondas novas para features novas. Use para /checkup-original, sempre que uma tela mudar (o hook de Stop cobra), ou quando pedirem para comparar/igualar com o site real."
argument-hint: "[sonda, ex.: chips | mais-filtros | hover | autocomplete | tipografia]"
---

# Check-up contra o site ao vivo

`bun run visual` compara com prints parados (`docs/reference/`); este check-up vai ao **site
real** e mede o que print não mostra: ordem e texto dos chips, valores padrão dos campos,
opções marcadas, tamanho de fonte, se algo **treme** no hover, se a lista **acompanha o
teclado**. Os dois se completam — rode os dois quando mudar tela.

Acesso ao original autorizado pelo QuintoAndar para este projeto (via o usuário). Regras de
convivência: execuções em sequência, poucas páginas, nada de raspagem em massa. Se aparecer
captcha, bloqueio, "acesso negado" ou login obrigatório, **pare e avise o usuário** (ele pede
a liberação) — não tente contornar.

## 1. Rodar

1. App no ar: `bun run dev` em segundo plano; pronto quando `http://localhost:5173` responde.
2. `bun run checkup` (todas as sondas) ou `bun run checkup <nome>` (ex.: `bun run checkup chips`).
3. Leia `apps/web/e2e/checkup/report.md` (tabela Campo | Original | Nosso | ✅/❌) e abra com
   Read os `*.compare.png` (`busca`, `mais-filtros`, `autocomplete`, `hover-antes`,
   `hover-depois`): original à esquerda, nosso à direita.

## 2. Classificar cada ❌

- **Corrigir** — diferença de texto, ordem, valor padrão, medida, cor, comportamento (tremer,
  rolar, foco). Corrija na camada certa (tabela da skill `conferir-visual` §4: token → `ui`,
  layout → CSS da página, texto/regra → `packages/shared` com teste).
- **Feature faltando** — o original tem e nós não (ex.: "Tipos de lançamento", "Perto de
  você"). Não invente às pressas: registre em `docs/aprendizado.md` (seção da etapa) e no
  relatório ao usuário; implemente se o pedido atual cobrir isso.
- **Aceito** — inevitável ou decidido: dados/contagens (o original tem outra base; as bolinhas
  dele mostram amostras), Google × OSM, fonte Oatmeal × Albert Sans, aluguel.
- **Artefato da sonda** — a medição pegou o elemento errado (ex.: texto escondido para leitor
  de tela). Conserte a sonda, não o site.

Depois de corrigir: `bun run checkup <sonda>` de novo até a linha ficar ✅ (ou classificada).
Ao final: `bun test`, `bun run typecheck`, `bun run e2e`.

## 3. Sonda nova (obrigatório ao criar uma feature que o original tem)

Toda tela ou comportamento novo que exista no original ganha uma sonda em
`apps/web/e2e/checkup.ts`, para os próximos check-ups pegarem regressões:

1. **Descubra os seletores do original** com um script descartável (apague depois), ex.
   `apps/web/e2e/_sonda.ts`: `launchBrowser()` de `./browser.ts`, `page.goto` na página do
   original, `page.evaluate` listando botões/inputs com `textContent`, `aria-label`, `name`,
   `role` e classes. Prefira `aria-label`, `role`, `name` e texto; classes do original com
   hash (`p-nPx5`) mudam a cada deploy — use só prefixos estáveis (`Cozy__ChipFilterModal`).
2. **Escreva a sonda** em `PROBES`: `name`, `about` (o que confere), `run(page, site)` que leva
   os DOIS sites ao mesmo estado e devolve um objeto simples (textos, números, listas). Código
   igual para os dois sempre que possível; o que difere vai em `SELECTORS` (`original`/`nosso`).
   Tire print do estado com `page.screenshot({ path: join(OUT, \`<estado>.\${site.id}.png\`) })`
   e inclua `<estado>` na lista de lado a lado no fim do arquivo.
3. **Prove a sonda**: ela precisa dar ❌ quando o defeito existe e ✅ quando está igual
   (foi assim com o hover que "tremia": 36 px de deslocamento → 0).
4. Para o cadastro (menu Anunciar), a página do original é a de "Anunciar" —
   `docs/reference/anunciar_imoveis.jpeg` mostra o primeiro passo.

## 4. Relatar

Responda com: o que foi medido, o que foi corrigido (antes → depois), features faltando,
diferenças aceitas e sondas novas. Diferenças relevantes vão para `docs/aprendizado.md` e,
se mudaram regra, para `docs/business-rules.md`. Derrube os servidores que você subiu.
