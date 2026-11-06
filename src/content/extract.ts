/**
 * Liest Informationen aus einem Element: Name, Selector, Eltern-Kette, HTML,
 * passende Stylesheet-Regeln, Computed Styles und sichtbaren Text.
 */

/** Diese Computed-Properties landen im Kontext (Layout, Abstände, Schrift, Farben). */
const RELEVANT_CSS_PROPERTIES = [
  'display', 'position', 'inset', 'width', 'height', 'min-width', 'max-width',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
  'justify-content', 'align-items', 'gap',
  'grid-template-columns', 'grid-template-rows',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
  'text-align', 'text-transform',
  'color', 'background-color', 'background-image',
  'border', 'border-radius', 'box-shadow', 'opacity',
  'overflow', 'z-index', 'transform', 'transition',
];
/** Standardwerte, die nichts aussagen. */
const DEFAULT_VALUES = ['', 'none', 'normal', 'auto'];

export interface CssRuleMatch {
  selector: string;
  css: string;
  media: string;
  source: string;
}

const truncate = (text: string, max: number, suffix: string) =>
  text.length > max ? text.slice(0, max) + suffix : text;

/** Kurzer Name, z. B. "div#header.nav.dark" (max. 3 Klassen). */
export function describeElement(el: Element): string {
  const id = el.id ? `#${el.id}` : '';
  const classes = [...el.classList].slice(0, 3).map((c) => `.${c}`).join('');
  return el.tagName.toLowerCase() + id + classes;
}

/** Eindeutiger Selector von innen nach außen, bis zu einer ID, <body> oder 8 Stufen. */
export function buildCssSelector(el: Element): string {
  const parts: string[] = [];
  for (let cur: Element | null = el; cur && parts.length < 8; cur = cur.parentElement) {
    if (cur.id) {
      parts.unshift(`#${CSS.escape(cur.id)}`);
      break;
    }
    const { tagName } = cur;
    let part = tagName.toLowerCase();
    for (const c of [...cur.classList].slice(0, 3)) part += `.${CSS.escape(c)}`;

    const sameTag = [...(cur.parentElement?.children ?? [])].filter((s) => s.tagName === tagName);
    if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(cur) + 1})`;

    parts.unshift(part);
    if (cur === document.body) break;
  }
  return parts.join(' > ');
}

/** Eltern-Elemente von außen nach innen, ohne <html>. */
export function getAncestorNames(el: Element): string[] {
  const names: string[] = [];
  for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
    names.unshift(describeElement(p));
  }
  return names;
}

/** outerHTML ohne Scripts/Styles/große SVGs, Leerzeilen und Einrückung entfernt. */
export function getCleanHtml(el: Element, maxChars: number): string {
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll('script, style, noscript').forEach((n) => n.remove());
  copy.querySelectorAll('svg').forEach((svg) => {
    if (svg.outerHTML.length > 300) svg.replaceWith(document.createComment(' svg (truncated) '));
  });
  const html = copy.outerHTML.replace(/\n\s*/g, '\n').trim();
  return truncate(html, maxChars, '\n<!-- … HTML truncated -->');
}

/** Alle Stylesheet-Regeln, die auf das Element passen (inkl. @media/@supports/@layer …). */
export function findMatchingCssRules(el: Element): CssRuleMatch[] {
  const matches: CssRuleMatch[] = [];

  const walk = (rules: CSSRuleList, media: string, source: string) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        if (el.matches(rule.selectorText)) {
          matches.push({ selector: rule.selectorText, css: rule.style.cssText, media, source });
        }
      } else if (rule instanceof CSSGroupingRule) {
        const cond = rule instanceof CSSMediaRule ? rule.conditionText : '';
        walk(rule.cssRules, [media, cond].filter(Boolean).join(' and '), source);
      }
    }
  };

  for (const sheet of document.styleSheets) {
    const source = sheet.href ? new URL(sheet.href).pathname.split('/').pop()! : 'inline <style>';
    try {
      walk(sheet.cssRules, '', source);
    } catch {
      // Fremde Stylesheets ohne CORS sind nicht lesbar.
    }
  }
  return matches;
}

/** Ausgewählte Computed Styles ohne Standardwerte. */
export function getComputedCss(el: Element): string[] {
  const style = getComputedStyle(el);
  return RELEVANT_CSS_PROPERTIES.flatMap((prop) => {
    const value = style.getPropertyValue(prop);
    return DEFAULT_VALUES.includes(value) ? [] : [`${prop}: ${value};`];
  });
}

/** Sichtbarer Text, auf eine Zeile normalisiert. */
export function getVisibleText(el: HTMLElement, maxChars: number): string {
  return truncate(el.innerText.replace(/\s+/g, ' ').trim(), maxChars, ' …');
}
