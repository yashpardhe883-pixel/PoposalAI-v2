import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'

export function useProposalRealtime() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('proposals-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'proposals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const oldRow = payload.old as { view_count?: number } | null
          const newRow = payload.new as {
            view_count?: number
            client_name?: string
            id?: string
          }
          if (
            newRow.view_count != null &&
            oldRow?.view_count != null &&
            newRow.view_count > oldRow.view_count
          ) {
            toast({
              title: `🔔 ${newRow.client_name || 'A client'} is viewing your proposal!`,
              description: 'Now is the perfect time to follow up.',
              duration: 8000,
              action: (
                <ToastAction
                  altText="View"
                  onClick={() =>
                    newRow.id && navigate(`/proposals/${newRow.id}`)
                  }
                >
                  View
                </ToastAction>
              ),
            })
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user?.id, navigate])
}
