import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Database } from '@/types/database'

type TemplateRow = Database['public']['Tables']['templates']['Row']

export default function TemplateMode() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('name')
      setTemplates((data as TemplateRow[]) || [])
      setLoading(false)
    })()
  }, [])

  const openWithTemplate = (t: TemplateRow) => {
    navigate('/proposals/new/smart', {
      state: {
        templateId: t.id,
        projectType: t.industry || t.name,
        description: t.description || '',
      },
    })
  }

  return (
    <div className="max-w-5xl mx-auto py-4">
      <Link
        to="/proposals/new"
        className="text-sm text-muted-foreground hover:text-[#d4a843] inline-block mb-6"
      >
        ← Back
      </Link>
      <h1 className="font-fraunces text-3xl mb-2">Choose a template</h1>
      <p className="text-muted-foreground text-sm mb-8">
        We&apos;ll pre-fill Smart Mode — you can still edit everything before
        generating.
      </p>
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="overflow-hidden border-white/10">
              <div
                className="h-1.5 w-full"
                style={{
                  background: `linear-gradient(90deg, #d4a843, #2dd4b0)`,
                }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-fraunces text-lg">{t.name}</h3>
                  {t.industry && (
                    <Badge variant="secondary">{t.industry}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {t.description}
                </p>
                <Button className="w-full" onClick={() => openWithTemplate(t)}>
                  Use This →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
