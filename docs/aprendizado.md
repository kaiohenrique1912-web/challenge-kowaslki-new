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

---

# Aprendizado — Etapa 2 (Modelo de dados e seed)

> Na Etapa 2 o projeto ganhou um **banco de dados de verdade** com 60.000 imóveis inventados, mas realistas, espalhados por 102 bairros reais de São Paulo. Ainda não dá para buscar pela tela; isso vem nas Etapas 3 e 5.

## 1. O que foi feito, passo a passo

### 1.1 As regras do imóvel em código (`packages/shared`)
O que estava escrito em `business-rules.md` virou código que o computador consegue checar:
- **`domain/property.ts`**: os tipos de imóvel (Apartamento, Casa, Casa de condomínio, Studio) e seus nomes em português.
- **`domain/amenities.ts`**: as 57 comodidades (Piscina, Academia, Varanda…) e a regra de quais valem para cada tipo. Por exemplo, casa de rua não tem "Piscina do condomínio".
- **`domain/limits.ts`**: as faixas válidas (preço de R$ 50 mil a R$ 50 milhões, área de 10 a 2.000 m²…) e o "retângulo" de São Paulo no mapa.
- **`domain/derived.ts`**: os cálculos automáticos: aluguel estimado, retorno com aluguel, os selos ("Exclusivo", "Baixou o preço", "Ótimo preço"…) e a nota de "Mais relevantes".
- **`validation/property.ts`**: o **validador** (feito com uma biblioteca chamada **zod**). Você entrega os dados de um imóvel e ele responde "ok" ou uma lista de erros em português, como *"Suítes não podem passar do número de quartos."*

**Por quê?** Esse validador é o mesmo que o futuro **cadastro de imóveis** vai usar. Se a IA criar o formulário, ela não precisa reinventar nenhuma regra, é só usar o que já está aqui.

### 1.2 As tabelas do banco (`apps/api/src/db/migrations/0001_init.sql`)
Um banco de dados é como uma planilha com várias abas, chamadas **tabelas**:

| Tabela | O que guarda |
|---|---|
| `neighborhoods` | os bairros (nome, centro no mapa, preço médio do m²) |
| `properties` | os imóveis (tipo, endereço, preço, quartos…) |
| `property_photos` | as fotos de cada imóvel, em ordem |
| `property_amenities` | as comodidades de cada imóvel |
| `favorites` | os favoritos (vazia por enquanto) |

Algumas colunas são **calculadas pelo próprio banco**, como "condomínio + IPTU" e "preço por m²". Assim ninguém precisa lembrar de calcular, e elas nunca ficam erradas.

Esse arquivo é uma **migração**: um passo numerado de evolução do banco. Se no futuro for preciso mudar o banco (por exemplo, para o cadastro), cria-se uma migração nova (`0002_...sql`), em vez de editar a antiga. Quem já tem o banco só aplica o passo que falta.

Também foram criados os **índices** planejados na Etapa 0, para as buscas e ordenações ficarem rápidas. Uma busca de teste por área do mapa respondeu em cerca de 24 milissegundos.

### 1.3 O seed: como os 60 mil imóveis são inventados (`apps/api/src/db/seed/`)
- **Bairros reais:** 102 bairros de SP, cada um com o centro aproximado no mapa, o preço de referência do m² (Itaim Bibi ~R$ 17 mil, Cidade Tiradentes ~R$ 3 mil), o tamanho, se tem mais prédios ou mais casas e se tem metrô.
- **Imóveis coerentes:** para cada imóvel, o gerador sorteia um bairro e então escolhe valores que combinam entre si:
  - tipo de acordo com o bairro (mais apartamentos em Pinheiros, mais casas no Grajaú);
  - quartos, suítes, banheiros e vagas que fazem sentido juntos;
  - área compatível com os quartos;
  - preço = m² do bairro × área, com uma variação para não ficar tudo igual;
  - condomínio e IPTU proporcionais ao imóvel e ao bairro;
  - posição no mapa espalhada em volta do centro do bairro.
- **Seed fixa (reprodutível):** o sorteio usa um gerador de números "pseudoaleatórios". Com a mesma semente (o número `42`), ele gera **exatamente os mesmos imóveis** toda vez, como embaralhar um baralho sempre do mesmo jeito. Assim um bug encontrado hoje pode ser reproduzido amanhã.
- **Tudo validado:** cada imóvel inventado passa pelo validador do item 1.1. Se um único estiver errado, o seed para com erro. Isso garante que os dados de teste obedecem às mesmas regras que um cadastro real.
- **Fotos sem internet:** em vez de baixar fotos de algum site, a API **desenha** uma ilustração simples (sala, quarto, cozinha, fachada…) no formato SVG, que é uma imagem feita de instruções de desenho. Exemplo: http://localhost:4000/static/photos/living-3.svg (com a API rodando).

### 1.4 Recálculo (`apps/api/src/db/maintenance/recompute.ts`)
Algumas informações dependem de **outros imóveis** ou do **tempo**:
- o preço médio do m² do bairro, que decide o selo "Ótimo preço";
- o aluguel estimado;
- a nota de "Mais relevantes", que cai conforme o anúncio envelhece.

O comando `bun run recompute-scores` recalcula tudo isso. O seed já roda esse recálculo no final.

## 2. Problemas encontrados e como foram resolvidos

- **Seed lento (20 s):** medindo cada fase, o tempo estava quase todo na gravação de ~2 milhões de linhas (imóveis + fotos + comodidades). Duas mudanças:
  1. gravar várias linhas por comando, em vez de uma por vez;
  2. criar os índices **só no final**. Manter o índice atualizado a cada linha é como reorganizar o índice de um livro a cada palavra escrita; é muito mais rápido montar o índice uma vez, com o livro pronto.

  Resultado: **~9–10 s**.
- **Condomínio caro demais na periferia:** a primeira versão gerava condomínio + IPTU de ~R$ 1.070 em Itaquera, acima do real. A taxa por m² dos bairros mais baratos foi reduzida, e agora vai de ~R$ 750 (Itaquera) a ~R$ 1.490 (Pinheiros).
- **Teste com tempo esgotado:** o teste que popula 60 mil imóveis passava do limite padrão de 5 segundos e foi ajustado.

## 3. Resultado

| Item | Quantidade |
|---|---|
| Imóveis | 60.000 (58.248 ativos) |
| Bairros | 102 |
| Fotos | ~1,1 milhão |
| Comodidades | ~850 mil |
| Tempo do seed | ~9–10 s |
| Testes | 39 passando (incluindo "o seed gera ≥ 50.000 imóveis válidos") |

Exemplo de coerência: um apartamento de 3 quartos sai por volta de **R$ 1,45 milhão em Pinheiros** e **R$ 400 mil em Itaquera**.

## 4. Como rodar

```
bun run seed               # recria o banco com os 60 mil imóveis (~10 s)
bun run recompute-scores   # recalcula médias, aluguel estimado e relevância
bun test                   # inclui o teste do seed
```

O banco fica em `apps/api/data/app.db` (cerca de 130 MB) e **não vai para o GitHub**: cada pessoa gera o seu com `bun run seed`.

## 5. Glossário da Etapa 2

| Termo | Significado |
|---|---|
| Tabela | "Aba" do banco de dados, com linhas (registros) e colunas (campos). |
| Migração | Passo numerado que cria ou altera tabelas do banco. |
| Seed | Script que enche o banco com dados iniciais. |
| Seed fixa / semente | Número que faz o sorteio "aleatório" sempre dar o mesmo resultado. |
| Validação | Conferir se um dado obedece às regras antes de aceitá-lo. |
| zod | Biblioteca usada para escrever as regras de validação. |
| Transação | Conjunto de gravações tratadas como uma só: ou entram todas, ou nenhuma. |
| Coluna calculada | Coluna que o banco preenche sozinho a partir de outras (ex.: condomínio + IPTU). |
| Mediana | O valor do meio de uma lista ordenada; menos afetada por valores extremos do que a média. |
| SVG | Formato de imagem feito de instruções de desenho (linhas, formas, cores). |

---

# Aprendizado — Etapa 3 (Backend GraphQL de busca)

> Na Etapa 3 o servidor aprendeu a **responder perguntas sobre os imóveis**: buscar com filtros, ordenar, paginar, montar as bolinhas do mapa, abrir um imóvel e sugerir bairros e ruas enquanto você digita. Ainda não há tela de busca (isso é a Etapa 5), mas dá para testar tudo pelo GraphiQL em http://localhost:4000/graphql.

## 1. O que foi feito, passo a passo

### 1.1 O contrato: o schema GraphQL (`apps/api/src/graphql/schema/`)
O schema é o **cardápio** da API: diz quais perguntas existem e o formato exato de cada resposta. Ficou dividido por assunto (imóveis, mapa, bairros, autocomplete). As perguntas disponíveis:

| Pergunta | Para que serve |
|---|---|
| `searchProperties` | A busca: filtros, ordenação, páginas e total de resultados |
| `propertyMapClusters` | As bolinhas com números do mapa |
| `property(id)` | Um imóvel completo, para a página de detalhe |
| `locationSuggestions` | O autocomplete "Rua, bairro ou código" |
| `neighborhoods` / `amenities` | Listas de bairros e de comodidades |

Exemplo de pergunta (cole no GraphiQL):

```graphql
{
  searchProperties(filters: { neighborhoodSlugs: ["pinheiros"], minBedrooms: 3 }, sort: PRICE_ASC, first: 2) {
    totalCount
    nodes { title salePrice monthlyCost badges }
  }
}
```

### 1.2 Tipos gerados automaticamente (codegen)
Um programa chamado **GraphQL Code Generator** lê o schema e **escreve sozinho** os tipos TypeScript das respostas. Se alguém escrever um campo com nome errado no código do servidor, o TypeScript avisa antes de rodar. Sempre que o schema mudar, roda-se `bun run codegen`.

### 1.3 As três camadas
Cada pergunta passa por três "balcões", cada um com uma única tarefa:

1. **Resolver** (`*.resolvers.ts`): o atendente. Recebe a pergunta e repassa, sem tomar decisão nenhuma.
2. **Service** (`*.service.ts`): o gerente. Confere se o pedido faz sentido (o mínimo é menor que o máximo? o bairro existe?), aplica os padrões (24 por página, "Mais relevantes") e decide como buscar.
3. **Repository** (`*.repository.ts`): o estoquista. Só conversa com o banco, em SQL.

**Por quê?** Quando algo der errado, você sabe onde procurar. E quem criar o cadastro de imóveis copia o mesmo formato.

### 1.4 Um único lugar para os filtros (`property-where.ts`)
Todos os filtros ("3+ quartos", "até R$ 900 mil", "com piscina"…) viram SQL **num arquivo só**. A lista, o total ("566 imóveis") e o mapa usam exatamente o mesmo filtro. Por isso as bolinhas do mapa sempre somam o mesmo número que a lista mostra, e há um teste garantindo isso.

### 1.5 Validação com mensagens claras
Antes de buscar, o serviço confere a pergunta com as regras do `packages/shared`. Se algo estiver errado, a resposta explica em português e diz qual campo:

```json
{ "message": "Valor do imóvel: o valor mínimo não pode ser maior que o máximo.",
  "extensions": { "code": "BAD_USER_INPUT", "field": "filters.price" } }
```

Assim a tela pode mostrar o erro do lado do campo certo.

### 1.6 Paginação por cursor ("Ver mais")
Cada página devolve um **cursor**: um "marcador de página" com o último imóvel visto. Para buscar a próxima página, a tela devolve esse marcador. O banco continua de onde parou, sem repetir nem pular imóveis, mesmo que novos anúncios entrem no meio. Há um teste que percorre todas as páginas e confere que cada imóvel aparece exatamente uma vez.

### 1.7 As bolinhas do mapa
O servidor divide o mapa numa **grade** (como um papel quadriculado) e conta quantos imóveis caem em cada quadradinho. Com o mapa afastado os quadrados são grandes (bolinhas com centenas); ao aproximar ficam pequenos (bolinhas com "1"). Em vez de mandar 58 mil pontos para o navegador, ele manda no máximo 1.000 bolinhas.

### 1.8 Loaders: evitando o "N+1"
Uma lista de 24 cards precisa do bairro, das fotos e das comodidades de cada imóvel. O jeito ingênuo faria 24 consultas para fotos, mais 24 para bairros, e assim por diante (o problema "N+1"). Os **loaders** juntam esses pedidos e fazem **uma** consulta para as fotos dos 24, uma para os bairros etc.

## 2. Problemas encontrados e como foram resolvidos

- **Buscas lentas (300 ms):** a primeira medição mostrou buscas por bairro e por área do mapa levando ~300 ms. A causa era o **cache** do SQLite, que por padrão guarda só 2 MB do banco na memória, menos que a tabela de imóveis; ele vivia relendo páginas do disco. Com cache de 64 MB e memória mapeada, caiu para ~35 ms (quase 10× mais rápido), com uma linha de configuração.
- **Filtro de comodidades:** foram testadas três formas de escrever "tem piscina E academia E elevador". A escolhida (`INTERSECT`) foi ~2,5× mais rápida que a original, com o mesmo resultado.
- **Mapa com zoom alto:** quando a área gerava bolinhas demais, o servidor refazia a conta inteira com um zoom menor. Agora ele só junta as bolinhas vizinhas de 4 em 4, sem voltar ao banco. Um teste confere que o resultado é idêntico.
- **Autocomplete de rua (62 ms → 11 ms):** em vez de procurar o texto em todos os 60 mil imóveis, primeiro acha os nomes de rua distintos (poucos) e só depois agrupa.
- **Bairros fora de ordem:** os testes pegaram que "Água Branca" aparecia **depois** de "Vila Sônia", porque o banco ordena letras com acento por último. A correção foi ordenar pelo nome sem acento.

## 3. Resultado: tempos com 60 mil imóveis (`bun run bench`)

| Busca | Tempo típico |
|---|---|
| Lista padrão da cidade toda | 5 ms |
| Bairro + 3 quartos, menor valor | 30 ms |
| Área do mapa + filtros | 41 ms |
| Com piscina + academia + elevador | 26 ms |
| Página 11 ("Ver mais" várias vezes) | 5 ms |
| Abrir um imóvel | 1 ms |
| Autocomplete | 0,3 a 9 ms |
| Mapa da cidade inteira (caso mais pesado) | 49 ms |

Para comparação, um piscar de olhos leva ~100 ms. **101 testes** passando.

## 4. Como testar você mesmo

```
bun run dev:api            # sobe a API
# abra http://localhost:4000/graphql e cole a pergunta do item 1.1
bun run bench              # mede os tempos
bun test                   # roda os 101 testes
```

## 5. Glossário da Etapa 3

| Termo | Significado |
|---|---|
| Schema | O "cardápio" da API: perguntas possíveis e formato das respostas. |
| Query | Uma pergunta de leitura feita à API GraphQL. |
| Codegen | Programa que gera código automaticamente (aqui, os tipos a partir do schema). |
| Service / Repository | Camada das regras / camada que só fala com o banco. |
| Cursor | Marcador de página que diz "continue a partir daqui". |
| Cluster | Bolinha do mapa que agrupa vários imóveis próximos. |
| N+1 | Erro clássico: fazer uma consulta ao banco para cada item de uma lista. |
| Loader | Peça que junta vários pedidos parecidos numa única consulta. |
| Cache | Memória rápida que guarda dados usados com frequência. |
| p50 / p95 | Tempo da busca "típica" (metade é mais rápida) / das 95% mais rápidas. |
| Benchmark | Teste que mede velocidade. |

---

# Aprendizado — Etapa 4 (Design system + Storybook)

> Na Etapa 4 foi construído o **kit de peças visuais** do projeto: cores, fontes, tamanhos e todos os componentes (botões, campos, card do imóvel, barra de filtros, bolinhas do mapa…). A tela de busca (Etapa 5) vai ser montada **encaixando essas peças**, como Lego. Dá para ver todas em http://localhost:6006 com `bun run storybook`.

## 1. O que foi feito, passo a passo

### 1.1 Tokens: as decisões visuais em um lugar só (`packages/ui/src/tokens/tokens.ts`)
Um **token** é uma decisão visual com nome. Em vez de espalhar `#3b5bc2` pelo código, todo mundo usa `--qa-color-primary` ("a cor principal"). Se um dia o azul mudar, muda-se **um** arquivo. Os tokens criados:

- **Cores** tiradas dos prints: o azul dos botões, o azul-clarinho do filtro selecionado, o cinza das pílulas, os tons de texto, o vermelho do pino do mapa, o rosa do coração.
- **Tipografia:** fonte **Inter** (gratuita, parecida com a do QuintoAndar, instalada no projeto, sem depender de internet) e tamanhos de 12 a 44 px.
- **Espaçamentos** em múltiplos de 4 px, **bordas arredondadas** (8 px nos campos, 12 px nos cards, pílula nos botões), **sombras** e **breakpoints** (larguras de tela).

O arquivo de CSS com os tokens é **gerado automaticamente** a partir do TypeScript (`bun run tokens`). Um teste falha se alguém editar um e esquecer o outro, e outro teste falha se algum componente usar um token que não existe.

### 1.2 Componentes base (`packages/ui/src/components/`)
São as peças genéricas, que serviriam para qualquer site:

| Peça | Exemplo no QuintoAndar |
|---|---|
| `Button` | "Buscar imóveis" (azul), "Mais relevantes" (cinza), "Limpar" (link) |
| `IconButton` | O "×" de fechar, as setas das fotos |
| `Input` | Campos "Mínimo R$" e "Máximo R$" |
| `Select` | Lista de ordenação |
| `Checkbox` | "Piscina", "Academia"… no painel de filtros |
| `Toggle` | Interruptor "Buscar ao mover o mapa" |
| `Chip` | As pílulas "Tipos de imóvel ▾", "3+ quartos" |
| `SegmentedControl` | "Alugar \| Comprar" |
| `CounterSelector` | "Tanto faz · 1+ · 2+ · 3+" |
| `RangeSlider` / `RangeField` | Slider de preço com duas bolinhas + campos mínimo/máximo |
| `Badge` / `Tag` | "Exclusivo" na foto; "✓ Varanda" no detalhe |
| `Skeleton` / `Spinner` | Blocos cinza piscando enquanto carrega |
| `Tooltip` | Balão preto "Que tal salvar este imóvel?" |
| `Modal` / `Drawer` | Janela central / painel lateral "Mais filtros" |
| `Pagination` | Páginas numeradas (a busca usa "Ver mais") |

### 1.3 Componentes de domínio (`packages/ui/src/domain/`)
São as peças **específicas de imóveis**:

- **`PropertyCard`**: o card da lista, igual ao print: fotos com bolinhas e selos, título pequeno, preço em negrito, "Condo. + IPTU", coração, "120 m² · 3 quartos · 2 vagas" e endereço sem número. O card inteiro é clicável.
- **`PhotoCarousel`**, **`PropertyBadges`** (no máximo 2 selos, na ordem das regras), **`PriceTag`**, **`FavoriteButton`**.
- **`FilterBar`**: a barra de filtros do topo.
- **`MapCluster`** e **`MapPin`**: a bolinha branca com número e o pino vermelho do mapa.

Esses componentes **não inventam texto**: "Condo. + IPTU R$ 2.350", "Sem condomínio e IPTU" e "120 m² · Studio" vêm de funções do `packages/shared`, as mesmas regras de negócio da Etapa 0. E o erro do slider de preço usa **a mesma validação da API**, então a mensagem na tela é idêntica à do servidor.

### 1.4 Storybook: o catálogo
Cada componente tem um arquivo `.stories.tsx` com seus **estados**: normal, selecionado, desabilitado, carregando, com erro, vazio e no celular. São **120 stories**. Assim dá para ver e testar cada peça isolada, sem precisar subir o site inteiro nem ter dados.

### 1.5 Acessibilidade
"Acessível" significa que dá para usar **só com o teclado** e com **leitor de tela** (o programa que lê a tela em voz alta para pessoas cegas):

- todo campo tem um rótulo e todo botão de ícone tem nome ("Fechar", "Favoritar");
- dá para ver onde está o foco do teclado (anel azul);
- nas pílulas de escolha única as **setas** do teclado mudam a opção;
- o painel de filtros prende o Tab dentro dele, fecha com **Esc** e devolve o foco a quem o abriu;
- quem pede "menos movimento" no sistema operacional não vê animações.

Há um **teste automático** que desenha todas as 120 stories e reprova se encontrar imagem sem descrição, botão sem nome ou campo sem rótulo. No Storybook, a aba **Accessibility** mostra problemas de contraste de cor.

### 1.6 `docs/design-system.md`
É o manual das peças: os tokens, **quando usar cada componente** (e quando não usar), as regras de acessibilidade, um "mapa" de qual peça forma cada parte dos prints e a **receita para criar um componente novo**. É o que a IA vai ler antes de montar qualquer tela.

## 2. Problemas encontrados e como foram resolvidos

- **Painel roubando o foco:** o código que mantém o foco dentro do painel de filtros rodava de novo a cada atualização da tela e jogaria o cursor de volta para o primeiro botão enquanto você digitava. Foi corrigido antes de qualquer uso.
- **O teste de acessibilidade pegou dois problemas reais:** o interruptor (`Toggle`) dependia de uma forma frágil de dar nome ao botão, e o slider usava nomes de variável que pareciam tokens sem ser. Os dois foram corrigidos.
- **Avisos do lint:** duas stories se chamavam `Error`, nome que já existe no JavaScript (viraram `WithError`), e o Esc do tooltip saiu de um elemento "mudo" para o próprio botão.

## 3. Resultado

| Item | Quantidade |
|---|---|
| Componentes base | 19 |
| Componentes de domínio | 7 |
| Stories no Storybook | 120 |
| Testes do projeto | 130 passando |

## 4. Como ver

```
bun run storybook     # abre o catálogo em http://localhost:6006
```

Sugestões para olhar primeiro: **Domain › PropertyCard › Results Grid** (os cards como na busca), **Base › Drawer › Filters Panel** (o painel "Mais filtros"), **Base › RangeField › Min Greater Than Max** (o erro de validação) e **Foundations › Tokens** (todas as cores e tamanhos).

## 5. Glossário da Etapa 4

| Termo | Significado |
|---|---|
| Design system | Conjunto padronizado de decisões visuais e componentes reutilizáveis. |
| Token | Decisão visual com nome (ex.: `--qa-color-primary` = o azul principal). |
| Componente | Peça de interface reutilizável (botão, card…). |
| Story | Um "retrato" de um componente num estado específico, dentro do Storybook. |
| Props | As "configurações" que se passa para um componente (texto, cor, se está desabilitado…). |
| Acessibilidade (a11y) | Garantir que pessoas com deficiência consigam usar o sistema. |
| Leitor de tela | Programa que lê o conteúdo da tela em voz alta. |
| Foco | Qual elemento recebe as teclas no momento (navegando com Tab). |
| BEM | Jeito de nomear classes CSS: `bloco__parte--variante` (ex.: `qa-chip--selected`). |
| Breakpoint | Largura de tela a partir da qual o layout muda (ex.: celular × notebook). |

---

# Aprendizado — Etapa 5 (Frontend da busca)

> Na Etapa 5 todas as peças se juntaram: a **tela de busca funciona de verdade**, com os 60 mil imóveis, filtros, ordenação, mapa e celular. Abra com `bun run dev` → http://localhost:5173.

## 1. O que foi feito, passo a passo

### 1.1 A URL é a "memória" da busca
Tudo o que você escolhe vira parte do endereço da página, por exemplo:

`/comprar/imovel/pinheiros?quartos=3&tipos=apartamento&ordem=menor-valor`

Por isso:
- dá para **copiar o link** e mandar para alguém: a pessoa vê exatamente a mesma busca;
- o botão **voltar** do navegador desfaz o último filtro;
- recarregar a página não perde nada.

As funções que leem e escrevem esse endereço ficam no `packages/shared` (`url.ts`). Um teste confere a "ida e volta" (estado → endereço → estado igual) e que um endereço com lixo (`quartos=99`, `ordem=xyz`) é ignorado sem quebrar a página.

### 1.2 Peças novas no design system
Para montar a tela foram criadas 9 peças novas no `packages/ui`, todas com story no Storybook:

| Peça | Para quê |
|---|---|
| `Popover` | O painel que abre embaixo de um chip ("Quartos ▾") |
| `Combobox` | O campo "Rua, bairro ou código" com sugestões |
| `ChoiceChips` | Pílulas "Tanto faz · Sim · Não" |
| `StatusMessage` | Mensagens "Nenhum imóvel encontrado" e de erro |
| `AppHeader` | O cabeçalho com a marca |
| `SearchLayout` | Lista à esquerda, mapa à direita; no celular, alterna |
| `SortMenu` | O botão "Mais relevantes ▾" com as 6 ordenações |
| `ResultsHeader` | "161 Apartamentos / com 3 quartos à venda em Pinheiros…" |
| `FilterPanel` | O conteúdo inteiro do "Mais filtros" |

A tela (`apps/web`) só **encaixa** essas peças; ela não tem visual próprio, só CSS de posicionamento (onde fica o mapa, a grade de cards).

### 1.3 Os filtros funcionam com "rascunho"
Quando você abre "Quartos" ou "Mais filtros", as mudanças vão para um **rascunho**. O botão mostra ao vivo quantos imóveis o rascunho encontraria ("Ver 161 imóveis"), e a busca só muda quando você clica nele, igual ao original. Assim a lista não fica pulando a cada clique.

### 1.4 O mapa (a parte mais difícil)
- As **bolinhas** vêm prontas do servidor (Etapa 3); a tela só desenha.
- Passar o mouse num **card** pinta de azul a bolinha onde aquele imóvel está.
- Clicar numa bolinha grande **aproxima**; clicar numa bolinha "1" mostra o **card do imóvel** sobre o mapa.
- **Mover o mapa** (com "Buscar ao mover o mapa" ligado) muda a lista para a área visível, mantendo o bairro no título, como no original.
- **O detalhe delicado:** o mapa também se move sozinho, por exemplo quando você escolhe outro bairro e ele se enquadra. Se o código não separasse "você moveu" de "eu movi", cada enquadramento viraria uma busca nova, em loop. O código marca os movimentos dele como "programáticos" e ignora esses.

### 1.5 Cliente GraphQL tipado
As perguntas que a tela faz à API ficam num arquivo só (`operations.ts`). O **codegen** lê esse arquivo e o schema da API e gera os tipos. Se a tela pedir um campo que não existe, ou a API mudar, o TypeScript avisa antes de rodar.

### 1.6 Teste no navegador de verdade
Até a Etapa 4 eu só conseguia verificar a tela por testes "sem tela". Agora há um teste (`bun run e2e`) que **abre o Chrome instalado no seu computador, sem janela**, clica nos botões como uma pessoa e confere o resultado. São 14 fluxos:

1. busca por bairro;
2. mouse no card destaca o mapa;
3. filtro de quartos;
4. ordenação por menor valor;
5. "Ver mais";
6. botão voltar;
7. "Mais filtros" com Piscina;
8. remover chip no mapa;
9. arrastar o mapa;
10. autocomplete;
11. estado vazio;
12. estado de erro (a API é desligada de mentira);
13. endereço inválido;
14. celular.

Ele também **tira prints** de cada passo, e foi olhando esses prints que achei boa parte dos problemas abaixo.

## 2. Problemas encontrados e como foram resolvidos

- **Mapa poluído:** com quadradinhos de 64 px apareciam 224 bolinhas, bem mais denso que o original. A grade passou a ter 128 px.
- **API sem as regras novas:** o servidor em modo desenvolvimento não percebia mudanças no `packages/shared`, porque só observava a própria pasta. Mudar uma regra exigiria reiniciar a API na mão; agora ele observa o projeto todo.
- **Campo "Máximo" vazando:** nos painéis, o campo saía pela borda. O `<input>` tem uma largura mínima "natural" que a grade respeitava.
- **Botão "Lista | Mapa" sumindo no celular:** no modo Mapa, o mapa ficava **por cima** do botão de voltar para a lista, e não havia como voltar. As camadas do Leaflet competiam com o resto da página; o mapa foi "isolado" e o teste agora verifica que o botão continua clicável.
- **Chips do mapa empilhados:** dividiam o espaço com "Buscar ao mover o mapa"; o controle foi para o canto de baixo.
- **Menu de ordenação fechando sozinho:** com o padrão de "botões de opção", apertar ↓ já escolhia a ordenação e fechava o menu. Passou a ser um menu: setas andam, Enter escolhe.
- **Teste "instável":** o teste clicava no meio da animação de abertura do painel e errava o alvo. Ele agora espera as animações terminarem (para quem usa, não havia problema).

## 3. Resultado

| Item | Situação |
|---|---|
| Testes automáticos | 153 passando |
| Teste no navegador | 14/14 fluxos passando |
| Componentes novos no design system | 9 (com stories) |
| Fica para a Etapa 6 | Página de detalhe completa e o coração de favoritar |

## 4. Como testar você mesmo

```
bun run dev        # API + tela
# abra http://localhost:5173 e brinque: filtros, mapa, ordenação, voltar
bun run e2e        # (com o dev rodando) os 14 fluxos no Chrome; prints em apps/web/e2e/screenshots
```

## 5. Glossário da Etapa 5

| Termo | Significado |
|---|---|
| Query string | A parte do endereço depois do `?` (ex.: `?quartos=3`), onde ficam os filtros. |
| Rota | Qual página aparece para cada endereço (ex.: `/imovel/123` → página do imóvel). |
| Rascunho | Cópia dos filtros que você edita antes de confirmar. |
| Cache | Respostas guardadas para não perguntar de novo à API (o TanStack Query cuida disso). |
| Debounce | Esperar a pessoa parar de digitar ou mexer antes de buscar. |
| Tile | Cada "azulejo" de imagem que forma o mapa (vem do OpenStreetMap). |
| Teste de ponta a ponta (e2e) | Teste que usa o sistema inteiro como uma pessoa usaria, no navegador. |
| Headless | Navegador rodando sem janela, controlado por um programa. |
| z-index | "Altura" de um elemento na pilha da tela: quem fica por cima de quem. |


---

# Aprendizado — Etapa 6 (Detalhe, favoritos e acabamento)

> Na Etapa 6 o site ficou "completo" para quem busca um imóvel: dá para **abrir o imóvel**, ver tudo sobre ele, **favoritar** e voltar para a busca sem perder nada. Também foi feita uma revisão de aparência, de velocidade e o `README.md`.

## 1. O que foi feito, passo a passo

### 1.1 A página do imóvel (`/imovel/1037438`)
Montada comparando com os prints `abrir_oferta*.png` do original:
- **Topo:** título ("Casa à venda com 387m², 5 quartos e 2 vagas"), selos, preço em destaque e as fotos ao lado. Clicar numa foto ou em "33 Fotos" abre a **galeria** em tela cheia, com setas e miniaturas.
- **Corpo:** trilha (Início › São Paulo › Bairro › Rua › Imóvel), endereço, características com ícones ("Sem vaga", "Aceita pet"…), "Publicado há 11 dias", descrição com "Ver mais", itens disponíveis e indisponíveis e um **mapa** com a localização.
- **Lateral fixa:** o card de preços (venda, condomínio, IPTU, condo + IPTU) e o **retorno estimado com aluguel**, a mesma conta que alimenta a ordenação "Maior retorno com aluguel".
- **Fora do escopo:** "Agendar visita" e "Fazer proposta" abrem um aviso explicando que não fazem parte da demonstração, em vez de não fazer nada.

Os textos ("Sem vaga", "Térreo", "Publicado há 2 meses", "Condomínio: Não há") vêm do `packages/shared`, com testes, seguindo as regras de negócio.

### 1.2 Favoritos
- **No servidor:** duas "ações" novas na API, chamadas **mutations** (`addFavorite` e `removeFavorite`), e uma pergunta `favoritesCount`. Sem login: cada navegador ganha um código anônimo, guardado nele mesmo, que vai junto em todo pedido.
- **Na tela:** o coração aparece no card, na prévia do mapa e no detalhe. O cabeçalho mostra "Favoritos (2)", e o chip **"Favoritos"** na barra filtra só os seus.
- **Atualização otimista:** quando você clica no coração, a tela **já mostra** o coração preenchido, antes de a API responder. Se a API falhar, ela desfaz sozinha. Assim o clique parece instantâneo.

### 1.3 "Voltar para a busca" sem perder nada
Ao abrir um imóvel pela lista, a tela anota "vim da busca". O botão "Voltar para a busca" então usa o **voltar do navegador**: os filtros, os imóveis já carregados com "Ver mais" e a **posição da rolagem** voltam exatamente como estavam. Se você chegou ao imóvel por um link direto, ele volta para a última busca que você fez, ou para o bairro do imóvel.

### 1.4 Revisão de aparência
Comparando os prints da tela com os do original, dois ajustes no detalhe: o título ocupava 4 linhas (a coluna estava estreita) e os selos cinza sumiam no fundo cinza.

### 1.5 Revisão de velocidade
- **Cards "memorizados":** antes, passar o mouse em **um** card fazia o React redesenhar **todos** os cards da lista. Agora só os cards que mudaram são redesenhados.
- **Páginas sob demanda:** o código foi dividido por página. Quem abre o link de um imóvel não baixa o código da busca, e vice-versa.
- A API já estava rápida (Etapa 3): abrir um imóvel leva cerca de 1 ms no servidor.

### 1.6 Testes e README
- **API:** 5 testes novos de favoritos (favoritar duas vezes não duplica, cada usuário tem os seus, imóvel inativo não pode ser favoritado…).
- **Navegador:** o teste ganhou 6 fluxos novos, **20 no total**, todos passando:
  1. favoritar pelo card e ver o contador subir;
  2. "ver favoritos";
  3. abrir o detalhe e a galeria;
  4. voltar mantendo os filtros;
  5. desfavoritar no detalhe;
  6. imóvel inexistente.
- **`README.md`:** o "cartão de visita" do projeto. Diz o que dá para fazer, **como rodar do zero** em 3 comandos e as decisões técnicas.

## 2. Problemas encontrados e como foram resolvidos

- **Tipos das duas mutations:** favoritar e desfavoritar devolvem tipos diferentes, e o TypeScript não aceitava escolher entre elas numa linha só. As duas chamadas foram separadas.
- **Dependência escondida:** a página do imóvel importava uma constante da página de busca, o que faria baixar a busca inteira só para abrir um imóvel. A constante foi para um arquivo pequeno próprio.
- **Estilo dos marcadores:** o estilo do pino do mapa ficava no CSS da busca; abrindo direto um imóvel, o pino ficaria sem estilo. Foi para um arquivo usado pelas duas páginas.

## 3. Resultado

| Item | Situação |
|---|---|
| Testes automáticos | 170 passando |
| Teste no navegador | 20/20 fluxos |
| Componentes novos no design system | 7 (galeria, card de preços, características, itens, endereço, trilha, texto "Ver mais") |
| Documentação nova | `README.md` |

## 4. Como testar você mesmo

```
bun run dev
# abra http://localhost:5173, clique num imóvel, favorite, volte para a busca,
# clique em "Favoritos" no topo
bun run e2e     # (com o dev rodando) os 20 fluxos no Chrome
```

## 5. Glossário da Etapa 6

| Termo | Significado |
|---|---|
| Mutation | Pedido GraphQL que **altera** dados (ex.: favoritar), em vez de só ler. |
| Atualização otimista | Mostrar o resultado antes da confirmação do servidor e desfazer se der erro. |
| Memorizar (memo) | Guardar o desenho de um componente e só refazê-lo se os dados dele mudarem. |
| Code splitting | Dividir o código do site em pedaços baixados só quando necessários. |
| Lightbox | Visualizador de fotos em tela cheia, por cima da página. |
| README | Arquivo de apresentação de um projeto: o que é e como usar. |
