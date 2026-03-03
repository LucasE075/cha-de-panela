// src/services/configuracoes.service.js
import { supabase } from './supabase'

const CONFIG_ID = 1

export async function getConfiguracoes() {
  const { data, error } = await supabase
    .from('configuracoes')
    .select('id, config')
    .eq('id', CONFIG_ID)
    .single()

  if (error) throw error

  // fallback seguro
  return data?.config || {}
}

export async function saveConfiguracoes(nextConfig) {
  const { error } = await supabase
    .from('configuracoes')
    .update({ config: nextConfig })
    .eq('id', CONFIG_ID)

  if (error) throw error
}