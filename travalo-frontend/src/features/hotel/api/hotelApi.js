import { api } from '@/lib/axios';
import { graphqlRequest } from '@/lib/graphql';

// searchHotels — GraphQL query، مطابق لـ SearchArgs و Hotel type بالظبط
const SEARCH_HOTELS_QUERY = /* GraphQL */ `
  query SearchHotels(
    $hotelName: String
    $destinationCode: String
    $city: String
    $stars: Int
    $countryCode: String
    $rating: order
    $ranking: order
    $cursor: String
    $limit: Int
  ) {
    searchHotels(
      hotelName: $hotelName
      destinationCode: $destinationCode
      city: $city
      stars: $stars
      countryCode: $countryCode
      rating: $rating
      ranking: $ranking
      cursor: $cursor
      limit: $limit
    ) {
      data {
        id
        code
        name
        web
        address
        description
        ranking
        rating
        latitude
        longitude
        city
        destinationCode
        countryCode
        images
      }
      meta {
        nextCursor
      }
    }
  }
`;

// args: { hotelName?, destinationCode?, city?, stars?, countryCode?, rating?: 'asc'|'desc', ranking?: 'asc'|'desc', cursor?, limit? }
export const searchHotels = (args) =>
  graphqlRequest(SEARCH_HOTELS_QUERY, args).then((data) => data.searchHotels);

// GET /api/hotel/:id — Response: { message, data: hotel } (فيه phones كمان)
export const getHotelById = (hotelId) => api.get(`/hotel/${hotelId}`);

// GET /api/hotel/:id/facilities — Response: { message, data: [...] }
export const getHotelFacilities = (hotelId) => api.get(`/hotel/${hotelId}/facilities`);
