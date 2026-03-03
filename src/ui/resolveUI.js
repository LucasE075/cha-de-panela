// src/ui/resolveUI.js

// Resolve a UI final (tema + textos + imagens + sessoes) usando:
// 1) config.global (defaults globais)
// 2) config.paginas[pageKey] (overrides por página)
// 3) fallbacks seguros (pra nunca quebrar layout)
//
// ✅ Correções importantes:
// - NÃO sobrescreve cores vindas do admin
// - Fallback de cor passa a respeitar o tema (tema.corTexto) quando existir
// - Sessões da Introdução: se tiver bg, default é branco APENAS quando admin não setou cor

const DEFAULT_TEMA = {
  corPrimaria: '#c59d5f',
  corBotao: '#c59d5f',
  corSecundaria: '#ffffff',
  corTexto: '#333333',
  corBorda: '#e9e9e9',
  corFundo: '#ffffff',
  fonteTitulo: 'Poppins',
  fonteTexto: 'Inter'
}
const DEFAULT_DESIGN = {
  // Cores de UI (não relacionadas a texto/botão primário)
  corFundoPrincipal: '#ffffff',
  corFundoSecundario: '#f3f3f3',
  corBordaPrincipal: '#eeeeee',
  corBordaSecundaria: '#dddddd',
  corPlaceholder: '#999999',
  corConfirmado: '#2e7d32',
  corErro: '#b00020',
  
  // Espaçamentos (em px ou rem)
  spacingPequeno: '8px',
  spacingMedio: '12px',
  spacingGrande: '16px',
  spacingXGrande: '24px',
  
  // Dimensões de layout
  containerMaxWidth: '980px',
  contentMaxWidth: '520px',
  
  // Border radius
  borderRadiusPequeno: '6px',
  borderRadioMedio: '10px',
  borderRadioGrande: '14px',
  borderRadioFull: '999px',
  
  // Imagens e media
  imagemBackgroundFallback: '#f3f3f3',
  imagemAspectRatio: '16/10',
  
  // Overlays
  overlayOpacityPadrao: '0.45',
  overlayOpacityMax: '0.75'
}
const DEFAULT_STYLED_TEXT = {
  value: '',
  scale: 'normal', // pequena | normal | grande
  color: null, // 👈 null para não “travar” uma cor default e permitir o componente decidir
  style: 'padrao' // padrao | destaque | suave | caps
}

export function resolveUI(config, pageKey, context = {}) {
  const cfg = config || {}
  const global = cfg.global || {}
  const paginas = cfg.paginas || {}

  const page = paginas[pageKey] || {}

  // tema final = defaults + global + page
  const temaGlobal = mergeTema(DEFAULT_TEMA, global.tema)
  const temaPage = mergeTema({}, page.tema)
  const tema = { ...temaGlobal, ...temaPage }

  // design final = defaults + global + page
  const designGlobal = mergeDesign(DEFAULT_DESIGN, global.design)
  const designPage = mergeDesign({}, page.design)
  const design = { ...designGlobal, ...designPage }

  // textos e imagens: por página
  // (se você quiser permitir "texto global", dá pra adicionar depois)
  const textos = normalizeTextMap(page.textos || {}, tema)
  const imagens = normalizeImageMap(page.imagens || {})

  // específicos por página (ex: introducao.sessoes)
  const extra = normalizeExtras(pageKey, page, tema, design)

  return {
    tema,
    design,
    textos,
    imagens,
    pageKey,
    rawPage: page,
    ...extra
  }
}

/* ---------------- helpers ---------------- */

function mergeTema(base, patch) {
  if (!patch || typeof patch !== 'object') return { ...(base || {}) }
  return { ...(base || {}), ...(patch || {}) }
}

function mergeDesign(base, patch) {
  if (!patch || typeof patch !== 'object') return { ...(base || {}) }
  return { ...(base || {}), ...(patch || {}) }
}

function normalizeTextMap(map, tema) {
  const out = {}
  if (!map || typeof map !== 'object') return out

  for (const [k, v] of Object.entries(map)) {
    out[k] = normalizeStyledText(v, tema)
  }
  return out
}

function normalizeImageMap(map) {
  const out = {}
  if (!map || typeof map !== 'object') return out

  for (const [k, v] of Object.entries(map)) {
    out[k] = typeof v === 'string' && v.trim() ? v.trim() : null
  }
  return out
}

function normalizeStyledText(v, tema) {
  // retrocompat: string simples
  if (typeof v === 'string') {
    return {
      ...DEFAULT_STYLED_TEXT,
      value: v
      // color fica null (decidido no componente)
    }
  }

  if (!v || typeof v !== 'object') {
    return { ...DEFAULT_STYLED_TEXT }
  }

  const scale = normalizeScale(v.scale)
  const style = normalizeStyle(v.style)
  const color = normalizeColor(v.color, tema)

  return {
    value: String(v.value ?? ''),
    scale,
    style,
    color // pode ser null se não veio nada (componente decide)
  }
}

function normalizeScale(s) {
  if (s === 'pequena' || s === 'normal' || s === 'grande') return s
  return 'normal'
}

function normalizeStyle(s) {
  if (s === 'padrao' || s === 'destaque' || s === 'suave' || s === 'caps') return s
  return 'padrao'
}

/**
 * ✅ Aqui está a correção principal:
 * - se não vier cor do admin -> retorna null (não força '#333' aqui)
 * - se vier cor inválida/vazia -> null
 * - (o componente usa: styledText.color || tema.corTexto || '#333')
 */
function normalizeColor(c, tema) {
  if (typeof c !== 'string') return null
  const t = c.trim()
  if (!t) return null
  return t
}

/* --------- page-specific normalization --------- */

function normalizeExtras(pageKey, page, tema, design) {
  if (pageKey !== 'introducao') return {}

  // 3 sessões fixas
  const sessoesRaw = Array.isArray(page.sessoes) ? page.sessoes : []

  const sessoes = [0, 1, 2].map(i => {
    const s = (sessoesRaw[i] && typeof sessoesRaw[i] === 'object') ? sessoesRaw[i] : {}

    const ativo = typeof s.ativo === 'boolean' ? s.ativo : i === 0
    const bgImageUrl =
      typeof s.bgImageUrl === 'string' && s.bgImageUrl.trim()
        ? s.bgImageUrl.trim()
        : null

    let overlay = Number(s.overlay)
    const defaultOverlay = Number(design?.overlayOpacityPadrao || 0.45)
    const maxOverlay = Number(design?.overlayOpacityMax || 0.75)
    
    if (!Number.isFinite(overlay)) overlay = bgImageUrl ? defaultOverlay : 0
    overlay = clamp(overlay, 0, maxOverlay)

    const titulo = normalizeStyledText(s.titulo, tema)
    const texto = normalizeStyledText(s.texto, tema)

    // ✅ NÃO SOBRESCREVE cor do admin
    // default (somente quando não veio cor):
    // - se tem bg => branco
    // - senão => tema.corTexto
    const defaultNoBg = tema?.corTexto || '#333333'
    const defaultOnBg = '#ffffff'

    const tituloFinal = {
      ...titulo,
      color: titulo.color ?? (bgImageUrl ? defaultOnBg : defaultNoBg)
    }

    const textoFinal = {
      ...texto,
      color: texto.color ?? (bgImageUrl ? defaultOnBg : defaultNoBg)
    }

    return {
      ativo,
      bgImageUrl,
      overlay,
      titulo: tituloFinal,
      texto: textoFinal
    }
  })

  return { sessoes }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/* --------- utilitários para componentes --------- */

// Para render: pegar string do StyledText
export function textValue(styledText, fallback = '') {
  if (!styledText) return fallback
  if (typeof styledText === 'string') return styledText
  const v = styledText.value
  return typeof v === 'string' && v.trim() !== '' ? v : fallback
}

// Para mapear para classes CSS
export function scaleClass(styledText) {
  const s = typeof styledText === 'object' ? styledText.scale : null
  if (s === 'pequena') return 'scale-pequena'
  if (s === 'grande') return 'scale-grande'
  return 'scale-normal'
}

export function styleClass(styledText) {
  const s = typeof styledText === 'object' ? styledText.style : null
  if (s === 'destaque') return 'st-destaque'
  if (s === 'suave') return 'st-suave'
  if (s === 'caps') return 'st-caps'
  return 'st-padrao'
}