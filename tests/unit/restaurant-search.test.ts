import { describe, expect, it } from 'vitest';
import {
  changeSearchPlace,
  filterRestaurantListings,
  getAvailableCuisines,
  interpretRestaurantQuery,
  normalizeRestaurantText,
  pickupFallback,
  resolveSearchPlace,
  supportedPlaces,
  prototypePostalPlaces,
  type SearchSelection,
} from '../../src/lib/restaurant-search';
import { escapeRestaurantHtml, parseRestaurantListing } from '../../src/data/restaurant-schema';
import { restaurants } from '../../src/data/restaurants';

const base: SearchSelection = {
  place: 'Luzern',
  mode: 'pickup',
  cuisine: 'Alle',
  query: '',
  unknownPostal: false,
};

const demoPizza = parseRestaurantListing({
  id: 'synthetische-pizza',
  name: 'Synthetische Pizzeria',
  place: 'Luzern',
  cuisine: 'Pizza',
  listingStatus: 'approved',
  verifiedAt: '2026-11-19',
  pickupEnabled: true,
  deliveryAreas: ['Luzern', 'Kriens'],
  orderUrl: 'https://example.invalid/test',
});

const demoKebab = parseRestaurantListing({
  id: 'synthetischer-kebab',
  name: 'Synthetischer Kebab',
  place: 'Kriens',
  cuisine: 'Kebab',
  listingStatus: 'approved',
  verifiedAt: '2026-11-19',
  pickupEnabled: true,
  deliveryAreas: [],
  orderUrl: null,
});

const draft = parseRestaurantListing({
  id: 'unveroeffentlichtes-beispiel',
  name: 'Synthetischer Entwurf',
  place: 'Luzern',
  cuisine: 'Pizza',
  listingStatus: 'draft',
  verifiedAt: null,
  pickupEnabled: true,
  deliveryAreas: [],
  orderUrl: null,
});

describe('PR12 – Prototyp-Suchlogik, bereinigt und isoliert', () => {
  it('übernimmt die sieben Orte und die zwölf expliziten Beispiel-PLZ', () => {
    expect(supportedPlaces).toHaveLength(7);
    expect(Object.keys(prototypePostalPlaces)).toHaveLength(12);
    expect(resolveSearchPlace('6003')).toBe('Luzern');
    expect(resolveSearchPlace('6010')).toBe('Kriens');
    expect(resolveSearchPlace('6020')).toBe('Emmenbrücke');
    expect(resolveSearchPlace('6045')).toBe('Meggen');
  });

  it('normalisiert Umlaute, Schreibweisen und Akzente', () => {
    expect(normalizeRestaurantText('  Càfé Ä/Ö/Ü  ')).toBe('cafe a o u');
    expect(normalizeRestaurantText('Emmenbruecke')).toBe('emmenbrucke');
    expect(resolveSearchPlace('Emmenbruecke, Luzern')).toBe('Emmenbrücke');
    expect(resolveSearchPlace('Kriens (6010)')).toBe('Kriens');
    expect(resolveSearchPlace('Emmen')).toBe('Emmen');
    expect(resolveSearchPlace('9000')).toBeNull();
  });

  it('interpretiert eine bekannte PLZ mit Küchen-/Restaurantsuchwort', () => {
    expect(interpretRestaurantQuery('Pizza 6010', base)).toMatchObject({
      place: 'Kriens',
      query: 'pizza',
      unknownPostal: false,
      cuisine: 'Alle',
    });
    expect(interpretRestaurantQuery('Emmenbrücke Kebab', base)).toMatchObject({
      place: 'Emmenbrücke',
      query: 'kebab',
    });
    expect(interpretRestaurantQuery('Synthetische Pizzeria', base)).toMatchObject({
      place: 'Luzern',
      query: 'synthetische pizzeria',
    });
  });

  it('zeigt bei unbekannten PLZ keine irreführende Liste im alten Ort', () => {
    const unknown = interpretRestaurantQuery('9999', base);
    expect(unknown.unknownPostal).toBe(true);
    expect(filterRestaurantListings([demoPizza], unknown).orderable).toEqual([]);
  });

  it('filtert nach Ort, Küche, Abholung und tatsächlichem Liefergebiet', () => {
    const all = [demoPizza, demoKebab, draft];
    const pickupLuzern = filterRestaurantListings(all, base);
    expect(pickupLuzern.orderable.map((r) => r.id)).toEqual(['synthetische-pizza']);
    expect(pickupLuzern.directory).toEqual([]);

    const pickupKriens = filterRestaurantListings(all, { ...base, place: 'Kriens' });
    expect(pickupKriens.directory.map((r) => r.id)).toEqual(['synthetischer-kebab']);

    const deliveryKriens = filterRestaurantListings(all, {
      ...base,
      mode: 'delivery',
      place: 'Kriens',
    });
    expect(deliveryKriens.orderable.map((r) => r.id)).toEqual(['synthetische-pizza']);
    expect(deliveryKriens.directory).toEqual([]);

    const pizza = filterRestaurantListings(all, { ...base, cuisine: 'Kebab' });
    expect(pizza.orderable).toEqual([]);
  });

  it('hebt die geografische Einschränkung auch bei Textsuche nicht auf', () => {
    const selected = interpretRestaurantQuery('Synthetischer Kebab', base);
    const results = filterRestaurantListings([demoPizza, demoKebab], selected);
    expect(results.orderable).toEqual([]);
    expect(results.directory).toEqual([]);
    expect(selected.place).toBe('Luzern');
  });

  it('setzt Filter und Ort ohne Seiteneffekte zurück', () => {
    expect(changeSearchPlace({ ...base, cuisine: 'Pizza', query: 'x' }, 'Kriens')).toEqual({
      ...base,
      place: 'Kriens',
    });
    expect(pickupFallback({ ...base, mode: 'delivery', query: 'pizza' })).toEqual(base);
    const unknown = interpretRestaurantQuery('9999', { ...base, mode: 'delivery' });
    const fallback = pickupFallback(unknown);
    expect(fallback.mode).toBe('pickup');
    expect(fallback.unknownPostal).toBe(true);
    expect(filterRestaurantListings([demoPizza], fallback)).toEqual({
      orderable: [],
      directory: [],
    });
    expect(getAvailableCuisines([demoPizza, demoKebab, draft])).toEqual(['Alle', 'Pizza', 'Kebab']);
  });

  it('veröffentlicht im tatsächlichen Katalog keine fiktiven Prototyp-Restaurants', () => {
    expect(restaurants).toEqual([]);
    expect(filterRestaurantListings(restaurants, base)).toEqual({
      orderable: [],
      directory: [],
    });
  });
});

describe('PR12 – validiertes Restaurant-Schema', () => {
  const data = {
    id: 'synthetischer-betrieb',
    name: 'Beispielrestaurant',
    place: 'Luzern',
    cuisine: 'Pizza',
    listingStatus: 'approved',
    verifiedAt: '2026-11-19',
    pickupEnabled: true,
    deliveryAreas: ['Kriens'],
    orderUrl: 'https://example.invalid/bestellen',
  };

  it('akzeptiert valide, explizit freigegebene Felder', () => {
    expect(parseRestaurantListing(data)).toMatchObject({
      id: 'synthetischer-betrieb',
      name: 'Beispielrestaurant',
      place: 'Luzern',
    });
  });

  it.each([
    [{ id: '../etc/passwd' }, 'Slug'],
    [{ name: '<script>alert(1)</script>' }, 'HTML'],
    [{ place: 'Unbekannt' }, 'Restaurantort'],
    [{ cuisine: 'Mexikanisch' }, 'Küche'],
    [{ listingStatus: 'published' }, 'Freigabestatus'],
    [{ verifiedAt: null }, 'Prüfdatum'],
    [{ verifiedAt: '2026-02-30' }, 'Datum'],
    [{ deliveryAreas: ['Bern'] }, 'deliveryAreas'],
    [{ deliveryAreas: ['Kriens', 'Kriens'] }, 'deliveryAreas'],
    [{ orderUrl: 'javascript:alert(1)' }, 'HTTPS'],
    [{ orderUrl: 'http://example.invalid' }, 'HTTPS'],
    [{ orderUrl: 'https://name:pass@example.invalid' }, 'Zugangsdaten'],
    [{ orderUrl: 'https://example.invalid/#anchor' }, 'Zugangsdaten'],
    [{ pickupEnabled: 'true' }, 'Boolean'],
  ])('weist ungültige Werte zurück: %j', (changes, message) => {
    expect(() => parseRestaurantListing({ ...data, ...changes })).toThrow(message);
  });

  it('lehnt nicht-Objekte und unbestätigte öffentliche Profile ab', () => {
    expect(() => parseRestaurantListing(null)).toThrow(TypeError);
    expect(() => parseRestaurantListing([])).toThrow(TypeError);
    expect(() =>
      parseRestaurantListing({
        ...data,
        pickupEnabled: false,
        deliveryAreas: [],
      }),
    ).toThrow('Bestellart');
  });

  it('escapt HTML, Sonderzeichen und Apostrophe für einen zusätzlichen Darstellungsrand', () => {
    expect(escapeRestaurantHtml('<img src="x" onerror=alert(1)> & Café')).toBe(
      '&lt;img src=&quot;x&quot; onerror=alert(1)&gt; &amp; Café',
    );
    expect(escapeRestaurantHtml("O'Hara")).toBe('O&#39;Hara');
  });
});
