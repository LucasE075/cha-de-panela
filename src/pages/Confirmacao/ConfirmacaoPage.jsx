// src/pages/Confirmacao/ConfirmacaoPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvidado } from '../../hooks/useConvidado'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { atualizarPresenca } from '../../services/convidados.service'
import { resolveUI, textValue, scaleClass, styleClass } from '../../ui/resolveUI'
import { designColors, designSpacing, designRadius } from '../../ui/designSystem'

export default function ConfirmacaoPage() {
  const navigate = useNavigate()
  const { convidado, definirConvidado } = useConvidado()
  const { config, loading: loadingConfig } = useConfiguracoes()

  const [salvando, setSalvando] = useState(false)

  const ui = useMemo(
    () => resolveUI(config, 'confirmacao', { convidado }),
    [config, convidado]
  )

  // proteção de rota
  useEffect(() => {
    if (!convidado) navigate('/')
  }, [convidado, navigate])

  if (loadingConfig || !convidado) return null

  async function responder(confirmou) {
    try {
      setSalvando(true)

      // 1) salva no banco
      await atualizarPresenca(convidado.id, confirmou)

      // 2) salva no store (pra UI refletir sem reload)
      definirConvidado({ confirmou_presenca: confirmou })

      navigate('/agradecimento')
    } catch (e) {
      console.error(e)
      alert('Não foi possível salvar sua resposta. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={makeStyles(ui.design).container}>
      <div style={makeStyles(ui.design).content}>
        <div style={makeStyles(ui.design).titleWrapper}>
          <h1
            className={`txt-title ${styleClass(ui.textos?.pergunta)} ${scaleClass(ui.textos?.pergunta)}`}
            style={{ color: ui.textos?.pergunta?.color || ui.tema.corPrimaria }}
          >
            {textValue(
              ui.textos?.pergunta,
              `${convidado.nome}, você poderá comparecer? 🥂`
            )}
          </h1>
        </div>

        <div style={makeStyles(ui.design).botoes}>
          <button
            onClick={() => responder(true)}
            disabled={salvando}
            className={`btn-primary ${styleClass(ui.textos?.botaoSim)} ${scaleClass(ui.textos?.botaoSim)}`}
            style={{
              backgroundColor: ui.tema.corBotao,
              color: ui.textos?.botaoSim?.color || '#fff',
              opacity: salvando ? 0.7 : 1,
              cursor: salvando ? 'not-allowed' : 'pointer'
            }}
          >
            {salvando
              ? 'Salvando...'
              : textValue(ui.textos?.botaoSim, 'Sim, estarei lá 🎉')}
          </button>

          <button
            onClick={() => responder(false)}
            disabled={salvando}
            className={`${styleClass(ui.textos?.botaoNao)} ${scaleClass(ui.textos?.botaoNao)}`}
            style={{
              ...makeStyles(ui.design).botaoSecundario,
              color: ui.textos?.botaoNao?.color || '#333',
              opacity: salvando ? 0.7 : 1,
              cursor: salvando ? 'not-allowed' : 'pointer'
            }}
          >
            {salvando
              ? 'Salvando...'
              : textValue(ui.textos?.botaoNao, 'Infelizmente não poderei ir')}
          </button>
        </div>
      </div>
    </div>
  )
}

function makeStyles(design) {
  return {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: designSpacing.xGrande(design)
    },
    content: {
      width: '100%',
      maxWidth: '420px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: designSpacing.grande(design),
      textAlign: 'center'
    },
    titleWrapper: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      overflow: 'visible'
    },
    botoes: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: designSpacing.medio(design)
    },
    botaoSecundario: {
      width: '100%',
      padding: `${designSpacing.medio(design)} ${designSpacing.grande(design)}`,
      borderRadius: designRadius.medio(design),
      border: `1px solid ${designColors.bordaSecundaria(design)}`,
      background: designColors.fundoPrincipal(design)
    }
  }
}

