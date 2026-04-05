import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export function SignatureModal({
  open,
  onOpenChange,
  title,
  onSign,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  onSign: (payload: {
    signerName: string
    signatureDataUrl: string | null
    typed: boolean
  }) => void | Promise<void>
}) {
  const sigRef = useRef<SignatureCanvas>(null)
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [tab, setTab] = useState('draw')

  const canSubmit = name.trim().length > 0 && agree

  const handleSign = async () => {
    let dataUrl: string | null = null
    if (tab === 'draw' && sigRef.current && !sigRef.current.isEmpty()) {
      dataUrl = sigRef.current.toDataURL('image/png')
    }
    await onSign({
      signerName: name.trim(),
      signatureDataUrl: dataUrl,
      typed: tab === 'type',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#d4a843]/20">
        <DialogHeader>
          <DialogTitle>Sign Proposal: {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Your Full Name</Label>
            <Input
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Legal name"
            />
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="draw" className="flex-1">
                Draw Signature
              </TabsTrigger>
              <TabsTrigger value="type" className="flex-1">
                Type Signature
              </TabsTrigger>
            </TabsList>
            <TabsContent value="draw" className="mt-3">
              <div className="rounded-md border border-dashed border-white/20 bg-white">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="black"
                  minWidth={1}
                  maxWidth={2}
                  canvasProps={{
                    className: 'w-full h-36 rounded-md',
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => sigRef.current?.clear()}
              >
                Clear
              </Button>
            </TabsContent>
            <TabsContent value="type" className="mt-3">
              <p
                className="font-fraunces text-3xl italic text-[#0a0908] min-h-[5rem] flex items-center justify-center rounded-md border bg-[#faf8f4]"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {name || 'Your name'}
              </p>
            </TabsContent>
          </Tabs>
          <div className="flex items-start gap-2">
            <Checkbox
              id="agree"
              checked={agree}
              onCheckedChange={(c) => setAgree(c === true)}
            />
            <label htmlFor="agree" className="text-sm text-muted-foreground">
              I agree this is a legally binding electronic signature
            </label>
          </div>
          <Button
            className="w-full"
            disabled={!canSubmit}
            onClick={() => void handleSign()}
          >
            Sign Proposal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
