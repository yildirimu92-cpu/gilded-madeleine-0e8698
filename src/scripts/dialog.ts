/**
 * Dialog-Steuerung für native <dialog class="dialog">:
 * - Öffnen über [data-dialog-open="id"], Schliessen über [data-dialog-close]
 * - Escape schliesst (nativ), Klick auf den Hintergrund schliesst (optional)
 * - Fokus: [autofocus] bzw. erstes Bedienelement im Inhalt; Tab bleibt im Dialog
 * - Fokus-Rückgabe an das auslösende Element, Seiten-Scroll gesperrt
 */

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const openers = new WeakMap<HTMLDialogElement, HTMLElement>();

function focusables(dialog: HTMLDialogElement): HTMLElement[] {
  return [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

export function openDialog(dialog: HTMLDialogElement, opener?: HTMLElement | null): void {
  if (dialog.open) return;
  if (opener) openers.set(dialog, opener);
  dialog.showModal();
  document.documentElement.classList.add('has-dialog');
  const preferred =
    dialog.querySelector<HTMLElement>('[autofocus]') ??
    focusables(dialog).find((el) => !el.classList.contains('dialog__close')) ??
    focusables(dialog)[0];
  preferred?.focus();
}

export function closeDialog(dialog: HTMLDialogElement, returnValue = ''): void {
  if (dialog.open) dialog.close(returnValue);
}

function onClose(this: HTMLDialogElement): void {
  document.documentElement.classList.remove('has-dialog');
  const opener = openers.get(this);
  if (opener?.isConnected) opener.focus();
  openers.delete(this);
}

function trapTab(this: HTMLDialogElement, e: KeyboardEvent): void {
  if (e.key !== 'Tab') return;
  const items = focusables(this);
  if (!items.length) return;
  const first = items[0]!;
  const last = items[items.length - 1]!;
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

const pressedOnBackdrop = new WeakSet<HTMLDialogElement>();

function onPointerDown(this: HTMLDialogElement, e: PointerEvent): void {
  if (e.target === this) pressedOnBackdrop.add(this);
  else pressedOnBackdrop.delete(this);
}

/** Schliesst nur, wenn Druck UND Loslassen auf dem Hintergrund erfolgten (kein Textauswahl-Ziehen). */
function onBackdropClick(this: HTMLDialogElement, e: MouseEvent): void {
  const fromBackdrop = pressedOnBackdrop.has(this);
  pressedOnBackdrop.delete(this);
  if (e.target === this && fromBackdrop && this.dataset.dismissible !== 'false') {
    closeDialog(this, 'backdrop');
  }
}

function bind(dialog: HTMLDialogElement): void {
  if (dialog.dataset.bound) return;
  dialog.dataset.bound = 'true';
  dialog.addEventListener('close', onClose);
  dialog.addEventListener('keydown', trapTab);
  dialog.addEventListener('pointerdown', onPointerDown);
  dialog.addEventListener('click', onBackdropClick);
}

function init(): void {
  document.querySelectorAll<HTMLDialogElement>('dialog.dialog').forEach(bind);
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  const openBtn = target?.closest<HTMLElement>('[data-dialog-open]');
  if (openBtn) {
    const dialog = document.getElementById(openBtn.dataset.dialogOpen ?? '');
    if (dialog instanceof HTMLDialogElement) {
      e.preventDefault();
      bind(dialog);
      openDialog(dialog, openBtn);
    }
    return;
  }
  const closeBtn = target?.closest<HTMLElement>('[data-dialog-close]');
  const dialog = closeBtn?.closest('dialog');
  if (closeBtn && dialog instanceof HTMLDialogElement) {
    closeDialog(dialog, closeBtn.dataset.dialogClose || 'close');
  }
});

init();
document.addEventListener('astro:page-load', init);
