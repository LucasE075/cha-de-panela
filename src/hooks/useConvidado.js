import { useEffect, useState } from 'react'
import {
  getConvidado,
  setConvidado,
  limparConvidado,
  subscribeConvidado
} from '../store/convidado.store'

export function useConvidado() {
  const [convidado, setState] = useState(getConvidado())

  useEffect(() => {
    const unsub = subscribeConvidado(setState)
    return unsub
  }, [])

  return {
    convidado,
    loading: false, // sempre pronto
    definirConvidado: setConvidado,
    limparConvidado
  }
}
