import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { generatedHeaders, type BuildEnv } from './site-config';
import { sitemapXml } from './sitemap';

/**
 * Steuert nach dem Build die Indexierungs-Header und die Sitemap.
 * Vor Freigabe: X-Robots-Tag noindex, keine Sitemap.
 * Nur nach expliziter Produktionsfreigabe: Sitemap, kein globaler noindex-Header.
 */
export function noindexHeaders(env: BuildEnv): AstroIntegration {
  return {
    name: 'izyorder:noindex-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const content = generatedHeaders(env);
        if (content) {
          await writeFile(new URL('_headers', dir), content, 'utf8');
          logger.info(`noindex aktiv – ${fileURLToPath(new URL('_headers', dir))} geschrieben.`);
        } else {
          logger.info('Indexierung aktiv – kein globaler X-Robots-Tag gesetzt.');
        }
        const sitemap = sitemapXml(env);
        if (sitemap) {
          await writeFile(new URL('sitemap.xml', dir), sitemap, 'utf8');
          logger.info('Indexierung freigegeben – Sitemap mit freigegebenen Seiten erstellt.');
        }
      },
    },
  };
}
