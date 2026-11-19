/**
 * Responsive Breakpoints (mobile first, min-width). CSS Custom Properties sind in
 * Media Queries nicht verwendbar – die Werte werden in CSS literal genutzt und hier
 * dokumentiert. Referenzbreiten für die Qualitätskontrolle: 375, 768, 1440.
 */
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;

export const qaViewports = [375, 768, 1440] as const;
