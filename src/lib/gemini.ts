import { supabase } from './supabase'

export async function generateProposal(formData: unknown, userProfile: unknown) {
  const { data, error } = await supabase.functions.invoke('generate-proposal', {
    body: { formData, userProfile },
  })
  if (error) throw new Error(error.message)
  const body = data as { success?: boolean; error?: string; data?: unknown }
  if (!body?.success) throw new Error(body?.error || 'Generation failed')
  return body.data
}

export async function generateFollowUp(
  proposal: unknown,
  userProfile: unknown,
  daysSinceSent: number
) {
  const { data, error } = await supabase.functions.invoke('generate-followup', {
    body: { proposal, userProfile, daysSinceSent },
  })
  if (error) throw new Error(error.message)
  const body = data as { success?: boolean; error?: string; data?: unknown }
  if (!body?.success) throw new Error(body?.error || 'Follow-up failed')
  return body.data
}

export async function improveSection(
  section: string,
  currentContent: string,
  context: unknown
) {
  const { data, error } = await supabase.functions.invoke('improve-proposal', {
    body: { section, currentContent, context },
  })
  if (error) throw new Error(error.message)
  const body = data as { success?: boolean; error?: string; data?: unknown }
  if (!body?.success) throw new Error(body?.error || 'Improve failed')
  return body.data
}

export async function sendEmail(payload: {
  to: string
  type: string
  data: Record<string, string>
}) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: payload,
  })
  if (error) throw new Error(error.message)
  return data
}
