import { supabase } from './supabase'

export async function criarConvidado({ nome, sobrenome, celular }) {
  const payload = {
    nome,
    sobrenome,
    celular
  }

  const { data, error } = await supabase
    .from('convidados')
    .insert(payload)
    .select('id, nome, sobrenome, celular')
    .single()

  if (error) {
    console.error('Erro ao criar convidado:', error)
    throw error
  }

  return data
}

export async function atualizarPresenca(convidadoId, confirmou) {
  const { error } = await supabase
    .from('convidados')
    .update({ confirmou_presenca: confirmou })
    .eq('id', convidadoId)

  if (error) {
    console.error('Erro ao atualizar presença:', error)
    throw error
  }
}

export async function listarConvidadosComPresentes() {
  const { data, error } = await supabase
    .from('convidados')
    .select(`
      id,
      nome,
      sobrenome,
      celular,
      confirmou_presenca,
      created_at,
      selecoes:selecoes (
        id,
        status,
        valor_final,
        created_at,
        presente:presentes (
          id,
          nome,
          tipo,
          valor,
          cor
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao listar convidados:', error)
    throw error
  }

  return data || []
}