/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment PropertyCardFields on Property {\n    id\n    type\n    title\n    salePrice\n    monthlyCost\n    area\n    bedrooms\n    parkingSpaces\n    street\n    badges\n    isFavorite\n    location {\n      lat\n      lng\n    }\n    neighborhood {\n      slug\n      name\n    }\n    photos(limit: 8) {\n      url\n    }\n  }\n": typeof types.PropertyCardFieldsFragmentDoc,
    "\n  query SearchProperties(\n    $filters: PropertySearchFilters\n    $sort: SortOrder\n    $first: Int\n    $after: String\n  ) {\n    searchProperties(filters: $filters, sort: $sort, first: $first, after: $after) {\n      totalCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      nodes {\n        ...PropertyCardFields\n      }\n    }\n  }\n": typeof types.SearchPropertiesDocument,
    "\n  query SearchCount($filters: PropertySearchFilters) {\n    searchProperties(filters: $filters, first: 0) {\n      totalCount\n    }\n  }\n": typeof types.SearchCountDocument,
    "\n  query MapClusters($filters: PropertySearchFilters, $bbox: BoundingBox!, $zoom: Int!) {\n    propertyMapClusters(filters: $filters, bbox: $bbox, zoom: $zoom) {\n      totalCount\n      zoom\n      clusters {\n        id\n        count\n        propertyId\n        center {\n          lat\n          lng\n        }\n        bounds {\n          north\n          south\n          east\n          west\n        }\n      }\n    }\n  }\n": typeof types.MapClustersDocument,
    "\n  query PropertyPreview($id: ID!) {\n    property(id: $id) {\n      ...PropertyCardFields\n    }\n  }\n": typeof types.PropertyPreviewDocument,
    "\n  query Neighborhoods {\n    neighborhoods {\n      slug\n      name\n      center {\n        lat\n        lng\n      }\n      bounds {\n        north\n        south\n        east\n        west\n      }\n    }\n  }\n": typeof types.NeighborhoodsDocument,
    "\n  query LocationSuggestions($query: String!) {\n    locationSuggestions(query: $query, limit: 8) {\n      kind\n      label\n      neighborhoodSlug\n      propertyId\n      center {\n        lat\n        lng\n      }\n      bounds {\n        north\n        south\n        east\n        west\n      }\n    }\n  }\n": typeof types.LocationSuggestionsDocument,
};
const documents: Documents = {
    "\n  fragment PropertyCardFields on Property {\n    id\n    type\n    title\n    salePrice\n    monthlyCost\n    area\n    bedrooms\n    parkingSpaces\n    street\n    badges\n    isFavorite\n    location {\n      lat\n      lng\n    }\n    neighborhood {\n      slug\n      name\n    }\n    photos(limit: 8) {\n      url\n    }\n  }\n": types.PropertyCardFieldsFragmentDoc,
    "\n  query SearchProperties(\n    $filters: PropertySearchFilters\n    $sort: SortOrder\n    $first: Int\n    $after: String\n  ) {\n    searchProperties(filters: $filters, sort: $sort, first: $first, after: $after) {\n      totalCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      nodes {\n        ...PropertyCardFields\n      }\n    }\n  }\n": types.SearchPropertiesDocument,
    "\n  query SearchCount($filters: PropertySearchFilters) {\n    searchProperties(filters: $filters, first: 0) {\n      totalCount\n    }\n  }\n": types.SearchCountDocument,
    "\n  query MapClusters($filters: PropertySearchFilters, $bbox: BoundingBox!, $zoom: Int!) {\n    propertyMapClusters(filters: $filters, bbox: $bbox, zoom: $zoom) {\n      totalCount\n      zoom\n      clusters {\n        id\n        count\n        propertyId\n        center {\n          lat\n          lng\n        }\n        bounds {\n          north\n          south\n          east\n          west\n        }\n      }\n    }\n  }\n": types.MapClustersDocument,
    "\n  query PropertyPreview($id: ID!) {\n    property(id: $id) {\n      ...PropertyCardFields\n    }\n  }\n": types.PropertyPreviewDocument,
    "\n  query Neighborhoods {\n    neighborhoods {\n      slug\n      name\n      center {\n        lat\n        lng\n      }\n      bounds {\n        north\n        south\n        east\n        west\n      }\n    }\n  }\n": types.NeighborhoodsDocument,
    "\n  query LocationSuggestions($query: String!) {\n    locationSuggestions(query: $query, limit: 8) {\n      kind\n      label\n      neighborhoodSlug\n      propertyId\n      center {\n        lat\n        lng\n      }\n      bounds {\n        north\n        south\n        east\n        west\n      }\n    }\n  }\n": types.LocationSuggestionsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PropertyCardFields on Property {\n    id\n    type\n    title\n    salePrice\n    monthlyCost\n    area\n    bedrooms\n    parkingSpaces\n    street\n    badges\n    isFavorite\n    location {\n      lat\n      lng\n    }\n    neighborhood {\n      slug\n      name\n    }\n    photos(limit: 8) {\n      url\n    }\n  }\n"): typeof import('./graphql').PropertyCardFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchProperties(\n    $filters: PropertySearchFilters\n    $sort: SortOrder\n    $first: Int\n    $after: String\n  ) {\n    searchProperties(filters: $filters, sort: $sort, first: $first, after: $after) {\n      totalCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      nodes {\n        ...PropertyCardFields\n      }\n    }\n  }\n"): typeof import('./graphql').SearchPropertiesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchCount($filters: PropertySearchFilters) {\n    searchProperties(filters: $filters, first: 0) {\n      totalCount\n    }\n  }\n"): typeof import('./graphql').SearchCountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MapClusters($filters: PropertySearchFilters, $bbox: BoundingBox!, $zoom: Int!) {\n    propertyMapClusters(filters: $filters, bbox: $bbox, zoom: $zoom) {\n      totalCount\n      zoom\n      clusters {\n        id\n        count\n        propertyId\n        center {\n          lat\n          lng\n        }\n        bounds {\n          north\n          south\n          east\n          west\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').MapClustersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PropertyPreview($id: ID!) {\n    property(id: $id) {\n      ...PropertyCardFields\n    }\n  }\n"): typeof import('./graphql').PropertyPreviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Neighborhoods {\n    neighborhoods {\n      slug\n      name\n      center {\n        lat\n        lng\n      }\n      bounds {\n        north\n        south\n        east\n        west\n      }\n    }\n  }\n"): typeof import('./graphql').NeighborhoodsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LocationSuggestions($query: String!) {\n    locationSuggestions(query: $query, limit: 8) {\n      kind\n      label\n      neighborhoodSlug\n      propertyId\n      center {\n        lat\n        lng\n      }\n      bounds {\n        north\n        south\n        east\n        west\n      }\n    }\n  }\n"): typeof import('./graphql').LocationSuggestionsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
