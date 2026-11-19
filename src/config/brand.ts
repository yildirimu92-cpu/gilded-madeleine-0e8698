/**
 * Markenkonfiguration. Verbindliche Schreibweise: «IzyOrder».
 *
 * Logo-Status: Das IO-Monogramm liegt erst als visuelle Markenstudie vor. Bis eine
 * freigegebene Vektordatei existiert, bleibt `logo.status` auf 'pending' und es wird
 * ausschliesslich die typografische Wortmarke verwendet (ADR 0010).
 */
export const brand = {
  name: 'IzyOrder',
  claim: 'Dein Restaurant. Deine Bestellungen.',
  logo: {
    status: 'pending' as 'pending' | 'final',
    /** Ablageort der freigegebenen SVG-Dateien (siehe src/assets/brand/README.md). */
    assetDir: 'src/assets/brand',
    files: {
      lockup: 'izyorder-lockup.svg',
      lockupInverse: 'izyorder-lockup-inverse.svg',
      monogram: 'izyorder-monogram.svg',
      monogramInverse: 'izyorder-monogram-inverse.svg',
    },
  },
} as const;

export type LogoVariant = 'lockup' | 'wordmark' | 'monogram';
export type LogoTone = 'default' | 'inverse';
