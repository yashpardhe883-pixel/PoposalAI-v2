export function ScoreRing({
  score,
  size = 72,
}: {
  score: number
  size?: number
}) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, score)) / 100
  const offset = c * (1 - pct)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#d4a843"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-fraunces text-lg font-semibold text-[#d4a843]">
          {score}
        </span>
      </div>
    </div>
  )
}
