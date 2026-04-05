import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useProposalStore } from '@/store/proposalStore'
import type { Database } from '@/types/database'

type ProposalRow = Database['public']['Tables']['proposals']['Row']

export function useProposals() {
  const user = useAuthStore((s) => s.user)
  const { proposals, setProposals } = useProposalStore()
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setProposals([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setProposals(data as ProposalRow[])
    setLoading(false)
  }, [user, setProposals])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { proposals, loading, refresh }
}
