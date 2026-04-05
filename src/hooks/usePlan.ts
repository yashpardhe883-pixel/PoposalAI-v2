import { useAuthStore } from '@/store/authStore'

export function usePlan() {
  const profile = useAuthStore((s) => s.profile)
  const plan = profile?.plan || 'free'
  const used = profile?.proposals_used_this_month ?? 0

  return {
    plan,
    isFree: plan === 'free',
    isPro: plan === 'pro' || plan === 'agency',
    isAgency: plan === 'agency',
    canGenerateProposal: plan !== 'free' || used < 5,
    proposalsRemaining: plan === 'free' ? Math.max(0, 5 - used) : Infinity,
    canUseBranding: plan !== 'free',
    canUseTracking: plan !== 'free',
    canUseAnalytics: plan !== 'free',
    canUseEsignature: plan !== 'free',
    canUseTeam: plan === 'agency',
    canUseWhiteLabel: plan === 'agency',
    canUseCRM: plan === 'agency',
  }
}
