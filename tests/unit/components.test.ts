import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = 'src/components/ui';
const files = readdirSync(dir).filter((f) => /\.(astro|css)$/.test(f));
const read = (f: string) => readFileSync(join(dir, f), 'utf8');
const styleOf = (src: string) =>
  [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n') +
  (src.includes('<style') ? '' : src);

describe('UI-Komponenten', () => {
  it('liefern alle geforderten Komponenten', () => {
    for (const name of [
      'Button',
      'Link',
      'Container',
      'Section',
      'Card',
      'Badge',
      'Tag',
      'Input',
      'Select',
      'SegmentedControl',
      'Dialog',
      'Form',
    ]) {
      expect(files, name).toContain(`${name}.astro`);
    }
  });

  it.each(files)('%s: keine willkürlichen Farben (nur Tokens)', (f) => {
    const css = styleOf(read(f));
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/\brgba?\(/i);
    expect(css).not.toMatch(/\bhsla?\(/i);
  });

  it.each(files)('%s: keine Inline-Styles (CSP)', (f) => {
    const markup = read(f).replace(/<style[\s\S]*?<\/style>/g, '');
    expect(markup).not.toMatch(/\sstyle=/);
    expect(markup).not.toMatch(/define:vars/);
  });

  it('Mint wird in Komponenten nie als Textfarbe genutzt', () => {
    for (const f of files) expect(styleOf(read(f)), f).not.toMatch(/(?<!-)color:\s*var\(--mint-/);
  });

  it('JavaScript nur in Button (Ladesperre), Dialog und Form (gezielt geladen)', () => {
    const withScript = files.filter((f) => /<script/.test(read(f)));
    expect(withScript.sort()).toEqual(['Button.astro', 'Dialog.astro', 'Form.astro']);
  });

  it('Demo-Formulare nutzen method="dialog" (kein Versand ohne JavaScript)', () => {
    const form = read('Form.astro');
    expect(form).toMatch(/const effectiveMethod = demo \? 'dialog' : method;/);
    expect(form).toMatch(/const effectiveAction = demo \? undefined : action;/);
  });

  it('ladende Submit-Buttons werden ohne JavaScript als type="button" gerendert', () => {
    expect(read('Button.astro')).toMatch(/loading && type !== 'button' \? 'button' : type/);
  });

  it('Bedienelemente verwenden die Kontrollhöhen-Tokens', () => {
    expect(read('Button.astro')).toContain('min-height: var(--control-height-md)');
    expect(read('controls.css')).toContain('min-height: var(--control-height-md)');
    const tokens = readFileSync('src/styles/tokens.css', 'utf8');
    expect(tokens).toMatch(/--control-height-md:\s*2\.75rem/);
    expect(tokens).toMatch(/--touch-target:\s*2\.75rem/);
  });

  it('Eingabefelder mindestens 16 px (kein iOS-Zoom)', () => {
    expect(read('controls.css')).toMatch(/font-size:\s*max\(16px/);
  });
});
