/**
 * Progressive Erweiterung des Mobile-Menüs (<details class="mnav">).
 * Ohne JavaScript öffnet/schliesst <summary> nativ. Mit JavaScript zusätzlich:
 * - Escape schliesst und gibt den Fokus an den Menü-Button zurück
 * - Klick ausserhalb schliesst
 * - Wahl eines Links schliesst
 * - Wechsel auf Desktop-Breite schliesst
 * - aria-expanded am Button spiegelt den Zustand (zusätzlich zur nativen Semantik)
 */

const DESKTOP = '(min-width: 1024px)';

function close(menu: HTMLDetailsElement, restoreFocus: boolean): void {
  if (!menu.open) return;
  menu.open = false;
  if (restoreFocus) menu.querySelector<HTMLElement>('summary')?.focus();
}

function bind(menu: HTMLDetailsElement): void {
  if (menu.dataset.bound) return;
  menu.dataset.bound = 'true';
  const summary = menu.querySelector<HTMLElement>('summary');
  const sync = () => {
    summary?.setAttribute('aria-expanded', String(menu.open));
    menu.closest('[data-site-header]')?.toggleAttribute('data-menu-open', menu.open);
  };
  sync();
  menu.addEventListener('toggle', sync);

  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) {
      e.preventDefault();
      close(menu, true);
    }
  });

  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target as Node)) close(menu, false);
  });

  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a[href]')) close(menu, false);
  });

  window.matchMedia(DESKTOP).addEventListener('change', (e) => {
    if (e.matches) close(menu, false);
  });
}

function init(): void {
  document.querySelectorAll<HTMLDetailsElement>('details.mnav').forEach(bind);
}

init();
document.addEventListener('astro:page-load', init);
