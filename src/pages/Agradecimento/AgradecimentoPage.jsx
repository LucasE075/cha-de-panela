// src/pages/Agradecimento/AgradecimentoPage.jsx
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvidado } from '../../hooks/useConvidado'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { resolveUI, textValue, scaleClass, styleClass } from '../../ui/resolveUI'
import { designColors, designSpacing, designDimensions } from '../../ui/designSystem'

export default function AgradecimentoPage() {
  const navigate = useNavigate()
  const { convidado } = useConvidado()
  const { config, loading: loadingConfig } = useConfiguracoes()

  const ui = useMemo(
    () => resolveUI(config, 'agradecimento', { convidado }),
    [config, convidado]
  )

  // proteção de rota
  useEffect(() => {
    if (!convidado) navigate('/')
  }, [convidado, navigate])

  if (loadingConfig || !convidado) return null

  const confirmou = convidado.confirmou_presenca === true

  return (
    <div style={makeStyles(ui.design).container}>
      <div style={makeStyles(ui.design).content}>
        <div style={makeStyles(ui.design).titleWrapper}>
          <h1
            className={`txt-title ${styleClass(ui.textos?.titulo)} ${scaleClass(ui.textos?.titulo)}`}
            style={{ color: ui.textos?.titulo?.color || ui.tema.corPrimaria }}
          >
            {textValue(ui.textos?.titulo, `Obrigado, ${convidado.nome}! 💐`)}
          </h1>
        </div>

        <p
          className={`${styleClass(confirmou ? ui.textos?.mensagemConfirmou : ui.textos?.mensagemNaoConfirmou)} ${scaleClass(confirmou ? ui.textos?.mensagemConfirmou : ui.textos?.mensagemNaoConfirmou)}`}
          style={{
            ...makeStyles(ui.design).texto,
            color:
              (confirmou
                ? ui.textos?.mensagemConfirmou?.color
                : ui.textos?.mensagemNaoConfirmou?.color) || '#333'
          }}
        >
          {confirmou
            ? textValue(
                ui.textos?.mensagemConfirmou,
                'Ficamos muito felizes em saber que você estará conosco nesse dia especial 🥂'
              )
            : textValue(
                ui.textos?.mensagemNaoConfirmou,
                'Mesmo não podendo comparecer, sua lembrança significa muito para nós ❤️'
              )}
        </p>

        <p
          className={`${styleClass(ui.textos?.mensagemFinal)} ${scaleClass(ui.textos?.mensagemFinal)}`}
          style={{ ...makeStyles(ui.design).texto, color: ui.textos?.mensagemFinal?.color || '#333' }}
        >
          {textValue(ui.textos?.mensagemFinal, 'Nos vemos em breve!')}
        </p>

        {/* Botão para lista de presentes (independente da confirmação) */}
        <button
          onClick={() => navigate('/presentes')}
          className="btn-primary"
          style={{
            backgroundColor: ui.tema.corBotao,
            color: '#fff',
            width: '100%',
            maxWidth: 420
          }}
        >
          {textValue(ui.textos?.botaoIrPresentes, 'Ver lista de presentes 🎁')}
        </button>
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
      maxWidth: designDimensions.contentMaxWidth(design),
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
    texto: {
      maxWidth: designDimensions.contentMaxWidth(design),
      margin: 0,
      lineHeight: 1.5
    }
  }
}