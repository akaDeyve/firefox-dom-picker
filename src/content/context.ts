/**
 * Baut aus einem Element den Kontext (Daten + Markdown-Prompt) zusammen.
 */

import {
  buildCssSelector, findMatchingCssRules, getAncestorNames, getCleanHtml,
  getComputedCss, getVisibleText, type CssRuleMatch,
} from './extract';
import { getSettings } from './settings';

interface ContextData {
  selector: string;
  ancestors: string[];
  html: string;
  inlineStyle: string;
  cssRules: CssRuleMatch[];
  computed: string[];
  text: string;
  title: string;
  url: string;
  at: string;
}

export type Context = ContextData & { markdown: string };

export async function buildContext(el: HTMLElement): Promise<Context> {
  const s = await getSettings();
  const ctx: ContextData = {
    selector: buildCssSelector(el),
    ancestors: s.includeAncestors ? getAncestorNames(el) : [],
    html: getCleanHtml(el, s.maxHtmlChars),
    inlineStyle: el.getAttribute('style')?.trim() ?? '',
    cssRules: s.includeCssRules ? findMatchingCssRules(el) : [],
    computed: s.includeComputed ? getComputedCss(el) : [],
    text: getVisibleText(el, s.maxTextChars),
    title: document.title.slice(0, 120),
    url: location.href,
    at: new Date().toISOString(),
  };
  return { ...ctx, markdown: renderMarkdown(ctx) };
}

const codeBlock = (lang: string, content: string) => ['```' + lang, content, '```', ''];

function renderMarkdown(ctx: ContextData): string {
  const lines = ['# Selected DOM element context', '', `- Page: ${ctx.title} — ${ctx.url}`, `- Element: \`${ctx.selector}\``];
  if (ctx.ancestors.length) lines.push(`- Ancestors: \`${ctx.ancestors.join(' < ')}\``);
  lines.push('', '## HTML', ...codeBlock('html', ctx.html));

  if (ctx.inlineStyle) lines.push('## Inline style', ...codeBlock('css', ctx.inlineStyle));

  if (ctx.cssRules.length) {
    const rules = ctx.cssRules.map(
      (r) => (r.media ? `/* @media ${r.media} */\n` : '') + `${r.selector} { ${r.css} } /* from: ${r.source} */`,
    );
    lines.push('## Matching CSS rules (authored)', ...codeBlock('css', rules.join('\n')));
  }

  if (ctx.computed.length) {
    const body = [`${ctx.selector} {`, ...ctx.computed.map((d) => `  ${d}`), '}'].join('\n');
    lines.push('## Computed styles (excerpt)', ...codeBlock('css', body));
  }

  if (ctx.text) lines.push('## Visible text', '', `"${ctx.text}"`, '');

  return lines.join('\n');
}
