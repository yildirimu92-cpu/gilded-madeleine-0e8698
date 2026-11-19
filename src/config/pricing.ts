/**
 * IzyOrder SaaS-Tarife: zentrale Datenquelle für den ENTWURF.
 *
 * Noch keine freigegebenen Tarifleistungen oder Setup-Gebühren.
 * Jahresrabatt = Vorschlag, NICHT verbindlich. Öffentliche Preisseite nicht freischalten.
 * 0 % Plattformprovision ist NICHT gleichbedeutend mit kostenloser Zahlungsabwicklung.
 */
export const pricingDraft = {
  status: 'draft',
  currency: 'CHF',
  vat: 'exkl. MWST',
  annualDiscountPercent: 15,
  annualDiscountStatus: 'not-approved',
  platformCommissionPercent: 0,
  plans: [
    { id: 'starter', name: 'Starter', monthlyCHF: 79 },
    { id: 'professional', name: 'Professional', monthlyCHF: 149 },
    { id: 'business', name: 'Business', monthlyCHF: 249 },
  ],
} as const;

export type PlanId = (typeof pricingDraft.plans)[number]['id'];

export interface PriceCalculation {
  monthlyCHF: number;
  annualTotalCHF: number;
  annualMonthlyEquivalentCHF: number;
  annualSavingsCHF: number;
}

/**
 * In Rappen rechnen; erst am Ende in CHF zurückwandeln.
 * Kein Vertrags- oder Abrechnungsversprechen: nur die Kalkulation des Entwurfs.
 */
export function calculateDraftPrices(monthlyCHF: number): PriceCalculation {
  if (!Number.isInteger(monthlyCHF) || monthlyCHF <= 0) {
    throw new RangeError('Monatspreis muss ein positiver ganzzahliger CHF-Betrag sein.');
  }

  const monthlyCents = monthlyCHF * 100;
  const normalAnnualCents = monthlyCents * 12;
  const discountedAnnualCents = Math.round(
    (normalAnnualCents * (100 - pricingDraft.annualDiscountPercent)) / 100,
  );

  return {
    monthlyCHF,
    annualTotalCHF: discountedAnnualCents / 100,
    annualMonthlyEquivalentCHF: Math.round(discountedAnnualCents / 12) / 100,
    annualSavingsCHF: (normalAnnualCents - discountedAnnualCents) / 100,
  };
}

export function draftPlanPrice(id: PlanId): PriceCalculation {
  const plan = pricingDraft.plans.find((entry) => entry.id === id);
  if (!plan) throw new Error(`Unbekannter Tarif: ${id}`);
  return calculateDraftPrices(plan.monthlyCHF);
}
