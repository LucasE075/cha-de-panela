// src/pages/Presentes/PresentesPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listarPresentesAtivos,
  selecionarPresente,
  listarIdsIndisponiveis,
  convidadoJaSelecionou
} from '../../services/presentes.service'
import { useConvidado } from '../../hooks/useConvidado'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { resolveUI, textValue, scaleClass, styleClass } from '../../ui/resolveUI'
import { designColors, designSpacing, designRadius, designDimensions } from '../../ui/designSystem'

export default function PresentesPage() {
  const navigate = useNavigate()
  const { convidado } = useConvidado()
  const { config, loading: loadingConfig } = useConfiguracoes()

  const ui = useMemo(() => resolveUI(config, 'presentes', { convidado }), [config, convidado])

  const [presentes, setPresentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [idsIndisponiveis, setIdsIndisponiveis] = useState(new Set())

  // ids que este convidado já selecionou (pra UI)
  const [idsSelecionados, setIdsSelecionados] = useState(() => new Set())
  const [salvandoId, setSalvandoId] = useState(null)

  useEffect(() => {
    async function carregar() {
      try {
        const [ativos, idsIndisponiveis] = await Promise.all([
          listarPresentesAtivos(),
          listarIdsIndisponiveis()
        ])

        // todos os presentes aparecem na vitrine
        // visual de indisponível é feito no JSX
        setPresentes(ativos || [])
        setIdsIndisponiveis(idsIndisponiveis)
      } catch (e) {
        console.error(e)
        setPresentes([])
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [])

  const qtdSelecionados = useMemo(() => idsSelecionados.size, [idsSelecionados])

  if (loadingConfig || !convidado || loading) return null

  async function selecionar(presente) {
    try {
      setSalvandoId(presente.id)

      // evita duplicar na UX
      if (idsSelecionados.has(presente.id)) return

      // evita duplicar no banco
      const ja = await convidadoJaSelecionou(convidado.id, presente.id)
      if (ja) {
        setIdsSelecionados(prev => new Set([...prev, presente.id]))
        return
      }

      await selecionarPresente(convidado.id, presente.id)

      // marca localmente
      setIdsSelecionados(prev => new Set([...prev, presente.id]))

      // recarrega IDs indisponíveis para atualizar visual
      const novoIndisponivel = await listarIdsIndisponiveis()
      setIdsIndisponiveis(novoIndisponivel)
    } catch (e) {
      console.error(e)
      alert(e?.message || 'Não foi possível selecionar este presente.')
    } finally {
      setSalvandoId(null)
    }
  }

  return (
    <div style={makeStyles(ui).container}>
      <div style={makeStyles(ui).topo}>
        <div style={makeStyles(ui).titleWrapper}>
          <h1
            className={`txt-title ${styleClass(ui.textos?.titulo)} ${scaleClass(ui.textos?.titulo)}`}
            style={{ color: ui.textos?.titulo?.color || ui.tema.corPrimaria, margin: 0 }}
          >
            {textValue(ui.textos?.titulo, 'Escolha um presente 🎁')}
          </h1>
        </div>

        <button
          onClick={() => navigate('/meus-presentes')}
          className="btn-primary"
          style={{
            backgroundColor: ui.tema.corBotao,
            color: '#fff',
            opacity: qtdSelecionados === 0 ? 0.6 : 1,
            cursor: qtdSelecionados === 0 ? 'not-allowed' : 'pointer'
          }}
          disabled={qtdSelecionados === 0}
          title={qtdSelecionados === 0 ? 'Selecione pelo menos um presente' : ''}
        >
          {qtdSelecionados > 0
            ? `Ver meus presentes (${qtdSelecionados})`
            : 'Ver meus presentes'}
        </button>
      </div>

      <div style={makeStyles(ui).grid}>
        {presentes.map(presente => {
          const selecionado = idsSelecionados.has(presente.id)
          const indisponivel = idsIndisponiveis.has(presente.id) && presente.tipo !== 'pix_livre'
          const disabled = selecionado || salvandoId === presente.id || indisponivel
          const cor = presente.cor || ui.tema.corPrimaria || '#ddd'
          const estilo = makeStyles(ui)

          return (
            <div
              key={presente.id}
              style={{
                ...estilo.card,
                borderColor: cor,
                opacity: salvandoId === presente.id ? 0.7 : indisponivel ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            >
              {presente.imagem_url ? (
                <div style={estilo.mediaWrap}>
                  <img
                    src={presente.imagem_url}
                    alt={presente.nome}
                    style={estilo.media}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div style={{ ...estilo.mediaFallback, background: cor }} />
              )}

              <div style={estilo.body}>
                <strong style={{ ...estilo.nome, textAlign: 'center' }}>{presente.nome}</strong>

                {presente.tipo === 'pix_fixo' && presente.valor != null && (
                  <p style={{ ...estilo.valor, textAlign: 'center' }}>R$ {formatarBRL(presente.valor)}</p>
                )}

                {presente.tipo === 'pix_livre' && (
                  <p style={{ ...estilo.pixLivre, textAlign: 'center' }}>Valor livre</p>
                )}

                {presente.descricao && (
                  <p style={{ ...estilo.descricao, textAlign: 'center' }}>{presente.descricao}</p>
                )}
              </div>

              <button
                onClick={() => selecionar(presente)}
                disabled={disabled}
                className={`btn-primary ${styleClass(ui.textos?.botaoEscolher)} ${scaleClass(ui.textos?.botaoEscolher)}`}
                style={{
                  backgroundColor: selecionado ? designColors.confirmado(ui.design) : indisponivel ? '#999' : cor,
                  color: ui.textos?.botaoEscolher?.color || '#fff',
                  opacity: disabled ? 0.85 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer'
                }}
                title={indisponivel && presente.tipo !== 'pix_livre' ? 'Este presente já foi selecionado' : ''}
              >
                {selecionado
                  ? 'Selecionado ✅'
                  : indisponivel && presente.tipo !== 'pix_livre'
                  ? 'Indisponível'
                  : textValue(ui.textos?.botaoEscolher, 'Selecionar')}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// helper removed because it's not used anywhere in this file

function formatarBRL(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return String(n)
  return String(Math.round(v * 100) / 100).replace('.', ',')
}

/**
 * Função que cria estilos dinâmicos a partir do design
 * Substitui o objeto styles hardcoded anterior
 */
function makeStyles(ui) {
  const design = ui
  const spacing = {
    p: designSpacing.pequeno(design),
    m: designSpacing.medio(design),
    g: designSpacing.grande(design),
    xg: designSpacing.xGrande(design)
  }

  const radius = {
    p: designRadius.pequeno(design),
    m: designRadius.medio(design),
    g: designRadius.grande(design),
    full: designRadius.full(design)
  }

  const colors = {
    fundoPrincipal: designColors.fundoPrincipal(design),
    fundoSecundario: designColors.fundoSecundario(design),
    bordaPrincipal: designColors.bordaPrincipal(design),
    bordaSecundaria: designColors.bordaSecundaria(design)
  }

  return {
    container: {
      minHeight: '100vh',
      padding: spacing.xg,
      maxWidth: designDimensions.containerMaxWidth(design),
      margin: '0 auto',
      background: ui.backgroundImage
        ? `url(${ui.backgroundImage}) center/cover no-repeat`
        : ui.backgroundColor || ui.tema.corFundo
    },
    topo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.m,
      flexWrap: 'wrap'
    },
    titleWrapper: {
      display: 'flex',
      justifyContent: 'center',
      overflow: 'visible'
    },

    // vitrine
    grid: {
      marginTop: spacing.xg,
      display: 'grid',
      gap: spacing.g,
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
    },

    card: {
      border: '2px solid',
      borderRadius: radius.g,
      overflow: 'hidden',
      background: colors.fundoPrincipal,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '320px'
    },

    mediaWrap: {
      width: '100%',
      aspectRatio: designDimensions.imagemAspectRatio(design),
      background: colors.fundoSecundario
    },
    media: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    },
    mediaFallback: {
      width: '100%',
      aspectRatio: designDimensions.imagemAspectRatio(design),
      opacity: 0.22
    },

    body: {
      padding: `${spacing.m} ${spacing.m} 0 ${spacing.m}`,
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.m,
      flex: 1
    },

    nome: { lineHeight: 1.2, display: 'block' },

    descricao: { margin: 0, fontSize: '0.9rem', opacity: 0.8 },
    valor: { margin: 0, fontWeight: 'bold' },
    pixLivre: { margin: 0, fontStyle: 'italic' }
  }
}