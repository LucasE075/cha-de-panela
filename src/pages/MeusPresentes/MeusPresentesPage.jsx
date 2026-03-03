// src/pages/MeusPresentes/MeusPresentesPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvidado } from '../../hooks/useConvidado'
import {
  listarMeusPresentes,
  confirmarPresentes,
  removerPresente
} from '../../services/presentes.service'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { resolveUI, textValue, scaleClass, styleClass } from '../../ui/resolveUI'
import { designColors, designSpacing, designRadius, designDimensions } from '../../ui/designSystem'

export default function MeusPresentesPage() {
  const navigate = useNavigate()
  const { convidado } = useConvidado()
  const { config, loading: loadingConfig } = useConfiguracoes()

  const ui = useMemo(
    () => resolveUI(config, 'meusPresentes', { convidado }),
    [config, convidado]
  )

  const [presentes, setPresentes] = useState([])
  const [loadingPresentes, setLoadingPresentes] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [removendoId, setRemovendoId] = useState(null)

  // proteção de rota
  useEffect(() => {
    if (!convidado) navigate('/')
  }, [convidado, navigate])

  async function carregar() {
    if (!convidado) return
    try {
      setLoadingPresentes(true)
      const data = await listarMeusPresentes(convidado.id)
      setPresentes(data || [])
    } catch (e) {
      console.error(e)
      setPresentes([])
    } finally {
      setLoadingPresentes(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convidado?.id])

  const total = useMemo(() => {
    return (presentes || []).reduce((acc, p) => {
      const v = Number(p.valor_final ?? p.valor ?? 0)
      return acc + (Number.isFinite(v) ? v : 0)
    }, 0)
  }, [presentes])

  if (loadingConfig || loadingPresentes || !convidado) return null

  async function confirmar() {
    try {
      setSalvando(true)
      await confirmarPresentes(convidado.id)
      await carregar()
      navigate('/confirmacao')
    } catch (e) {
      console.error(e)
      alert('Erro ao confirmar.')
    } finally {
      setSalvando(false)
    }
  }

  async function desmarcar(item) {
    // item pode ter selecao_id (ideal) ou id/presente_id
    const idRemover = item?.selecao_id || item?.id || item?.presente_id
    if (!idRemover) return

    try {
      setRemovendoId(idRemover)
      await removerPresente(convidado.id, idRemover)

      // remove localmente (comparando contra todos os campos possíveis)
      setPresentes(prev =>
        (prev || []).filter(x =>
          x.selecao_id !== idRemover &&
          x.id !== idRemover &&
          x.presente_id !== idRemover
        )
      )
    } catch (e) {
      console.error(e)
      alert('Erro ao remover.')
    } finally {
      setRemovendoId(null)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.titleWrapper}>
          <h1
            className={`txt-title ${styleClass(ui.textos?.titulo)} ${scaleClass(ui.textos?.titulo)}`}
            style={{ color: ui.textos?.titulo?.color || ui.tema.corPrimaria, margin: 0 }}
          >
            {textValue(ui.textos?.titulo, 'Meus presentes 🎁')}
          </h1>
        </div>

        <div style={styles.resumo}>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Selecionados</span>
            <strong style={styles.resumoValue}>{presentes.length}</strong>
          </div>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Total (estimado)</span>
            <strong style={styles.resumoValue}>R$ {formatarBRL(total)}</strong>
          </div>
        </div>

        {presentes.length === 0 ? (
          <div style={styles.vazio}>
            <p style={{ margin: 0 }}>Nenhum presente selecionado.</p>
            <button
              onClick={() => navigate('/presentes')}
              style={styles.botaoSecundario}
              disabled={salvando}
            >
              Ir para a lista de presentes
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {presentes.map(p => {
              const nome = p.nome || p.presente_nome || p.presente?.nome || 'Presente'
              const tipo = p.tipo || p.presente_tipo || p.presente?.tipo || ''
              const cor =
                p.cor || p.presente_cor || p.presente?.cor || ui.tema.corPrimaria || '#ddd'
              const imagem =
                p.imagem_url || p.presente_imagem_url || p.presente?.imagem_url || null

              const idRemover = p.selecao_id || p.id || p.presente_id
              const desabilitado = salvando || removendoId === idRemover

              const valorMostrar = Number(p.valor_final ?? p.valor ?? 0)
              const status = p.status || p.selecao_status || 'selecionado'

              return (
                <div
                  key={idRemover || nome}
                  style={{
                    ...styles.card,
                    borderColor: cor,
                    opacity: desabilitado ? 0.7 : 1
                  }}
                >
                  {imagem ? (
                    <div style={styles.mediaWrap}>
                      <img
                        src={imagem}
                        alt={nome}
                        style={styles.media}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div style={{ ...styles.mediaFallback, background: cor }} />
                  )}

                  <div style={styles.body}>
                    <strong style={{ ...styles.nome, textAlign: 'center' }}>{nome}</strong>

                    {Number.isFinite(valorMostrar) && valorMostrar > 0 && (
                      <p style={{ ...styles.valor, textAlign: 'center' }}>R$ {formatarBRL(valorMostrar)}</p>
                    )}

                    <p style={{ ...styles.status, textAlign: 'center' }}>
                      Status: <strong>{status}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => desmarcar(p)}
                    disabled={desabilitado}
                    style={{
                      ...styles.botaoRemover,
                      opacity: desabilitado ? 0.6 : 1,
                      cursor: desabilitado ? 'not-allowed' : 'pointer'
                    }}
                    title={status !== 'selecionado' ? 'Não é possível remover após confirmar' : ''}
                  >
                    {removendoId === idRemover ? 'Removendo...' : 'Remover ❌'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div style={styles.acoes}>
          <button
            onClick={() => navigate('/presentes')}
            style={styles.botaoSecundario}
            disabled={salvando}
          >
            ← Voltar aos presentes
          </button>

          {presentes.length > 0 && (
            <button
              onClick={confirmar}
              disabled={salvando}
              className="btn-primary"
              style={{
                backgroundColor: ui.tema.corBotao,
                color: '#fff',
                opacity: salvando ? 0.7 : 1,
                cursor: salvando ? 'not-allowed' : 'pointer'
              }}
            >
              {salvando ? 'Confirmando...' : 'Confirmar 🎉'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function formatarTipo(tipo) {
  if (tipo === 'fisico') return 'Físico'
  if (tipo === 'pix_fixo') return 'PIX fixo'
  if (tipo === 'pix_livre') return 'PIX livre'
  return tipo || ''
}

function formatarBRL(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return String(n)
  return String(Math.round(v * 100) / 100).replace('.', ',')
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    padding: '24px'
  },
  content: {
    width: '100%',
    maxWidth: '980px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center'
  },
  titleWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'visible'
  },

  resumo: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  resumoItem: {
    flex: '1 1 200px',
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '10px 12px',
    background: '#fff'
  },
  resumoLabel: { display: 'block', fontSize: 12, opacity: 0.75 },
  resumoValue: { fontSize: 18 },

  vazio: {
    width: '100%',
    maxWidth: '520px',
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '16px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center'
  },

  grid: {
    width: '100%',
    display: 'grid',
    gap: '14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
  },

  card: {
    border: '2px solid',
    borderRadius: '14px',
    overflow: 'hidden',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '280px'
  },

  mediaWrap: {
    width: '100%',
    aspectRatio: '16 / 10',
    background: '#f3f3f3'
  },
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  mediaFallback: {
    width: '100%',
    aspectRatio: '16 / 10',
    opacity: 0.22
  },

  body: {
    padding: '12px 12px 0 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },

  nome: { lineHeight: 1.2, display: 'block' },

  valor: { margin: 0, fontWeight: 'bold' },
  status: { margin: 0, fontStyle: 'italic', opacity: 0.9 },

  botaoRemover: {
    border: 'none',
    background: 'transparent',
    color: '#b00020',
    padding: '12px 14px',
    fontWeight: 600
  },

  acoes: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '8px'
  },
  botaoSecundario: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #ccc',
    background: '#fff',
    cursor: 'pointer'
  }
}