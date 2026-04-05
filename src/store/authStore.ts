import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: any
  profile: any
  loading: boolean
  setUser: (user: any) => void
  setProfile: (profile: any) => void
  setLoading: (loading: boolean) => void
  initialize: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  initialize: () => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ user: session.user })
        // Fetch profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            set({ profile: data, loading: false })
          })
      } else {
        set({ loading: false })
      }
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user })
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            set({ profile: data, loading: false })
          })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))