# Challenge #1 — Prompts para o Claude Code (em etapas)

## Como usar este arquivo (leia antes)

1. Copie o PDF do challenge para dentro do repositório, em `docs/challenge.pdf`.
2. (Recomendado) Tire prints da busca do QuintoAndar: página de resultados com mapa, painel de filtros aberto, card de imóvel, página de detalhe, versão mobile. Salve em `docs/reference/`. O site é muito dinâmico e o Claude Code pode não conseguir lê-lo direito só pela URL; os prints ajudam muito a copiar o design.
3. Abra o terminal na pasta do repositório e rode `claude`.
4. Rode **uma etapa por sessão**. Cole o prompt da etapa, deixe terminar e confira.
5. Ao final de cada etapa, o Claude Code atualiza o `PROGRESS.md` e faz commit + push. Depois rode `/clear` (ou feche e abra de novo) antes da próxima etapa. Assim cada sessão começa leve e você gasta menos do limite.
6. Se o limite acabar no meio de uma etapa, sem problema: na próxima sessão use o **Prompt de retomada** (no fim do arquivo).

Dicas para economizar uso:
- Use `/model` para escolher um modelo mais leve nas etapas mais mecânicas (1, 2 e 4).
- Se a conversa ficar longa dentro de uma etapa, rode `/compact`.
- Evite pedir "refaça tudo"; peça correções pontuais.

---

## ETAPA 0 — Planejamento e memória do projeto

```
Você vai me ajudar a resolver um desafio técnico. O enunciado está em docs/challenge.pdf
e há prints de referência em docs/reference/ (se existirem). Leia ambos.

Resumo do desafio:
- Copiar a feature de BUSCA de imóveis à venda do QuintoAndar
  (https://www.quintoandar.com.br/comprar/imovel/sao-paulo-sp-brasil).
- Requisitos: pelo menos 50.000 imóveis no banco; frontend funcionalmente equivalente;
  backend funcionalmente equivalente; design system equivalente. Nada precisa estar deployado,
  tudo roda local.
- Subobjetivo MUITO importante: o projeto deve ficar organizado e documentado de forma que um
  agente de código consiga, em one-shot, construir uma feature nova (ex.: "Implemente o cadastro
  de imóveis. Use um formulário e um mapa para apoio visual.") respeitando as regras de negócio
  e o system design existentes.

Stack definida (baseada nas referências do desafio):
- Runtime e gerenciador: Bun, com workspaces (monorepo).
- Backend: Elysia + GraphQL (GraphQL Yoga via plugin do Elysia).
- Banco: SQLite via bun:sqlite (sem Docker, simples de rodar).
- Frontend: React + Vite + TypeScript.
- Mapa: Leaflet com tiles do OpenStreetMap e clusterização (supercluster ou equivalente).
- Design system: pacote próprio com tokens + componentes, documentado no Storybook.
- Testes: bun test.

Estrutura sugerida:
  apps/api        -> servidor Elysia + GraphQL
  apps/web        -> aplicação React
  packages/ui     -> design system + Storybook
  packages/shared -> tipos, enums e regras de negócio compartilhadas
  docs/           -> documentação

NESTA ETAPA, NÃO ESCREVA CÓDIGO DA APLICAÇÃO. Faça apenas:

1. Tente acessar a URL do QuintoAndar e analise os prints. Liste a feature de busca em detalhe:
   filtros existentes (tipo de imóvel, preço, quartos, banheiros, vagas, área, suítes,
   comodidades etc.), ordenações, comportamento do mapa (pins, clusters, buscar ao mover o mapa),
   contagem de resultados, card do imóvel, paginação/scroll, página de detalhe, favoritos,
   persistência dos filtros na URL, comportamento mobile. Quando não tiver certeza, marque como
   "suposição" para eu validar.

2. Crie docs/business-rules.md com as regras de negócio do domínio (o que é um imóvel, campos
   obrigatórios, faixas válidas, como cada filtro funciona, como cada ordenação funciona,
   valores exibidos como preço + condomínio + IPTU etc.).

3. Crie docs/architecture.md com o system design: camadas, fluxo de uma busca do front ao banco,
   schema GraphQL planejado, modelo de dados e índices, estratégia de paginação, estratégia do
   mapa (bounding box + clusters), convenções de código.

4. Crie CLAUDE.md na raiz com: visão geral, stack, estrutura de pastas, comandos (instalar,
   rodar, testar, seed, storybook), convenções e a regra "antes de implementar qualquer feature,
   leia docs/business-rules.md e docs/architecture.md".

5. Crie PROGRESS.md com o checklist das etapas abaixo e marque a Etapa 0 como concluída:
   - Etapa 0: Planejamento e documentação
   - Etapa 1: Setup do monorepo
   - Etapa 2: Modelo de dados e seed com 50k+ imóveis
   - Etapa 3: Backend GraphQL de busca
   - Etapa 4: Design system + Storybook
   - Etapa 5: Frontend da busca (lista + filtros + mapa)
   - Etapa 6: Página de detalhe, favoritos e acabamento
   - Etapa 7: Preparação para agentes e validação one-shot

6. Faça commit e push com a mensagem "docs: planejamento inicial".

Ao final, me mostre um resumo curto e a lista de suposições que preciso validar.
```

---

## ETAPA 1 — Setup do monorepo

```
Leia CLAUDE.md, PROGRESS.md e docs/architecture.md. Execute a Etapa 1: setup do monorepo.

- Configure Bun workspaces com apps/api, apps/web, packages/ui e packages/shared.
- TypeScript configurado em todos, com tsconfig base compartilhado.
- apps/api: Elysia rodando com um endpoint GraphQL de "health" funcionando.
- apps/web: React + Vite rodando, chamando o health do GraphQL e mostrando o resultado.
- packages/ui: Storybook rodando com um componente de exemplo.
- packages/shared: exporta um tipo de exemplo usado pelo api e pelo web.
- Scripts na raiz: dev (api + web juntos), test, storybook, seed (pode ser placeholder).
- .gitignore adequado (node_modules, banco SQLite, builds).
- Atualize CLAUDE.md com os comandos reais.

Verifique que tudo roda (instale, suba e teste). Depois marque a Etapa 1 no PROGRESS.md
e faça commit + push.
```

---

## ETAPA 2 — Modelo de dados e seed (50k+ imóveis)

```
Leia CLAUDE.md, PROGRESS.md, docs/business-rules.md e docs/architecture.md.
Execute a Etapa 2: modelo de dados e seed.

- Crie o schema SQLite dos imóveis seguindo docs/business-rules.md (tipo, endereço, bairro,
  cidade, latitude, longitude, preço, condomínio, IPTU, área, quartos, suítes, banheiros, vagas,
  andar, comodidades, fotos, descrição, data de publicação etc.).
- Crie índices pensando nas consultas da busca (filtros mais comuns, ordenações e lat/lng
  para busca por região do mapa).
- Script de seed que gera pelo menos 60.000 imóveis realistas em São Paulo:
  * Use uma lista real de bairros de SP com coordenadas aproximadas do centro de cada bairro e
    espalhe os imóveis ao redor desse centro.
  * Preços coerentes com o bairro e a área (ex.: m² mais caro em Pinheiros/Itaim do que em
    bairros periféricos). Condomínio e IPTU proporcionais.
  * Distribuição realista de tipos, quartos, vagas etc.
  * Gerador com seed fixa (resultados reproduzíveis).
  * Fotos: use imagens placeholder geradas localmente ou URLs determinísticas, sem depender de
    serviços pagos.
  * Insira em lote/transação para ser rápido.
- Coloque as regras de geração e validação dos dados em packages/shared quando fizer sentido.
- Testes: o seed gera >= 50.000 registros válidos.

Rode o seed, mostre quantos registros foram criados e o tempo. Atualize CLAUDE.md e
PROGRESS.md, e faça commit + push.
```

---

## ETAPA 3 — Backend GraphQL de busca

```
Leia CLAUDE.md, PROGRESS.md, docs/business-rules.md e docs/architecture.md.
Execute a Etapa 3: backend GraphQL.

Implemente no apps/api, com schema GraphQL tipado:
- Query de busca de imóveis com:
  * todos os filtros definidos em docs/business-rules.md;
  * filtro por bounding box do mapa (norte, sul, leste, oeste);
  * filtro por bairro(s);
  * ordenações (relevância, mais recentes, menor preço, maior preço etc.);
  * paginação (cursor ou offset, conforme decidido em architecture.md);
  * total de resultados.
- Query para o mapa que retorna pins/clusters agregados para a área visível, sem mandar
  milhares de pontos de uma vez.
- Query de imóvel por id (para a página de detalhe).
- Query de autocomplete de bairros/endereços.
- Validação de entrada (ex.: preço mínimo maior que máximo deve dar erro claro).
- Separe camadas: schema/resolvers -> serviço (regras) -> repositório (SQL).
- Testes com bun test cobrindo filtros, ordenação, paginação e mapa.
- Garanta que as buscas respondem rápido com 60k registros (meça e cite os tempos).

Atualize docs/architecture.md se algo mudou, marque a etapa no PROGRESS.md e faça commit + push.
```

---

## ETAPA 4 — Design system + Storybook

```
Leia CLAUDE.md, PROGRESS.md e analise os prints em docs/reference/.
Execute a Etapa 4: design system no packages/ui.

- Tokens: cores, tipografia, espaçamentos, bordas, sombras e breakpoints, inspirados
  no visual do QuintoAndar.
- Componentes base: Button, IconButton, Input, Select, Checkbox, Chip/Tag, Toggle,
  RangeSlider ou campos de faixa (preço/área), Counter de seleção (1+, 2+, 3+...), Modal/Drawer,
  Badge, Skeleton, Tooltip, Pagination.
- Componentes de domínio: PropertyCard (com carrossel de fotos, preço, condomínio + IPTU,
  área, quartos, vagas, endereço e botão de favorito), FilterBar, PriceTag, MapPin/Cluster.
- Cada componente com stories no Storybook cobrindo estados (padrão, hover, desabilitado,
  carregando, erro, mobile).
- Acessibilidade básica (labels, foco visível, navegação por teclado).
- Crie docs/design-system.md explicando tokens, componentes e quando usar cada um.

Rode o Storybook para validar. Marque a etapa no PROGRESS.md e faça commit + push.
```

---

## ETAPA 5 — Frontend da busca

```
Leia CLAUDE.md, PROGRESS.md, docs/business-rules.md, docs/architecture.md e
docs/design-system.md. Execute a Etapa 5: página de busca no apps/web.

- Use apenas componentes do packages/ui (se faltar algo, crie no packages/ui com story).
- Layout como o do QuintoAndar: barra de busca/filtros no topo, lista de cards de um lado e
  mapa do outro; no mobile, alternância entre lista e mapa.
- Filtros completos (rápidos na barra + painel com todos os filtros), com contagem de
  resultados atualizando.
- Mapa com clusters/pins de preço, sincronizado com a lista; opção "buscar ao mover o mapa".
- Ordenação e paginação/scroll infinito.
- Estado dos filtros na URL (dá para compartilhar o link e voltar com o botão do navegador).
- Estados de carregamento (skeleton), vazio ("nenhum imóvel encontrado") e erro.
- Cliente GraphQL tipado com os tipos do schema.

Rode o projeto, teste os fluxos principais e corrija o que estiver quebrado. Marque a etapa
no PROGRESS.md e faça commit + push.
```

---

## ETAPA 6 — Detalhe, favoritos e acabamento

```
Leia CLAUDE.md e PROGRESS.md. Execute a Etapa 6.

- Página de detalhe do imóvel: galeria de fotos, preço, condomínio, IPTU, características,
  comodidades, descrição e mapa da localização. Botão de voltar mantém os filtros da busca.
- Favoritos (mutation GraphQL + persistência simples, sem login real; pode usar um id de
  usuário fixo ou anônimo) e filtro "ver favoritos".
- Revise a fidelidade visual comparando com os prints em docs/reference/ e ajuste.
- Revise performance (consultas, renderização da lista e do mapa).
- Testes dos fluxos críticos.
- README.md na raiz explicando o projeto, como rodar do zero e decisões técnicas.

Marque a etapa no PROGRESS.md e faça commit + push.
```

---

## ETAPA 7 — Preparação para agentes e validação one-shot

```
Leia CLAUDE.md, PROGRESS.md e todos os arquivos em docs/. Execute a Etapa 7.

O objetivo é que um agente consiga, em uma única instrução, criar uma feature nova
consistente com o projeto.

1. Revise CLAUDE.md para que seja um guia completo e enxuto: arquitetura, onde fica cada coisa,
   convenções, comandos, e o passo a passo para criar uma feature ponta a ponta
   (shared -> banco -> GraphQL -> serviço -> ui -> web -> testes -> docs).
2. Crie docs/feature-recipe.md com esse passo a passo detalhado e um checklist de "pronto".
3. Crie skills/comandos do Claude Code em .claude/ (ex.: comando /nova-feature que segue a
   receita, e uma skill de "regras de negócio de imóveis"). Use como inspiração a ideia de
   skills de https://github.com/cursor/plugins/tree/main/pstack/skills.
4. Garanta que regras de negócio reutilizáveis (validações, enums, faixas) estão centralizadas
   em packages/shared, para uma feature nova não duplicar regras.
5. Faça commit + push.

Depois disso, PARE e me avise. Eu vou abrir uma sessão nova e testar o one-shot.
```

**Teste do one-shot (em uma sessão nova, depois do `/clear`):**

```
Implemente o cadastro de imóveis. Use um formulário e um mapa para apoio visual.
```

Se o resultado sair bom, ótimo. Se não sair, volte numa sessão e peça:

```
Leia CLAUDE.md e docs/feature-recipe.md. Acabei de testar o prompt "Implemente o cadastro de
imóveis. Use um formulário e um mapa para apoio visual." numa sessão nova e estes foram os
problemas: [descreva]. Ajuste a documentação, a receita e as skills para que um agente acerte
isso de primeira, sem depender desta conversa.
```

---

## Prompt de retomada (se o limite acabar no meio de uma etapa)

```
Leia CLAUDE.md e PROGRESS.md. A sessão anterior foi interrompida no meio da Etapa [N].
Rode `git status` e `git log -5` para ver o que já foi feito, verifique o que está pronto e
continue a Etapa [N] de onde parou. No fim, atualize o PROGRESS.md e faça commit + push.
```
