import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarConvidadosComPresentes } from '../../services/convidados.service'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'

export default function AdminConvidadosPage() {
  const navigate = useNavigate()
  const { config } = useConfiguracoes()

  const [loading, setLoading] = useState(true)
  const [convidados, setConvidados] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarConvidadosComPresentes()
        setConvidados(data)
      } catch (e) {
        console.error(e)
        alert('Erro ao carregar convidados.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [])

  const listaFiltrada = useMemo(() => {
    const q = busca.trim().toLowerCase()

    return convidados
      .filter(c => {
        // filtro presença
        if (filtro === 'sim') return c.confirmou_presenca === true
        if (filtro === 'nao') return c.confirmou_presenca === false
        if (filtro === 'pendente') return c.confirmou_presenca == null
        return true
      })
      .filter(c => {
        if (!q) return true
        const nome = `${c.nome || ''} ${c.sobrenome || ''}`.toLowerCase()
        const cel = String(c.celular || '').toLowerCase()
        return nome.includes(q) || cel.includes(q)
      })
  }, [convidados, filtro, busca])

  if (loading) return null

  return (
    <div style={styles.container}>
      <div style={styles.topo}>
        <h1 style={{ fontFamily: 'var(--fonte-titulo)', color: config?.tema?.corPrimaria }}>
          Admin — Convidados 👥
        </h1>

        <nav style={styles.nav}>

          <button onClick={() => navigate('/admin/presentes')} style={styles.navButton}>
            🎁 Presentes
          </button>
          <button onClick={() => navigate('/admin/ui')} style={styles.navButton}>
            🎨 Customização
          </button>
        </nav>
      </div>

      <div style={styles.filtros}>
        <input
          placeholder="Buscar por nome ou celular..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={styles.input}
        />

        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={styles.select}>
          <option value="todos">Todos</option>
          <option value="sim">Confirmou presença</option>
          <option value="nao">Não vai</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      <div style={styles.resumo}>
        <Resumo label="Total" value={convidados.length} />
        <Resumo label="Confirmou" value={convidados.filter(c => c.confirmou_presenca === true).length} />
        <Resumo label="Não vai" value={convidados.filter(c => c.confirmou_presenca === false).length} />
        <Resumo label="Pendente" value={convidados.filter(c => c.confirmou_presenca == null).length} />
      </div>

      <ul style={styles.lista}>
        {listaFiltrada.map(c => {
          const nomeCompleto = `${c.nome || ''} ${c.sobrenome || ''}`.trim()
          const presencaLabel =
            c.confirmou_presenca === true
              ? '✅ Vai'
              : c.confirmou_presenca === false
              ? '❌ Não vai'
              : '⏳ Pendente'

          const confirmados = (c.selecoes || []).filter(s => s.status === 'confirmado')
          const selecionados = (c.selecoes || []).filter(s => s.status === 'selecionado')

          return (
            <li key={c.id} style={styles.item}>
              <div style={styles.linha1}>
                <div>
                  <strong>{nomeCompleto || '—'}</strong>
                  <div style={styles.sub}>
                    {c.celular || '—'}
                  </div>
                </div>

                <span style={styles.badge}>{presencaLabel}</span>
              </div>

              <div style={styles.bloco}>
                <div style={styles.blocoTitulo}>Presentes</div>

                {confirmados.length === 0 && selecionados.length === 0 ? (
                  <div style={styles.sub}>Nenhum presente</div>
                ) : (
                  <div style={styles.presentes}>
                    {confirmados.map(s => (
                      <TagPresente key={s.id} status="confirmado" selecao={s} />
                    ))}
                    {selecionados.map(s => (
                      <TagPresente key={s.id} status="selecionado" selecao={s} />
                    ))}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Resumo({ label, value }) {
  return (
    <div style={styles.resumoItem}>
      <div style={styles.resumoLabel}>{label}</div>
      <div style={styles.resumoValor}>{value}</div>
    </div>
  )
}

function TagPresente({ selecao, status }) {
  const nome = selecao?.presente?.nome || 'Presente'
  const tipo = selecao?.presente?.tipo
  const valorFinal = selecao?.valor_final

  const sufixo =
    tipo === 'pix_livre'
      ? '(pix livre)'
      : tipo === 'pix_fechado'
      ? '(pix)'
      : '(físico)'

  const statusTxt = status === 'confirmado' ? '✅' : '🕒'

  return (
    <span style={styles.tag}>
      {statusTxt} {nome} {sufixo}
      {valorFinal != null ? ` — R$ ${valorFinal}` : ''}
    </span>
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
  botaoPrincipal: { border: 'none', color: '#fff', padding: '10px 14px', borderRadius: '6px' },
  filtros: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px',
    marginTop: '12px'
  },
  input: {
    flex: 1,
    minWidth: '220px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd'
  },
  select: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd'
  },
  resumo: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  resumoItem: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '10px 12px',
    minWidth: '120px'
  },
  resumoLabel: {
    fontSize: '12px',
    opacity: 0.8
  },
  resumoValor: {
    fontSize: '20px',
    fontWeight: 700
  },
  lista: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  item: {
    border: '1px solid #eee',
    borderRadius: '10px',
    padding: '14px'
  },
  linha1: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  sub: {
    marginTop: '4px',
    fontSize: '13px',
    opacity: 0.8
  },
  badge: {
    border: '1px solid #ddd',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '13px'
  },
  bloco: {
    marginTop: '12px'
  },
  blocoTitulo: {
    fontSize: '12px',
    opacity: 0.7,
    marginBottom: '8px'
  },
  presentes: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  tag: {
    border: '1px solid #ddd',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '12px'
  }
}