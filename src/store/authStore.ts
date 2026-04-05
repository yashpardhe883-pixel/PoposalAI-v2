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
  logout: () => Promise<void>
  // aliases so other files dont break
  init: () => void
  signOut: () => Promise<void>
  fetchProfile: (id: string) => Promise<void>
  setSession: (session: any) => void
  session: any
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setSession: (session) => set({ session, user: session?.user || null }),

  fetchProfile: async (id: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    set({ profile: data })
  },

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ user: session.user, session })
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

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user, session })
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            set({ profile: data, loading: false })
          })
      } else {
        set({ user: null, profile: null, session: null, loading: false })
      }
    })
  },

  // aliases
  init: () => get().initialize(),
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },
}))