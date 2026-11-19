import { describe, expect, it } from 'vitest';
import {
  approvedDemoUrl,
  businessTypeOptions,
  isPilotCollectionEnabled,
  leadForm,
} from '../../src/config/lead';

const APPROVED = {
  CONTEXT: 'production',
  PILOT_LEADS_ENABLED: 'true',
  PILOT_PRIVACY_APPROVED: 'true',
  PILOT_PROCESSORS_APPROVED: 'true',
  PILOT_CONTACT_APPROVED: 'true',
};

describe('PR9 – Demo und Pilotanfrage sicher gesperrt', () => {
  it('gibt ohne ausdrückliche Demo-Freigabe keinen externen Link aus', () => {
    expect(leadForm.demoStatus).toBe('not-approved');
    expect(approvedDemoUrl()).toBeNull();
  });

  it.each([
    [{}, false],
    [{ CONTEXT: 'production' }, true],
    [{ ...APPROVED, CONTEXT: 'deploy-preview' }, true],
    [{ ...APPROVED, CONTEXT: 'ci' }, true],
    [{ ...APPROVED, PILOT_LEADS_ENABLED: 'false' }, true],
    [{ ...APPROVED, PILOT_PRIVACY_APPROVED: 'false' }, true],
    [{ ...APPROVED, PILOT_PROCESSORS_APPROVED: 'false' }, true],
    [{ ...APPROVED, PILOT_CONTACT_APPROVED: 'false' }, true],
  ] as const)('verweigert Formaktivierung, sobald eine Bedingung fehlt: %j', (env, privacyLive) => {
    expect(isPilotCollectionEnabled(env, privacyLive)).toBe(false);
  });

  it('kann nur bei vollständiger rechts- und datenschutzbezogener Freigabe aktiv werden', () => {
    expect(isPilotCollectionEnabled(APPROVED, false)).toBe(false);
    expect(isPilotCollectionEnabled(APPROVED, true)).toBe(true);
    expect(isPilotCollectionEnabled({ ...APPROVED, PILOT_LEADS_ENABLED: 'TRUE' }, true)).toBe(
      false,
    );
  });

  it('verwendet stabile Feldnamen ohne besondere Kategorien', () => {
    expect(leadForm.name).toBe('izyorder-pilot');
    expect(leadForm.honeypot).toBe('bot-field');
    expect(leadForm.successPath).toBe('/pilot/danke/');
    expect(Object.values(leadForm.fields)).toEqual([
      'kontakt_name',
      'betrieb_name',
      'email',
      'telefon',
      'ort',
      'betriebsart',
      'datenschutz_kenntnisnahme',
    ]);
    expect(businessTypeOptions).toHaveLength(4);
  });
});
