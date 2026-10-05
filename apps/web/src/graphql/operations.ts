import { graphql } from "./generated/gql.ts";

/**
 * Todas as operações GraphQL do web. Depois de alterar este arquivo (ou o SDL da api), rode
 * `bun run codegen` para regenerar os tipos em ./generated.
 */

export const propertyCardFieldsFragment = graphql(`
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
`);

export const searchPropertiesDocument = graphql(`
  query SearchProperties(
    $filters: PropertySearchFilters
    $sort: SortOrder
    $first: Int
    $after: String
  ) {
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
`);

export const searchCountDocument = graphql(`
  query SearchCount($filters: PropertySearchFilters) {
    searchProperties(filters: $filters, first: 0) {
      totalCount
    }
  }
`);

export const mapClustersDocument = graphql(`
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
`);

export const propertyPreviewDocument = graphql(`
  query PropertyPreview($id: ID!) {
    property(id: $id) {
      ...PropertyCardFields
    }
  }
`);

export const neighborhoodsDocument = graphql(`
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
`);

export const locationSuggestionsDocument = graphql(`
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
`);

export const propertyDetailDocument = graphql(`
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
`);

export const addFavoriteDocument = graphql(`
  mutation AddFavorite($propertyId: ID!) {
    addFavorite(propertyId: $propertyId) {
      id
      isFavorite
    }
  }
`);

export const removeFavoriteDocument = graphql(`
  mutation RemoveFavorite($propertyId: ID!) {
    removeFavorite(propertyId: $propertyId) {
      id
      isFavorite
    }
  }
`);

export const favoritesCountDocument = graphql(`
  query FavoritesCount {
    favoritesCount
  }
`);
