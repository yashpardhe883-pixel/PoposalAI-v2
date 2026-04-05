import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { generateFollowUp } from '@/lib/gemini'

export function FollowUpModal({
  open,
  onOpenChange,
  proposal,
  userProfile,
  daysSinceSent,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  proposal: Record<string, unknown>
  userProfile: Record<string, unknown>
  daysSinceSent: number
}) {
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const generate = async () => {
    setLoading(true)
    try {
      const data = (await generateFollowUp(
        proposal,
        userProfile,
        daysSinceSent
      )) as { subject?: string; body?: string }
      setSubject(data.subject || '')
      setBody(data.body || '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-fraunces">AI Follow-up Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void generate()}
            disabled={loading}
          >
            {loading ? 'Generating…' : '✦ Generate with AI'}
          </Button>
          <div>
            <label className="text-xs font-mono text-muted-foreground">
              Subject
            </label>
            <Textarea
              className="mt-1 min-h-[44px]"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground">
              Body
            </label>
            <Textarea
              className="mt-1 min-h-[160px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              void navigator.clipboard.writeText(`${subject}\n\n${body}`)
            }}
            disabled={!subject && !body}
          >
            Copy to clipboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
