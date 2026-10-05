import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { PropertyRecord, PropertyConnectionModel } from '../../modules/properties/property-record.ts';
import type { NeighborhoodRecord } from '../../modules/neighborhoods/neighborhood-record.ts';
import type { SearchAlertRecord } from '../../modules/search-alerts/search-alerts.repository.ts';
import type { GraphQLContext } from '../../context.ts';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Data/hora ISO-8601 (UTC). */
  DateTime: { input: string; output: number; }
};

/** Canal de aviso de um alerta de busca. */
export type AlertChannel =
  /** Notificações no app (assim que o imóvel chegar). */
  | 'APP'
  /** E-mail com os imóveis que chegaram no dia. */
  | 'EMAIL'
  /** Whatsapp (assim que o imóvel chegar). */
  | 'WHATSAPP';

export type Amenity = {
  __typename?: 'Amenity';
  category: AmenityCategory;
  code: AmenityCode;
  label: Scalars['String']['output'];
};

export type AmenityCategory =
  | 'ACCESSIBILITY'
  | 'APPLIANCES'
  | 'CONDOMINIUM'
  | 'FEATURES'
  | 'FURNITURE'
  | 'ROOMS'
  | 'WELLBEING';

/** Códigos estáveis das comodidades (docs/business-rules.md §3). */
export type AmenityCode =
  | 'ACCESSIBLE_PARKING'
  | 'ACCESS_RAMPS'
  | 'ADAPTED_BATHROOM'
  | 'AFTERNOON_SUN'
  | 'AIR_CONDITIONING'
  | 'AMERICAN_KITCHEN'
  | 'BACKYARD'
  | 'BALCONY'
  | 'BATHROOM_CABINETS'
  | 'BATHTUB'
  | 'BEDROOM_WARDROBES'
  | 'CEILING_FAN'
  | 'CLOSET'
  | 'CONCIERGE_24H'
  | 'CONDO_BARBECUE'
  | 'COOKTOP'
  | 'DINING_SET'
  | 'DOUBLE_BED'
  | 'ELEVATOR'
  | 'FRIDGE'
  | 'GAME_ROOM'
  | 'GARDEN'
  | 'GAS_SHOWER'
  | 'GREEN_AREA'
  | 'GYM'
  | 'HANDRAIL'
  | 'HOME_OFFICE'
  | 'KITCHEN_CABINETS'
  | 'KITCHEN_UTENSILS'
  | 'LARGE_WINDOWS'
  | 'LAUNDRY'
  | 'LAUNDRY_TANK'
  | 'MICROWAVE'
  | 'MORNING_SUN'
  | 'NEW_OR_RENOVATED'
  | 'OPEN_VIEW'
  | 'PARTY_ROOM'
  | 'PENTHOUSE'
  | 'PLAYGROUND'
  | 'POOL'
  | 'PRIVATE_BARBECUE'
  | 'PRIVATE_GARDEN'
  | 'PRIVATE_POOL'
  | 'QUIET_STREET'
  | 'SAUNA'
  | 'SERVICE_AREA'
  | 'SHOWER_BOX'
  | 'SINGLE_BED'
  | 'SINGLE_HOUSE_ON_LOT'
  | 'SOFA'
  | 'SPORTS_COURT'
  | 'STOVE'
  | 'TACTILE_FLOOR'
  | 'TOY_LIBRARY'
  | 'TV'
  | 'WASHING_MACHINE'
  | 'WIDE_DOORS';

/** Retângulo da área visível do mapa. */
export type BoundingBox = {
  east: Scalars['Float']['input'];
  north: Scalars['Float']['input'];
  south: Scalars['Float']['input'];
  west: Scalars['Float']['input'];
};

export type Bounds = {
  __typename?: 'Bounds';
  east: Scalars['Float']['output'];
  north: Scalars['Float']['output'];
  south: Scalars['Float']['output'];
  west: Scalars['Float']['output'];
};

export type CreateSearchAlertInput = {
  channels: Array<AlertChannel>;
  searchUrl: Scalars['String']['input'];
};

export type Health = {
  __typename?: 'Health';
  service: Scalars['String']['output'];
  /** Sempre "ok" quando a API responde. */
  status: Scalars['String']['output'];
  /** ISO-8601 (UTC) */
  timestamp: Scalars['String']['output'];
};

/** Faixa inclusiva; qualquer lado pode ficar em branco. */
export type IntRange = {
  max?: InputMaybe<Scalars['Int']['input']>;
  min?: InputMaybe<Scalars['Int']['input']>;
};

export type LatLng = {
  __typename?: 'LatLng';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type LatLngInput = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type LocationSuggestion = {
  __typename?: 'LocationSuggestion';
  bounds?: Maybe<Bounds>;
  center: LatLng;
  kind: LocationSuggestionKind;
  /** Texto exibido, ex.: "Pinheiros, São Paulo – SP". */
  label: Scalars['String']['output'];
  neighborhoodSlug?: Maybe<Scalars['String']['output']>;
  propertyId?: Maybe<Scalars['ID']['output']>;
};

export type LocationSuggestionKind =
  | 'NEIGHBORHOOD'
  | 'PROPERTY_CODE'
  | 'STREET';

/** Agrupamento de imóveis numa célula da grade do mapa. */
export type MapCluster = {
  __typename?: 'MapCluster';
  /** Extensão real dos imóveis (zoom ao clicar). */
  bounds: Bounds;
  /** Média das posições dos imóveis da célula. */
  center: LatLng;
  count: Scalars['Int']['output'];
  /** z{zoom}:{linha}:{coluna} — estável ao arrastar o mapa. */
  id: Scalars['ID']['output'];
  /** Preenchido quando count = 1. */
  propertyId?: Maybe<Scalars['ID']['output']>;
};

export type MapClusterResult = {
  __typename?: 'MapClusterResult';
  clusters: Array<MapCluster>;
  totalCount: Scalars['Int']['output'];
  /** Zoom efetivamente usado na agregação (pode ser menor que o pedido se houver células demais). */
  zoom: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Favorita um imóvel ativo para o usuário do header x-user-id. Idempotente. */
  addFavorite: Property;
  /** Cria o alerta da busca para o usuário do header x-user-id (a mesma busca de novo só troca os canais). */
  createSearchAlert: SearchAlert;
  /** Remove dos favoritos. Idempotente (remover o que não está favoritado não é erro). */
  removeFavorite: Property;
};


export type MutationAddFavoriteArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationCreateSearchAlertArgs = {
  input: CreateSearchAlertInput;
};


export type MutationRemoveFavoriteArgs = {
  propertyId: Scalars['ID']['input'];
};

export type Neighborhood = {
  __typename?: 'Neighborhood';
  bounds: Bounds;
  center: LatLng;
  id: Scalars['ID']['output'];
  /** Mediana do preço de venda por m² dos imóveis ativos do bairro. */
  medianPricePerM2: Scalars['Int']['output'];
  /** Aluguel mensal de referência por m². */
  medianRentPerM2: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  zone: Zone;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Photo = {
  __typename?: 'Photo';
  position: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type Property = {
  __typename?: 'Property';
  acceptsPets: Scalars['Boolean']['output'];
  amenities: Array<Amenity>;
  area: Scalars['Int']['output'];
  /** Em ordem de prioridade; o card mostra no máximo 2. */
  badges: Array<PropertyBadge>;
  bathrooms: Scalars['Int']['output'];
  bedrooms: Scalars['Int']['output'];
  condoFee: Scalars['Int']['output'];
  description: Scalars['String']['output'];
  estimatedRent: Scalars['Int']['output'];
  floor?: Maybe<Scalars['Int']['output']>;
  /** Título do detalhe, ex.: "Apartamento à venda com 120m², 3 quartos e 2 vagas". */
  headline: Scalars['String']['output'];
  /** Também é o código público ("Imóvel 1000123"). */
  id: Scalars['ID']['output'];
  iptu: Scalars['Int']['output'];
  isExclusive: Scalars['Boolean']['output'];
  isFavorite: Scalars['Boolean']['output'];
  isFurnished: Scalars['Boolean']['output'];
  isRented: Scalars['Boolean']['output'];
  location: LatLng;
  monthlyCost: Scalars['Int']['output'];
  /** Aluguel atual (só quando isRented). */
  monthlyRent?: Maybe<Scalars['Int']['output']>;
  nearSubway: Scalars['Boolean']['output'];
  neighborhood: Neighborhood;
  parkingSpaces: Scalars['Int']['output'];
  photoCount: Scalars['Int']['output'];
  photos: Array<Photo>;
  previousPrice?: Maybe<Scalars['Int']['output']>;
  pricePerM2: Scalars['Int']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Fração mensal (0.0045 = 0,45% a.m.). */
  rentalYield: Scalars['Float']['output'];
  salePrice: Scalars['Int']['output'];
  status: PropertyStatus;
  /** Só a rua: número e complemento nunca são expostos. */
  street: Scalars['String']['output'];
  suites: Scalars['Int']['output'];
  /** Título do card, ex.: "Apartamento à venda em Pinheiros com 3 quartos". */
  title: Scalars['String']['output'];
  type: PropertyType;
  /** Comodidades aplicáveis ao tipo que o imóvel não tem ("Itens indisponíveis"). */
  unavailableAmenities: Array<Amenity>;
};


export type PropertyPhotosArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type PropertyBadge =
  | 'EXCLUSIVE'
  | 'GREAT_PRICE'
  | 'NEW_LISTING'
  | 'PRICE_DROP'
  | 'RENTED';

export type PropertyConnection = {
  __typename?: 'PropertyConnection';
  nodes: Array<Property>;
  pageInfo: PageInfo;
  /** Total com todos os filtros (inclusive bbox); calculado só quando pedido. */
  totalCount: Scalars['Int']['output'];
};

/** Filtros da busca. Todos opcionais e combinados com E (docs/business-rules.md §4.1). */
export type PropertySearchFilters = {
  /** O imóvel precisa ter TODAS as comodidades. */
  amenities?: InputMaybe<Array<AmenityCode>>;
  /** Área útil (m²). */
  area?: InputMaybe<IntRange>;
  /** Área visível do mapa. */
  bbox?: InputMaybe<BoundingBox>;
  exclusive?: InputMaybe<Scalars['Boolean']['input']>;
  furnished?: InputMaybe<Scalars['Boolean']['input']>;
  minBathrooms?: InputMaybe<Scalars['Int']['input']>;
  minBedrooms?: InputMaybe<Scalars['Int']['input']>;
  minParkingSpaces?: InputMaybe<Scalars['Int']['input']>;
  minSuites?: InputMaybe<Scalars['Int']['input']>;
  /** Condomínio + IPTU mensal (R$). */
  monthlyCost?: InputMaybe<IntRange>;
  nearSubway?: InputMaybe<Scalars['Boolean']['input']>;
  /** Imóvel em qualquer um destes bairros. */
  neighborhoodSlugs?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Só favoritos do usuário do header x-user-id. */
  onlyFavorites?: InputMaybe<Scalars['Boolean']['input']>;
  /** Área desenhada no mapa (polígono de 3 a 40 pontos): só imóveis dentro dela. */
  polygon?: InputMaybe<Array<LatLngInput>>;
  /** Valor de venda (R$). */
  price?: InputMaybe<IntRange>;
  publishedWithin?: InputMaybe<PublishedWithin>;
  /** true = só imóveis já alugados ("Compre já alugado"). */
  rented?: InputMaybe<Scalars['Boolean']['input']>;
  types?: InputMaybe<Array<PropertyType>>;
};

export type PropertyStatus =
  | 'ACTIVE'
  | 'DRAFT'
  | 'INACTIVE';

export type PropertyType =
  | 'APARTMENT'
  | 'CONDO_HOUSE'
  | 'HOUSE'
  | 'STUDIO';

export type PublishedWithin =
  | 'LAST_2_MONTHS'
  | 'LAST_6_MONTHS'
  | 'LAST_7_DAYS'
  | 'LAST_15_DAYS'
  | 'LAST_30_DAYS'
  | 'TODAY';

export type Query = {
  __typename?: 'Query';
  /** Catálogo de comodidades na ordem do painel de filtros. */
  amenities: Array<Amenity>;
  /** Quantos imóveis ativos o usuário do header x-user-id favoritou (0 sem usuário). */
  favoritesCount: Scalars['Int']['output'];
  /** Verifica se a API está no ar. */
  health: Health;
  /** Autocomplete do campo "Rua, bairro ou código" (mínimo 2 caracteres). */
  locationSuggestions: Array<LocationSuggestion>;
  /** Todos os bairros, em ordem alfabética. */
  neighborhoods: Array<Neighborhood>;
  /** Imóvel ativo pelo id/código. null se não existir ou não estiver ativo. */
  property?: Maybe<Property>;
  /** Clusters dos imóveis da área visível, respeitando os filtros. Não inclua neighborhoodSlugs para ver também imóveis de outros bairros. */
  propertyMapClusters: MapClusterResult;
  /** Alertas do usuário do header x-user-id, do mais novo ao mais antigo. */
  searchAlerts: Array<SearchAlert>;
  /** Busca paginada por cursor ("Ver mais" passa pageInfo.endCursor em after). */
  searchProperties: PropertyConnection;
};


export type QueryLocationSuggestionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QueryPropertyArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPropertyMapClustersArgs = {
  bbox: BoundingBox;
  filters?: InputMaybe<PropertySearchFilters>;
  zoom: Scalars['Int']['input'];
};


export type QuerySearchPropertiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<PropertySearchFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  origin?: InputMaybe<LatLngInput>;
  sort?: InputMaybe<SortOrder>;
};

/** Busca salva para avisar quando chegar imóvel novo (docs/business-rules.md §4.5). */
export type SearchAlert = {
  __typename?: 'SearchAlert';
  channels: Array<AlertChannel>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** URL da busca, ex.: "/comprar/imovel/pinheiros?quartos=3". */
  searchUrl: Scalars['String']['output'];
};

export type SortOrder =
  | 'NEAREST'
  | 'NEWEST'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'RELEVANCE'
  | 'RENTAL_YIELD_DESC';

export type Zone =
  | 'CENTRO'
  | 'LESTE'
  | 'NORTE'
  | 'OESTE'
  | 'SUL';



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AlertChannel: AlertChannel;
  Amenity: ResolverTypeWrapper<Amenity>;
  AmenityCategory: AmenityCategory;
  AmenityCode: AmenityCode;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BoundingBox: BoundingBox;
  Bounds: ResolverTypeWrapper<Bounds>;
  CreateSearchAlertInput: CreateSearchAlertInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Health: ResolverTypeWrapper<Health>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  IntRange: IntRange;
  LatLng: ResolverTypeWrapper<LatLng>;
  LatLngInput: LatLngInput;
  LocationSuggestion: ResolverTypeWrapper<LocationSuggestion>;
  LocationSuggestionKind: LocationSuggestionKind;
  MapCluster: ResolverTypeWrapper<MapCluster>;
  MapClusterResult: ResolverTypeWrapper<MapClusterResult>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Neighborhood: ResolverTypeWrapper<NeighborhoodRecord>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Photo: ResolverTypeWrapper<Photo>;
  Property: ResolverTypeWrapper<PropertyRecord>;
  PropertyBadge: PropertyBadge;
  PropertyConnection: ResolverTypeWrapper<PropertyConnectionModel>;
  PropertySearchFilters: PropertySearchFilters;
  PropertyStatus: PropertyStatus;
  PropertyType: PropertyType;
  PublishedWithin: PublishedWithin;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SearchAlert: ResolverTypeWrapper<SearchAlertRecord>;
  SortOrder: SortOrder;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Zone: Zone;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Amenity: Amenity;
  Boolean: Scalars['Boolean']['output'];
  BoundingBox: BoundingBox;
  Bounds: Bounds;
  CreateSearchAlertInput: CreateSearchAlertInput;
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  Health: Health;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  IntRange: IntRange;
  LatLng: LatLng;
  LatLngInput: LatLngInput;
  LocationSuggestion: LocationSuggestion;
  MapCluster: MapCluster;
  MapClusterResult: MapClusterResult;
  Mutation: Record<PropertyKey, never>;
  Neighborhood: NeighborhoodRecord;
  PageInfo: PageInfo;
  Photo: Photo;
  Property: PropertyRecord;
  PropertyConnection: PropertyConnectionModel;
  PropertySearchFilters: PropertySearchFilters;
  Query: Record<PropertyKey, never>;
  SearchAlert: SearchAlertRecord;
  String: Scalars['String']['output'];
};

export type AmenityResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Amenity'] = ResolversParentTypes['Amenity']> = {
  category?: Resolver<ResolversTypes['AmenityCategory'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['AmenityCode'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type BoundsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Bounds'] = ResolversParentTypes['Bounds']> = {
  east?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  north?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  south?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  west?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type HealthResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Health'] = ResolversParentTypes['Health']> = {
  service?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type LatLngResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LatLng'] = ResolversParentTypes['LatLng']> = {
  lat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  lng?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type LocationSuggestionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LocationSuggestion'] = ResolversParentTypes['LocationSuggestion']> = {
  bounds?: Resolver<Maybe<ResolversTypes['Bounds']>, ParentType, ContextType>;
  center?: Resolver<ResolversTypes['LatLng'], ParentType, ContextType>;
  kind?: Resolver<ResolversTypes['LocationSuggestionKind'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  neighborhoodSlug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  propertyId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
};

export type MapClusterResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MapCluster'] = ResolversParentTypes['MapCluster']> = {
  bounds?: Resolver<ResolversTypes['Bounds'], ParentType, ContextType>;
  center?: Resolver<ResolversTypes['LatLng'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  propertyId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
};

export type MapClusterResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MapClusterResult'] = ResolversParentTypes['MapClusterResult']> = {
  clusters?: Resolver<Array<ResolversTypes['MapCluster']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  zoom?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addFavorite?: Resolver<ResolversTypes['Property'], ParentType, ContextType, RequireFields<MutationAddFavoriteArgs, 'propertyId'>>;
  createSearchAlert?: Resolver<ResolversTypes['SearchAlert'], ParentType, ContextType, RequireFields<MutationCreateSearchAlertArgs, 'input'>>;
  removeFavorite?: Resolver<ResolversTypes['Property'], ParentType, ContextType, RequireFields<MutationRemoveFavoriteArgs, 'propertyId'>>;
};

export type NeighborhoodResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Neighborhood'] = ResolversParentTypes['Neighborhood']> = {
  bounds?: Resolver<ResolversTypes['Bounds'], ParentType, ContextType>;
  center?: Resolver<ResolversTypes['LatLng'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  medianPricePerM2?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  medianRentPerM2?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zone?: Resolver<ResolversTypes['Zone'], ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type PhotoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Photo'] = ResolversParentTypes['Photo']> = {
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type PropertyResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Property'] = ResolversParentTypes['Property']> = {
  acceptsPets?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  amenities?: Resolver<Array<ResolversTypes['Amenity']>, ParentType, ContextType>;
  area?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  badges?: Resolver<Array<ResolversTypes['PropertyBadge']>, ParentType, ContextType>;
  bathrooms?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bedrooms?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  condoFee?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  estimatedRent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  floor?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  headline?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  iptu?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isExclusive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isFavorite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isFurnished?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isRented?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['LatLng'], ParentType, ContextType>;
  monthlyCost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  monthlyRent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nearSubway?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  neighborhood?: Resolver<ResolversTypes['Neighborhood'], ParentType, ContextType>;
  parkingSpaces?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  photoCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  photos?: Resolver<Array<ResolversTypes['Photo']>, ParentType, ContextType, Partial<PropertyPhotosArgs>>;
  previousPrice?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pricePerM2?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  rentalYield?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  salePrice?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PropertyStatus'], ParentType, ContextType>;
  street?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  suites?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PropertyType'], ParentType, ContextType>;
  unavailableAmenities?: Resolver<Array<ResolversTypes['Amenity']>, ParentType, ContextType>;
};

export type PropertyConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PropertyConnection'] = ResolversParentTypes['PropertyConnection']> = {
  nodes?: Resolver<Array<ResolversTypes['Property']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  amenities?: Resolver<Array<ResolversTypes['Amenity']>, ParentType, ContextType>;
  favoritesCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  health?: Resolver<ResolversTypes['Health'], ParentType, ContextType>;
  locationSuggestions?: Resolver<Array<ResolversTypes['LocationSuggestion']>, ParentType, ContextType, RequireFields<QueryLocationSuggestionsArgs, 'limit' | 'query'>>;
  neighborhoods?: Resolver<Array<ResolversTypes['Neighborhood']>, ParentType, ContextType>;
  property?: Resolver<Maybe<ResolversTypes['Property']>, ParentType, ContextType, RequireFields<QueryPropertyArgs, 'id'>>;
  propertyMapClusters?: Resolver<ResolversTypes['MapClusterResult'], ParentType, ContextType, RequireFields<QueryPropertyMapClustersArgs, 'bbox' | 'zoom'>>;
  searchAlerts?: Resolver<Array<ResolversTypes['SearchAlert']>, ParentType, ContextType>;
  searchProperties?: Resolver<ResolversTypes['PropertyConnection'], ParentType, ContextType, RequireFields<QuerySearchPropertiesArgs, 'first' | 'sort'>>;
};

export type SearchAlertResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SearchAlert'] = ResolversParentTypes['SearchAlert']> = {
  channels?: Resolver<Array<ResolversTypes['AlertChannel']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  searchUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  Amenity?: AmenityResolvers<ContextType>;
  Bounds?: BoundsResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Health?: HealthResolvers<ContextType>;
  LatLng?: LatLngResolvers<ContextType>;
  LocationSuggestion?: LocationSuggestionResolvers<ContextType>;
  MapCluster?: MapClusterResolvers<ContextType>;
  MapClusterResult?: MapClusterResultResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Neighborhood?: NeighborhoodResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Photo?: PhotoResolvers<ContextType>;
  Property?: PropertyResolvers<ContextType>;
  PropertyConnection?: PropertyConnectionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SearchAlert?: SearchAlertResolvers<ContextType>;
};

