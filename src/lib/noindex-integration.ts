import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { generatedHeaders, type BuildEnv } from './site-config';

/**
 * Schreibt nach dem Build eine Netlify-Datei `_headers` mit `X-Robots-Tag: noindex`,
 * solange die Indexierung nicht freigegeben ist (ADR 0005).
 */
export function noindexHeaders(env: BuildEnv): AstroIntegration {
  return {
    name: 'izyorder:noindex-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const content = generatedHeaders(env);
        if (!content) {
          logger.info('Indexierung aktiv – kein X-Robots-Tag gesetzt.');
          return;
        }
        await writeFile(new URL('_headers', dir), content, 'utf8');
        logger.info(`noindex aktiv – ${fileURLToPath(new URL('_headers', dir))} geschrieben.`);
      },
    },
  };
}
