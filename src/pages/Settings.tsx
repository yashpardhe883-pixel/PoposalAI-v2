import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { usePlan } from '@/hooks/usePlan'
import { createCheckoutSession, createBillingPortalSession } from '@/lib/stripe'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import type { Database } from '@/types/database'

type TeamRow = Database['public']['Tables']['team_members']['Row']

const proMonthly = import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID as string | undefined
const proAnnual = import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID as string | undefined
const agencyMonthly = import.meta.env.VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID as string | undefined
const agencyAnnual = import.meta.env.VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID as string | undefined

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const {
    canUseBranding,
    canUseTeam,
    isAgency,
    isFree,
  } = usePlan()
  const [sp] = useSearchParams()
  const [tab, setTab] = useState(sp.get('tab') || 'profile')

  useEffect(() => {
    const t = sp.get('tab')
    if (t) setTab(t)
    if (sp.get('success') === 'true') {
      toast({
        title: 'Subscription updated',
        description: 'Thanks! Your plan will sync in a moment.',
      })
      void fetchProfile()
    }
  }, [sp, fetchProfile])

  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [services, setServices] = useState('')
  const [brandColor, setBrandColor] = useState('#d4a843')
  const [watermark, setWatermark] = useState(true)
  const [team, setTeam] = useState<TeamRow[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [emailOnView, setEmailOnView] = useState(true)
  const [emailOnSign, setEmailOnSign] = useState(true)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name || '')
    setCompany(profile.company_name || '')
    setIndustry(profile.industry || '')
    setServices((profile.services || []).join(', '))
    setBrandColor(profile.brand_color || '#d4a843')
  }, [profile])

  useEffect(() => {
    if (!user?.id || !isAgency) return
    ;(async () => {
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('agency_id', user.id)
      setTeam((data as TeamRow[]) || [])
    })()
  }, [user?.id, isAgency])

  const saveProfile = async () => {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        company_name: company,
        industry,
        services: services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .eq('id', user.id)
    if (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    await fetchProfile()
    toast({ title: 'Profile saved' })
  }

  const saveBranding = async () => {
    if (!user || !canUseBranding) return
    const { error } = await supabase
      .from('profiles')
      .update({ brand_color: brandColor })
      .eq('id', user.id)
    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    await fetchProfile()
    toast({ title: 'Branding updated' })
  }

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const path = `${user.id}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true })
    if (upErr) {
      toast({
        title: 'Upload failed',
        description: upErr.message,
        variant: 'destructive',
      })
      return
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('logos').getPublicUrl(path)
    await supabase.from('profiles').update({ logo_url: publicUrl }).eq('id', user.id)
    await fetchProfile()
    toast({ title: 'Logo uploaded' })
  }

  const checkout = async (priceId: string | undefined, plan: string, cycle: string) => {
    if (!user || !priceId) {
      toast({
        title: 'Missing price ID',
        description: 'Set Stripe price env vars in .env',
        variant: 'destructive',
      })
      return
    }
    try {
      await createCheckoutSession({
        priceId,
        userId: user.id,
        plan,
        billingCycle: cycle,
        customerEmail: user.email ?? undefined,
      })
    } catch (e) {
      toast({
        title: 'Checkout error',
        description: e instanceof Error ? e.message : 'Error',
        variant: 'destructive',
      })
    }
  }

  const portal = async () => {
    try {
      await createBillingPortalSession()
    } catch (e) {
      toast({
        title: 'Portal unavailable',
        description: e instanceof Error ? e.message : 'Deploy create-billing-portal',
        variant: 'destructive',
      })
    }
  }

  const inviteMember = async () => {
    if (!user || !inviteEmail.trim()) return
    const { error } = await supabase.from('team_members').insert({
      agency_id: user.id,
      member_email: inviteEmail.trim(),
      role: 'member',
      status: 'pending',
    })
    if (error) {
      toast({
        title: 'Invite failed',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    setInviteEmail('')
    toast({ title: 'Invitation sent' })
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('agency_id', user.id)
    setTeam((data as TeamRow[]) || [])
  }

  const saveNotifications = () => {
    localStorage.setItem(
      'proposalai_notifications',
      JSON.stringify({ emailOnView, emailOnSign })
    )
    toast({ title: 'Notification preferences saved' })
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('proposalai_notifications')
      if (raw) {
        const j = JSON.parse(raw) as { emailOnView?: boolean; emailOnSign?: boolean }
        if (typeof j.emailOnView === 'boolean') setEmailOnView(j.emailOnView)
        if (typeof j.emailOnSign === 'boolean') setEmailOnSign(j.emailOnSign)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const used = profile?.proposals_used_this_month ?? 0

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-fraunces text-3xl">Settings</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-fraunces">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  className="mt-1"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  className="mt-1"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Input
                  className="mt-1"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div>
                <Label>Services (comma-separated)</Label>
                <Input
                  className="mt-1"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                />
              </div>
              <Button onClick={() => void saveProfile()}>Save profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-fraunces">Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canUseBranding ? (
                <p className="text-sm text-muted-foreground">
                  Branding is available on Pro and Agency plans.
                </p>
              ) : (
                <>
                  <div>
                    <Label>Logo upload</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      className="mt-1"
                      onChange={(e) => void uploadLogo(e)}
                    />
                  </div>
                  <div>
                    <Label>Brand color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-14 h-10 p-1"
                      />
                      <Input
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Watermark on PDF (Free preview)</Label>
                    <Switch checked={watermark} onCheckedChange={setWatermark} />
                  </div>
                  <div
                    className="rounded-lg border p-4 text-sm"
                    style={{
                      borderColor: brandColor,
                      background: `${brandColor}18`,
                    }}
                  >
                    Live preview — headers and accents use your brand color.
                  </div>
                  <Button onClick={() => void saveBranding()}>
                    Save branding
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-fraunces">Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Current plan:{' '}
                <span className="font-mono text-[#d4a843] capitalize">
                  {profile?.plan || 'free'}
                </span>
              </p>
              {isFree && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Usage: {used} proposals this month
                  </p>
                  <Progress value={Math.min(100, (used / 5) * 100)} />
                </>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => void checkout(proMonthly, 'pro', 'monthly')}
                >
                  Pro Monthly
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void checkout(proAnnual, 'pro', 'annual')}
                >
                  Pro Annual
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void checkout(agencyMonthly, 'agency', 'monthly')}
                >
                  Agency Monthly
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void checkout(agencyAnnual, 'agency', 'annual')}
                >
                  Agency Annual
                </Button>
              </div>
              {!isFree && (
                <Button variant="outline" onClick={() => void portal()}>
                  Open Stripe Customer Portal
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-fraunces">Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canUseTeam ? (
                <p className="text-sm text-muted-foreground">
                  Team seats are available on the Agency plan.
                </p>
              ) : (
                <>
                  <p className="text-xs font-mono text-muted-foreground">
                    Seats: {team.length} members
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="member@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button onClick={() => void inviteMember()}>Invite</Button>
                  </div>
                  <ul className="text-sm space-y-2">
                    {team.map((m) => (
                      <li
                        key={m.id}
                        className="flex justify-between border border-white/10 rounded-md px-3 py-2"
                      >
                        <span>{m.member_email}</span>
                        <span className="text-muted-foreground capitalize">
                          {m.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-fraunces">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email when proposal is viewed</Label>
                <Switch checked={emailOnView} onCheckedChange={setEmailOnView} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Email when proposal is signed</Label>
                <Switch checked={emailOnSign} onCheckedChange={setEmailOnSign} />
              </div>
              <Button onClick={saveNotifications}>Save preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
