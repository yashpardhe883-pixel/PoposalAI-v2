import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { usePlan } from '@/hooks/usePlan'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Database } from '@/types/database'

type TemplateRow = Database['public']['Tables']['templates']['Row']

const industries = [
  'All',
  'Design',
  'Technology',
  'Marketing',
  'Content',
  'Consulting',
  'Creative',
]

export default function Templates() {
  const user = useAuthStore((s) => s.user)
  const { isAgency } = usePlan()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [filter, setFilter] = useState('All')
  const [list, setList] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const q = supabase.from('templates').select('*').order('name')
      const { data } = await q
      setList((data as TemplateRow[]) || [])
      setLoading(false)
    })()
  }, [])

  const filtered = useMemo(() => {
    let base = list
    if (tab === 'my' && user) {
      base = base.filter((t) => t.user_id === user.id)
    } else if (tab === 'team' && isAgency) {
      base = base.filter((t) => t.user_id !== null && t.user_id !== user?.id)
    } else if (tab === 'all') {
      base = base.filter((t) => t.is_public || t.user_id === user?.id)
    }
    if (filter !== 'All') {
      base = base.filter((t) => t.industry === filter)
    }
    return base
  }, [list, tab, filter, user, isAgency])

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
    <div className="space-y-6">
      <h1 className="font-fraunces text-3xl">Templates</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="my">My Templates</TabsTrigger>
          {isAgency && (
            <TabsTrigger value="team">Team Templates</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="all" className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {industries.map((ind) => (
              <Button
                key={ind}
                size="sm"
                variant={filter === ind ? 'default' : 'outline'}
                onClick={() => setFilter(ind)}
              >
                {ind}
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t) => (
                <Card key={t.id} className="overflow-hidden border-white/10">
                  <div
                    className="h-2 w-full"
                    style={{
                      background: `linear-gradient(90deg, #d4a843, #2dd4b0)`,
                    }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-fraunces text-lg">{t.name}</h3>
                      {t.industry && (
                        <Badge variant="secondary">{t.industry}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
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
        </TabsContent>
        <TabsContent value="my" className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {industries.map((ind) => (
              <Button
                key={ind}
                size="sm"
                variant={filter === ind ? 'default' : 'outline'}
                onClick={() => setFilter(ind)}
              >
                {ind}
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t) => (
                <Card key={t.id} className="overflow-hidden border-white/10">
                  <div
                    className="h-2 w-full"
                    style={{
                      background: `linear-gradient(90deg, #d4a843, #2dd4b0)`,
                    }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-fraunces text-lg">{t.name}</h3>
                      {t.industry && (
                        <Badge variant="secondary">{t.industry}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
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
        </TabsContent>
        {isAgency && (
          <TabsContent value="team" className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <Button
                  key={ind}
                  size="sm"
                  variant={filter === ind ? 'default' : 'outline'}
                  onClick={() => setFilter(ind)}
                >
                  {ind}
                </Button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t) => (
                <Card key={t.id} className="overflow-hidden border-white/10">
                  <CardHeader>
                    <CardTitle className="font-fraunces text-lg">{t.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => openWithTemplate(t)}>
                      Use This →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
