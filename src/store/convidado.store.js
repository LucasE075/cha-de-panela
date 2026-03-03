import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'convidado'

let convidado = null
let listeners = []

function carregar() {
  const salvo = localStorage.getItem(STORAGE_KEY)

  if (salvo) {
    try {
      convidado = JSON.parse(salvo)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      convidado = null
    }
  }
}

function salvar() {
  if (convidado) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convidado))
  }
}

carregar()

export function getConvidado() {
  return convidado
}

export function setConvidado(dados) {
  convidado = {
    id: convidado?.id || uuidv4(),
    ...convidado,
    ...dados
  }

  salvar()
  listeners.forEach(fn => fn(convidado))
}

export function limparConvidado() {
  convidado = null
  localStorage.removeItem(STORAGE_KEY)
  listeners.forEach(fn => fn(null))
}

export function subscribeConvidado(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter(l => l !== fn)
  }
}
