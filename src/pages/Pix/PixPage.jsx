// src/pages/Pix/PixPage.jsx
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { resolveUI, textValue, scaleClass, styleClass } from '../../ui/resolveUI'
import { designSpacing, designRadius, designDimensions, designColors } from '../../ui/designSystem'

export default function PixPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { config, loading: loadingConfig } = useConfiguracoes()

  const presente = location.state?.presente || {}
  const ui = useMemo(
    () => resolveUI(config, 'pix', {}),
    [config]
  )

  const [mensagem, setMensagem] = useState('')

  if (loadingConfig) return null

  const valorMostrar = Number(presente.valor_final ?? presente.valor ?? 0)

  function handleVoltar() {
    navigate(-1)
  }

  function handleFinalizar() {
    navigate('/agradecimento')
  }

  return (
    <div style={makeStyles(ui.tema, ui.design).container}>
      <div style={makeStyles(ui.tema, ui.design).content}>
        <div style={makeStyles(ui.tema, ui.design).titleWrapper}>
          <h1
            className={`txt-title ${styleClass(ui.textos?.titulo)} ${scaleClass(ui.textos?.titulo)}`}
            style={{ color: ui.textos?.titulo?.color || ui.tema.corPrimaria }}
          >
            {textValue(ui.textos?.titulo, 'Pagamento via PIX 💳')}
          </h1>
        </div>

        {/* QR Code image */}
        {ui.imagens?.qrCode && (
          <img
            src={ui.imagens.qrCode}
            alt="PIX QR Code"
            style={makeStyles(ui.tema, ui.design).qrImage}
          />
        )}

        {/* Texto 1 - embaixo do QR (valor para pix_fixo) */}
        {ui.textos?.texto1 && (
          <p
            className={`${styleClass(ui.textos.texto1)} ${scaleClass(ui.textos.texto1)}`}
            style={{
              ...makeStyles(ui.tema, ui.design).texto,
              color: ui.textos.texto1?.color || ui.tema.corTexto
            }}
          >
            {textValue(ui.textos.texto1, presente.tipo === 'pix_fixo' ? `R$ ${formatarBRL(valorMostrar)}` : '')}
          </p>
        )}

        {/* Texto 2 - instrução ou mensagem adicional */}
        {ui.textos?.texto2 && (
          <p
            className={`${styleClass(ui.textos.texto2)} ${scaleClass(ui.textos.texto2)}`}
            style={{
              ...makeStyles(ui.tema, ui.design).texto,
              color: ui.textos.texto2?.color || ui.tema.corTexto
            }}
          >
            {textValue(ui.textos.texto2, '')}
          </p>
        )}

        {/* Texto 3 - observação final */}
        {ui.textos?.texto3 && (
          <p
            className={`${styleClass(ui.textos.texto3)} ${scaleClass(ui.textos.texto3)}`}
            style={{
              ...makeStyles(ui.tema, ui.design).texto,
              color: ui.textos.texto3?.color || ui.tema.corTexto
            }}
          >
            {textValue(ui.textos.texto3, '')}
          </p>
        )}

        {/* Área para mensagem do cliente (opcional) */}
        <textarea
          value={mensagem}
          onChange={e => setMensagem(e.target.value)}
          placeholder={textValue(ui.textos?.placeholderMensagem, 'Deixe uma mensagem (opcional)...')}
          style={makeStyles(ui.tema, ui.design).textarea}
        />

        {/* Botões */}
        <div style={makeStyles(ui.tema, ui.design).actions}>
          <button onClick={handleVoltar} style={makeStyles(ui.tema, ui.design).btnSecondary}>
            {textValue(ui.textos?.botaoVoltar, '← Voltar')}
          </button>
          <button onClick={handleFinalizar} className="btn-primary" style={makeStyles(ui.tema, ui.design).btnPrimary}>
            {textValue(ui.textos?.botaoConfirmar, 'Finalizar')}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatarBRL(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return String(n)
  return String(Math.round(v * 100) / 100).replace('.', ',')
}

function makeStyles(tema, design) {
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
    qrImage: {
      width: 'min(280px, 60vw)',
      height: 'auto',
      aspectRatio: '1 / 1',
      objectFit: 'contain',
      borderRadius: designRadius.medio(design),
      border: `1px solid ${designColors.bordaPrincipal(design)}`
    },
    texto: {
      maxWidth: designDimensions.contentMaxWidth(design),
      margin: 0,
      lineHeight: 1.5
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: designSpacing.medio(design),
      borderRadius: designRadius.medio(design),
      border: `1px solid ${designColors.bordaSecundaria(design)}`,
      fontFamily: 'inherit',
      fontSize: '14px'
    },
    actions: {
      display: 'flex',
      gap: designSpacing.medio(design),
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    btnPrimary: {
      backgroundColor: tema?.corBotao || '#c59d5f',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: designRadius.medio(design),
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    btnSecondary: {
      backgroundColor: designColors.fundoSecundario(design),
      color: '#333',
      padding: '10px 20px',
      borderRadius: designRadius.medio(design),
      border: `1px solid ${designColors.bordaSecundaria(design)}`,
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  }
}
