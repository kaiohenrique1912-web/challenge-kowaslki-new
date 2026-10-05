# Busca de imóveis à venda — clone do QuintoAndar

Clone funcional da **busca de imóveis à venda do QuintoAndar** (São Paulo), feito para o
desafio "Challenge #1 — SW & Product" ([docs/challenge.pdf](docs/challenge.pdf)). Roda 100% local,
com **60.000 imóveis** gerados em 102 bairros reais.

O projeto também foi organizado para que um agente de código consiga criar uma feature nova em
uma única instrução, respeitando as regras de negócio e o design existentes: veja
[CLAUDE.md](CLAUDE.md) e a pasta [docs/](docs/).

## O que dá para fazer

- **Buscar** por bairro, rua ou código do imóvel, ou na cidade toda.
- **Filtrar**:
  - valor, condomínio + IPTU e área;
  - tipos de imóvel e data de publicação;
  - quartos, banheiros, suítes e vagas;
  - mobiliado, perto do metrô, exclusivos e "compre já alugado";
  - 57 comodidades.

  Chips rápidos e o painel "Mais filtros" mostram "Ver N imóveis" ao vivo.
- **Ordenar** por mais próximos, mais relevantes, mais recentes, menor valor, maior valor e
  maior retorno com aluguel. "Ver mais" carrega a próxima página.
- **Mapa**:
  - bolinhas com a contagem de imóveis, que aproximam ao clicar;
  - a lista acompanha a área visível ("Buscar ao mover o mapa");
  - passar o mouse num card destaca a bolinha dele;
  - clicar numa bolinha "1" mostra o imóvel.
- **Ver o imóvel**: galeria de fotos, preço, condomínio, IPTU, retorno estimado com aluguel,
  características, itens disponíveis/indisponíveis, descrição e mapa da localização.
- **Favoritar** sem login (usuário anônimo guardado no navegador) e ver só os favoritos.
- **Compartilhar**: todos os filtros ficam na URL; o botão voltar do navegador funciona e
  "Voltar para a busca" mantém os filtros e a posição na lista.
- **Celular**: alternância Lista/Mapa. O foco do projeto é desktop/notebook.

## Como rodar do zero

Pré-requisito: **[Bun](https://bun.com) ≥ 1.4**. Node.js não é necessário. Funciona em
Windows, macOS e Linux.

```bash
bun install        # dependências de todos os pacotes
bun run seed       # cria o banco SQLite com 60.000 imóveis (~10 s)
bun run dev        # API (porta 4000) + site (porta 5173)
```

Abra **http://localhost:5173**. A API GraphQL (com o GraphiQL para testar consultas) fica em
http://localhost:4000/graphql.

| Comando | O que faz |
|---|---|
| `bun test` | Testes de todos os pacotes (regras, API, seed, design system) |
| `bun run e2e` | Com o `dev` rodando: abre o Chrome/Edge instalado e percorre 20 fluxos reais |
| `bun run storybook` | Catálogo do design system em http://localhost:6006 |
| `bun run bench` | Mede a velocidade das buscas com os 60 mil imóveis |
| `bun run typecheck` / `bun run lint` | Verificação de tipos / estilo de código |
| `bun run codegen` | Regera os tipos GraphQL (api e web) após mudar o schema ou as consultas |

## Como está organizado

```
apps/api          servidor Elysia + GraphQL Yoga, SQLite (bun:sqlite), seed
apps/web          site React + Vite (React Router, TanStack Query, Leaflet)
packages/ui       design system (tokens + componentes) documentado no Storybook
packages/shared   regras de negócio: enums, validações (zod), textos, contrato da URL
docs/             regras de negócio, arquitetura, design system, aprendizado
```

O caminho de uma busca:

1. Os filtros estão na URL.
2. `@qa/shared` converte a URL num estado tipado.
3. A tela faz consultas GraphQL tipadas.
4. Na API, o resolver repassa ao serviço, que valida com as mesmas regras do `shared`.
5. O repositório monta um SQL parametrizado e executa no SQLite com índices.

Detalhes em [docs/architecture.md](docs/architecture.md).

## Decisões técnicas

| Decisão | Por quê |
|---|---|
| **Bun** para tudo (runtime, pacotes, testes) | Uma ferramenta só, rápida; sem Node, sem Docker. |
| **SQLite** (`bun:sqlite`) | Zero infraestrutura. Com índices e cache ajustado, as buscas com 60 mil imóveis respondem em ~5–50 ms (`bun run bench`). |
| **GraphQL schema-first + codegen** | O schema é o contrato único entre API e tela; os tipos são gerados dos dois lados. |
| **Regras de negócio em `packages/shared`** | Validação, textos ("Condo. + IPTU R$ 2.350"), URL e filtros escritos uma vez e usados pela API e pela tela; um formulário de cadastro reaproveita a mesma validação. |
| **Um único lugar traduz filtros em SQL** (`property-where.ts`) | Lista, contagem e mapa usam o mesmo filtro, então as bolinhas sempre somam o total da lista. |
| **Paginação por cursor** | "Ver mais" sem repetir nem pular imóveis, com custo constante. |
| **Clusters do mapa calculados no SQL** (grade) | Respeitam todos os filtros sem mandar milhares de pontos ao navegador. |
| **Estado da busca na URL** | Link compartilhável, botão voltar funcionando, recarregar sem perder nada. |
| **Design system próprio** (CSS + tokens, sem biblioteca de UI) | Fidelidade ao visual do original; um teste renderiza todas as stories e checa acessibilidade. |
| **Leaflet + OpenStreetMap** | Mapa gratuito, sem chave de API. |
| **Favoritos com usuário anônimo** (`x-user-id`) | Sem login, conforme o escopo; trocar por autenticação real só muda de onde vem o id. |
| **Teste no navegador real** (`puppeteer-core`) | Usa o Chrome/Edge já instalado, sem baixar navegador; pegou bugs de layout que testes sem tela não pegam. |

Decisões detalhadas e medições: [docs/architecture.md §12](docs/architecture.md) e §5.4.

## Fora do escopo

Aluguel, login real, agendar visita, fazer proposta, alerta de imóvel, desenhar área de busca
no mapa. Os botões "Agendar visita" e "Fazer proposta" existem e explicam que não fazem parte
da demonstração. As fotos são ilustrações geradas pela própria API.

## Documentação

- [docs/business-rules.md](docs/business-rules.md) — regras do domínio (campos, faixas, filtros, textos).
- [docs/architecture.md](docs/architecture.md) — system design, schema, banco, mapa, convenções.
- [docs/design-system.md](docs/design-system.md) — tokens, componentes e quando usar cada um.
- [docs/feature-analysis.md](docs/feature-analysis.md) — levantamento do site original.
- [docs/aprendizado.md](docs/aprendizado.md) — o que foi feito em cada etapa, explicado para iniciantes.
- [PROGRESS.md](PROGRESS.md) — etapas do projeto.
