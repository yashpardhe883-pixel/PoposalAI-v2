import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

function loginWithError(navigate: ReturnType<typeof useNavigate>, message: string) {
  navigate(`/login?error=${encodeURIComponent(message)}`, { replace: true })
}

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const error = params.get('error')
        const error_description = params.get('error_description')

        if (error) {
          throw new Error(error_description || error)
        }

        // Wait a bit for Supabase auto-exchange if code is present
        let session = null
        for (let i = 0; i < 20; ++i) {
          const { data } = await supabase.auth.getSession()
          if (data.session?.user) {
            session = data.session
            break
          }
          await new Promise((r) => setTimeout(r, 100))
        }

        if (!session?.user) {
          throw new Error('No session after sign-in')
        }

        if (cancelled) return

        const store = useAuthStore.getState()
        store.setSession(session)
        store.setUser(session.user)

        const { data: existing, error: selectError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()

        if (selectError) throw selectError

        if (!existing) {
          const meta = session.user.user_metadata as Record<string, string | undefined>
          const { error: insertError } = await supabase.from('profiles').insert({
            id: session.user.id,
            full_name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
            logo_url: meta.avatar_url ?? null,
          })
          if (insertError) throw insertError
        }

        await store.fetchProfile()
        store.setLoading(false)
        navigate('/dashboard', { replace: true })
      } catch (e) {
        useAuthStore.getState().setLoading(false)
        const message = e instanceof Error ? e.message : 'Sign-in failed'
        loginWithError(navigate, message)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0908]">
      <Link to="/" className="font-fraunces text-2xl">
        Proposal<span className="text-[#d4a843]">AI</span>
      </Link>
      <div className="h-10 w-10 rounded-full border-2 border-[#d4a843]/30 border-t-[#d4a843] animate-spin" />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}
