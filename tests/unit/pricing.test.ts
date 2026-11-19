import { describe, expect, it } from 'vitest';
import { calculateDraftPrices, draftPlanPrice, pricingDraft } from '../../src/config/pricing';

describe('IzyOrder Tarifentwurf', () => {
  it('hat die beschlossenen monatlichen Ausgangspreise', () => {
    expect(pricingDraft.plans.map((p) => [p.name, p.monthlyCHF])).toEqual([
      ['Starter', 79],
      ['Professional', 149],
      ['Business', 249],
    ]);
    expect(pricingDraft.status).toBe('draft');
    expect(pricingDraft.vat).toBe('exkl. MWST');
  });

  it('weist den Jahresrabatt als ungeprüften Vorschlag aus', () => {
    expect(pricingDraft.annualDiscountPercent).toBe(15);
    expect(pricingDraft.annualDiscountStatus).toBe('not-approved');
    expect(pricingDraft.platformCommissionPercent).toBe(0);
  });

  it.each([
    ['starter', 79, 805.8, 67.15, 142.2],
    ['professional', 149, 1519.8, 126.65, 268.2],
    ['business', 249, 2539.8, 211.65, 448.2],
  ] as const)(
    '%s: Jahrespreis exakt in Rappen',
    (id, monthlyCHF, annualTotalCHF, annualMonthlyEquivalentCHF, annualSavingsCHF) => {
      expect(draftPlanPrice(id)).toEqual({
        monthlyCHF,
        annualTotalCHF,
        annualMonthlyEquivalentCHF,
        annualSavingsCHF,
      });
    },
  );

  it('lehnt ungültige Monatspreise ab', () => {
    for (const value of [0, -1, 49.5, NaN, Infinity]) {
      expect(() => calculateDraftPrices(value)).toThrow(RangeError);
    }
  });
});
