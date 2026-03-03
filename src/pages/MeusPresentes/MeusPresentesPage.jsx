// src/pages/MeusPresentes/MeusPresentesPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvidado } from '../../hooks/useConvidado'
import {
  listarMeusPresentes,
  confirmarPresentes,
  confirmarPresente,
  removerPresente
} from '../../services/presentes.service'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { resolveUI, textValue, scaleClass, styleClass } from '../../ui/resolveUI'
// removing unused designSystem imports; page uses static styles

export default function MeusPresentesPage() {
  const navigate = useNavigate()
  const { convidado } = useConvidado()
  const { config, loading: loadingConfig } = useConfiguracoes()

  const ui = useMemo(
    () => resolveUI(config, 'meusPresentes', { convidado }),
    [config, convidado]
  )

  const styles = useMemo(() => {
    const base = {
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
      cardActions: {
        marginTop: 8,
        display: 'flex',
        justifyContent: 'center'
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
      }
    }

    // apply global background overrides
    base.container.background = ui.backgroundImage
      ? `url(${ui.backgroundImage}) center/cover no-repeat`
      : ui.backgroundColor || ui.tema.corFundo

    return base
  }, [ui])

  const [presentes, setPresentes] = useState([])
  const [loadingPresentes, setLoadingPresentes] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoId, setConfirmandoId] = useState(null)
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

  // confirma apenas um presente e navega conforme o tipo
  async function confirmarItem(p) {
    if (!convidado || !p.selecao_id) return
    try {
      setConfirmandoId(p.selecao_id)
      await confirmarPresente(convidado.id, p.selecao_id)

      // navegação condicional
      if (p.tipo === 'fisico') {
        navigate('/agradecimento')
      } else {
        // todos os outros tipos (pix_fixo/pix_livre) vão para tela de PIX
        navigate('/pix', { state: { presente: p } })
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao confirmar o presente.')
    } finally {
      setConfirmandoId(null)
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
              // tipo is currently unused; kept for future features
              // const tipo = p.tipo || p.presente_tipo || p.presente?.tipo || ''
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

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => desmarcar(p)}
                      disabled={desabilitado || status !== 'selecionado'}
                      style={{
                        ...styles.botaoRemover,
                        opacity: desabilitado ? 0.6 : 1,
                        cursor: desabilitado ? 'not-allowed' : 'pointer'
                      }}
                      title={status !== 'selecionado' ? 'Não é possível remover após confirmar' : ''}
                    >
                      {removendoId === idRemover ? 'Removendo...' : 'Remover ❌'}
                    </button>

                    {status === 'selecionado' && (
                      <button
                        onClick={() => confirmarItem(p)}
                        disabled={confirmandoId === idRemover}
                        style={{
                          backgroundColor: ui.tema?.corBotao || '#c59d5f',
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          marginLeft: 8,
                          opacity: confirmandoId === idRemover ? 0.7 : 1,
                          cursor: confirmandoId === idRemover ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {confirmandoId === idRemover ? 'Confirmando...' : 'Confirmar'}
                      </button>
                    )}
                  </div>
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

// formatarTipo was used previously for displaying the type of gift but is
// not currently referenced anywhere in this component.  Leave the helper
// commented out in case it's valuable later.
/*
function formatarTipo(tipo) {
  if (tipo === 'fisico') return 'Físico'
  if (tipo === 'pix_fixo') return 'PIX fixo'
  if (tipo === 'pix_livre') return 'PIX livre'
  return tipo || ''
}
*/

function formatarBRL(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return String(n)
  return String(Math.round(v * 100) / 100).replace('.', ',')
}


