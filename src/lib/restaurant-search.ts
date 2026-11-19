/**
 * PR #12 – B2C-Suchlogik, DOM- und API-unabhängig.
 * Referenz: gesicherter Prototyp, mit bewusst engeren Ortsgrenzen.
 */
import type { RestaurantListing } from '../data/restaurant-schema';

export const supportedPlaces = [
  'Luzern',
  'Kriens',
  'Emmen',
  'Emmenbrücke',
  'Horw',
  'Ebikon',
  'Meggen',
] as const;
export type SupportedPlace = (typeof supportedPlaces)[number];

export const prototypePostalPlaces: Readonly<Record<string, SupportedPlace>> = {
  '6000': 'Luzern',
  '6002': 'Luzern',
  '6003': 'Luzern',
  '6004': 'Luzern',
  '6005': 'Luzern',
  '6006': 'Luzern',
  '6010': 'Kriens',
  '6020': 'Emmenbrücke',
  '6032': 'Emmen',
  '6048': 'Horw',
  '6030': 'Ebikon',
  '6045': 'Meggen',
};

export type OrderMode = 'pickup' | 'delivery';
export type RestaurantCuisine = 'Pizza' | 'Kebab' | 'Burger' | 'Andere';
export type CuisineFilter = RestaurantCuisine | 'Alle';

export interface SearchSelection {
  place: SupportedPlace;
  mode: OrderMode;
  cuisine: CuisineFilter;
  query: string;
  unknownPostal: boolean;
}

export interface SearchResult {
  orderable: readonly RestaurantListing[];
  directory: readonly RestaurantListing[];
}

export function normalizeRestaurantText(input: string): string {
  return input
    .toLocaleLowerCase('de-CH')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&');
}

export function resolveSearchPlace(input: string): SupportedPlace | null {
  const postalCode = input.match(/\b\d{4}\b/)?.[0];
  if (postalCode && prototypePostalPlaces[postalCode]) return prototypePostalPlaces[postalCode];
  const q = normalizeRestaurantText(input);
  return (
    [...supportedPlaces]
      .sort((a, b) => normalizeRestaurantText(b).length - normalizeRestaurantText(a).length)
      .find((place) => {
        const token = normalizeRestaurantText(place);
        return new RegExp('(?:^| )' + escapeRegExp(token) + '(?: |$)').test(q);
      }) ?? null
  );
}

/** Entfernt Ort und PLZ aus der Textsuche, behält z. B. «Pizza» bei. */
export function interpretRestaurantQuery(
  input: string,
  previous: SearchSelection,
): SearchSelection {
  const original = input.trim().slice(0, 200);
  if (!original) return { ...previous, query: '', unknownPostal: false, cuisine: 'Alle' };
  const postal = original.match(/\b\d{4}\b/)?.[0];
  const place = resolveSearchPlace(original);
  if (postal && !prototypePostalPlaces[postal]) {
    return { ...previous, query: '', unknownPostal: true, cuisine: 'Alle' };
  }
  if (!place) {
    return {
      ...previous,
      query: normalizeRestaurantText(original),
      unknownPostal: false,
      cuisine: 'Alle',
    };
  }
  const withoutPostal = original.replace(/\b\d{4}\b/g, ' ');
  const normalizedPlace = normalizeRestaurantText(place);
  const normalized = normalizeRestaurantText(withoutPostal)
    .replace(new RegExp('(?:^| )' + escapeRegExp(normalizedPlace) + '(?= |$)'), ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { ...previous, place, query: normalized, unknownPostal: false, cuisine: 'Alle' };
}

export function filterRestaurantListings(
  listings: readonly RestaurantListing[],
  selection: SearchSelection,
): SearchResult {
  if (selection.unknownPostal) return { orderable: [], directory: [] };
  const query = normalizeRestaurantText(selection.query);

  const matching = listings.filter((restaurant) => {
    if (restaurant.listingStatus !== 'approved') return false;
    if (selection.cuisine !== 'Alle' && restaurant.cuisine !== selection.cuisine) return false;
    if (
      query &&
      !normalizeRestaurantText(restaurant.name + ' ' + restaurant.cuisine).includes(query)
    ) {
      return false;
    }
    // Ein Suchtext darf nie den ausgewählten Ort oder das Liefergebiet umgehen.
    return selection.mode === 'pickup'
      ? restaurant.pickupEnabled && restaurant.place === selection.place
      : restaurant.deliveryAreas.includes(selection.place);
  });

  return {
    orderable: matching.filter((restaurant) => restaurant.orderUrl !== null),
    directory: matching.filter((restaurant) => restaurant.orderUrl === null),
  };
}

export function pickupFallback(selection: SearchSelection): SearchSelection {
  return { ...selection, mode: 'pickup', unknownPostal: false, query: '' };
}

export function changeSearchPlace(
  selection: SearchSelection,
  place: SupportedPlace,
): SearchSelection {
  return { ...selection, place, query: '', unknownPostal: false, cuisine: 'Alle' };
}

export function getAvailableCuisines(
  listings: readonly RestaurantListing[],
): readonly CuisineFilter[] {
  const cuisines = new Set(
    listings.filter((r) => r.listingStatus === 'approved').map((r) => r.cuisine),
  );
  return [
    'Alle',
    ...(['Pizza', 'Kebab', 'Burger', 'Andere'] as const).filter((c) => cuisines.has(c)),
  ];
}
