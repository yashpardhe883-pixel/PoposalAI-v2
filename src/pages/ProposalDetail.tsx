import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  FileDown,
  Link2,
  Mail,
  PenLine,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { usePlan } from '@/hooks/usePlan'
import {
  parseProposalContent,
  type ProposalContent,
  type ProposalStatus,
} from '@/types/proposal'
import { improveSection } from '@/lib/gemini'
import { exportProposalPDFFromElement } from '@/lib/pdf'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProposalEditor } from '@/components/proposals/ProposalEditor'
import { ProposalPreview } from '@/components/proposals/ProposalPreview'
import { ProposalPDF } from '@/components/proposals/ProposalPDF'
import { ScoreRing } from '@/components/features/ScoreRing'
import { FollowUpModal } from '@/components/features/FollowUpModal'
import { UpgradeModal } from '@/components/features/UpgradeModal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import type { Database } from '@/types/database'
import type { ScoreFeedbackItem } from '@/types/proposal'

type Row = Database['public']['Tables']['proposals']['Row']

const statuses: ProposalStatus[] = [
  'draft',
  'sent',
  'viewed',
  'signed',
  'won',
  'lost',
]

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const [row, setRow] = useState<Row | null>(null)
  const [content, setContent] = useState<ProposalContent>({})
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<string>('draft')
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  )
  const [pdfBusy, setPdfBusy] = useState(false)
  const [followOpen, setFollowOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState('')
  const pdfRef = useRef<HTMLDivElement>(null)
  const previewDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    isFree,
    canUseEsignature: _es,
    isPro,
  } = usePlan()

  const load = useCallback(async () => {
    if (!id || !user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    setLoading(false)
    if (error || !data) {
      toast({
        title: 'Proposal not found',
        variant: 'destructive',
      })
      return
    }
    const r = data as Row
    setRow(r)
    setTitle(r.title)
    setStatus(r.status)
    setContent(parseProposalContent(r.content))
  }, [id, user])

  useEffect(() => {
    void load()
  }, [load])

  const persist = useCallback(
    async (patch: Partial<Row>) => {
      if (!id) return
      setSaveState('saving')
      const { error } = await supabase.from('proposals').update(patch).eq('id', id)
      if (error) {
        setSaveState('idle')
        toast({
          title: 'Save failed',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    },
    [id]
  )

  useEffect(() => {
    if (!row || loading) return
    if (saveDebounce.current) clearTimeout(saveDebounce.current)
    saveDebounce.current = setTimeout(() => {
      void persist({
        title,
        status,
        content: content as unknown as Row['content'],
        score: content.score ?? row.score,
        score_feedback: JSON.parse(
          JSON.stringify(content.score_feedback || [])
        ) as Row['score_feedback'],
      })
    }, 30000)
    return () => {
      if (saveDebounce.current) clearTimeout(saveDebounce.current)
    }
  }, [content, title, status, row, loading, persist])

  const onContentChange = (c: ProposalContent) => {
    setContent(c)
    if (previewDebounce.current) clearTimeout(previewDebounce.current)
    previewDebounce.current = setTimeout(() => {
      /* preview updates from state */
    }, 300)
  }

  const mergedContent = useMemo(() => {
    return { ...content, title: title || content.title }
  }, [content, title])

  const copyLink = async () => {
    if (!row?.share_token) return
    const url = `${window.location.origin}/p/${row.share_token}`
    await navigator.clipboard.writeText(url)
    toast({ title: 'Share link copied' })
  }

  const exportPdf = async () => {
    if (!pdfRef.current || !row) return
    setPdfBusy(true)
    try {
      await exportProposalPDFFromElement(
        pdfRef.current,
        `${row.client_name.replace(/\s+/g, '-')}-Proposal.pdf`
      )
    } catch (e) {
      toast({
        title: 'PDF export failed',
        description: e instanceof Error ? e.message : 'Error',
        variant: 'destructive',
      })
    } finally {
      setPdfBusy(false)
    }
  }

  const improveScore = async () => {
    try {
      const summary = JSON.stringify(content).slice(0, 8000)
      const text = (await improveSection(
        'Full proposal polish',
        summary,
        {
          client_name: row?.client_name,
          project_type: row?.project_type,
          tone: row?.tone,
        }
      )) as string
      toast({
        title: 'Suggestions',
        description: text.slice(0, 200) + (text.length > 200 ? '…' : ''),
      })
    } catch (e) {
      toast({
        title: 'AI error',
        description: e instanceof Error ? e.message : 'Error',
        variant: 'destructive',
      })
    }
  }

  const feedback = (content.score_feedback || []) as ScoreFeedbackItem[]

  if (loading || !row) {
    return (
      <div className="p-8 text-muted-foreground font-mono text-sm">
        Loading proposal…
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] md:min-h-screen">
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#0a0908]/95 backdrop-blur-md py-3 px-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#d4a843]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <input
          className="flex-1 min-w-[160px] bg-transparent font-fraunces text-lg border-none outline-none focus:ring-0"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
          {saveState === 'saving' && 'Saving…'}
          {saveState === 'saved' && 'Saved ✓'}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            void persist({
              title,
              status,
              content: content as unknown as Row['content'],
            })
          }
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={() => void exportPdf()} disabled={pdfBusy}>
          <FileDown className="h-4 w-4 mr-1" />
          {pdfBusy ? '…' : 'PDF'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void copyLink()}>
          <Link2 className="h-4 w-4 mr-1" />
          Copy Link
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            isPro
              ? setFollowOpen(true)
              : (setUpgradeFeature('Follow-up emails'), setUpgradeOpen(true))
          }
        >
          <Mail className="h-4 w-4 mr-1" />
          Email
          {isFree && <span className="ml-1 text-[10px]">Pro</span>}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            isPro
              ? toast({
                  title: 'Signature',
                  description: 'Share the public link — clients sign there.',
                })
              : (setUpgradeFeature('E-signature'), setUpgradeOpen(true))
          }
        >
          <PenLine className="h-4 w-4 mr-1" />
          Signature
          {isFree && <span className="ml-1 text-[10px]">Pro</span>}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void improveScore()}>
              Improve overall (AI)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void copyLink()}>
              Copy client link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border-b border-white/10 bg-[#111009] px-4 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <ScoreRing score={content.score ?? row.score ?? 0} size={80} />
          <div className="flex-1 min-w-[200px]">
            <p className="font-fraunces text-lg">Proposal Score</p>
            <ul className="mt-2 space-y-1 text-sm max-h-24 overflow-y-auto">
              {feedback.map((f, i) => (
                <li
                  key={i}
                  className={
                    f.type === 'strength' ? 'text-[#2dd4b0]' : 'text-[#d4a843]'
                  }
                >
                  {f.type === 'strength' ? '✅ ' : '⚠ '}
                  {f.message}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="secondary" onClick={() => void improveScore()}>
            <Sparkles className="h-4 w-4 mr-1" />
            ✦ Improve with AI →
          </Button>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[55%_45%] flex-1 min-h-0 divide-x divide-white/10">
        <div className="overflow-y-auto scrollbar-thin p-4 max-h-[calc(100vh-200px)]">
          <ProposalEditor
            content={content}
            onChange={onContentChange}
            context={{
              client_name: row.client_name,
              project_type: row.project_type || '',
              tone: row.tone || 'professional',
            }}
          />
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)] sticky top-[200px] self-start">
          <ProposalPreview
            content={mergedContent}
            profile={profile}
            clientName={row.client_name}
          />
        </div>
      </div>

      <div className="lg:hidden flex-1 p-4">
        <Tabs defaultValue="edit">
          <TabsList className="w-full">
            <TabsTrigger value="edit" className="flex-1">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            <ProposalEditor
              content={content}
              onChange={onContentChange}
              context={{
                client_name: row.client_name,
                project_type: row.project_type || '',
                tone: row.tone || 'professional',
              }}
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <ProposalPreview
              content={mergedContent}
              profile={profile}
              clientName={row.client_name}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
        <ProposalPDF
          ref={pdfRef}
          content={mergedContent}
          profile={profile}
          clientName={row.client_name}
          showWatermark={isFree}
        />
      </div>

      <FollowUpModal
        open={followOpen}
        onOpenChange={setFollowOpen}
        proposal={row}
        userProfile={profile || {}}
        daysSinceSent={3}
      />
      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        featureName={upgradeFeature}
      />
    </div>
  )
}
