/**
 * Text ready to compare or search: trimmed, single spaces, no accents, lowercase.
 *
 * @example
 * normalizeText('  Música   y  Más ') // 'musica y mas'
 */
export const normalizeText = (text: string): string =>
  text
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD') // splits "á" into "a" + accent mark...
    .replace(/\p{Diacritic}/gu, '') // ...so the accent marks can be removed
    .toLowerCase()
