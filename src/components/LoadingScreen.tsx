export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0908] gap-4">
      <div className="h-12 w-12 rounded-full border-2 border-[#d4a843]/30 border-t-[#d4a843] animate-spin" />
      <p className="text-sm text-muted-foreground font-mono">Loading…</p>
    </div>
  )
}
