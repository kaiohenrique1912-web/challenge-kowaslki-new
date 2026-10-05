# Análise da feature de busca do QuintoAndar (compra)

> Levantamento feito em 2026-10-01 a partir de:
> - acesso à URL `https://www.quintoandar.com.br/comprar/imovel/sao-paulo-sp-brasil` e a uma
>   página filtrada (`/comprar/imovel/pinheiros-sao-paulo-sp-brasil/apartamento/3-quartos`);
>   o HTML veio parcialmente renderizado (sem mapa e sem menu de ordenação);
> - prints em `docs/reference/`. **Atenção:** os prints são do fluxo de **aluguel**; a feature
>   a copiar é a de **compra**. Onde o comportamento de compra foi inferido a partir do aluguel,
>   isso está indicado.
>
> Itens marcados com **(suposição)** precisam de validação. Este documento é o "o que existe";
> as regras que vamos de fato implementar estão em [business-rules.md](business-rules.md).

## 1. Ponto de entrada

- Home com card "Buscar imóveis / Anunciar imóveis", abas **Alugar / Comprar**, campos
  **Cidade**, **Bairro**, **Valor total até**, **Quartos** e botão "Buscar imóveis"
  (`buscar_imoveis.jpeg`).
- Fluxo alternativo de onboarding em perguntas ("Você busca quais tipos de imóveis?",
  "Mais alguma característica?") com contador "Cerca de N imóveis encontrados"
  (`exemplo_pergunta_extra*.jpeg`). **Fora do escopo** (suposição).
- Contagem total em SP observada: "419.215 Imóveis à venda em São Paulo, SP".

## 2. Página de resultados (`tela_apos_busca.jpeg`)

Layout desktop: header global → barra de filtros → à esquerda a lista (grid de 3 colunas de
cards) e à direita o mapa ocupando a altura da viewport.

### 2.1 Barra de filtros (topo)
- Campo de localização com o texto da busca atual ("Barra Funda, São Paulo – SP, Brasil").
  No header da página de detalhe o placeholder é **"Rua, bairro ou código"** → autocomplete
  aceita rua, bairro e código do imóvel.
- Chips (pílulas) com dropdown: **Alugar/Comprar**, **Valor** ("Valor total: Até R$ 5.000"),
  **Tipos de imóvel**, **Quartos** ("3+ quartos"), **Vagas de garagem**, seta para rolar mais
  chips, **Mais filtros** (abre o painel completo).
- Chip ativo fica com fundo azul-claro e texto azul; inativo, fundo cinza claro.
- **Criar alerta de imóvel** — feito na Etapa 7 (o alerta é gravado; o envio das notificações fica fora do escopo).

### 2.2 Cabeçalho da lista
- Contagem + descrição dos filtros, ex.: **"7.887 Apartamentos com 3 quartos à venda em
  Pinheiros, São Paulo, SP"** (compra) / "11 imóveis — com 3 quartos para alugar em Barra
  Funda, São Paulo, SP" (aluguel).
- Botão de ordenação à direita, padrão **"Mais relevantes"**.

### 2.3 Ordenações
Confirmado (compra): **Mais próximos**, **Mais relevantes** (padrão), **Mais recentes**,
**Menor valor**, **Maior valor**, **Maior retorno com aluguel**.

### 2.4 Card do imóvel
- Carrossel de fotos com bolinhas de paginação; badges no canto superior esquerdo.
- Badges observados: **Exclusivo**, **Baixou o preço**, **Anúncio novo**, **Em breve**
  (aluguel), **Compre já alugado** e **Ótimo preço** (compra).
- Título curto gerado: "Apartamento para alugar na Barra Funda, com 3 quartos".
- Compra: preço de venda em destaque (**R$ 1.555.000**) e linha **"Condo. + IPTU R$ 2.350"**.
  Aluguel: "R$ 2.354 aluguel" + "R$ 3.544 total".
- Linha de atributos: **"120 m² · 3 quartos · 2 vagas"** (vagas omitidas quando 0).
- Endereço: **"Rua João Moura, Pinheiros · São Paulo"** (sem número).
- Botão de favorito (coração) no rodapé do card.
- **(suposição)** card inteiro é link para o detalhe, aberto em nova aba no desktop.
- **(suposição)** hover no card destaca o pin/cluster correspondente no mapa.

### 2.5 Paginação
- Botão **"Ver mais"** ao final da lista carrega a próxima página (load more, não páginas
  numeradas). **(suposição)** tamanho de página ~24.

### 2.6 Mapa (`tela_apos_busca.jpeg`, `mapa_zoom_out.png`)
- Google Maps no original (usaremos Leaflet + OpenStreetMap).
- Marcadores são **bolhas brancas circulares com a contagem** de imóveis (não preço), tanto
  em zoom afastado (clusters de dezenas/centenas) quanto em zoom de rua ("1", "2").
- Pin vermelho marca o centro da localização buscada.
- Chips dos filtros ativos sobrepostos no topo do mapa, removíveis com "×"
  ("Total R$ 500 – R$ 5.000 ×", "3+ dormitórios ×").
- Controles de zoom +/−; botão **"Desenhar área de busca"** (polígono livre).
- Ao mover/zoom o mapa, a lista e a contagem passam a refletir a área visível (validado).
  O bairro buscado **continua** no campo de busca (o filtro não "muda"), mas ao afastar o zoom
  aparecem imóveis de fora do bairro (validado).
- **(suposição)** clicar num cluster dá zoom nele; clicar numa bolha "1" mostra um mini-card.

### 2.7 Painel "Mais filtros" (`mais_filtros1..4.jpeg` + HTML de compra)
Painel lateral/modal com rolagem, botão fechar (×), rodapé fixo com **"Limpar"** e
**"Ver N imóveis"** (contagem ao vivo com os filtros ainda não aplicados).

| Seção | Controle | Opções |
|---|---|---|
| Alugar / Comprar | toggle segmentado | — |
| Valor do imóvel | min/máx em R$ + slider duplo | (aluguel tem "Valor total / Aluguel") |
| Condomínio + IPTU | min/máx em R$ | só compra |
| Tipos de imóvel | checkboxes (multi) | Apartamento, Casa, Casa de Condomínio, Kitnet/Studio |
| Data de publicação | seleção única | Tanto faz, Hoje, Últimos 7/15/30 dias, Últimos 2/6 meses |
| Quartos | pílulas | 1+, 2+, 3+, 4+ (HTML indica também faixa min/máx) |
| Banheiros | pílulas | 1+, 2+, 3+, 4+ |
| Vagas de garagem | pílulas | Tanto faz, 1+, 2+, 3+ |
| Área | min/máx em m² | — |
| Mobiliado | pílulas | Tanto faz, Sim, Não |
| Próximo ao metrô | pílulas | Tanto faz, Sim, Não |
| Exclusivos QuintoAndar | pílulas | Tanto faz, Sim, Não |
| Suítes | pílulas | Tanto faz, 1+, 2+, 3+, 4+ |
| Compra para investir | toggles | exibir rentabilidade mensal; só imóveis já alugados |
| Condomínio | checkboxes | Academia, Área verde, Brinquedoteca, Churrasqueira, Elevador, Lavanderia, Piscina, Playground, Portaria 24h, Quadra esportiva, Salão de festas, Salão de jogos, Sauna |
| Comodidades | checkboxes | Apartamento cobertura, Ar condicionado, Banheira, Box, Churrasqueira, Chuveiro a gás, Closet, Garden/Área privativa, Novos ou reformados, Piscina privativa, Somente uma casa no terreno, Tanque, Televisão, Utensílios de cozinha, Ventilador de teto |
| Mobílias | checkboxes | Armários na cozinha, Armários no quarto, Armários nos banheiros, Cama de casal, Cama de solteiro, Mesas e cadeiras de jantar, Sofá |
| Bem-estar | checkboxes | Janelas grandes, Rua silenciosa, Sol da manhã, Sol da tarde, Vista livre |
| Eletrodomésticos | checkboxes | Fogão, Fogão cooktop, Geladeira, Máquina de lavar, Microondas |
| Cômodos | checkboxes | Área de serviço, Cozinha americana, Home-office, Jardim, Quintal, Varanda |
| Acessibilidade | checkboxes | Banheiro adaptado, Corrimão, Piso tátil, Quartos e corredores com portas amplas, Rampas de acesso, Vaga de garagem acessível |

- **(suposição)** checkboxes de comodidades combinam com **E** (o imóvel precisa ter todas).
- **(suposição)** "Aceita pet" é filtro só de aluguel; em compra vira apenas atributo.
- **(suposição)** "exibir rentabilidade mensal" fica **fora do escopo** inicial.

### 2.8 Persistência na URL
- O original usa segmentos de path para SEO: `/comprar/imovel/{bairro-slug}-sao-paulo-sp-brasil/{tipo}/{n}-quartos`
  e tokens como `q-ate-400000` (preço) e `q-ate-100m2` (área).
- **(suposição)** filtros avançados também ficam na URL; voltar/avançar do navegador restaura
  a busca. Vamos usar **query string** (mais simples e previsível), mantendo o bairro no path.

## 3. Página de detalhe (`abrir_oferta*.png`)

- Header com busca "Rua, bairro ou código".
- Hero: título gerado ("Casa para alugar com 90m², 3 quartos e sem vaga"), preço em destaque,
  botões **Agendar visita** e **Converse conosco agora**; galeria com botões
  **compartilhar**, **favoritar**, **"62 Fotos"**, **"Mapa"** e setas.
- Breadcrumb: Início › São Paulo › Bairro › Rua › Imóvel {código}.
- Card de endereço (rua + "Bairro, São Paulo") com seta → mapa.
- Grade de atributos com ícones: área, quartos, banheiros, vagas ("–" quando 0), andar
  ("Até 3º andar"), aceita pet, mobília, metrô próximo.
- Tag "Imóvel 1601406" + "Publicado há 1 dia".
- **Descrição do proprietário** truncada com "Ver mais".
- **Itens disponíveis** (✓) × **Itens indisponíveis** (riscados/cinza).
- Card lateral fixo de preços. Aluguel: Aluguel, Condomínio ("Incluso"), IPTU, Seguro
  incêndio, Taxa de serviço, Total. **(suposição)** compra: Valor de venda, Condomínio, IPTU
  (sem "total" somado ao preço).
- Ações: Agendar visita, Fazer proposta (**fora do escopo**, botões sem efeito),
  **Favoritar**, **Compartilhar** (copiar link).
- Tooltip "Que tal salvar este imóvel? Crie listas dos seus imóveis preferidos." —
  **(suposição)** listas nomeadas fora do escopo; favorito é uma lista única.

## 4. Favoritos
- Coração no card e no detalhe. No original exige login.
- **(suposição)** sem login: usuário anônimo identificado por um id gerado no navegador;
  filtro/rota "ver favoritos".

## 5. Mobile
- **Prioridade baixa:** o foco é desktop/notebook; o mobile será revisado depois.
- Não há prints mobile. **(suposição)** baseada no padrão do site:
  - lista em coluna única; botão flutuante alterna **Lista ↔ Mapa**;
  - chips da barra de filtros em rolagem horizontal;
  - "Mais filtros" abre em tela cheia (o layout de `mais_filtros*.jpeg` já é desse formato).

## 6. Fora do escopo (proposto)
Aluguel, envio das notificações de alerta, onboarding por perguntas, login real, agendar
visita, proposta, chat, toggle "exibir rentabilidade mensal" (o dado existe por causa da
ordenação "Maior retorno com aluguel", mas o toggle não). Desenhar área de busca e criar alerta
de imóvel foram feitos na Etapa 7.
