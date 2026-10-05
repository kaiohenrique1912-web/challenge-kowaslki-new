/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
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
  east: number;
  north: number;
  south: number;
  west: number;
};

/** Faixa inclusiva; qualquer lado pode ficar em branco. */
export type IntRange = {
  max?: number | null | undefined;
  min?: number | null | undefined;
};

export type LocationSuggestionKind =
  | 'NEIGHBORHOOD'
  | 'PROPERTY_CODE'
  | 'STREET';

export type PropertyBadge =
  | 'EXCLUSIVE'
  | 'GREAT_PRICE'
  | 'NEW_LISTING'
  | 'PRICE_DROP'
  | 'RENTED';

/** Filtros da busca. Todos opcionais e combinados com E (docs/business-rules.md §4.1). */
export type PropertySearchFilters = {
  /** O imóvel precisa ter TODAS as comodidades. */
  amenities?: Array<AmenityCode> | null | undefined;
  /** Área útil (m²). */
  area?: IntRange | null | undefined;
  /** Área visível do mapa. */
  bbox?: BoundingBox | null | undefined;
  exclusive?: boolean | null | undefined;
  furnished?: boolean | null | undefined;
  minBathrooms?: number | null | undefined;
  minBedrooms?: number | null | undefined;
  minParkingSpaces?: number | null | undefined;
  minSuites?: number | null | undefined;
  /** Condomínio + IPTU mensal (R$). */
  monthlyCost?: IntRange | null | undefined;
  nearSubway?: boolean | null | undefined;
  /** Imóvel em qualquer um destes bairros. */
  neighborhoodSlugs?: Array<string> | null | undefined;
  /** Só favoritos do usuário do header x-user-id. */
  onlyFavorites?: boolean | null | undefined;
  /** Valor de venda (R$). */
  price?: IntRange | null | undefined;
  publishedWithin?: PublishedWithin | null | undefined;
  /** true = só imóveis já alugados ("Compre já alugado"). */
  rented?: boolean | null | undefined;
  types?: Array<PropertyType> | null | undefined;
};

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

export type SortOrder =
  | 'NEAREST'
  | 'NEWEST'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'RELEVANCE'
  | 'RENTAL_YIELD_DESC';

export type PropertyCardFieldsFragment = { id: string, type: PropertyType, title: string, salePrice: number, monthlyCost: number, area: number, bedrooms: number, parkingSpaces: number, street: string, badges: Array<PropertyBadge>, isFavorite: boolean, location: { lat: number, lng: number }, neighborhood: { slug: string, name: string }, photos: Array<{ url: string }> };

export type SearchPropertiesQueryVariables = Exact<{
  filters?: PropertySearchFilters | null | undefined;
  sort?: SortOrder | null | undefined;
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type SearchPropertiesQuery = { searchProperties: { totalCount: number, pageInfo: { endCursor: string | null, hasNextPage: boolean }, nodes: Array<{ id: string, type: PropertyType, title: string, salePrice: number, monthlyCost: number, area: number, bedrooms: number, parkingSpaces: number, street: string, badges: Array<PropertyBadge>, isFavorite: boolean, location: { lat: number, lng: number }, neighborhood: { slug: string, name: string }, photos: Array<{ url: string }> }> } };

export type SearchCountQueryVariables = Exact<{
  filters?: PropertySearchFilters | null | undefined;
}>;


export type SearchCountQuery = { searchProperties: { totalCount: number } };

export type MapClustersQueryVariables = Exact<{
  filters?: PropertySearchFilters | null | undefined;
  bbox: BoundingBox;
  zoom: number;
}>;


export type MapClustersQuery = { propertyMapClusters: { totalCount: number, zoom: number, clusters: Array<{ id: string, count: number, propertyId: string | null, center: { lat: number, lng: number }, bounds: { north: number, south: number, east: number, west: number } }> } };

export type PropertyPreviewQueryVariables = Exact<{
  id: string | number;
}>;


export type PropertyPreviewQuery = { property: { id: string, type: PropertyType, title: string, salePrice: number, monthlyCost: number, area: number, bedrooms: number, parkingSpaces: number, street: string, badges: Array<PropertyBadge>, isFavorite: boolean, location: { lat: number, lng: number }, neighborhood: { slug: string, name: string }, photos: Array<{ url: string }> } | null };

export type NeighborhoodsQueryVariables = Exact<{ [key: string]: never; }>;


export type NeighborhoodsQuery = { neighborhoods: Array<{ slug: string, name: string, center: { lat: number, lng: number }, bounds: { north: number, south: number, east: number, west: number } }> };

export type LocationSuggestionsQueryVariables = Exact<{
  query: string;
}>;


export type LocationSuggestionsQuery = { locationSuggestions: Array<{ kind: LocationSuggestionKind, label: string, neighborhoodSlug: string | null, propertyId: string | null, center: { lat: number, lng: number }, bounds: { north: number, south: number, east: number, west: number } | null }> };

export type PropertyDetailQueryVariables = Exact<{
  id: string | number;
}>;


export type PropertyDetailQuery = { property: { id: string, type: PropertyType, title: string, headline: string, street: string, salePrice: number, previousPrice: number | null, condoFee: number, iptu: number, monthlyCost: number, area: number, bedrooms: number, suites: number, bathrooms: number, parkingSpaces: number, floor: number | null, isFurnished: boolean, acceptsPets: boolean, nearSubway: boolean, isRented: boolean, monthlyRent: number | null, estimatedRent: number, rentalYield: number, description: string, badges: Array<PropertyBadge>, isFavorite: boolean, publishedAt: string | null, location: { lat: number, lng: number }, neighborhood: { slug: string, name: string }, amenities: Array<{ code: AmenityCode, label: string }>, unavailableAmenities: Array<{ code: AmenityCode, label: string }>, photos: Array<{ url: string }> } | null };

export type AddFavoriteMutationVariables = Exact<{
  propertyId: string | number;
}>;


export type AddFavoriteMutation = { addFavorite: { id: string, isFavorite: boolean } };

export type RemoveFavoriteMutationVariables = Exact<{
  propertyId: string | number;
}>;


export type RemoveFavoriteMutation = { removeFavorite: { id: string, isFavorite: boolean } };

export type FavoritesCountQueryVariables = Exact<{ [key: string]: never; }>;


export type FavoritesCountQuery = { favoritesCount: number };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const PropertyCardFieldsFragmentDoc = new TypedDocumentString(`
    fragment PropertyCardFields on Property {
  id
  type
  title
  salePrice
  monthlyCost
  area
  bedrooms
  parkingSpaces
  street
  badges
  isFavorite
  location {
    lat
    lng
  }
  neighborhood {
    slug
    name
  }
  photos(limit: 8) {
    url
  }
}
    `, {"fragmentName":"PropertyCardFields"}) as unknown as TypedDocumentString<PropertyCardFieldsFragment, unknown>;
export const SearchPropertiesDocument = new TypedDocumentString(`
    query SearchProperties($filters: PropertySearchFilters, $sort: SortOrder, $first: Int, $after: String) {
  searchProperties(filters: $filters, sort: $sort, first: $first, after: $after) {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      ...PropertyCardFields
    }
  }
}
    fragment PropertyCardFields on Property {
  id
  type
  title
  salePrice
  monthlyCost
  area
  bedrooms
  parkingSpaces
  street
  badges
  isFavorite
  location {
    lat
    lng
  }
  neighborhood {
    slug
    name
  }
  photos(limit: 8) {
    url
  }
}`) as unknown as TypedDocumentString<SearchPropertiesQuery, SearchPropertiesQueryVariables>;
export const SearchCountDocument = new TypedDocumentString(`
    query SearchCount($filters: PropertySearchFilters) {
  searchProperties(filters: $filters, first: 0) {
    totalCount
  }
}
    `) as unknown as TypedDocumentString<SearchCountQuery, SearchCountQueryVariables>;
export const MapClustersDocument = new TypedDocumentString(`
    query MapClusters($filters: PropertySearchFilters, $bbox: BoundingBox!, $zoom: Int!) {
  propertyMapClusters(filters: $filters, bbox: $bbox, zoom: $zoom) {
    totalCount
    zoom
    clusters {
      id
      count
      propertyId
      center {
        lat
        lng
      }
      bounds {
        north
        south
        east
        west
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MapClustersQuery, MapClustersQueryVariables>;
export const PropertyPreviewDocument = new TypedDocumentString(`
    query PropertyPreview($id: ID!) {
  property(id: $id) {
    ...PropertyCardFields
  }
}
    fragment PropertyCardFields on Property {
  id
  type
  title
  salePrice
  monthlyCost
  area
  bedrooms
  parkingSpaces
  street
  badges
  isFavorite
  location {
    lat
    lng
  }
  neighborhood {
    slug
    name
  }
  photos(limit: 8) {
    url
  }
}`) as unknown as TypedDocumentString<PropertyPreviewQuery, PropertyPreviewQueryVariables>;
export const NeighborhoodsDocument = new TypedDocumentString(`
    query Neighborhoods {
  neighborhoods {
    slug
    name
    center {
      lat
      lng
    }
    bounds {
      north
      south
      east
      west
    }
  }
}
    `) as unknown as TypedDocumentString<NeighborhoodsQuery, NeighborhoodsQueryVariables>;
export const LocationSuggestionsDocument = new TypedDocumentString(`
    query LocationSuggestions($query: String!) {
  locationSuggestions(query: $query, limit: 8) {
    kind
    label
    neighborhoodSlug
    propertyId
    center {
      lat
      lng
    }
    bounds {
      north
      south
      east
      west
    }
  }
}
    `) as unknown as TypedDocumentString<LocationSuggestionsQuery, LocationSuggestionsQueryVariables>;
export const PropertyDetailDocument = new TypedDocumentString(`
    query PropertyDetail($id: ID!) {
  property(id: $id) {
    id
    type
    title
    headline
    street
    salePrice
    previousPrice
    condoFee
    iptu
    monthlyCost
    area
    bedrooms
    suites
    bathrooms
    parkingSpaces
    floor
    isFurnished
    acceptsPets
    nearSubway
    isRented
    monthlyRent
    estimatedRent
    rentalYield
    description
    badges
    isFavorite
    publishedAt
    location {
      lat
      lng
    }
    neighborhood {
      slug
      name
    }
    amenities {
      code
      label
    }
    unavailableAmenities {
      code
      label
    }
    photos {
      url
    }
  }
}
    `) as unknown as TypedDocumentString<PropertyDetailQuery, PropertyDetailQueryVariables>;
export const AddFavoriteDocument = new TypedDocumentString(`
    mutation AddFavorite($propertyId: ID!) {
  addFavorite(propertyId: $propertyId) {
    id
    isFavorite
  }
}
    `) as unknown as TypedDocumentString<AddFavoriteMutation, AddFavoriteMutationVariables>;
export const RemoveFavoriteDocument = new TypedDocumentString(`
    mutation RemoveFavorite($propertyId: ID!) {
  removeFavorite(propertyId: $propertyId) {
    id
    isFavorite
  }
}
    `) as unknown as TypedDocumentString<RemoveFavoriteMutation, RemoveFavoriteMutationVariables>;
export const FavoritesCountDocument = new TypedDocumentString(`
    query FavoritesCount {
  favoritesCount
}
    `) as unknown as TypedDocumentString<FavoritesCountQuery, FavoritesCountQueryVariables>;