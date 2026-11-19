/**
 * PR #9: Öffentliches Demo-/Lead-Gating, standardmässig fail-closed.
 *
 * Aktivierung nie nur mit einem einzelnen Feature-Flag:
 * Betreiber, Datenschutzerklärung und tatsächliche Netlify-Datenbearbeitung
 * sind vor Live-Kontaktaufnahme unabhängig zu prüfen.
 */
import type { BuildEnv } from '../lib/site-config';

export const leadForm = {
  name: 'izyorder-pilot',
  honeypot: 'bot-field',
  successPath: '/pilot/danke/',
  formPath: '/pilot/',
  demoUrl: null as string | null,
  demoStatus: 'not-approved' as const,
  fields: {
    contactName: 'kontakt_name',
    restaurantName: 'betrieb_name',
    email: 'email',
    phone: 'telefon',
    city: 'ort',
    businessType: 'betriebsart',
    privacyRead: 'datenschutz_kenntnisnahme',
  },
} as const;

export const businessTypeOptions = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'cafe', label: 'Café oder Bäckerei' },
  { value: 'other', label: 'Anderer Gastronomiebetrieb' },
] as const;

/**
 * Netlify verarbeitet nur statisch im Build vorhandene, explizit aktivierte Formulare.
 * In CI, Deploy-Previews und bei fehlender Datenschutzerklärung gibt es KEIN
 * data-netlify, keine form-name-Submission und keine produktiven Formularfelder.
 */
export function isPilotCollectionEnabled(env: BuildEnv, privacyPageLive: boolean): boolean {
  return (
    env.CONTEXT === 'production' &&
    env.PILOT_LEADS_ENABLED === 'true' &&
    env.PILOT_PRIVACY_APPROVED === 'true' &&
    env.PILOT_PROCESSORS_APPROVED === 'true' &&
    env.PILOT_CONTACT_APPROVED === 'true' &&
    privacyPageLive
  );
}

/** Erst nach gesonderter visueller/technischer Demo-Freigabe auf URL setzen. */
export function approvedDemoUrl(): string | null {
  if (!leadForm.demoUrl) return null;
  const url = new URL(leadForm.demoUrl);
  if (url.protocol !== 'https:') {
    throw new Error('Die freigegebene Demo muss HTTPS verwenden.');
  }
  return url.href;
}
