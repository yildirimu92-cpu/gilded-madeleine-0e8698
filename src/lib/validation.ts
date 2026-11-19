/**
 * Validierungsregeln (rein, ohne DOM – identisch im Browser und in Tests).
 * Meldungen B2B in der Sie-Form (Inhaltsregeln). Wiederverwendbar für Lead-Formulare.
 */

export type FieldKind = 'text' | 'email' | 'tel' | 'select';

export interface FieldRules {
  kind: FieldKind;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  /** z. B. 'phone-ch' für Schweizer Telefonnummern */
  format?: 'phone-ch';
}

export const messages = {
  required: 'Bitte füllen Sie dieses Feld aus.',
  requiredSelect: 'Bitte wählen Sie eine Option aus.',
  email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein, z.\u00a0B. name@beispiel.ch.',
  phone: 'Bitte geben Sie eine gültige Telefonnummer ein, z.\u00a0B. 041 123 45 67.',
  phoneCh: 'Bitte geben Sie eine gültige Schweizer Telefonnummer ein, z.\u00a0B. 041 123 45 67.',
  minLength: (n: number) => `Bitte geben Sie mindestens ${n} Zeichen ein.`,
  maxLength: (n: number) => `Bitte geben Sie höchstens ${n} Zeichen ein.`,
} as const;

const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[a-z]{2,}$/i;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL.test(value.trim());
}

/** Entfernt Leerzeichen, Klammern, Bindestriche, Punkte und Schrägstriche. */
export function normalizePhone(value: string): string {
  return value.trim().replace(/[\s().\-/]/g, '');
}

/**
 * Schweizer Nummern: 0XX XXX XX XX (10 Ziffern), +41 XX XXX XX XX bzw. 0041 …
 * Die führende 0 nach +41 wird toleriert: +41 (0)41 …
 */
export function isValidSwissPhone(value: string): boolean {
  let n = normalizePhone(value);
  if (n.startsWith('+41')) n = n.slice(3);
  else if (n.startsWith('0041')) n = n.slice(4);
  else if (n.startsWith('0')) n = n.slice(1);
  else return false;
  if (n.startsWith('0')) n = n.slice(1);
  return /^[1-9]\d{8}$/.test(n);
}

/** Internationale Nummer (E.164-ähnlich), z.\u00a0B. für Betriebe im Grenzgebiet. */
export function isValidPhone(value: string): boolean {
  const n = normalizePhone(value);
  return /^(\+|00)?[1-9]\d{6,14}$/.test(n) || isValidSwissPhone(value);
}

/** Liefert die erste Fehlermeldung oder `null`. */
export function validate(value: string, rules: FieldRules): string | null {
  const v = value.trim();
  if (!v) {
    if (!rules.required) return null;
    return rules.kind === 'select' ? messages.requiredSelect : messages.required;
  }
  if (rules.minLength && v.length < rules.minLength) return messages.minLength(rules.minLength);
  if (rules.maxLength && v.length > rules.maxLength) return messages.maxLength(rules.maxLength);
  if (rules.kind === 'email' && !isValidEmail(v)) return messages.email;
  if (rules.kind === 'tel') {
    if (rules.format === 'phone-ch' ? !isValidSwissPhone(v) : !isValidPhone(v)) {
      return rules.format === 'phone-ch' ? messages.phoneCh : messages.phone;
    }
  }
  return null;
}
