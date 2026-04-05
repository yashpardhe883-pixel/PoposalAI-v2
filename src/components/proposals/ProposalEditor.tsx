import { useCallback, useState } from 'react'
import { GripVertical, Plus, Trash2, Sparkles } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { ProposalContent, TimelinePhase, PricingRow } from '@/types/proposal'
import { improveSection } from '@/lib/gemini'
import { toast } from '@/hooks/use-toast'

type Ctx = {
  client_name: string
  project_type: string
  tone: string
}

export function ProposalEditor({
  content,
  onChange,
  context,
}: {
  content: ProposalContent
  onChange: (c: ProposalContent) => void
  context: Ctx
}) {
  const patch = useCallback(
    (p: Partial<ProposalContent>) => onChange({ ...content, ...p }),
    [content, onChange]
  )

  const improve = async (section: string, current: string, setter: (t: string) => void) => {
    try {
      const text = (await improveSection(section, current, context)) as string
      setter(text)
      toast({ title: 'Section improved', description: section })
    } catch (e) {
      toast({
        title: 'AI improve failed',
        description: e instanceof Error ? e.message : 'Error',
        variant: 'destructive',
      })
    }
  }

  return (
    <Accordion type="multiple" defaultValue={['exec', 'scope']} className="w-full">
      <SectionText
        id="exec"
        title="Executive Summary"
        value={content.executive_summary || ''}
        onChange={(v) => patch({ executive_summary: v })}
        onImprove={() =>
          void improve('Executive Summary', content.executive_summary || '', (t) =>
            patch({ executive_summary: t })
          )
        }
      />
      <SectionText
        id="understanding"
        title="Understanding"
        value={content.understanding || ''}
        onChange={(v) => patch({ understanding: v })}
        onImprove={() =>
          void improve('Understanding', content.understanding || '', (t) =>
            patch({ understanding: t })
          )
        }
      />
      <ListSection
        title="Scope of Work"
        items={content.scope || []}
        onChange={(scope) => patch({ scope })}
        onImproveAll={async () => {
          const joined = (content.scope || []).join('\n')
          const t = (await improveSection('Scope list', joined, context)) as string
          patch({ scope: t.split('\n').filter(Boolean) })
        }}
      />
      <ListSection
        title="Exclusions"
        items={content.exclusions || []}
        onChange={(exclusions) => patch({ exclusions })}
      />
      <TimelineSection
        rows={content.timeline || []}
        onChange={(timeline) => patch({ timeline })}
      />
      <PricingSection
        rows={content.pricing || []}
        total={content.total || ''}
        onChange={(pricing, total) => patch({ pricing, total })}
      />
      <SectionText
        id="pay"
        title="Payment Terms"
        value={content.payment_terms || ''}
        onChange={(v) => patch({ payment_terms: v })}
        onImprove={() =>
          void improve('Payment terms', content.payment_terms || '', (t) =>
            patch({ payment_terms: t })
          )
        }
      />
      <SectionText
        id="why"
        title="Why Choose Us"
        value={content.why_us || ''}
        onChange={(v) => patch({ why_us: v })}
        onImprove={() =>
          void improve('Why choose us', content.why_us || '', (t) =>
            patch({ why_us: t })
          )
        }
      />
      <ListSection
        title="Terms"
        items={content.terms || []}
        onChange={(terms) => patch({ terms })}
      />
      <SectionText
        id="next"
        title="Next Steps"
        value={content.next_steps || ''}
        onChange={(v) => patch({ next_steps: v })}
        onImprove={() =>
          void improve('Next steps', content.next_steps || '', (t) =>
            patch({ next_steps: t })
          )
        }
      />
    </Accordion>
  )
}

function SectionText({
  id,
  title,
  value,
  onChange,
  onImprove,
}: {
  id: string
  title: string
  value: string
  onChange: (v: string) => void
  onImprove?: () => void
}) {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px]"
        />
        {onImprove && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={onImprove}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Improve with AI
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

function ListSection({
  title,
  items,
  onChange,
  onImproveAll,
}: {
  title: string
  items: string[]
  onChange: (items: string[]) => void
  onImproveAll?: () => void
}) {
  const id = title.toLowerCase().replace(/\s/g, '')
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <AccordionItem value={id}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex flex-col gap-0.5 pt-2 text-muted-foreground">
              <button
                type="button"
                aria-label="Move up"
                onClick={() => move(i, -1)}
                className="hover:text-foreground"
              >
                <GripVertical className="h-4 w-4 rotate-90" />
              </button>
            </div>
            <Textarea
              value={item}
              onChange={(e) => {
                const next = [...items]
                next[i] = e.target.value
                onChange(next)
              }}
              className="flex-1 min-h-[56px]"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, ''])}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add item
        </Button>
        {onImproveAll && (
          <Button type="button" variant="secondary" size="sm" onClick={onImproveAll}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Improve list with AI
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

function TimelineSection({
  rows,
  onChange,
}: {
  rows: TimelinePhase[]
  onChange: (r: TimelinePhase[]) => void
}) {
  const update = (i: number, p: Partial<TimelinePhase>) => {
    const next = [...rows]
    next[i] = { ...next[i], ...p }
    onChange(next)
  }

  return (
    <AccordionItem value="timeline">
      <AccordionTrigger>Timeline</AccordionTrigger>
      <AccordionContent className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-md border border-white/10 p-3 space-y-2">
            <Input
              value={row.phase}
              onChange={(e) => update(i, { phase: e.target.value })}
              placeholder="Phase"
            />
            <Input
              value={row.duration}
              onChange={(e) => update(i, { duration: e.target.value })}
              placeholder="Duration"
            />
            <Textarea
              value={row.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Description"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            >
              Remove phase
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...rows,
              { phase: '', duration: '', description: '' },
            ])
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Add phase
        </Button>
      </AccordionContent>
    </AccordionItem>
  )
}

function PricingSection({
  rows,
  total,
  onChange,
}: {
  rows: PricingRow[]
  total: string
  onChange: (rows: PricingRow[], total: string) => void
}) {
  const [autoTotal, setAutoTotal] = useState(false)

  const sumAmounts = useCallback((list: PricingRow[]) => {
    const nums = list.map((r) => {
      const m = r.amount.replace(/[^0-9.]/g, '')
      return parseFloat(m) || 0
    })
    const sum = nums.reduce((a, b) => a + b, 0)
    return sum > 0 ? `$${sum.toLocaleString()}` : ''
  }, [])

  const push = useCallback(
    (nextRows: PricingRow[], nextTotal?: string) => {
      const t =
        autoTotal && nextTotal === undefined
          ? sumAmounts(nextRows) || total
          : (nextTotal ?? total)
      onChange(nextRows, t)
    },
    [autoTotal, onChange, sumAmounts, total]
  )

  const updateRow = (i: number, p: Partial<PricingRow>) => {
    const next = [...rows]
    next[i] = { ...next[i], ...p }
    push(next)
  }

  return (
    <AccordionItem value="pricing">
      <AccordionTrigger>Pricing</AccordionTrigger>
      <AccordionContent className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-mono">
          <input
            type="checkbox"
            checked={autoTotal}
            onChange={(e) => {
              const on = e.target.checked
              setAutoTotal(on)
              if (on) {
                const nextT = sumAmounts(rows)
                onChange(rows, nextT || total)
              }
            }}
          />
          Auto-sum total from amounts
        </label>
        {rows.map((row, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-3">
            <Input
              value={row.item}
              onChange={(e) => updateRow(i, { item: e.target.value })}
              placeholder="Item"
            />
            <Input
              value={row.description}
              onChange={(e) => updateRow(i, { description: e.target.value })}
              placeholder="Description"
            />
            <div className="flex gap-1">
              <Input
                value={row.amount}
                onChange={(e) => updateRow(i, { amount: e.target.value })}
                placeholder="Amount"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => push(rows.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            push([...rows, { item: '', description: '', amount: '' }])
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Add row
        </Button>
        <div>
          <label className="text-xs font-mono text-muted-foreground">Total</label>
          <Input
            className="mt-1 font-mono"
            value={total}
            onChange={(e) => onChange(rows, e.target.value)}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
