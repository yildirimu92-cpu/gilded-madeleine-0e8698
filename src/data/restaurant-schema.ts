/**
 * PR #12 – B2C-Restaurant-Datenmodell mit Laufzeitprüfung.
 * Datenvalidität bedeutet NICHT Partner-/Veröffentlichungsfreigabe.
 * Kein Zugriff auf Bestell-, Zahlungs- oder Kundendaten.
 */
import {
  supportedPlaces,
  type RestaurantCuisine,
  type SupportedPlace,
} from '../lib/restaurant-search';

export type ListingStatus = 'draft' | 'approved';

export interface RestaurantListing {
  id: string;
  name: string;
  place: SupportedPlace;
  cuisine: RestaurantCuisine;
  listingStatus: ListingStatus;
  verifiedAt: string | null;
  pickupEnabled: boolean;
  deliveryAreas: readonly SupportedPlace[];
  orderUrl: string | null;
}

const cuisines = ['Pizza', 'Kebab', 'Burger', 'Andere'] as const;
const places = new Set<string>(supportedPlaces);

function publicText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || value.trim().length < 2 || value.length > maxLength)
    throw new TypeError('Ungültiges Feld: ' + field);
  if (/[<>]/.test(value)) throw new TypeError('HTML ist nicht zulässig: ' + field);
  return value.trim();
}

function dateOrNull(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new TypeError('verifiedAt muss YYYY-MM-DD oder null sein.');
  const date = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== value)
    throw new TypeError('verifiedAt enthält ein ungültiges Datum.');
  return value;
}

function safeOrderUrl(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') throw new TypeError('Bestelllink ist kein String.');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError('Bestelllink muss eine absolute HTTPS-URL sein.');
  }
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname || url.hash)
    throw new TypeError('Bestelllink muss eine saubere HTTPS-URL ohne Zugangsdaten sein.');
  return url.href;
}

export function parseRestaurantListing(value: unknown): RestaurantListing {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new TypeError('Ein Restaurant muss ein Datenobjekt sein.');
  const input = value as Record<string, unknown>;
  const id = input.id;
  if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 80)
    throw new TypeError('id muss ein sicherer Slug sein.');

  const place = input.place;
  if (typeof place !== 'string' || !places.has(place))
    throw new TypeError('Nicht unterstützter Restaurantort.');

  const cuisine = input.cuisine;
  if (typeof cuisine !== 'string' || !cuisines.some((c) => c === cuisine))
    throw new TypeError('Unbekannte Küche.');

  const listingStatus = input.listingStatus;
  if (listingStatus !== 'approved' && listingStatus !== 'draft')
    throw new TypeError('Ungültiger Freigabestatus.');

  if (typeof input.pickupEnabled !== 'boolean')
    throw new TypeError('pickupEnabled muss Boolean sein.');

  const delivery = input.deliveryAreas;
  if (
    !Array.isArray(delivery) ||
    delivery.length > supportedPlaces.length ||
    !delivery.every((p) => typeof p === 'string' && places.has(p)) ||
    new Set(delivery).size !== delivery.length
  ) {
    throw new TypeError('deliveryAreas enthält unbekannte oder doppelte Orte.');
  }

  const verifiedAt = dateOrNull(input.verifiedAt);
  const orderUrl = safeOrderUrl(input.orderUrl);
  if (listingStatus === 'approved' && verifiedAt === null)
    throw new TypeError('Freigegebene Restaurants benötigen ein bestätigtes Prüfdatum.');
  if (listingStatus === 'approved' && !input.pickupEnabled && delivery.length === 0)
    throw new TypeError('Freigegebene Restaurants benötigen eine geprüfte Bestellart.');

  return {
    id,
    name: publicText(input.name, 'name', 120),
    place: place as SupportedPlace,
    cuisine: cuisine as RestaurantCuisine,
    listingStatus,
    verifiedAt,
    pickupEnabled: input.pickupEnabled,
    deliveryAreas: [...delivery] as SupportedPlace[],
    orderUrl,
  };
}

/** Zusätzliche Escape-Grenze für künftiges HTML, Astro interpoliert ohnehin sicher. */
export function escapeRestaurantHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return replacements[char]!;
  });
}
