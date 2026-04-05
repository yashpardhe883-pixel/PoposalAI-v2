import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0908] px-4 text-center">
      <h1 className="font-fraunces text-6xl text-[#d4a843]">404</h1>
      <p className="mt-4 text-muted-foreground max-w-md">
        This page doesn&apos;t exist — maybe it moved or the link is wrong.
      </p>
      <Button className="mt-8" asChild>
        <Link to="/">Back home</Link>
      </Button>
    </div>
  )
}
