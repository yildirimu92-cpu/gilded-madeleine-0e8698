import { describe, expect, it } from 'vitest';
import {
  featureBySlug,
  featurePages,
  featurePath,
  voiceFeature,
  type FeatureSlug,
} from '../../src/config/features';

describe('PR10 – B2B-Funktionsseiten', () => {
  it('enthält genau die drei freigegebenen Produktbereiche als Entwurf', () => {
    expect(featurePages.map((feature) => feature.slug)).toEqual([
      'online-bestellshop',
      'abholung-lieferung',
      'bestellverwaltung',
    ]);
    expect(new Set(featurePages.map((feature) => feature.slug)).size).toBe(3);
  });

  it('erzeugt ausschliesslich die vorgesehenen lokalen URL-Pfade', () => {
    for (const feature of featurePages) {
      expect(featurePath(feature.slug)).toBe(`/funktionen/${feature.slug}/`);
      expect(featureBySlug(feature.slug)).toBe(feature);
    }
    expect(() => featureBySlug('unbekannt' as FeatureSlug)).toThrow();
  });

  it('bietet pro Unterseite drei verständliche Vorteile und drei Schritte', () => {
    for (const feature of featurePages) {
      expect(feature.title.length).toBeGreaterThan(10);
      expect(feature.intro.length).toBeGreaterThan(60);
      expect(feature.pitch.length).toBeGreaterThan(60);
      expect(feature.disclaimer.length).toBeGreaterThan(40);
      expect(feature.highlights).toHaveLength(3);
      expect(feature.steps).toHaveLength(3);
      for (const item of [...feature.highlights, ...feature.steps]) {
        expect(item.title.length).toBeGreaterThan(5);
      }
    }
  });

  it('bewirbt KI-Telefonassistenz nicht als verfügbares oder inkludiertes Produkt', () => {
    expect(voiceFeature.status).toBe('planned');
    expect(voiceFeature.text).toContain('optionale Erweiterung');
    expect(voiceFeature.text).not.toContain('bereits verfügbar');
  });
});
