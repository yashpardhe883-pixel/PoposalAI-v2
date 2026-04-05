import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()
        if (!profile) {
          const meta = session.user.user_metadata as Record<string, string>
          await supabase.from('profiles').insert({
            id: session.user.id,
            full_name: meta.full_name || meta.name || session.user.email?.split('@')[0],
            logo_url: meta.avatar_url,
          })
        }
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })()
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
