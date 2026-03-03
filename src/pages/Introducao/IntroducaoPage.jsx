// src/pages/Introducao/IntroducaoPage.jsx
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvidado } from '../../hooks/useConvidado'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { resolveUI, textValue, scaleClass, styleClass } from '../../ui/resolveUI'
import { designColors, designSpacing, designRadius, designDimensions } from '../../ui/designSystem'

export default function IntroducaoPage() {
  const navigate = useNavigate()
  const { convidado } = useConvidado()
  const { config, loading } = useConfiguracoes()

  const ui = useMemo(
    () => resolveUI(config, 'introducao', { convidado }),
    [config, convidado]
  )

  useEffect(() => {
    if (!convidado) navigate('/')
  }, [convidado, navigate])

  if (loading || !convidado) return null

  // cores "padrão" vindas do tema, sem hardcode
  const corTextoPadrao = ui?.tema?.corTexto || '#333'
  const corBorda = ui?.tema?.corBorda || '#e9e9e9'
  const corFundo = ui?.tema?.corFundo || '#ffffff'

  return (
    <div style={makeStyles(ui).container}>
      <div style={makeStyles(ui).content}>
        <div style={makeStyles(ui).titleWrapper}>
          <h1
            className={`txt-title ${styleClass(ui.textos?.titulo)} ${scaleClass(ui.textos?.titulo)}`}
            style={{ color: ui.textos?.titulo?.color || ui.tema.corPrimaria }}
          >
            {textValue(ui.textos?.titulo, `Oi, ${convidado.nome}! 💕`)}
          </h1>
        </div>

        <p
          className={`${styleClass(ui.textos?.texto)} ${scaleClass(ui.textos?.texto)}`}
          style={{ color: ui.textos?.texto?.color || corTextoPadrao, margin: 0 }}
        >
          {textValue(
            ui.textos?.texto,
            'Ficamos muito felizes em compartilhar esse momento especial com você.'
          )}
        </p>

        <div style={makeStyles(ui).sessoes}>
          {(ui.sessoes || []).map((s, idx) => {
            if (!s.ativo) return null

            const hasBg = !!s.bgImageUrl

            const bgImage = hasBg
              ? `linear-gradient(rgba(0,0,0,${s.overlay}), rgba(0,0,0,${s.overlay})), url(${s.bgImageUrl})`
              : 'none'

            // ✅ se tiver bg: default branco, MAS respeita o que veio do admin
            const tituloColor = s.titulo?.color || (hasBg ? '#fff' : corTextoPadrao)
            const textoColor = s.texto?.color || (hasBg ? '#fff' : corTextoPadrao)

            return (
              <section
                key={idx}
                style={{
                  ...makeStyles(ui).sessao,
                  backgroundColor: hasBg ? 'transparent' : corFundo,
                  borderColor: corBorda,
                  backgroundImage: bgImage,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div style={makeStyles(ui).sessaoInner}>
                  <div style={makeStyles(ui).titleWrapper}>
                    <h2
                      className={`${styleClass(s.titulo)} ${scaleClass(s.titulo)}`}
                      style={{
                        ...makeStyles(ui).sessaoTitulo,
                        color: tituloColor
                      }}
                    >
                      {textValue(s.titulo, `Sessão ${idx + 1}`)}
                    </h2>
                  </div>

                  <p
                    className={`${styleClass(s.texto)} ${scaleClass(s.texto)}`}
                    style={{
                      ...makeStyles(ui).sessaoTexto,
                      color: textoColor
                    }}
                  >
                    {textValue(s.texto, '')}
                  </p>
                </div>
              </section>
            )
          })}
        </div>

        <div style={makeStyles(ui).botoes}>
          <button
            onClick={() => navigate('/confirmacao')}
            className={`btn-primary ${styleClass(ui.textos?.botaoConfirmar)} ${scaleClass(ui.textos?.botaoConfirmar)}`}
            style={{
              backgroundColor: ui.tema.corBotao,
              color: ui.textos?.botaoConfirmar?.color || '#fff'
            }}
          >
            {textValue(ui.textos?.botaoConfirmar, 'Confirmar presença')}
          </button>

          <button
            onClick={() => navigate('/presentes')}
            className={`${styleClass(ui.textos?.botaoPresentes)} ${scaleClass(ui.textos?.botaoPresentes)}`}
            style={{
              ...makeStyles(ui).botaoSecundario,
              borderColor: ui?.tema?.corPrimaria || '#ccc',
              color: ui.textos?.botaoPresentes?.color || (ui?.tema?.corPrimaria || '#333'),
              background: ui?.tema?.corSecundaria || '#fff'
            }}
          >
            {textValue(ui.textos?.botaoPresentes, 'Ver lista de presentes')}
          </button>
        </div>
      </div>
    </div>
  )
}

function makeStyles(ui) {
  const design = ui
  return {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      padding: designSpacing.xGrande(design)
    },
    content: {
      width: '100%',
      maxWidth: '700px',
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
    sessoes: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: designSpacing.medio(design),
      marginTop: designSpacing.pequeno(design)
    },
    sessao: {
      width: '100%',
      borderRadius: designRadius.grande(design),
      border: `1px solid ${designColors.bordaPrincipal(design)}`,
      overflow: 'hidden',
      minHeight: 180,
      aspectRatio: designDimensions.imagemAspectRatio(design),
      display: 'flex',
      alignItems: 'flex-end'
    },
    sessaoInner: {
      width: '100%',
      padding: designSpacing.grande(design),
      textAlign: 'left',
      background: 'transparent'
    },
    sessaoTitulo: {
      margin: 0,
      fontFamily: 'var(--fonte-titulo)',
      fontSize: 18,
      lineHeight: 1.2
    },
    sessaoTexto: {
      marginTop: designSpacing.grande(design),
      marginBottom: 0,
      lineHeight: 1.5
    },
    botoes: {
      width: '100%',
      maxWidth: designDimensions.contentMaxWidth(design),
      display: 'flex',
      flexDirection: 'column',
      gap: designSpacing.medio(design),
      marginTop: designSpacing.pequeno(design)
    },
    botaoSecundario: {
      padding: `${designSpacing.medio(design)} ${designSpacing.grande(design)}`,
      borderRadius: designRadius.medio(design),
      border: `1px solid ${designColors.bordaSecundaria(design)}`,
      cursor: 'pointer'
    }
  }
}
