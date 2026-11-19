import { describe, expect, it } from 'vitest';
import {
  calculateCommissionScenario,
  sampleScenario,
  scenarioLimits,
  type CommissionScenario,
} from '../../src/lib/commission-calculator';

const calculate = (changes: Partial<CommissionScenario> = {}) =>
  calculateCommissionScenario({ ...sampleScenario, ...changes });

describe('PR11 – Provisionsvergleich mit nachvollziehbaren Annahmen', () => {
  it('rechnet das explizit hypothetische Standardbeispiel exakt nach', () => {
    expect(calculate()).toEqual({
      redirectedOrders: 60,
      redirectedOrderVolumeCHF: 2280,
      avoidedMarketplaceCommissionCHF: 342,
      assumedDirectPaymentFeesCHF: 63.6,
      subscriptionCHF: 149,
      monthlyDifferenceCHF: 129.4,
      annualDifferenceCHF: 1552.8,
      breakEvenRedirectedOrders: 33,
      breakEvenRedirectedPercent: 16.5,
    });
  });

  it('vergleicht nur tatsächlich angenommene verlagerte Bestellungen', () => {
    const none = calculate({ redirectedPercent: 0 });
    expect(none.redirectedOrders).toBe(0);
    expect(none.avoidedMarketplaceCommissionCHF).toBe(0);
    expect(none.assumedDirectPaymentFeesCHF).toBe(0);
    expect(none.monthlyDifferenceCHF).toBe(-149);

    const half = calculate({ redirectedPercent: 50 });
    expect(half.redirectedOrders).toBe(100);
    expect(half.avoidedMarketplaceCommissionCHF).toBe(570);
    expect(half.assumedDirectPaymentFeesCHF).toBe(106);
    expect(half.monthlyDifferenceCHF).toBe(315);
  });

  it('macht die Pakete aus der zentralen Preisquelle sichtbar', () => {
    expect(calculate({ planId: 'starter' }).subscriptionCHF).toBe(79);
    expect(calculate({ planId: 'professional' }).subscriptionCHF).toBe(149);
    expect(calculate({ planId: 'business' }).subscriptionCHF).toBe(249);
  });

  it('wird bei schlechten Eingaben oder Gebühren zu einem Mehrkosten-Szenario', () => {
    const expensive = calculate({ marketplaceCommissionPercent: 0 });
    expect(expensive.monthlyDifferenceCHF).toBe(-212.6);
    expect(expensive.breakEvenRedirectedOrders).toBeNull();
    expect(expensive.breakEvenRedirectedPercent).toBeNull();
  });

  it('behauptet bei nicht erreichbarerer Umleitung keinen Break-even', () => {
    const tiny = calculate({ monthlyMarketplaceOrders: 10, redirectedPercent: 100 });
    expect(tiny.breakEvenRedirectedOrders).toBeNull();
    expect(tiny.breakEvenRedirectedPercent).toBeNull();

    const zero = calculate({ monthlyMarketplaceOrders: 0 });
    expect(zero.redirectedOrders).toBe(0);
    expect(zero.breakEvenRedirectedOrders).toBeNull();
    expect(zero.monthlyDifferenceCHF).toBe(-149);
  });

  it('rundet die Anzahl umgeleiteter Bestellungen auf ganze Aufträge', () => {
    const scenario = calculate({ monthlyMarketplaceOrders: 7, redirectedPercent: 25 });
    expect(scenario.redirectedOrders).toBe(2);
  });

  it('berechnet die Jahresdifferenz ausschliesslich aus zwölf vollen Monatswerten', () => {
    for (const planId of ['starter', 'professional', 'business'] as const) {
      const result = calculate({ planId });
      expect(result.annualDifferenceCHF).toBeCloseTo(result.monthlyDifferenceCHF * 12, 2);
    }
  });

  it('lehnt NaN, Infinität und alle Werte ausserhalb der Grenzen ab', () => {
    for (const field of Object.keys(scenarioLimits) as (keyof typeof scenarioLimits)[]) {
      const limits = scenarioLimits[field];
      for (const invalid of [NaN, Infinity, -Infinity, limits.min - 1, limits.max + 1]) {
        expect(() => calculate({ [field]: invalid })).toThrow(RangeError);
      }
    }
    expect(() => calculate({ monthlyMarketplaceOrders: 12.5 })).toThrow(RangeError);
    expect(() => calculate({ planId: 'unknown' as CommissionScenario['planId'] })).toThrow(
      RangeError,
    );
  });
});
