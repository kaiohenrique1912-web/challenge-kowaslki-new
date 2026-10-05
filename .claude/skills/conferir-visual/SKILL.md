---
name: conferir-visual
description: "Confere se o site está igual ao QuintoAndar original: com Playwright, leva o site ao estado de cada print de docs/reference/, gera imagens lado a lado (original × nosso), lista as diferenças e corrige. Use para /conferir-visual, depois de mudar qualquer tela, ou quando pedirem para comparar com o original/deixar mais parecido."
argument-hint: "[cena, ex.: busca | detalhe | filtros | home]"
---

# Conferir visual com o original

Quem compara é você, lendo imagens — não um diff de pixels. Dados, fotos e o mapa (Google no
original, OpenStreetMap aqui) nunca vão bater; o que precisa bater é **layout, tamanhos,
tipografia, cores, textos, ordem e presença dos componentes**.

## 1. Subir o app (se ainda não estiver no ar)

- Banco populado? `apps/api/data/app.db` existe → ok; senão `bun run seed`.
- `bun run dev` em segundo plano; pronto quando `http://localhost:5173` e
  `http://localhost:4000/graphql` respondem (curl).

## 2. Gerar as comparações

```bash
bun run visual            # todas as cenas
bun run visual detalhe    # só cenas cujo nome contém "detalhe"
```

Saída em `apps/web/e2e/visual/` (fora do git):
- `<cena>.compare.png` — referência à esquerda, nosso à direita, mesma escala;
- `<cena>.ours.png` — nosso print em tamanho real (para detalhes finos);
- `report.md` — lista de cenas, checklist de cada uma e as referências sem cena.

As cenas usam janela 1536×694 com `deviceScaleFactor` 1,25: é o notebook em que os prints
foram tirados (Windows em 125%). Nossos `.ours.png` têm a mesma escala dos `.png` de
referência; os `.jpeg` de 1600 px são a mesma tela reduzida.

## 3. Comparar (Read em cada imagem)

Para cada cena: abra o `.compare.png`; se precisar de detalhe, abra a referência em
`docs/reference/` e o `.ours.png` separadamente. Percorra o checklist do `report.md` e anote
cada diferença em uma de três listas:

1. **Corrigir** — layout, espaçamento, tamanho/peso de fonte, cor, raio, sombra, texto,
   ordem, ícone, componente faltando ou sobrando.
2. **Feature faltando** — algo que o original faz e nós não (vira tarefa; use `nova-feature`
   se o usuário quiser).
3. **Aceito** — diferença inevitável ou decidida: dados/fotos, Google × OSM, fonte paga
   (Oatmeal Pro → Albert Sans), aluguel (fora do escopo). Não "corrija" estes.

## 4. Corrigir

- Diferença de **token** (cor, tamanho, raio, sombra) → `packages/ui/src/tokens/tokens.ts`
  + `cd packages/ui && bun run tokens`. Valores do original: CSS público do site (variáveis
  `--tokens-base-*`); as já usadas estão comentadas em `tokens.ts`.
- Diferença de **componente** → CSS/TSX em `packages/ui` (só tokens; atualize a story).
- Diferença de **layout da página** → CSS de layout em `apps/web/src/features/*/…-page.css`.
- Diferença de **texto** → helper em `packages/shared` (com teste) — nunca texto solto na tela.
- Regra de exibição mudou → atualize `docs/business-rules.md` §6.

Depois de corrigir: rode de novo só a cena (`bun run visual <cena>`) e confira; repita até a
lista "Corrigir" esvaziar. Por fim `bun test`, `bun run typecheck` e `bun run e2e`.

## 5. Cena nova

Print novo em `docs/reference/` → adicione um item em `SCENES` de `apps/web/e2e/visual.ts`:
`name`, `reference`, `viewport` (`SCREEN`), `referenceCrop` se o print tiver a barra de
tarefas, `setup(page)` que leva o site ao mesmo estado (use os helpers `openSearch`,
`openMoreFilters`, `openFirstProperty`) e o `checklist` do que conferir. Print de uma feature
que ainda não existe → registre em `NOT_COVERED` com o motivo.

## 6. Relatar

Responda com as três listas (corrigido / feature faltando / aceito), o antes e depois das
cenas principais e o resultado dos testes. Mudanças visuais relevantes entram em
`docs/aprendizado.md` (seção da etapa atual) e no `docs/design-system.md`. Derrube os
servidores que você subiu.
