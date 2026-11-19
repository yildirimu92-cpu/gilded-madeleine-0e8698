/**
 * IzyOrder PR #11: Szenariorechner – keine Marktprognose.
 *
 * Vergleich: Ein selbst gewählter Anteil der HEUTIGEN Marktplatzbestellungen
 * läuft künftig direkt. Der übrige Bestellbestand bleibt unverändert.
 * Verglichen werden ausschliesslich:
 * - vermiedene Marktplatzprovision auf den verlagerten Bestellungen
 * - angenommene direkte Zahlungsabwicklung auf diesen Bestellungen
 * - monatliche IzyOrder-Abogebühr (unverbindlicher Tarifentwurf)
 *
 * Nicht enthalten: Marketing, Lieferung, Setup, Personal, Retouren, Steuern,
 * Kosten der Kundengewinnung oder weitere Gebühren. Kein Umsatzversprechen.
 */
import { pricingDraft, type PlanId } from '../config/pricing';

export interface CommissionScenario {
  /** Bisherige Marktplatzbestellungen je Monat, ganze Anzahl. */
  monthlyMarketplaceOrders: number;
  /** Durchschnittlicher Warenkorb in CHF inkl. selbst gesetzter Annahmen. */
  averageBasketCHF: number;
  /** Bisherige vergleichbare Marktplatzprovision in %, frei eingegeben. */
  marketplaceCommissionPercent: number;
  /** Hypothetisch verlagerten Anteil dieser Bestellungen in %. */
  redirectedPercent: number;
  /** Angenommener prozentualer Zahlungsanbieter-Aufschlag für Direktbestellungen. */
  paymentPercent: number;
  /** Angenommene fixe Zahlungsgebühr je Direktbestellung, CHF. */
  paymentFixedCHF: number;
  planId: PlanId;
}

export interface CommissionCalculation {
  redirectedOrders: number;
  redirectedOrderVolumeCHF: number;
  avoidedMarketplaceCommissionCHF: number;
  assumedDirectPaymentFeesCHF: number;
  subscriptionCHF: number;
  monthlyDifferenceCHF: number;
  annualDifferenceCHF: number;
  /** Benötigte verlagerte Bestellungen, sofern unter den Eingaben erreichbar. */
  breakEvenRedirectedOrders: number | null;
  /** Prozent vom vorhandenen Marktplatzvolumen; null, falls nicht erreichbar. */
  breakEvenRedirectedPercent: number | null;
}

export const sampleScenario: CommissionScenario = {
  monthlyMarketplaceOrders: 200,
  averageBasketCHF: 38,
  marketplaceCommissionPercent: 15,
  redirectedPercent: 30,
  paymentPercent: 2,
  paymentFixedCHF: 0.3,
  planId: 'professional',
};

export const scenarioLimits = {
  monthlyMarketplaceOrders: { min: 0, max: 100_000 },
  averageBasketCHF: { min: 0.01, max: 10_000 },
  marketplaceCommissionPercent: { min: 0, max: 40 },
  redirectedPercent: { min: 0, max: 100 },
  paymentPercent: { min: 0, max: 20 },
  paymentFixedCHF: { min: 0, max: 20 },
} as const;

function checkNumber(
  name: keyof typeof scenarioLimits,
  value: number,
  integer = false,
): void {
  const { min, max } = scenarioLimits[name];
  if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new RangeError(`Ungültiger Wert für ${name}.`);
  }
}

function roundedCents(value: number): number {
  return Math.round(value * 100);
}

/** Prozentangaben werden als Hundertstel-Prozent exakt gerechnet. */
function percentageFeeCents(volumeCents: number, percentage: number): number {
  const bps = Math.round(percentage * 100);
  return Math.round((volumeCents * bps) / 10_000);
}

export function calculateCommissionScenario(input: CommissionScenario): CommissionCalculation {
  checkNumber('monthlyMarketplaceOrders', input.monthlyMarketplaceOrders, true);
  checkNumber('averageBasketCHF', input.averageBasketCHF);
  checkNumber('marketplaceCommissionPercent', input.marketplaceCommissionPercent);
  checkNumber('redirectedPercent', input.redirectedPercent);
  checkNumber('paymentPercent', input.paymentPercent);
  checkNumber('paymentFixedCHF', input.paymentFixedCHF);

  const plan = pricingDraft.plans.find((item) => item.id === input.planId);
  if (!plan) throw new RangeError('Der gewählte Tarif ist nicht bekannt.');

  const redirectedOrders = Math.round(
    (input.monthlyMarketplaceOrders * input.redirectedPercent) / 100,
  );
  const basketCents = roundedCents(input.averageBasketCHF);
  const paymentFixedCents = roundedCents(input.paymentFixedCHF);
  const subscriptionCents = plan.monthlyCHF * 100;

  function differenceFor(count: number): number {
    const volumeCents = count * basketCents;
    const marketplaceCents = percentageFeeCents(volumeCents, input.marketplaceCommissionPercent);
    const directFeesCents =
      percentageFeeCents(volumeCents, input.paymentPercent) + count * paymentFixedCents;
    return marketplaceCents - directFeesCents - subscriptionCents;
  }

  const redirectedVolumeCents = redirectedOrders * basketCents;
  const marketplaceCents = percentageFeeCents(
    redirectedVolumeCents,
    input.marketplaceCommissionPercent,
  );
  const directFeesCents =
    percentageFeeCents(redirectedVolumeCents, input.paymentPercent) +
    redirectedOrders * paymentFixedCents;
  const monthlyDifferenceCents = marketplaceCents - directFeesCents - subscriptionCents;

  // Auch bei Cent-Rundungen keine falsche Unmöglichkeits-Aussage: statt
  // gerundetem Einzelauftrag den vollständigen Vergleich am maximal
  // vorhandenen Bestellvolumen prüfen.
  let breakEvenRedirectedOrders: number | null = null;
  if (differenceFor(input.monthlyMarketplaceOrders) >= 0) {
    let lo = 0;
    let hi = input.monthlyMarketplaceOrders;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (differenceFor(mid) >= 0) hi = mid;
      else lo = mid + 1;
    }
    breakEvenRedirectedOrders = lo;
  }

  return {
    redirectedOrders,
    redirectedOrderVolumeCHF: redirectedVolumeCents / 100,
    avoidedMarketplaceCommissionCHF: marketplaceCents / 100,
    assumedDirectPaymentFeesCHF: directFeesCents / 100,
    subscriptionCHF: subscriptionCents / 100,
    monthlyDifferenceCHF: monthlyDifferenceCents / 100,
    annualDifferenceCHF: (monthlyDifferenceCents * 12) / 100,
    breakEvenRedirectedOrders,
    breakEvenRedirectedPercent:
      breakEvenRedirectedOrders !== null && input.monthlyMarketplaceOrders > 0
        ? Math.round((breakEvenRedirectedOrders / input.monthlyMarketplaceOrders) * 10_000) / 100
        : null,
  };
}
