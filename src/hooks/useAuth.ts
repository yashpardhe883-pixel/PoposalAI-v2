import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)
  const init = useAuthStore((s) => s.init)
  const signOut = useAuthStore((s) => s.signOut)

  useEffect(() => {
    void init()
  }, [init])

  return { user, session, profile, loading, signOut }
}
