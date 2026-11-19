/**
 * Progressive Formularvalidierung für <form data-validate>.
 * - Meldungen direkt am Feld (aria-invalid + aria-describedby), keine Browser-Bubbles
 * - Prüfung nach dem ersten Verlassen eines Feldes, danach live beim Tippen
 * - Beim Absenden: Fokus auf das erste fehlerhafte Feld, Zusammenfassung per Live-Region
 * - `data-demo`: sendet nie Daten (Styleguide)
 * Ohne JavaScript greift die native Validierung des Browsers.
 */
import { validate, type FieldKind, type FieldRules } from '../lib/validation';

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function rulesFor(el: Control): FieldRules {
  const kind: FieldKind =
    el instanceof HTMLSelectElement
      ? 'select'
      : el.type === 'email'
        ? 'email'
        : el.type === 'tel'
          ? 'tel'
          : 'text';
  const min = 'minLength' in el && el.minLength > 0 ? el.minLength : undefined;
  const max = 'maxLength' in el && el.maxLength > 0 ? el.maxLength : undefined;
  return {
    kind,
    required: el.required,
    minLength: min,
    maxLength: max,
    format: el.dataset.format === 'phone-ch' ? 'phone-ch' : undefined,
  };
}

function setError(el: Control, message: string | null): void {
  const field = el.closest<HTMLElement>('[data-field]');
  const box = field?.querySelector<HTMLElement>('[data-field-error]');
  const text = box?.querySelector<HTMLElement>('[data-field-error-text]');
  if (!box || !text) return;
  const ids = new Set((el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
  if (message) {
    text.textContent = message;
    box.hidden = false;
    el.setAttribute('aria-invalid', 'true');
    ids.add(box.id);
    field?.classList.add('field--invalid');
  } else {
    text.textContent = '';
    box.hidden = true;
    el.removeAttribute('aria-invalid');
    ids.delete(box.id);
    field?.classList.remove('field--invalid');
  }
  if (ids.size) el.setAttribute('aria-describedby', [...ids].join(' '));
  else el.removeAttribute('aria-describedby');
}

function check(el: Control): boolean {
  if (el.disabled) return true;
  const message = validate(el.value, rulesFor(el));
  setError(el, message);
  return message === null;
}

export function enhanceForm(form: HTMLFormElement): void {
  if (form.dataset.enhanced) return;
  form.dataset.enhanced = 'true';
  form.noValidate = true;
  const controls = () =>
    [
      ...form.querySelectorAll<Control>(
        'input:not([type=radio]):not([type=checkbox]):not([type=hidden]), select, textarea',
      ),
    ].filter((el) => el.closest('[data-field]'));
  const touched = new WeakSet<Control>();
  const status = form.querySelector<HTMLElement>('[data-form-status]');

  form.addEventListener('focusout', (e) => {
    const el = e.target as Control;
    if (!controls().includes(el)) return;
    if (el.value.trim() || touched.has(el)) {
      touched.add(el);
      check(el);
    }
  });

  form.addEventListener('input', (e) => {
    const el = e.target as Control;
    if (touched.has(el)) check(el);
  });

  form.addEventListener('change', (e) => {
    const el = e.target as Control;
    if (el instanceof HTMLSelectElement) {
      touched.add(el);
      check(el);
    }
  });

  form.addEventListener('submit', (e) => {
    const invalid = controls().filter((el) => {
      touched.add(el);
      return !check(el);
    });
    if (invalid.length) {
      e.preventDefault();
      if (status) {
        status.textContent =
          invalid.length === 1
            ? 'Ein Feld benötigt Ihre Aufmerksamkeit.'
            : `${invalid.length} Felder benötigen Ihre Aufmerksamkeit.`;
      }
      invalid[0]?.focus();
      return;
    }
    if (form.dataset.demo !== undefined) {
      e.preventDefault();
      if (status)
        status.textContent = 'Demo: Eingaben sind gültig. Es wurden keine Daten gesendet.';
    }
  });
}

function init(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-validate]').forEach(enhanceForm);
}

init();
document.addEventListener('astro:page-load', init);
