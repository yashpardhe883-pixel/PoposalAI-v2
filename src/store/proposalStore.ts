import { create } from 'zustand'
import type { Database } from '@/types/database'

type ProposalRow = Database['public']['Tables']['proposals']['Row']

interface ProposalState {
  proposals: ProposalRow[]
  setProposals: (p: ProposalRow[]) => void
  updateProposalLocal: (id: string, patch: Partial<ProposalRow>) => void
  removeProposalLocal: (id: string) => void
}

export const useProposalStore = create<ProposalState>((set) => ({
  proposals: [],
  setProposals: (proposals) => set({ proposals }),
  updateProposalLocal: (id, patch) =>
    set((s) => ({
      proposals: s.proposals.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),
  removeProposalLocal: (id) =>
    set((s) => ({
      proposals: s.proposals.filter((p) => p.id !== id),
    })),
}))
