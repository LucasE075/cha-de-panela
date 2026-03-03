    // src/pages/Admin/AdminUIPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConfiguracoes, saveConfiguracoes } from '../../services/configuracoes.service'

const PAGES = [
  { key: 'identificacao', label: 'Identificação' },
  { key: 'introducao', label: 'Introdução' },
  { key: 'confirmacao', label: 'Confirmação' },
  { key: 'presentes', label: 'Presentes' },
  { key: 'meusPresentes', label: 'Meus Presentes' },
  { key: 'agradecimento', label: 'Agradecimento' }
]

const SCALE_OPTS = [
  { v: 'pequena', t: 'Pequena' },
  { v: 'normal', t: 'Normal' },
  { v: 'grande', t: 'Grande' }
]

const STYLE_OPTS = [
  { v: 'padrao', t: 'Padrão' },
  { v: 'destaque', t: 'Destaque' },
  { v: 'suave', t: 'Suave' },
  { v: 'caps', t: 'CAPS' }
]

export default function AdminUIPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [pageKey, setPageKey] = useState('identificacao')
  const [config, setConfig] = useState({})

  useEffect(() => {
    async function load() {
      try {
        const cfg = await getConfiguracoes()
        setConfig(cfg || {})
      } catch (e) {
        console.error(e)
        setConfig({})
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const page = useMemo(() => {
    const paginas = config?.paginas || {}
    return paginas[pageKey] || {}
  }, [config, pageKey])

  function setPage(nextPage) {
    setConfig(prev => ({
      ...(prev || {}),
      paginas: {
        ...((prev || {}).paginas || {}),
        [pageKey]: nextPage
      }
    }))
  }

  function setText(key, nextStyledText) {
    const textos = page.textos || {}
    setPage({ ...page, textos: { ...textos, [key]: nextStyledText } })
  }

  function setTema(nextTemaPatch) {
    const tema = page.tema || {}
    setPage({ ...page, tema: { ...tema, ...nextTemaPatch } })
  }

  function setImagem(key, url) {
    const imagens = page.imagens || {}
    setPage({ ...page, imagens: { ...imagens, [key]: url || null } })
  }

  function setGlobalDesign(nextDesignPatch) {
    const global = config.global || {}
    const design = global.design || {}
    setConfig(prev => ({
      ...(prev || {}),
      global: { ...global, design: { ...design, ...nextDesignPatch } }
    }))
  }

  function setGlobalTema(nextTemaPatch) {
    const global = config.global || {}
    const tema = global.tema || {}
    setConfig(prev => ({
      ...(prev || {}),
      global: { ...global, tema: { ...tema, ...nextTemaPatch } }
    }))
  }

  async function salvar() {
    try {
      setSalvando(true)
      await saveConfiguracoes(config)
      alert('Configurações salvas ✅')
    } catch (e) {
      console.error(e)
      alert('Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return null

  return (
    <div style={styles.container}>
      <h1 style={{ fontFamily: 'var(--fonte-titulo)' }}>Admin — Customização UI 🎨</h1>

      <div style={styles.navButtons}>
        <button onClick={() => navigate('/admin/convidados')} style={styles.navButton}>
          👥 Gerenciar Convidados
        </button>
        <button onClick={() => navigate('/admin/presentes')} style={styles.navButton}>
          🎁 Gerenciar Presentes
        </button>
      </div>

      <div style={styles.row}>
        <label>
          Página:
          <select value={pageKey} onChange={e => setPageKey(e.target.value)}>
            {PAGES.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </label>

        <button onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div style={styles.card}>
        <h3>Tema Global (todas as páginas)</h3>

        <label style={styles.inline}>
          Cor primária:
          <input
            type="color"
            value={(config.global?.tema?.corPrimaria) || '#c59d5f'}
            onChange={e => setGlobalTema({ corPrimaria: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Cor do botão:
          <input
            type="color"
            value={(config.global?.tema?.corBotao) || '#c59d5f'}
            onChange={e => setGlobalTema({ corBotao: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Fonte título:
          <input
            type="text"
            value={(config.global?.tema?.fonteTitulo) || 'Poppins'}
            onChange={e => setGlobalTema({ fonteTitulo: e.target.value })}
            placeholder="ex: Poppins"
          />
        </label>

        <label style={styles.inline}>
          Fonte texto:
          <input
            type="text"
            value={(config.global?.tema?.fonteTexto) || 'Inter'}
            onChange={e => setGlobalTema({ fonteTexto: e.target.value })}
            placeholder="ex: Inter"
          />
        </label>
      </div>

      <div style={styles.card}>
        <h3>Design Global — Cores</h3>
        
        <label style={styles.inline}>
          Fundo principal:
          <input
            type="color"
            value={(config.global?.design?.corFundoPrincipal) || '#ffffff'}
            onChange={e => setGlobalDesign({ corFundoPrincipal: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Fundo secundário:
          <input
            type="color"
            value={(config.global?.design?.corFundoSecundario) || '#f3f3f3'}
            onChange={e => setGlobalDesign({ corFundoSecundario: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Borda principal:
          <input
            type="color"
            value={(config.global?.design?.corBordaPrincipal) || '#eeeeee'}
            onChange={e => setGlobalDesign({ corBordaPrincipal: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Borda secundária:
          <input
            type="color"
            value={(config.global?.design?.corBordaSecundaria) || '#dddddd'}
            onChange={e => setGlobalDesign({ corBordaSecundaria: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Placeholder:
          <input
            type="color"
            value={(config.global?.design?.corPlaceholder) || '#999999'}
            onChange={e => setGlobalDesign({ corPlaceholder: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Confirmado (sucesso):
          <input
            type="color"
            value={(config.global?.design?.corConfirmado) || '#2e7d32'}
            onChange={e => setGlobalDesign({ corConfirmado: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Erro:
          <input
            type="color"
            value={(config.global?.design?.corErro) || '#b00020'}
            onChange={e => setGlobalDesign({ corErro: e.target.value })}
          />
        </label>
      </div>

      <div style={styles.card}>
        <h3>Design Global — Espaçamentos</h3>

        <label style={styles.inline}>
          Pequeno:
          <input
            type="text"
            value={(config.global?.design?.spacingPequeno) || '8px'}
            onChange={e => setGlobalDesign({ spacingPequeno: e.target.value })}
            placeholder="8px"
          />
        </label>

        <label style={styles.inline}>
          Médio:
          <input
            type="text"
            value={(config.global?.design?.spacingMedio) || '12px'}
            onChange={e => setGlobalDesign({ spacingMedio: e.target.value })}
            placeholder="12px"
          />
        </label>

        <label style={styles.inline}>
          Grande:
          <input
            type="text"
            value={(config.global?.design?.spacingGrande) || '16px'}
            onChange={e => setGlobalDesign({ spacingGrande: e.target.value })}
            placeholder="16px"
          />
        </label>

        <label style={styles.inline}>
          Muito grande:
          <input
            type="text"
            value={(config.global?.design?.spacingXGrande) || '24px'}
            onChange={e => setGlobalDesign({ spacingXGrande: e.target.value })}
            placeholder="24px"
          />
        </label>
      </div>

      <div style={styles.card}>
        <h3>Design Global — Border Radius</h3>

        <label style={styles.inline}>
          Pequeno:
          <input
            type="text"
            value={(config.global?.design?.borderRadiusPequeno) || '6px'}
            onChange={e => setGlobalDesign({ borderRadiusPequeno: e.target.value })}
            placeholder="6px"
          />
        </label>

        <label style={styles.inline}>
          Médio:
          <input
            type="text"
            value={(config.global?.design?.borderRadioMedio) || '10px'}
            onChange={e => setGlobalDesign({ borderRadioMedio: e.target.value })}
            placeholder="10px"
          />
        </label>

        <label style={styles.inline}>
          Grande:
          <input
            type="text"
            value={(config.global?.design?.borderRadioGrande) || '14px'}
            onChange={e => setGlobalDesign({ borderRadioGrande: e.target.value })}
            placeholder="14px"
          />
        </label>

        <label style={styles.inline}>
          Full:
          <input
            type="text"
            value={(config.global?.design?.borderRadioFull) || '999px'}
            onChange={e => setGlobalDesign({ borderRadioFull: e.target.value })}
            placeholder="999px"
          />
        </label>
      </div>

      <div style={styles.card}>
        <h3>Design Global — Dimensões</h3>

        <label style={styles.inline}>
          Largura máx. container:
          <input
            type="text"
            value={(config.global?.design?.containerMaxWidth) || '980px'}
            onChange={e => setGlobalDesign({ containerMaxWidth: e.target.value })}
            placeholder="980px"
          />
        </label>

        <label style={styles.inline}>
          Largura máx. conteúdo:
          <input
            type="text"
            value={(config.global?.design?.contentMaxWidth) || '520px'}
            onChange={e => setGlobalDesign({ contentMaxWidth: e.target.value })}
            placeholder="520px"
          />
        </label>

        <label style={styles.inline}>
          Aspect ratio imagens:
          <input
            type="text"
            value={(config.global?.design?.imagemAspectRatio) || '16/10'}
            onChange={e => setGlobalDesign({ imagemAspectRatio: e.target.value })}
            placeholder="16/10"
          />
        </label>

        <label style={styles.inline}>
          Fundo fallback imagens:
          <input
            type="color"
            value={(config.global?.design?.imagemBackgroundFallback) || '#f3f3f3'}
            onChange={e => setGlobalDesign({ imagemBackgroundFallback: e.target.value })}
          />
        </label>
      </div>

      <div style={styles.card}>
        <h3>Design Global — Overlays</h3>

        <label style={styles.inline}>
          Opacity padrão:
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={Number(config.global?.design?.overlayOpacityPadrao) || 0.45}
            onChange={e => setGlobalDesign({ overlayOpacityPadrao: Number(e.target.value) })}
          />
        </label>

        <label style={styles.inline}>
          Opacity máxima:
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={Number(config.global?.design?.overlayOpacityMax) || 0.75}
            onChange={e => setGlobalDesign({ overlayOpacityMax: Number(e.target.value) })}
          />
        </label>
      </div>

      <h2 style={{ marginTop: 32, marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #eee' }}>
        📄 Edição por Página — {PAGES.find(p => p.key === pageKey)?.label}
      </h2>

      <div style={styles.card}>
        <h3>Tema (opcional, sobrescreve o global)</h3>
        <p style={styles.hint}>Deixe vazio para usar o tema global.</p>

        <label style={styles.inline}>
          Cor primária:
          <input
            type="color"
            value={(page.tema?.corPrimaria) || '#c59d5f'}
            onChange={e => setTema({ corPrimaria: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Cor do botão:
          <input
            type="color"
            value={(page.tema?.corBotao) || '#c59d5f'}
            onChange={e => setTema({ corBotao: e.target.value })}
          />
        </label>

        <label style={styles.inline}>
          Fonte título:
          <input
            type="text"
            value={(page.tema?.fonteTitulo) || ''}
            onChange={e => setTema({ fonteTitulo: e.target.value })}
            placeholder="ex: Poppins"
          />
        </label>

        <label style={styles.inline}>
          Fonte texto:
          <input
            type="text"
            value={(page.tema?.fonteTexto) || ''}
            onChange={e => setTema({ fonteTexto: e.target.value })}
            placeholder="ex: Inter"
          />
        </label>
      </div>

      {/* Slots de imagem conhecidos */}
      {pageKey === 'identificacao' && (
        <div style={styles.card}>
          <h3>Imagem (Identificação)</h3>
          <label>
            Header (1:1):
            <input
              placeholder="https://..."
              value={page.imagens?.headerImageUrl || ''}
              onChange={e => setImagem('headerImageUrl', e.target.value)}
            />
          </label>
        </div>
      )}

      {/* Textos - editor dinâmico */}
      <div style={styles.card}>
        <h3>Textos</h3>
        <p style={styles.hint}>
          Cada texto tem: conteúdo + escala (3 níveis) + cor + estilo.
        </p>

        {Object.entries(page.textos || {}).length === 0 && (
          <p style={styles.hint}>
            Ainda não há textos cadastrados para esta página.
            (O site usa fallback. Depois a gente “seed” com defaults.)
          </p>
        )}

        {(Object.entries(page.textos || {})).map(([k, v]) => (
          <TextEditor
            key={k}
            label={k}
            value={normalizeStyledText(v)}
            onChange={next => setText(k, next)}
          />
        ))}

        <AddTextKey
          onAdd={(newKey) => {
            if (!newKey) return
            setText(newKey, normalizeStyledText({ value: '' }))
          }}
        />
      </div>

      {/* Introdução: 3 sessões fixas */}
      {pageKey === 'introducao' && (
        <IntroducaoSessoesEditor
          page={page}
          setPage={setPage}
        />
      )}
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
  return (
    <div style={styles.textRow}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>

      <input
        value={value.value}
        onChange={e => onChange({ ...value, value: e.target.value })}
        placeholder="Texto..."
      />

      <div style={styles.grid4}>
        <label>
          Escala
          <select
            value={value.scale}
            onChange={e => onChange({ ...value, scale: e.target.value })}
          >
            {SCALE_OPTS.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
          </select>
        </label>

        <label>
          Estilo
          <select
            value={value.style}
            onChange={e => onChange({ ...value, style: e.target.value })}
          >
            {STYLE_OPTS.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
          </select>
        </label>

        <label>
          Cor
          <input
            type="color"
            value={value.color}
            onChange={e => onChange({ ...value, color: e.target.value })}
          />
        </label>

        <button
          type="button"
          onClick={() => onChange({ ...value, scale: 'normal', style: 'padrao' })}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function AddTextKey({ onAdd }) {
  const [k, setK] = useState('')
  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
      <input
        value={k}
        onChange={e => setK(e.target.value)}
        placeholder="novoKey (ex: titulo)"
      />
      <button
        type="button"
        onClick={() => { onAdd(k.trim()); setK('') }}
      >
        + Adicionar
      </button>
    </div>
  )
}

function IntroducaoSessoesEditor({ page, setPage }) {
  const sessoes = Array.isArray(page.sessoes) ? page.sessoes : [
    { ativo: true, bgImageUrl: null, overlay: 0.45, titulo: { value:'', scale:'normal', color:'#fff', style:'destaque' }, texto: { value:'', scale:'normal', color:'#fff', style:'padrao' } },
    { ativo: false },
    { ativo: false }
  ]

  function setSessao(i, patch) {
    const next = sessoes.map((s, idx) => idx === i ? { ...(s || {}), ...patch } : s)
    setPage({ ...page, sessoes: next })
  }

  return (
    <div style={styles.card}>
      <h3>Introdução — 3 sessões (fixas)</h3>
      <p style={styles.hint}>Cada sessão pode ter background opcional (url) + overlay (0 a 0.75).</p>

      {[0,1,2].map(i => {
        const s = sessoes[i] || { ativo: false }
        return (
          <div key={i} style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 12 }}>
            <h4 style={{ margin: 0 }}>Sessão {i+1}</h4>

            <label style={styles.inline}>
              Ativa:
              <input
                type="checkbox"
                checked={!!s.ativo}
                onChange={e => setSessao(i, { ativo: e.target.checked })}
              />
            </label>

            <label>
              Background URL (opcional)
              <input
                value={s.bgImageUrl || ''}
                onChange={e => setSessao(i, { bgImageUrl: e.target.value || null })}
                placeholder="https://..."
              />
            </label>

            <label>
              Overlay (0 a 0.75)
              <input
                type="number"
                step="0.05"
                min="0"
                max="0.75"
                value={typeof s.overlay === 'number' ? s.overlay : 0.45}
                onChange={e => setSessao(i, { overlay: Number(e.target.value) })}
              />
            </label>

            <TextEditor
              label={`sessao${i+1}.titulo`}
              value={normalizeStyledText(s.titulo)}
              onChange={next => setSessao(i, { titulo: next })}
            />

            <TextEditor
              label={`sessao${i+1}.texto`}
              value={normalizeStyledText(s.texto)}
              onChange={next => setSessao(i, { texto: next })}
            />
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  container: { padding: 24, maxWidth: 900, margin: '0 auto' },
  navButtons: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  navButton: { padding: '10px 16px', borderRadius: 8, border: 'none', background: '#f0f0f0', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s', flex: 1, minWidth: 200 },
  row: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 },
  card: { border: '1px solid #eee', borderRadius: 12, padding: 16, marginTop: 12, background: '#fff' },
  hint: { marginTop: 6, fontSize: 13, opacity: 0.75 },
  inline: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 },
  textRow: { display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '1px solid #eee', borderRadius: 10, marginTop: 10 },
  grid4: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }
}