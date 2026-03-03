// src/hooks/useConfiguracoes.js
import { useEffect, useState } from 'react'
import { getConfiguracoes } from '../services/configuracoes.service'

export function useConfiguracoes() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function carregar() {
      try {
        const cfg = await getConfiguracoes()
        if (alive) {
          setConfig(cfg || {})
        }
      } catch (e) {
        console.error(e)
        if (alive) {
          setConfig({})
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    carregar()

    return () => {
      alive = false
    }
  }, [])

  return { config, loading }
}