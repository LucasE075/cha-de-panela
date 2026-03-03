// src/services/presentes.service.js
import { supabase } from './supabase'

export async function listarPresentesAtivos() {
  const { data, error } = await supabase
    .from('presentes')
    .select('*')
    .eq('ativo', true)
    .order('nome')

  if (error) {
    console.error('Erro ao listar presentes:', error)
    throw error
  }

  return data || []
}

/**
 * Retorna Set com ids de presentes que devem ficar indisponíveis na lista:
 * - físico e pix_fixo quando já existe seleção (selecionado ou confirmado)
 * - pix_livre nunca entra como indisponível
 */
export async function listarIdsIndisponiveis() {
  const { data, error } = await supabase
    .from('selecoes')
    .select(`
      presente_id,
      status,
      presente:presentes (
        id,
        tipo
      )
    `)
    .in('status', ['selecionado', 'confirmado'])

  if (error) {
    console.error('Erro ao buscar seleções:', error)
    throw error
  }

  const ids = new Set()

  for (const row of data || []) {
    const tipo = row?.presente?.tipo
    if (tipo === 'fisico' || tipo === 'pix_fixo') {
      ids.add(row.presente_id)
    }
  }

  return ids
}

/**
 * Checa se o convidado já selecionou um presente (evita duplicar cliques)
 */
export async function convidadoJaSelecionou(convidadoId, presenteId) {
  const { data, error } = await supabase
    .from('selecoes')
    .select('id')
    .eq('convidado_id', convidadoId)
    .eq('presente_id', presenteId)
    .limit(1)

  if (error) {
    console.error('Erro ao checar seleção do convidado:', error)
    throw error
  }

  return (data || []).length > 0
}

/**
 * Seleciona um presente para o convidado:
 * - busca o presente para saber tipo/valor
 * - bloqueia físico se já existir seleção para o presente
 * - evita duplicar seleção do mesmo convidado
 * - insere seleção com status 'selecionado'
 * - valor_final = valor do presente se pix_fixo
 */
export async function selecionarPresente(convidadoId, presenteId) {
  // 1) buscar presente (tipo/valor)
  const { data: presente, error: errPresente } = await supabase
    .from('presentes')
    .select('id, tipo, valor')
    .eq('id', presenteId)
    .maybeSingle()

  if (errPresente || !presente) {
    console.error('Erro ao buscar presente:', errPresente)
    throw errPresente || new Error('Presente não encontrado')
  }

  const ehFisico = presente.tipo === 'fisico'

  // 2) regra: físico não pode ser escolhido por mais de uma pessoa
  if (ehFisico) {
    const { data: jaExiste, error: errExiste } = await supabase
      .from('selecoes')
      .select('id')
      .eq('presente_id', presenteId)
      .eq('eh_presente_fisico', true)
      .in('status', ['selecionado', 'confirmado'])
      .limit(1)

    if (errExiste) {
      console.error('Erro ao checar disponibilidade do presente físico:', errExiste)
      throw errExiste
    }

    if (jaExiste && jaExiste.length > 0) {
      throw new Error('Este presente físico já foi escolhido.')
    }
  }

  // 3) evita duplicar seleção do mesmo convidado
  const jaSelecionou = await convidadoJaSelecionou(convidadoId, presenteId)
  if (jaSelecionou) return

  // 4) inserir seleção
  const payload = {
    convidado_id: convidadoId,
    presente_id: presenteId,
    status: 'selecionado',
    valor_final: presente.tipo === 'pix_fixo' ? presente.valor : null,
    eh_presente_fisico: ehFisico
  }

  const { error: errInsert } = await supabase
    .from('selecoes')
    .insert(payload)

  if (errInsert) {
    console.error('Erro ao inserir seleção:', errInsert)
    throw errInsert
  }
}

/**
 * Lista os presentes do convidado (com join do presente)
 * Retorna array "achatado" para a UI:
 * { id (presente), selecao_id, status, valor_final, created_at, nome, tipo, ... }
 */
export async function listarMeusPresentes(convidadoId) {
  const { data, error } = await supabase
    .from('selecoes')
    .select(`
      id,
      status,
      valor_final,
      created_at,
      presente:presentes (
        id,
        nome,
        descricao,
        tipo,
        valor,
        cor
      )
    `)
    .eq('convidado_id', convidadoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao listar meus presentes:', error)
    throw error
  }

  return (data || []).map(row => ({
    id: row.presente?.id,        // id do presente (para UI)
    selecao_id: row.id,          // id da seleção (útil no futuro)
    status: row.status,
    valor_final: row.valor_final,
    created_at: row.created_at,
    ...(row.presente || {})
  }))
}

/**
 * Confirma todos os presentes do convidado (status -> confirmado)
 * Só confirma os que estão em 'selecionado'
 */
export async function confirmarPresentes(convidadoId) {
  const { error } = await supabase
    .from('selecoes')
    .update({ status: 'confirmado' })
    .eq('convidado_id', convidadoId)
    .eq('status', 'selecionado')

  if (error) {
    console.error('Erro ao confirmar presentes:', error)
    throw error
  }
}

/**
 * Confirma uma única seleção (status -> confirmado).
 * Usa o id da seleção (selecoes.id), porque o mesmo presente pode ser
 * escolhido várias vezes por diferentes convidados em casos de pix livre,
 * então não podemos atualizar usando presente_id.
 */
export async function confirmarPresente(convidadoId, selecaoId) {
  const { error } = await supabase
    .from('selecoes')
    .update({ status: 'confirmado' })
    .eq('convidado_id', convidadoId)
    .eq('id', selecaoId)
    .eq('status', 'selecionado')

  if (error) {
    console.error('Erro ao confirmar presente:', error)
    throw error
  }
}

/**
 * Remove um presente do convidado (desmarcar)
 */
export async function removerPresente(convidadoId, selecaoIdOuPresenteId) {
  // 1) tenta apagar pelo ID da seleção (selecoes.id)
  {
    const { error, count } = await supabase
      .from('selecoes')
      .delete({ count: 'exact' })
      .eq('id', selecaoIdOuPresenteId)
      .eq('convidado_id', convidadoId)
      .eq('status', 'selecionado')

    if (error) throw error
    if ((count || 0) > 0) return true
  }

  // 2) fallback: tenta apagar pelo ID do presente (selecoes.presente_id)
  {
    const { error, count } = await supabase
      .from('selecoes')
      .delete({ count: 'exact' })
      .eq('presente_id', selecaoIdOuPresenteId)
      .eq('convidado_id', convidadoId)
      .eq('status', 'selecionado')

    if (error) throw error
    return (count || 0) > 0
  }
} 

export async function listarPresentesAdmin() {
  const { data, error } = await supabase
    .from('presentes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao listar presentes (admin):', error)
    throw error
  }

  return data || []
}

export async function criarPresente(payload) {
  const { data, error } = await supabase
    .from('presentes')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao criar presente:', error)
    throw error
  }

  return data
}

export async function atualizarPresente(id, payload) {
  const { data, error } = await supabase
    .from('presentes')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao atualizar presente:', error)
    throw error
  }

  return data
}

export async function apagarPresente(id) {
  const { error } = await supabase
    .from('presentes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao apagar presente:', error)
    throw error
  }
}