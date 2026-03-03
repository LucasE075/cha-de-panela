// src/pages/AdminUI/AdminUIPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConfiguracoes, saveConfiguracoes } from '../../services/configuracoes.service'

const PAGES = [
  { key: 'identificacao', label: 'Identificação', images: ['headerImageUrl'] },
  { key: 'introducao', label: 'Introdução', images: [] },
  { key: 'presentes', label: 'Presentes', images: [] },
  { key: 'meusPresentes', label: 'Meus Presentes', images: [] },
  { key: 'confirmacao', label: 'Confirmação', images: [] },
  { key: 'agradecimento', label: 'Agradecimento', images: [] },
  { key: 'pix', label: 'PIX', images: ['qrCode'] }
]

const SCALE_OPTS = [
  { v: 'pequena', label: 'Pequena' },
  { v: 'normal', label: 'Normal' },
  { v: 'grande', label: 'Grande' }
]

const STYLE_OPTS = [
  { v: 'padrao', label: 'Padrão' },
  { v: 'destaque', label: 'Destaque' },
  { v: 'suave', label: 'Suave' },
  { v: 'caps', label: 'CAPS' }
]

export default function AdminUIPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [pageKey, setPageKey] = useState('identificacao')
  const [config, setConfig] = useState({})

  // Carregar config do Supabase
  useEffect(() => {
    async function load() {
      try {
        const cfg = await getConfiguracoes()
        setConfig(cfg || {})
      } catch (e) {
        console.error('Erro ao carregar config:', e)
        setConfig({})
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Refs para paginação
  const page = useMemo(() => {
    return (config.paginas?.[pageKey]) || {}
  }, [config, pageKey])

  // Setters para config global
  function setGlobal(patch) {
    setConfig(prev => ({
      ...(prev || {}),
      global: { ...(prev?.global || {}), ...patch }
    }))
  }

  function setGlobalTema(patch) {
    setConfig(prev => ({
      ...(prev || {}),
      global: {
        ...(prev?.global || {}),
        tema: { ...(prev?.global?.tema || {}), ...patch }
      }
    }))
  }

  // Setters para página
  function setPageData(patch) {
    setConfig(prev => ({
      ...(prev || {}),
      paginas: {
        ...(prev?.paginas || {}),
        [pageKey]: { ...(page || {}), ...patch }
      }
    }))
  }

  function setPageText(key, nextText) {
    const textos = page.textos || {}
    setPageData({ textos: { ...textos, [key]: nextText } })
  }

  function setPageImage(key, url) {
    const imagens = page.imagens || {}
    setPageData({ imagens: { ...imagens, [key]: url || null } })
  }

  // Salvar
  async function salvar() {
    try {
      setSalvando(true)
      await saveConfiguracoes(config)
      alert('✅ Configurações salvas com sucesso!')
    } catch (e) {
      console.error('Erro ao salvar:', e)
      alert('❌ Erro ao salvar configurações.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <p>Carregando...</p>

  const currentPage = PAGES.find(p => p.key === pageKey)

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>⚙️ Configurações do Site</h1>
        <div style={styles.headerButtons}>
          <button
            onClick={() => navigate('/admin/convidados')}
            style={styles.navButton}
          >
            👥 Convidados
          </button>
          <button
            onClick={() => navigate('/admin/presentes')}
            style={styles.navButton}
          >
            🎁 Presentes
          </button>
        </div>
      </header>

      {/* ===== GLOBAL SETTINGS ===== */}
      <section style={styles.section}>
        <h2>🌍 Configurações Globais (Todas as páginas)</h2>

        {/* Background */}
        <div style={styles.card}>
          <h3>Background</h3>
          <div style={styles.formGroup}>
            <label>
              Cor de fundo:
              <input
                type="color"
                value={config.global?.backgroundColor || '#ffffff'}
                onChange={e => setGlobal({ backgroundColor: e.target.value })}
              />
            </label>

            <label>
              Imagem (URL):
              <input
                type="text"
                placeholder="https://exemplo.com/imagem.jpg"
                value={config.global?.backgroundImage || ''}
                onChange={e => setGlobal({ backgroundImage: e.target.value })}
              />
            </label>
          </div>
        </div>

        {/* Cores dos Botões */}
        <div style={styles.card}>
          <h3>Cores dos Botões</h3>
          <div style={styles.formGroup}>
            <label>
              Botão Primário (Cor 1):
              <input
                type="color"
                value={config.global?.tema?.corPrimaria || '#c59d5f'}
                onChange={e => setGlobalTema({ corPrimaria: e.target.value })}
              />
            </label>

            <label>
              Botão Secundário (Cor 2):
              <input
                type="color"
                value={config.global?.tema?.corBotao || '#c59d5f'}
                onChange={e => setGlobalTema({ corBotao: e.target.value })}
              />
            </label>
          </div>
        </div>

        {/* Fontes Globais */}
        <div style={styles.card}>
          <h3>Fontes</h3>
          <div style={styles.formGroup}>
            <label>
              Fonte dos títulos:
              <input
                type="text"
                placeholder="ex: Poppins"
                value={config.global?.tema?.fonteTitulo || 'Poppins'}
                onChange={e => setGlobalTema({ fonteTitulo: e.target.value })}
              />
            </label>

            <label>
              Fonte do texto:
              <input
                type="text"
                placeholder="ex: Inter"
                value={config.global?.tema?.fonteTexto || 'Inter'}
                onChange={e => setGlobalTema({ fonteTexto: e.target.value })}
              />
            </label>
          </div>
        </div>
      </section>

      {/* ===== PAGE SELECTOR ===== */}
      <section style={styles.section}>
        <h2>📄 Editar Página</h2>
        <div style={styles.pageSelector}>
          {PAGES.map(p => (
            <button
              key={p.key}
              onClick={() => setPageKey(p.key)}
              style={{
                ...styles.pageButton,
                ...(pageKey === p.key ? styles.pageButtonActive : {})
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== PAGE CONTENT ===== */}
      {currentPage && (
        <section style={styles.section}>
          <h2>Editar: {currentPage.label}</h2>

          {/* Textos da página */}
          <div style={styles.card}>
            <h3>Textos</h3>
            {Object.entries(page.textos || {}).length === 0 ? (
              <p style={styles.hint}>Nenhum texto cadastrado nesta página.</p>
            ) : (
              <div style={styles.textsList}>
                {Object.entries(page.textos || {}).map(([key, value]) => (
                  <TextEditor
                    key={key}
                    label={key}
                    value={value}
                    onChange={nextValue => setPageText(key, nextValue)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Imagens da página */}
          {currentPage.images?.length > 0 && (
            <div style={styles.card}>
              <h3>Imagens</h3>
              <div style={styles.formGroup}>
                {currentPage.images.map(imageKey => (
                  <label key={imageKey}>
                    {imageKey === 'headerImageUrl'
                      ? 'Foto de cabeçalho (1:1)'
                      : imageKey === 'qrCode'
                      ? 'QR Code PIX'
                      : imageKey}
                    <input
                      type="text"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={page.imagens?.[imageKey] || ''}
                      onChange={e => setPageImage(imageKey, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== SAVE BUTTON ===== */}
      <div style={styles.footer}>
        <button
          onClick={salvar}
          disabled={salvando}
          style={{
            ...styles.saveButton,
            opacity: salvando ? 0.7 : 1,
            cursor: salvando ? 'not-allowed' : 'pointer'
          }}
        >
          {salvando ? '💾 Salvando...' : '💾 Salvar Todas as Mudanças'}
        </button>
      </div>
    </div>
  )
}

function normalizeStyledText(v) {
  if (!v) return { value: '', scale: 'normal', color: '#333333', style: 'padrao' }
  if (typeof v === 'string') return { value: v, scale: 'normal', color: '#333333', style: 'padrao' }
  return {
    value: v.value ?? '',
    scale: v.scale ?? 'normal',
    color: v.color ?? '#333333',
    style: v.style ?? 'padrao'
  }
}

function TextEditor({ label, value, onChange }) {
  const normalized = normalizeStyledText(value)
  return (
    <div style={styles.textRow}>
      <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 500 }}>{label}</div>

      <input
        value={normalized.value}
        onChange={e => onChange({ ...normalized, value: e.target.value })}
        placeholder="Texto..."
        style={styles.textInput}
      />

      <div style={styles.grid4}>
        <label style={styles.selectLabel}>
          Escala
          <select
            value={normalized.scale}
            onChange={e => onChange({ ...normalized, scale: e.target.value })}
          >
            {SCALE_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </label>

        <label style={styles.selectLabel}>
          Estilo
          <select
            value={normalized.style}
            onChange={e => onChange({ ...normalized, style: e.target.value })}
          >
            {STYLE_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </label>

        <label style={styles.selectLabel}>
          Cor
          <input
            type="color"
            value={normalized.color}
            onChange={e => onChange({ ...normalized, color: e.target.value })}
            style={{ cursor: 'pointer' }}
          />
        </label>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    marginBottom: '32px',
    borderBottom: '2px solid #eee',
    paddingBottom: '16px'
  },
  headerButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  navButton: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#f0f0f0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  section: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #eee'
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '12px',
    background: '#fafafa'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px'
  },
  pageSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '8px',
    marginTop: '12px'
  },
  pageButton: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  pageButtonActive: {
    background: '#4CAF50',
    color: '#fff',
    border: '2px solid #4CAF50'
  },
  textsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px'
  },
  textRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff'
  },
  textInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  selectLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  grid4: {
    display: 'grid',
    gap: '8px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'
  },
  footer: {
    paddingTop: '24px',
    marginTop: '24px',
    borderTop: '2px solid #eee',
    display: 'flex',
    justifyContent: 'center'
  },
  saveButton: {
    padding: '14px 32px',
    borderRadius: '8px',
    border: 'none',
    background: '#4CAF50',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  hint: {
    marginTop: '8px',
    fontSize: '13px',
    opacity: 0.7,
    fontStyle: 'italic'
  }
}
