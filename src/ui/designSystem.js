// src/ui/designSystem.js
// Helpers para acessar cores e espaçamentos do design system

/**
 * Obter cor com fallback
 * @param {object} design - objeto design do resolveUI
 * @param {string} colorKey - chave da cor (ex: 'corFundoPrincipal')
 * @param {string} fallback - cor fallback
 */
export function getColor(design, colorKey, fallback = '#ffffff') {
  if (!design || typeof design !== 'object') return fallback
  const color = design[colorKey]
  return typeof color === 'string' && color.trim() ? color : fallback
}

/**
 * Obter espaçamento com fallback
 * @param {object} design - objeto design do resolveUI
 * @param {string} spacingKey - chave do espaçamento (ex: 'spacingMedio')
 * @param {string} fallback - espaçamento fallback
 */
export function getSpacing(design, spacingKey, fallback = '12px') {
  if (!design || typeof design !== 'object') return fallback
  const spacing = design[spacingKey]
  return typeof spacing === 'string' && spacing.trim() ? spacing : fallback
}

/**
 * Obter border-radius com fallback
 * @param {object} design - objeto design do resolveUI
 * @param {string} radiusKey - chave do border-radius (ex: 'borderRadioMedio')
 * @param {string} fallback - radius fallback
 */
export function getRadius(design, radiusKey, fallback = '10px') {
  if (!design || typeof design !== 'object') return fallback
  const radius = design[radiusKey]
  return typeof radius === 'string' && radius.trim() ? radius : fallback
}

/**
 * Obter dimensão com fallback
 * @param {object} design - objeto design do resolveUI
 * @param {string} dimensionKey - chave da dimensão (ex: 'containerMaxWidth')
 * @param {string} fallback - dimensão fallback
 */
export function getDimension(design, dimensionKey, fallback = '100%') {
  if (!design || typeof design !== 'object') return fallback
  const dimension = design[dimensionKey]
  return typeof dimension === 'string' && dimension.trim() ? dimension : fallback
}

/**
 * Obter opacity com fallback
 * @param {object} design - objeto design do resolveUI
 * @param {string} opacityKey - chave da opacity (ex: 'overlayOpacityPadrao')
 * @param {number} fallback - opacity fallback
 */
export function getOpacity(design, opacityKey, fallback = 0.45) {
  if (!design || typeof design !== 'object') return fallback
  const opacity = design[opacityKey]
  const num = Number(opacity)
  return Number.isFinite(num) ? num : fallback
}

/**
 * Helpers de cores mais comuns
 */
export const designColors = {
  fundoPrincipal: (design) => getColor(design, 'corFundoPrincipal', '#ffffff'),
  fundoSecundario: (design) => getColor(design, 'corFundoSecundario', '#f3f3f3'),
  bordaPrincipal: (design) => getColor(design, 'corBordaPrincipal', '#eeeeee'),
  bordaSecundaria: (design) => getColor(design, 'corBordaSecundaria', '#dddddd'),
  placeholder: (design) => getColor(design, 'corPlaceholder', '#999999'),
  confirmado: (design) => getColor(design, 'corConfirmado', '#2e7d32'),
  erro: (design) => getColor(design, 'corErro', '#b00020')
}

/**
 * Helpers de espaçamento mais comuns
 */
export const designSpacing = {
  pequeno: (design) => getSpacing(design, 'spacingPequeno', '8px'),
  medio: (design) => getSpacing(design, 'spacingMedio', '12px'),
  grande: (design) => getSpacing(design, 'spacingGrande', '16px'),
  xGrande: (design) => getSpacing(design, 'spacingXGrande', '24px')
}

/**
 * Helpers de border-radius mais comuns
 */
export const designRadius = {
  pequeno: (design) => getRadius(design, 'borderRadiusPequeno', '6px'),
  medio: (design) => getRadius(design, 'borderRadioMedio', '10px'),
  grande: (design) => getRadius(design, 'borderRadioGrande', '14px'),
  full: (design) => getRadius(design, 'borderRadioFull', '999px')
}

/**
 * Helpers de dimensões mais comuns
 */
export const designDimensions = {
  containerMaxWidth: (design) => getDimension(design, 'containerMaxWidth', '980px'),
  contentMaxWidth: (design) => getDimension(design, 'contentMaxWidth', '520px'),
  imagemAspectRatio: (design) => getDimension(design, 'imagemAspectRatio', '16/10')
}
