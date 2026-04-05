import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Mail,
  Briefcase,
  FileText,
  DollarSign,
  Calendar,
  Palette,
  Coins,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generateProposal } from '@/lib/gemini'
import { useAuthStore } from '@/store/authStore'
import { usePlan } from '@/hooks/usePlan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { UpgradeModal } from '@/components/features/UpgradeModal'
import { toast } from '@/hooks/use-toast'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  client_name: z.string().min(1, 'Client name required'),
  client_email: z.union([z.literal(''), z.string().email()]),
  project_type: z.string().min(1, 'Select project type'),
  project_description: z.string().min(50, 'At least 50 characters'),
  budget: z.string().min(1, 'Budget required'),
  deadline: z.string().min(1, 'Deadline required'),
  tone: z.string().min(1),
  currency: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

const projectTypes = [
  'Web Design',
  'Mobile App',
  'Branding',
  'Marketing Retainer',
  'Consulting',
  'Video Production',
  'Other',
]

const tones = ['professional', 'friendly', 'bold', 'creative']
const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD']

const loadingMessages = [
  '✦ Reading your project details...',
  '✦ Writing your executive summary...',
  '✦ Building your scope of work...',
  '✦ Crafting your pricing table...',
  '✦ Adding the finishing touches...',
  '✦ Almost ready...',
]

export default function SmartMode() {
  const navigate = useNavigate()
  const location = useLocation() as {
    state?: { templateId?: string; projectType?: string; description?: string }
  }
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const { canGenerateProposal } = usePlan()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)

  const defaultValues = useMemo(
    () => ({
      title: '',
      client_name: '',
      client_email: '',
      project_type: location.state?.projectType || '',
      project_description: location.state?.description || '',
      budget: '',
      deadline: '',
      tone: profile?.default_tone || 'professional',
      currency: profile?.default_currency || 'USD',
    }),
    [profile, location.state]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onSubmit',
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % loadingMessages.length)
    }, 1500)
    return () => clearInterval(t)
  }, [loading])

  const clientName = form.watch('client_name')
  const projectType = form.watch('project_type')
  useEffect(() => {
    if (!form.getValues('title') && clientName && projectType) {
      form.setValue('title', `Proposal for ${clientName} — ${projectType}`)
    }
  }, [clientName, projectType, form])

  const onSubmit = async (values: FormValues) => {
    if (!canGenerateProposal) {
      setUpgradeOpen(true)
      return
    }
    if (!user?.id || !profile) return
    setLoading(true)
    try {
      const formData = {
        ...values,
        client_email: values.client_email || undefined,
      }
      const userProfile = {
        company_name: profile.company_name,
        full_name: profile.full_name,
        industry: profile.industry,
        services: profile.services,
        default_currency: profile.default_currency,
        default_tone: profile.default_tone,
      }
      const data = (await generateProposal(formData, userProfile)) as Record<
        string,
        unknown
      >

      const { data: inserted, error } = await supabase
        .from('proposals')
        .insert({
          user_id: user.id,
          title: (data.title as string) || values.title,
          client_name: values.client_name,
          client_email: values.client_email || null,
          project_type: values.project_type,
          project_description: values.project_description,
          budget: values.budget,
          deadline: values.deadline,
          tone: values.tone,
          mode: 'smart',
          template_id: location.state?.templateId || null,
          content: data as Record<string, unknown>,
          status: 'draft',
          score: (data.score as number) || 0,
          score_feedback: (data.score_feedback as unknown[]) || [],
        })
        .select('id')
        .single()

      if (error) throw error

      const used = (profile.proposals_used_this_month || 0) + 1
      await supabase
        .from('profiles')
        .update({ proposals_used_this_month: used })
        .eq('id', user.id)
      await fetchProfile()

      toast({ title: 'Proposal generated', description: 'Opening editor…' })
      navigate(`/proposals/${inserted.id}`)
    } catch (e) {
      toast({
        title: 'Generation failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const errs = form.formState.errors
  const errCount = Object.keys(errs).length

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <Link
        to="/proposals/new"
        className="text-sm text-muted-foreground hover:text-[#d4a843] inline-block mb-6"
      >
        ← Back
      </Link>
      <div className="grid lg:grid-cols-[55%_45%] gap-8 items-start">
        <div>
          <p className="text-xs font-mono text-[#d4a843] mb-2">
            Step 1 of 2 — Fill Details
          </p>
          <h1 className="font-fraunces text-3xl mb-6">Smart proposal</h1>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {errCount > 0 && (
              <p className="text-sm text-[#e8673a]">
                Please fix {errCount} field{errCount > 1 ? 's' : ''} below.
              </p>
            )}
            <Field
              label="Proposal Title"
              icon={<FileText className="h-4 w-4" />}
              error={errs.title?.message}
            >
              <Input {...form.register('title')} />
            </Field>
            <Field
              label="Client Name *"
              icon={<User className="h-4 w-4" />}
              error={errs.client_name?.message}
            >
              <Input {...form.register('client_name')} />
            </Field>
            <Field
              label="Client Email"
              icon={<Mail className="h-4 w-4" />}
              error={errs.client_email?.message}
            >
              <Input type="email" {...form.register('client_email')} />
            </Field>
            <Field
              label="Project Type *"
              icon={<Briefcase className="h-4 w-4" />}
              error={errs.project_type?.message}
            >
              <Select
                value={form.watch('project_type')}
                onValueChange={(v) => form.setValue('project_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Project Description *"
              icon={<FileText className="h-4 w-4" />}
              error={errs.project_description?.message}
            >
              <Textarea
                {...form.register('project_description')}
                placeholder="Describe goals, constraints, audience, success metrics, and any specifics the client shared."
                className="min-h-[140px]"
              />
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {form.watch('project_description')?.length || 0} / 50+ characters
              </p>
            </Field>
            <Field
              label="Budget *"
              icon={<DollarSign className="h-4 w-4" />}
              error={errs.budget?.message}
            >
              <Input {...form.register('budget')} placeholder="$3,000" />
            </Field>
            <Field
              label="Deadline *"
              icon={<Calendar className="h-4 w-4" />}
              error={errs.deadline?.message}
            >
              <Input {...form.register('deadline')} placeholder="6 weeks" />
            </Field>
            <Field
              label="Tone *"
              icon={<Palette className="h-4 w-4" />}
              error={errs.tone?.message}
            >
              <Select
                value={form.watch('tone')}
                onValueChange={(v) => form.setValue('tone', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Currency"
              icon={<Coins className="h-4 w-4" />}
              error={errs.currency?.message}
            >
              <Select
                value={form.watch('currency')}
                onValueChange={(v) => form.setValue('currency', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Button type="submit" size="lg" className="w-full text-base">
              ✦ Generate My Proposal →
            </Button>
          </form>
        </div>
        <div className="space-y-4 lg:sticky lg:top-6">
          <Card className="border-[#d4a843]/20">
            <CardContent className="pt-6">
              <h3 className="font-fraunces text-lg mb-4">
                Pro Tips for Better Proposals
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>1. Be specific about the client&apos;s problem and outcome.</li>
                <li>2. Include a clear budget range or anchor.</li>
                <li>3. List concrete deliverables you&apos;ll own end-to-end.</li>
                <li>4. State timeline expectations in plain language.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        featureName="more proposals"
        description="Free plan includes 5 proposals per month. Upgrade for unlimited."
      />

      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0908]/95 gap-6">
          <div className="h-16 w-16 rounded-full border-2 border-[#d4a843]/30 border-t-[#d4a843] animate-spin" />
          <p className="font-fraunces text-lg text-center px-4">
            {loadingMessages[msgIdx]}
          </p>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string
  icon: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="text-xs text-[#e8673a] mt-1">{error}</p>}
    </div>
  )
}
