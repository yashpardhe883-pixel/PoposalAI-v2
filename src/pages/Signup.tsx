import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'

function strength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const str = useMemo(() => strength(password), [password])
  const strLabel =
    str <= 1 ? 'Weak' : str === 2 ? 'Fair' : str >= 3 ? 'Strong' : 'Weak'
  const strPct = [0, 25, 50, 75, 100][str] ?? 0

  const google = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast({
        title: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }
    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Use at least 8 characters.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setLoading(false)
    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    toast({ title: 'Welcome to ProposalAI! 🎉' })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0908] px-4 py-10">
      <Card className="w-full max-w-[400px] border-white/10">
        <CardHeader className="text-center space-y-2">
          <Link to="/" className="font-fraunces text-2xl mx-auto">
            Proposal<span className="text-[#d4a843]">AI</span>
          </Link>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="secondary"
            className="w-full bg-white text-[#0a0908] hover:bg-white/90"
            onClick={() => void google()}
          >
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-[#161410] px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                className="mt-1"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input
                  className="pr-10"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Strength</span>
                  <span
                    className={
                      str <= 1
                        ? 'text-[#e8673a]'
                        : str === 2
                          ? 'text-[#d4a843]'
                          : 'text-[#2dd4b0]'
                    }
                  >
                    {strLabel}
                  </span>
                </div>
                <Progress value={strPct} className="h-1.5" />
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                className="mt-1"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account →'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-[#d4a843] hover:underline">
              Log in →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
