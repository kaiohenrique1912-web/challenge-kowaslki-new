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

