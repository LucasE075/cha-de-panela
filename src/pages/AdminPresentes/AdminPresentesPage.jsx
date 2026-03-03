import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listarPresentesAdmin,
  criarPresente,
  atualizarPresente,
  apagarPresente
} from '../../services/presentes.service'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'

const TIPOS = [
  { value: 'fisico', label: 'Físico' },
  { value: 'pix_fechado', label: 'PIX fechado (valor definido)' },
  { value: 'pix_livre', label: 'PIX livre (valor escolhido pelo convidado)' }
]

export default function AdminPresentesPage() {
  const navigate = useNavigate()
  const { config } = useConfiguracoes()

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [presentes, setPresentes] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos') // todos | fisico | pix_fechado | pix_livre

  const [form, setForm] = useState({
    id: null,
    nome: '',
    tipo: 'fisico',
    valor: '',
    descricao: '',
    cor: '#c59d5f',
    imagem_url: '',
    ativo: true
  })

  useEffect(() => {
    async function load() {
      try {
        const data = await listarPresentesAdmin()
        setPresentes(data)
      } catch (e) {
        console.error(e)
        alert('Erro ao carregar presentes.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const listaFiltrada = useMemo(() => {
    const q = busca.trim().toLowerCase()

    return presentes
      .filter(p => {
        if (filtroTipo === 'todos') return true
        return p.tipo === filtroTipo
      })
      .filter(p => {
        if (!q) return true
        const nome = String(p.nome || '').toLowerCase()
        const desc = String(p.descricao || '').toLowerCase()
        return nome.includes(q) || desc.includes(q)
      })
  }, [presentes, busca, filtroTipo])

  function editar(p) {
    setForm({
      id: p.id,
      nome: p.nome || '',
      tipo: p.tipo || 'fisico',
      valor: p.valor ?? '',
      descricao: p.descricao || '',
      cor: p.cor || '#c59d5f',
      imagem_url: p.imagem_url || '',
      ativo: p.ativo !== false
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function limparForm() {
    setForm({
      id: null,
      nome: '',
      tipo: 'fisico',
      valor: '',
      descricao: '',
      cor: '#c59d5f',
      imagem_url: '',
      ativo: true
    })
  }

  async function salvar(e) {
    e.preventDefault()
    if (!form.nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    // regra: valor só faz sentido no pix_fechado (você pode manter em físico se quiser)
    const valorNum =
      form.valor === '' ? null : Number(form.valor)

    if (form.tipo === 'pix_fechado' && (valorNum == null || Number.isNaN(valorNum))) {
      alert('Para PIX fechado, informe um valor válido.')
      return
    }

    const payload = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      valor: form.tipo === 'pix_fechado' ? valorNum : null,
      descricao: form.descricao.trim() || null,
      cor: form.cor || '#c59d5f',
      imagem_url: form.imagem_url.trim() || null,
      ativo: form.ativo
    }

    try {
      setSalvando(true)

      if (form.id) {
        const atualizado = await atualizarPresente(form.id, payload)
        setPresentes(prev =>
          prev.map(p => (p.id === atualizado.id ? atualizado : p))
        )
      } else {
        const criado = await criarPresente(payload)
        setPresentes(prev => [criado, ...prev])
      }

      limparForm()
      alert('Salvo ✅')
    } catch (e) {
      console.error(e)
      alert('Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function apagar(id) {
    if (!confirm('Deseja apagar este presente?')) return

    try {
      await apagarPresente(id)
      setPresentes(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      console.error(e)
      alert('Erro ao apagar. Talvez exista seleção vinculada a este presente.')
    }
  }

  if (loading) return null

  return (
    <div style={styles.container}>
      <div style={styles.topo}>
        <h1 style={{ fontFamily: 'var(--fonte-titulo)', color: config?.tema?.corPrimaria }}>
          Admin — Presentes 🎁
        </h1>

        <nav style={styles.nav}>
          <button onClick={() => navigate('/admin/convidados')} style={styles.navButton}>
            👥 Convidados
          </button>
          <button onClick={() => navigate('/admin/ui')} style={styles.navButton}>
            🎨 Customização
          </button>
        </nav>
      </div>

      <form onSubmit={salvar} style={styles.form}>
        <h3>{form.id ? 'Editar presente' : 'Novo presente'}</h3>

        <label style={styles.label}>
          Nome *
          <input
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
            style={styles.input}
            disabled={salvando}
          />
        </label>

        <label style={styles.label}>
          Tipo
          <select
            value={form.tipo}
            onChange={e => setForm({ ...form, tipo: e.target.value })}
            style={styles.input}
            disabled={salvando}
          >
            {TIPOS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Valor (somente PIX fechado)
          <input
            type="number"
            value={form.valor}
            onChange={e => setForm({ ...form, valor: e.target.value })}
            style={styles.input}
            disabled={salvando || form.tipo !== 'pix_fechado'}
            placeholder={form.tipo === 'pix_fechado' ? 'Ex: 150' : '—'}
          />
        </label>

        <label style={styles.label}>
          Descrição
          <textarea
            value={form.descricao}
            onChange={e => setForm({ ...form, descricao: e.target.value })}
            style={styles.textarea}
            disabled={salvando}
          />
        </label>

        <label style={styles.label}>
          Cor do item
          <input
            type="color"
            value={form.cor}
            onChange={e => setForm({ ...form, cor: e.target.value })}
            disabled={salvando}
            style={styles.color}
          />
        </label>

        <label style={styles.label}>
          URL da imagem (opcional)
          <input
            value={form.imagem_url}
            onChange={e => setForm({ ...form, imagem_url: e.target.value })}
            style={styles.input}
            disabled={salvando}
            placeholder="https://..."
          />
        </label>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={e => setForm({ ...form, ativo: e.target.checked })}
            disabled={salvando}
          />
          Ativo
        </label>

        <div style={styles.botoes}>
          <button
            type="submit"
            disabled={salvando}
            style={{
              ...styles.botaoPrincipal,
              backgroundColor: config?.tema?.corBotao || '#666',
              opacity: salvando ? 0.7 : 1,
              cursor: salvando ? 'not-allowed' : 'pointer'
            }}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>

          {form.id && (
            <button
              type="button"
              onClick={limparForm}
              disabled={salvando}
              style={styles.botaoSecundario}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div style={styles.filtros}>
        <input
          placeholder="Buscar por nome/descrição..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={styles.input}
        />

        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          style={styles.input}
        >
          <option value="todos">Todos os tipos</option>
          <option value="fisico">Físico</option>
          <option value="pix_fixo">PIX fechado</option>
          <option value="pix_livre">PIX livre</option>
        </select>
      </div>

      <ul style={styles.lista}>
        {listaFiltrada.map(p => (
          <li key={p.id} style={{ ...styles.item, opacity: p.ativo ? 1 : 0.5 }}>
            <div>
              <div style={styles.linha}>
                <span style={{ ...styles.bolinha, background: p.cor || '#ddd' }} />
                <strong>{p.nome}</strong>
              </div>

              <div style={styles.sub}>
                {p.tipo}
                {p.tipo === 'pix_fixo' && p.valor != null ? ` — R$ ${p.valor}` : ''}
              </div>

              {p.descricao && <div style={styles.sub}>{p.descricao}</div>}
            </div>

            <div style={styles.acoes}>
              <button onClick={() => editar(p)} style={styles.botaoMini}>Editar</button>
              <button onClick={() => apagar(p.id)} style={styles.botaoMiniPerigo}>Apagar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  topo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  nav: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  navButton: { padding: '10px 16px', borderRadius: 8, border: 'none', background: '#f0f0f0', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' },
  card: { border: '1px solid #eee', borderRadius: 12, padding: 16, marginTop: 12, background: '#fff' },
  hint: { marginTop: 6, fontSize: 13, opacity: 0.75 },
  inline: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: '1px solid #eee',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '16px'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '13px'
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd'
  },
  textarea: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    minHeight: '80px'
  },
  color: {
    width: '60px',
    height: '40px',
    padding: '0',
    border: 'none',
    background: 'transparent'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  botoes: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '6px'
  },
  botaoPrincipal: {
    border: 'none',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '6px'
  },
  botaoSecundario: {
    border: '1px solid #ccc',
    background: '#fff',
    padding: '10px 14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  filtros: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px'
  },
  lista: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  item: {
    border: '1px solid #eee',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start'
  },
  linha: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  bolinha: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    border: '1px solid #ddd'
  },
  sub: {
    marginTop: '4px',
    fontSize: '13px',
    opacity: 0.8
  },
  acoes: {
    display: 'flex',
    gap: '8px'
  },
  botaoMini: {
    border: '1px solid #ddd',
    background: '#fff',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  botaoMiniPerigo: {
    border: '1px solid #f3c1c1',
    background: '#fff',
    color: '#b00020',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer'
  }
}