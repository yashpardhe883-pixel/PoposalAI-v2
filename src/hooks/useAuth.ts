import { useAuthStore } from '@/store/authStore'

/** Auth state from Zustand. Call `useAuthStore.getState().init()` once at app root (see App.tsx). */
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)
  const signOut = useAuthStore((s) => s.signOut)

  return { user, session, profile, loading, signOut }
}
