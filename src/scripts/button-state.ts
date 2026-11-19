/**
 * Ladezustand für Buttons (PR #4, Codex-Befund 1).
 *
 * Ein Button mit aria-busy="true" darf keine Aktion auslösen – weder per Maus noch per
 * Enter/Leertaste noch durch implizites Absenden eines Formulars. aria-disabled und
 * pointer-events allein reichen dafür nicht. Diese Sperre fängt deshalb in der
 * Capture-Phase am Dokument ab, bevor andere Handler (z. B. Dialog-Auslöser) reagieren.
 *
 * Der Button bleibt fokussierbar (Screenreader können den Ladezustand erfassen).
 */

const BUSY = '[aria-busy="true"]';

function isBusyControl(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>(BUSY) : null;
}

function block(e: Event): void {
  e.preventDefault();
  e.stopImmediatePropagation();
}

/** Setzt oder entfernt den Ladezustand eines Buttons (auch zur Laufzeit). */
export function setButtonLoading(button: HTMLElement, loading: boolean): void {
  button.classList.toggle('is-loading', loading);
  if (loading) {
    button.setAttribute('aria-busy', 'true');
    button.setAttribute('aria-disabled', 'true');
  } else {
    button.removeAttribute('aria-busy');
    if (!button.hasAttribute('data-disabled')) button.removeAttribute('aria-disabled');
  }
  const status = button.querySelector<HTMLElement>('.btn__spinner');
  if (status) status.hidden = !loading;
}

function install(): void {
  const w = window as Window & { __izyButtonGuard?: boolean };
  if (w.__izyButtonGuard) return;
  w.__izyButtonGuard = true;

  // Maus, Enter, Leertaste und synthetische Klicks (implizites Absenden) erzeugen «click».
  document.addEventListener(
    'click',
    (e) => {
      if (isBusyControl(e.target)) block(e);
    },
    true,
  );

  // Zweite Verteidigungslinie: Absenden über einen ladenden Button verhindern.
  document.addEventListener(
    'submit',
    (e) => {
      const submitter = (e as SubmitEvent).submitter;
      const form = e.target as HTMLFormElement;
      const defaultButton = form.querySelector<HTMLElement>(
        'button[type="submit"], button:not([type])',
      );
      if (isBusyControl(submitter) || (!submitter && isBusyControl(defaultButton))) block(e);
    },
    true,
  );
}

install();
