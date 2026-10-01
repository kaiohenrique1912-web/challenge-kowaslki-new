# Aprendizado — Etapa 0 (Planejamento e documentação)

> Este arquivo explica, para quem está começando, **o que** foi feito na Etapa 0 e **por quê**.
> Não tem código aqui: a Etapa 0 é só planejamento.

## 1. O que o desafio pede, em palavras simples

Construir uma cópia da tela de **busca de imóveis à venda** do QuintoAndar, rodando no seu computador:

- um **banco de dados** com pelo menos 50 mil imóveis (inventados, mas realistas);
- um **backend** (o "servidor"), que recebe pedidos como "me dê apartamentos com 3 quartos em  Pinheiros" e responde com os imóveis certos;
- um **frontend** (a "tela"), com filtros, lista de cards e mapa;
- um **design system**: o kit de peças visuais (botões, cores, cards…) usado para montar a tela.

E tem um objetivo extra, que é o mais importante: deixar o projeto **tão bem organizado e documentado** que um agente de IA consiga criar uma funcionalidade nova (por exemplo, o cadastro de imóveis) **de primeira**, sem errar as regras.

## 2. O que foi feito, passo a passo

### 2.1 Organizar os arquivos que você trouxe

**Por quê?** Os prompts das próximas etapas procuram os arquivos nesses caminhos. deixar toda a documentação dentro de `docs/` mantém a raiz do projeto limpa.

### 2.2 Estudar o site original → `docs/feature-analysis.md`
Foi feito um inventário de tudo que a busca do QuintoAndar tem: filtros, ordenações, o que aparece no card, como o mapa se comporta, a página de detalhe etc. As informações vieram de duas fontes: o acesso direto ao site (que só carregou em parte) e os seus prints.

O que não deu para confirmar foi marcado como **(suposição)**, para você validar. 

**Por quê?** Para copiar algo, primeiro é preciso saber exatamente o que existe. Marcar as suposições evita que um "chute" vire regra sem ninguém perceber.

### 2.3 Regras de negócio → `docs/business-rules.md`
"Regra de negócio" é uma regra do **mundo real** que o sistema precisa respeitar, independentemente da tecnologia.

**Por quê?** Esse é o documento que a IA vai ler antes de criar o cadastro de imóveis. 

### 2.4 Arquitetura → `docs/architecture.md`
Se as regras de negócio são o **quê**, a arquitetura é o **como**: que peças o sistema tem, como elas conversam e onde fica cada coisa. Os pontos principais:

- **Monorepo:** um único repositório com quatro partes:
  - `apps/api` — o servidor;
  - `apps/web` — a tela;
  - `packages/ui` — o design system;
  - `packages/shared` — regras e tipos usados pelo servidor e pela tela.

  Assim, a regra é escrita **uma vez** em `shared` e usada nos dois lados. 
- **Camadas no servidor:** quem recebe o pedido (*resolver*) passa para quem aplica as regras (*service*), que passa para quem conversa com o banco (*repository*). Cada um tem uma única responsabilidade, o que facilita achar e corrigir as coisas.
- **GraphQL:** a "língua" que a tela usa para pedir dados ao servidor. A tela diz exatamente quais campos quer, e o *schema* funciona como um contrato do que pode ser pedido.
- **SQLite:** o banco de dados, que é um único arquivo no seu computador. Não precisa instalar servidor de banco nem Docker.
- **Índices:** funcionam como o índice remissivo de um livro. Deixam rápidas as buscas e ordenações mais comuns, mesmo com 60 mil imóveis.
- **Paginação por cursor:** o botão "Ver mais" pede "os próximos 24 depois do último que eu vi", em vez de "pule 500 e me dê 24". Isso é mais rápido e não repete nem pula imóveis.
- **Clusters do mapa:** em vez de mandar 60 mil pontos para o navegador (que travaria), o servidor divide o mapa numa grade e devolve "nesta região há 53 imóveis". São as bolinhas com números que você vê no site.
- **Filtros na URL:** os filtros ficam no endereço da página. Dá para copiar o link, mandar para alguém e a pessoa ver a mesma busca; o botão "voltar" também funciona.
- **Convenções:** regras de estilo do código (nomes de arquivos, idioma, testes…), para o projeto parecer escrito por uma pessoa só.

### 2.5 `CLAUDE.md` na raiz
É o "manual de boas-vindas" do projeto. O Claude Code lê esse arquivo automaticamente toda vez que começa uma sessão aqui. Ele resume a stack, as pastas, os comandos e as convenções. A regra mais importante dele: **antes de implementar qualquer feature, ler `business-rules.md` e `architecture.md`**.

**Por quê?** É isso que torna possível o "one-shot": a IA começa toda sessão já sabendo as regras do jogo.

### 2.6 `PROGRESS.md`
É o checklist das etapas, de 0 a 7. Mostra o que já foi feito e o que falta. Também serve para retomar o trabalho se uma sessão for interrompida no meio.

### 2.7 Commit e push
- **Commit** é como uma "foto" do projeto, salva no histórico do Git com uma mensagem explicando o que mudou.
- **Push** envia essas fotos para o GitHub, para ficarem guardadas fora do seu computador.

Foram feitos dois commits:
1. `docs: planejamento inicial` — a primeira versão de todos os documentos;
2. `docs: incorporate validated assumptions…` — os ajustes depois da sua validação.

## 3. Mini-glossário

| Termo | Significado |
|---|---|
| Frontend | A parte que roda no navegador: a tela. |
| Backend / API | O servidor que recebe pedidos da tela e responde com dados. |
| Banco de dados | Onde os dados (os imóveis) ficam guardados. |
| Monorepo | Vários projetos relacionados num único repositório. |
| GraphQL | Linguagem para a tela pedir ao servidor exatamente os dados que quer. |
| Schema | O contrato que define o que pode ser pedido ao servidor e o formato da resposta. |
| Índice (banco) | Estrutura que acelera buscas, como o índice de um livro. |
| Paginação | Carregar resultados aos pedaços (24 por vez) em vez de todos de uma vez. |
| Cluster | Agrupamento de vários pontos próximos do mapa numa bolinha com a contagem. |
| Bounding box | O retângulo da área visível do mapa (norte, sul, leste, oeste). |
| Design system | Conjunto padronizado de cores, fontes e componentes visuais. |
| Storybook | Ferramenta que mostra cada componente visual isolado, como um catálogo. |
| Seed | Script que preenche o banco com dados iniciais (os 60 mil imóveis). |
| Commit / Push | Salvar uma versão no histórico do Git / enviar para o GitHub. |
| Bun | Ferramenta que roda JavaScript/TypeScript e instala dependências (faz o papel do Node + npm). |

---

# Aprendizado — Etapa 1 (Setup do monorepo)

> Na Etapa 1 foi montado o **esqueleto** do projeto: as quatro partes existem, conversam entre si e rodam, mas ainda não fazem nada de imóveis. É como erguer a estrutura e passar a fiação de uma casa antes de mobiliar.

## 1. O que foi feito, passo a passo

### 1.1 A raiz do monorepo
- `package.json` da raiz declara os **workspaces** (`apps/*` e `packages/*`). Com isso, um único `bun install` instala as dependências de todas as partes, e uma parte pode importar a outra pelo nome (ex.: `@qa/shared`).
- `tsconfig.base.json` guarda as regras do TypeScript (modo `strict`, etc.). Cada parte tem um `tsconfig.json` pequeno que **herda** dessa base.
- `.gitignore` diz ao Git o que **não** salvar: `node_modules` (dependências baixadas), `dist` (builds) e o arquivo do banco SQLite.
- `.gitattributes` padroniza as quebras de linha dos arquivos (Windows e Linux/Mac usam caracteres diferentes no fim da linha; sem isso, o Git acusaria "mudanças" falsas).
- `biome.json` configura o **Biome**, que confere o estilo do código e acha erros comuns.

**Por quê?** Configurar uma vez só, no topo, evita que cada parte tenha regras diferentes.

### 1.2 `packages/shared` — o tipo de exemplo
Exporta o tipo `HealthStatus` (o formato da resposta "a API está viva?") e uma função `isHealthStatus` que confere se um dado tem esse formato. A **api** usa o tipo para responder, e a **web** usa para conferir a resposta.

**Por quê?** É a prova de que o "escreva uma vez, use dos dois lados" funciona. Nas próximas etapas, os tipos de imóvel, filtros e validações vão morar aqui.

### 1.3 `apps/api` — o servidor
- **Elysia** é o servidor web; o plugin **GraphQL Yoga** adiciona o endereço `/graphql`.
- O contrato fica em `schema/health.graphql`: existe uma pergunta `health` que devolve `status`, `service` e `timestamp`.
- O *resolver* (`modules/health/health.resolvers.ts`) é a função que responde essa pergunta.
- `createApp()` monta o servidor **sem abrir porta**. Assim o teste consegue "fazer uma pergunta" ao servidor sem precisar ligá-lo de verdade.
- Abrindo http://localhost:4000/graphql no navegador aparece o **GraphiQL**, uma tela para testar perguntas GraphQL na mão.
- O `seed` ainda só imprime uma mensagem; ele ganha conteúdo na Etapa 2.

### 1.4 `apps/web` — a tela
- **Vite** é o servidor de desenvolvimento: entrega a tela ao navegador e recarrega na hora quando você salva um arquivo.
- A tela pergunta `health` à API e mostra "API: ok", com estados de *carregando* e *erro* e um botão "Verificar novamente" (que vem do design system).
- **Proxy:** a tela chama `/graphql` no próprio endereço dela (porta 5173), e o Vite repassa para a API (porta 4000). Sem isso o navegador bloquearia a chamada por segurança (regra chamada **CORS**, que barra pedidos entre endereços diferentes).

### 1.5 `packages/ui` — o design system
- `tokens.css` define as primeiras **variáveis de design** (cor azul principal, fonte, espaçamentos, bordas arredondadas). Componentes usam essas variáveis, nunca a cor "solta".
- `Button` é o componente de exemplo, com variações (primário/secundário, pequeno/médio, desabilitado).
- O **Storybook** (http://localhost:6006) mostra o `Button` em cada variação, isolado do resto do app.

### 1.6 Verificação
Tudo foi testado de verdade, não só escrito:

| Verificação | Resultado |
|---|---|
| `bun test` | 3 testes passando (o `health` da API e a função de `shared`) |
| `bun run typecheck` | sem erros de tipo nas 4 partes |
| `bun run lint` | sem problemas |
| `bun run dev` | API e tela no ar; a tela recebe "ok" pelo proxy |
| `bun run storybook` | Storybook no ar com as 4 variações do `Button` |
| build da web | gera a versão final da tela sem erros |

## 2. Problemas encontrados e como foram resolvidos

- **Bun fora do PATH:** o Bun foi instalado com o VS Code já aberto, então o terminal dele não "via" o Bun. Os comandos foram rodados pelo caminho completo. **Solução definitiva:** fechar e abrir o VS Code.
- **Duas versões do GraphQL:** o plugin do Elysia já traz sua própria versão do GraphQL Yoga, que só funciona com `graphql` 16. Uma versão mais nova (17) tinha sido instalada por fora, o que deixaria duas cópias no projeto e causaria erros difíceis de entender mais tarde. A versão foi fixada na 16 e a cópia extra removida. Isso ficou registrado em `architecture.md` para ninguém repetir o erro.
- **TypeScript 7 e arquivos `.css`:** a versão nova do TypeScript reclama de `import "./Button.css"` se não souber o que é CSS. A solução foi usar as definições de tipo do Vite, que é quem processa o CSS.
- **Sem Node instalado:** tudo (Vite, Storybook, TypeScript) roda com `bunx --bun`, que usa o Bun no lugar do Node. Funcionou, então o Node continua desnecessário.

## 3. Como rodar (resumo)

```
bun install          # instala tudo
bun run dev          # API (porta 4000) + tela (porta 5173)
bun run storybook    # catálogo de componentes (porta 6006)
bun test             # testes
```

## 4. Glossário da Etapa 1

| Termo | Significado |
|---|---|
| Workspace | Cada parte do monorepo (`api`, `web`, `ui`, `shared`), com seu próprio `package.json`. |
| Dependência | Biblioteca de terceiros que o projeto usa (ex.: React, Elysia). Fica em `node_modules`. |
| `bun.lock` | Arquivo que "congela" as versões exatas instaladas, para todo mundo ter o mesmo resultado. |
| TypeScript | JavaScript com tipos: avisa erros (ex.: campo com nome errado) antes de rodar. |
| Typecheck | Rodar o TypeScript só para procurar erros de tipo. |
| Lint | Verificação automática de estilo e de erros comuns no código. |
| Resolver | Função do servidor que responde a uma pergunta GraphQL. |
| Proxy | Intermediário que recebe um pedido e o repassa para outro endereço. |
| CORS | Regra de segurança do navegador que bloqueia pedidos entre endereços diferentes. |
| Token de design | Variável com uma decisão visual (cor, espaçamento) usada por todos os componentes. |
| Build | Gerar a versão final, otimizada, do código para publicar. |
| Porta | "Número de porta" do computador onde cada servidor atende (4000, 5173, 6006). |

