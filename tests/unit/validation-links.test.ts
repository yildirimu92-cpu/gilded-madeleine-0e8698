import { describe, expect, it } from 'vitest';
import { externalRel, isExternalHref } from '../../src/lib/links';
import {
  isValidEmail,
  isValidPhone,
  isValidSwissPhone,
  messages,
  normalizePhone,
  validate,
} from '../../src/lib/validation';

describe('E-Mail', () => {
  it.each(['name@beispiel.ch', 'vorname.nachname@restaurant-luzern.ch', 'a+b@sub.domain.swiss'])(
    'gültig: %s',
    (v) => expect(isValidEmail(v)).toBe(true),
  );
  it.each([
    'name@',
    'name@beispiel',
    '@beispiel.ch',
    'name @beispiel.ch',
    'name@beispiel.c',
    'name@@x.ch',
  ])('ungültig: %s', (v) => expect(isValidEmail(v)).toBe(false));
});

describe('Telefon (Schweiz)', () => {
  it('normalisiert Trennzeichen', () => {
    expect(normalizePhone(' 041 / 123-45.67 ')).toBe('0411234567');
  });
  it.each([
    '041 123 45 67',
    '0411234567',
    '+41 41 123 45 67',
    '+41 (0)41 123 45 67',
    '0041 79 123 45 67',
    '079-123-45-67',
  ])('gültig: %s', (v) => expect(isValidSwissPhone(v)).toBe(true));
  it.each([
    '123',
    '041 123 45',
    '+49 30 1234567',
    '0041 00 123 45 67',
    '41 123 45 67',
    '041 123 45 678',
  ])('ungültig: %s', (v) => expect(isValidSwissPhone(v)).toBe(false));
  it('international: auch ausländische Nummern', () => {
    expect(isValidPhone('+49 30 1234567')).toBe(true);
    expect(isValidPhone('abc')).toBe(false);
  });
});

describe('validate()', () => {
  it('Pflichtfelder', () => {
    expect(validate('  ', { kind: 'text', required: true })).toBe(messages.required);
    expect(validate('', { kind: 'select', required: true })).toBe(messages.requiredSelect);
    expect(validate('', { kind: 'email' })).toBeNull();
  });
  it('Formate und Längen', () => {
    expect(validate('name@', { kind: 'email' })).toBe(messages.email);
    expect(validate('123', { kind: 'tel', format: 'phone-ch' })).toBe(messages.phoneCh);
    expect(validate('041 123 45 67', { kind: 'tel', format: 'phone-ch' })).toBeNull();
    expect(validate('ab', { kind: 'text', minLength: 3 })).toBe(messages.minLength(3));
    expect(validate('abcd', { kind: 'text', maxLength: 3 })).toBe(messages.maxLength(3));
  });
  it('Meldungen in Sie-Form mit geschütztem Leerzeichen in «z. B.»', () => {
    for (const m of [messages.required, messages.email, messages.phoneCh]) expect(m).toMatch(/Sie/);
    expect(messages.email).toContain('z. B.');
  });
});

describe('Links', () => {
  it('erkennt externe Links', () => {
    expect(isExternalHref('https://rsms.me/inter/')).toBe(true);
    expect(isExternalHref('/preise')).toBe(false);
    expect(isExternalHref('#faq')).toBe(false);
    expect(isExternalHref('mailto:info@beispiel.ch')).toBe(false);
    expect(isExternalHref('https://www.example.ch/x', 'https://www.example.ch')).toBe(false);
  });
  it('setzt sichere rel-Werte', () => {
    expect(externalRel(true)).toBe('noopener noreferrer');
    expect(externalRel(false)).toBe('noopener');
  });
});
