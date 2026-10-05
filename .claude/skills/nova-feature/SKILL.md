---
name: nova-feature
description: "Implementa uma feature nova ponta a ponta neste clone do QuintoAndar (shared → banco → GraphQL → serviço → ui → web → testes → docs), seguindo docs/feature-recipe.md. Use para /nova-feature, ou sempre que pedirem para implementar/criar/adicionar uma funcionalidade, tela, formulário, cadastro, filtro ou fluxo novo (ex.: \"Implemente o cadastro de imóveis\")."
argument-hint: "<descrição da feature>"
---

# Nova feature ponta a ponta

Você vai implementar **$ARGUMENTS** (se vazio, a feature pedida na conversa) de uma vez, sem
depender de conversas anteriores. Tudo o que precisa saber está nos docs do repositório.
O resultado precisa parecer feito por quem escreveu o resto do projeto: mesmas camadas,
mesmos componentes, mesmos textos.

## 1. Carregue o contexto (obrigatório, antes de qualquer código)

Leia por inteiro: `CLAUDE.md`, `docs/feature-recipe.md`, `docs/business-rules.md`,
`docs/architecture.md`, `docs/design-system.md`. Depois:

- Procure a feature em `docs/feature-analysis.md` e um print em `docs/reference/` (abra a
  imagem com Read). Existe print → o visual segue o original.
- Se a feature mexe com imóveis (campos, faixas, comodidades, status, preços), use também a
  skill `regras-imoveis`.
- Liste o que vai **reaproveitar**: exports de `packages/shared/src/index.ts`, componentes de
  `packages/ui/src/index.ts`, módulos de `apps/api/src/modules/`. Reescrever algo que já existe
  é o erro mais comum — procure antes (`Grep`).

## 2. Decida e anote (não pare para perguntar o óbvio)

A instrução vai ser curta. Para cada lacuna, decida pelo padrão do projeto e do original, e
registre a decisão no doc certo (business-rules para regra, architecture §12 para decisão
técnica). Só pergunte ao usuário se a escolha muda o escopo de forma cara de desfazer.

Escreva um plano curto com os arquivos por camada (use a tabela "Exemplo resolvido" de
`docs/feature-recipe.md` como modelo) e siga-o com uma lista de tarefas.

## 3. Implemente na ordem da receita

`docs/feature-recipe.md` §1 → §9: shared (regras + zod + testes) → migração → SDL +
`bun run codegen` → repository/service/resolvers + testes da API → componentes no `ui` (com
stories) → páginas/hooks no `web` (rota, entrada na navegação) → fluxo no `e2e/smoke.ts` → docs.

Regras que não se negociam (estão no CLAUDE.md):
- regra de negócio, enum, faixa, label ou texto exibido **só** em `packages/shared`;
- SQL só no repository, parametrizado; filtro de imóvel só em `property-where.ts`;
- entrada da API validada com `parseOrThrow(schemaDeShared, args)`;
- tela só com componentes do `packages/ui`; CSS só com tokens; componente novo com story;
- toda tela com estados de carregando, vazio/sucesso e erro;
- se a feature ocupa um ponto hoje "fora do escopo" (menu **Anunciar**, aba **Anunciar
  imóveis** da home, "Agendar visita"…), troque o `notAvailable(...)` pela navegação real.

## 4. Prove que funciona (não basta compilar)

Rode e leia a saída de cada um — pare e corrija ao primeiro erro:

```bash
bun run format && bun run lint
bun run typecheck
bun test
```

Depois, com o app no ar (`bun run dev` em segundo plano; espere `http://localhost:5173`
responder), rode `bun run e2e` e **abra os prints** da feature em `apps/web/e2e/screenshots/`
com Read. Prova = o usuário consegue fazer o fluxo pela tela e o efeito aparece (ex.: imóvel
cadastrado aparece na busca). Se a feature tem print do original, rode a skill
`conferir-visual` para ela. Ao terminar, derrube os servidores que você subiu (portas 4000 e
5173).

## 5. Feche

- Percorra o checklist "pronto" de `docs/feature-recipe.md` item por item.
- Docs atualizados no mesmo commit (business-rules, architecture, design-system, CLAUDE.md
  arquivos-chave, README "O que dá para fazer").
- Commit em Conventional Commits (`feat: …`); push só se o usuário pediu.
- Responda ao usuário com: o que foi feito, onde entra na tela, decisões tomadas por você
  (para ele validar) e o resultado dos testes.
