/**
 * PR #13 – Progressive Enhancement der B2C-Restaurantsuche.
 * Keine Formulare, Fetch-Requests oder Speicherung. Alle Resultate stammen
 * aus freigegebenen Daten. Text wird mit textContent statt innerHTML gesetzt.
 */
import { restaurants } from '../data/restaurants';
import { parseRestaurantListing, type RestaurantListing } from '../data/restaurant-schema';
import {
  changeSearchPlace,
  filterRestaurantListings,
  interpretRestaurantQuery,
  pickupFallback,
  supportedPlaces,
  type CuisineFilter,
  type OrderMode,
  type SearchSelection,
  type SupportedPlace,
} from '../lib/restaurant-search';

const approvedRestaurants = restaurants
  .map(parseRestaurantListing)
  .filter((restaurant) => restaurant.listingStatus === 'approved');

function restaurantCard(restaurant: RestaurantListing): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'b2c-search__restaurant';

  const details = document.createElement('div');
  const heading = document.createElement('h3');
  heading.textContent = restaurant.name;
  const meta = document.createElement('p');
  meta.textContent = restaurant.cuisine + ' · ' + restaurant.place;
  details.append(heading, meta);
  item.append(details);

  if (restaurant.orderUrl) {
    const link = document.createElement('a');
    link.href = restaurant.orderUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Bestellshop öffnen';
    item.append(link);
  } else {
    const status = document.createElement('span');
    status.className = 'b2c-search__unavailable';
    status.textContent = 'Noch nicht bestellbar';
    item.append(status);
  }
  return item;
}

function initRestaurantFinder(): void {
  const root = document.querySelector<HTMLElement>('[data-restaurant-finder]');
  if (!root || root.dataset.finderReady === 'true') return;
  root.dataset.finderReady = 'true';

  const place = root.querySelector<HTMLSelectElement>('[data-finder-place]');
  const query = root.querySelector<HTMLInputElement>('[data-finder-query]');
  const search = root.querySelector<HTMLButtonElement>('[data-finder-search]');
  const heading = root.querySelector<HTMLElement>('[data-finder-heading]');
  const count = root.querySelector<HTMLElement>('[data-finder-count]');
  const list = root.querySelector<HTMLUListElement>('[data-finder-results]');
  const empty = root.querySelector<HTMLElement>('[data-finder-empty]');
  const emptyTitle = root.querySelector<HTMLElement>('[data-finder-empty-title]');
  const emptyCopy = root.querySelector<HTMLElement>('[data-finder-empty-copy]');
  const fallback = root.querySelector<HTMLButtonElement>('[data-finder-pickup]');
  const cuisineButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-finder-cuisine]')];

  if (
    !place ||
    !query ||
    !search ||
    !heading ||
    !count ||
    !list ||
    !empty ||
    !emptyTitle ||
    !emptyCopy ||
    !fallback
  )
    return;

  let selection: SearchSelection = {
    place: 'Luzern',
    mode: 'pickup',
    cuisine: 'Alle',
    query: '',
    unknownPostal: false,
  };

  const render = (): void => {
    const results = filterRestaurantListings(approvedRestaurants, selection);
    const combined = [...results.orderable, ...results.directory];
    const amount = combined.length;

    heading.textContent =
      selection.mode === 'pickup'
        ? 'Restaurants zum Abholen in ' + selection.place
        : 'Restaurants mit Lieferung nach ' + selection.place;
    count.textContent = amount + (amount === 1 ? ' Restaurant' : ' Restaurants');

    const cards = combined.map(restaurantCard);
    list.replaceChildren(...cards);
    empty.hidden = amount !== 0;

    if (selection.unknownPostal) {
      emptyTitle.textContent = 'Diese PLZ ist noch nicht abgedeckt.';
      emptyCopy.textContent =
        'Für diese Postleitzahl liegen noch keine geprüften Liefer- oder Abholgebiete vor. Wähle einen Ort aus der Liste.';
    } else if (approvedRestaurants.length === 0) {
      emptyTitle.textContent = 'Noch keine Restaurants verfügbar.';
      emptyCopy.textContent =
        'Die Restaurantsuche befindet sich im Aufbau. Sobald geprüfte Betriebe hinzukommen, findest du sie hier.';
    } else if (selection.mode === 'delivery') {
      emptyTitle.textContent = 'Hier ist noch keine Lieferung verfügbar.';
      emptyCopy.textContent =
        'Passe deine Suche an oder wähle Abholung in ' + selection.place + '.';
    } else {
      emptyTitle.textContent = 'Keine Restaurants für diese Auswahl.';
      emptyCopy.textContent =
        'Versuche einen anderen Ort, eine Küche oder einen anderen Suchbegriff.';
    }

    fallback.hidden = amount !== 0 || selection.mode !== 'delivery' || selection.unknownPostal;
    place.value = selection.place;
    for (const button of cuisineButtons) {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.finderCuisine === selection.cuisine),
      );
    }
  };

  const submitQuery = (): void => {
    selection = interpretRestaurantQuery(query.value, selection);
    render();
    root.querySelector<HTMLElement>('#ergebnisse')?.focus({ preventScroll: true });
    root
      .querySelector<HTMLElement>('#ergebnisse')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  search.addEventListener('click', submitQuery);
  query.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitQuery();
    }
  });
  place.addEventListener('change', () => {
    if (!supportedPlaces.includes(place.value as SupportedPlace)) return;
    selection = changeSearchPlace(selection, place.value as SupportedPlace);
    query.value = '';
    render();
  });

  root.querySelectorAll<HTMLInputElement>('input[name="restaurant-mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      const mode: OrderMode = radio.value === 'delivery' ? 'delivery' : 'pickup';
      selection = { ...selection, mode };
      render();
    });
  });

  for (const button of cuisineButtons) {
    button.addEventListener('click', () => {
      selection = {
        ...selection,
        cuisine: button.dataset.finderCuisine as CuisineFilter,
      };
      render();
    });
  }

  fallback.addEventListener('click', () => {
    selection = pickupFallback(selection);
    const pickup = root.querySelector<HTMLInputElement>(
      'input[name="restaurant-mode"][value="pickup"]',
    );
    if (pickup) pickup.checked = true;
    query.value = '';
    render();
  });

  render();
}

initRestaurantFinder();
document.addEventListener('astro:page-load', initRestaurantFinder);
