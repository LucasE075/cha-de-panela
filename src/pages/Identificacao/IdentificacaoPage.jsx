// src/pages/Identificacao/IdentificacaoPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvidado } from '../../hooks/useConvidado'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { criarConvidado } from '../../services/convidados.service'
import { resolveUI, textValue, scaleClass, styleClass } from '../../ui/resolveUI'
import { designColors, designSpacing, designRadius, designDimensions } from '../../ui/designSystem'

export default function IdentificacaoPage() {
  const navigate = useNavigate()
  const { convidado, definirConvidado } = useConvidado()
  const { config, loading: loadingConfig } = useConfiguracoes()

  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [celular, setCelular] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const ui = useMemo(() => resolveUI(config, 'identificacao', {}), [config])

  useEffect(() => {
    if (convidado?.id && convidado?.persistido === true) {
      navigate('/introducao')
    }
  }, [convidado?.id, convidado?.persistido, navigate])

  if (loadingConfig) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!nome || !sobrenome || !celular) {
      setErro('Preencha todos os campos')
      return
    }

    setSalvando(true)
    try {
      const criado = await criarConvidado({
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        celular: celular.trim()
      })

      definirConvidado({ ...criado, persistido: true })
      navigate('/introducao')
    } catch (err) {
      console.error(err)
      setErro('Não foi possível salvar seu cadastro. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={makeStyles(ui).container}>
      <div style={makeStyles(ui).content}>
        {ui.imagens?.headerImageUrl && (
          <img
            src={ui.imagens.headerImageUrl}
            alt="Foto"
            style={makeStyles(ui).headerImage}
          />
        )}

        <div style={makeStyles(ui).titleWrapper}>
          <h1
            className={`txt-title ${styleClass(ui.textos?.titulo)} ${scaleClass(ui.textos?.titulo)}`}
            style={{ color: ui.textos?.titulo?.color || ui.tema.corPrimaria }}
          >
            {textValue(ui.textos?.titulo, 'Bem-vindos ao nosso Chá de Panela 💍')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={makeStyles(ui).form}>
          <input
            placeholder={textValue(ui.textos?.placeholderNome, 'Nome')}
            value={nome}
            onChange={e => setNome(e.target.value)}
            disabled={salvando}
            style={makeStyles(ui).input}
          />
          <input
            placeholder={textValue(ui.textos?.placeholderSobrenome, 'Sobrenome')}
            value={sobrenome}
            onChange={e => setSobrenome(e.target.value)}
            disabled={salvando}
            style={makeStyles(ui).input}
          />
          <input
            placeholder={textValue(ui.textos?.placeholderCelular, 'Celular')}
            value={celular}
            onChange={e => setCelular(e.target.value)}
            disabled={salvando}
            style={makeStyles(ui).input}
          />

          {erro && <p style={makeStyles(ui).erro}>{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className={`btn-primary ${styleClass(ui.textos?.botaoContinuar)} ${scaleClass(ui.textos?.botaoContinuar)}`}
            style={{
              backgroundColor: ui.tema.corBotao,
              color: ui.textos?.botaoContinuar?.color || '#fff',
              opacity: salvando ? 0.75 : 1,
              cursor: salvando ? 'not-allowed' : 'pointer'
            }}
          >
            {salvando ? 'Salvando...' : textValue(ui.textos?.botaoContinuar, 'Continuar')}
          </button>
        </form>
      </div>
    </div>
  )
}

function makeStyles(ui) {
  const { design, tema, backgroundColor, backgroundImage } = ui
  return {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: designSpacing.xGrande(design),
      background: backgroundImage
        ? `url(${backgroundImage}) center/cover no-repeat`
        : backgroundColor || tema.corFundo
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
    headerImage: {
      width: 'min(220px, 70vw)',
      aspectRatio: '1 / 1',
      objectFit: 'cover',
    },
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: designSpacing.medio(design)
    },
    input: {
      padding: designSpacing.medio(design),
      borderRadius: designRadius.medio(design), 
      width: '100%'
    },
    erro: { color: designColors.erro(design), fontSize: 14, margin: 0 }
  }
}