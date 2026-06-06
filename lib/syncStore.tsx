'use client'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface FinanceAccount {
  id: string
  name: string
  currency: string
  createdAt?: string
  updatedAt?: string
}

export interface FinanceTransaction {
  id: string
  accountId: string
  amount: number
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  category: string
  note: string | null
  date: string // ISO string
  recipientAccountId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface FinanceBudget {
  id: string
  category: string
  limit: number
  currency: string
  createdAt?: string
  updatedAt?: string
}

export interface FinanceGoal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  currency: string
  targetDate: string | null
  createdAt?: string
  updatedAt?: string
}

export interface JournalEntry {
  id: string
  title: string | null
  content: string
  createdAt: string
  updatedAt?: string
}

interface PendingQueues {
  accounts: Record<string, FinanceAccount>
  transactions: Record<string, FinanceTransaction>
  budgets: Record<string, FinanceBudget>
  goals: Record<string, FinanceGoal>
  journals: Record<string, JournalEntry>
}

interface DeletedQueues {
  accounts: string[]
  transactions: string[]
  budgets: string[]
  goals: string[]
  journals: string[]
}

interface SyncStoreType {
  accounts: FinanceAccount[]
  transactions: FinanceTransaction[]
  budgets: FinanceBudget[]
  goals: FinanceGoal[]
  journals: JournalEntry[]
  isOnline: boolean
  syncing: boolean
  lastSyncedAt: string | null
  triggerSync: () => Promise<void>
  // Mutations
  saveAccount: (acc: Omit<FinanceAccount, 'createdAt' | 'updatedAt'>) => void
  deleteAccount: (id: string) => void
  saveTransaction: (tx: Omit<FinanceTransaction, 'createdAt' | 'updatedAt'>) => void
  deleteTransaction: (id: string) => void
  saveBudget: (b: Omit<FinanceBudget, 'createdAt' | 'updatedAt'>) => void
  deleteBudget: (id: string) => void
  saveGoal: (g: Omit<FinanceGoal, 'createdAt' | 'updatedAt'>) => void
  deleteGoal: (id: string) => void
  saveJournal: (j: Omit<JournalEntry, 'updatedAt'>) => void
  deleteJournal: (id: string) => void
}

const SyncStoreContext = createContext<SyncStoreType | undefined>(undefined)

export function generateUUID() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export function SyncStoreProvider({ children }: { children: React.ReactNode }) {
  // 1. Unified client datasets
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [budgets, setBudgets] = useState<FinanceBudget[]>([])
  const [goals, setGoals] = useState<FinanceGoal[]>([])
  const [journals, setJournals] = useState<JournalEntry[]>([])

  // 2. Queue states
  const [pendingUpserts, setPendingUpserts] = useState<PendingQueues>({
    accounts: {}, transactions: {}, budgets: {}, goals: {}, journals: {}
  })
  const [pendingDeletes, setPendingDeletes] = useState<DeletedQueues>({
    accounts: [], transactions: [], budgets: [], goals: [], journals: []
  })

  // 3. Status metadata
  const [isOnline, setIsOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  // Load cache on mount
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load initial client data from localStorage caches
    const cachedAccounts = localStorage.getItem('self_vault_accounts')
    const cachedTransactions = localStorage.getItem('self_vault_transactions')
    const cachedBudgets = localStorage.getItem('self_vault_budgets')
    const cachedGoals = localStorage.getItem('self_vault_goals')
    const cachedJournals = localStorage.getItem('self_journal_entries')
    const cachedLastSync = localStorage.getItem('self_last_synced_at')

    if (cachedAccounts) setAccounts(JSON.parse(cachedAccounts))
    if (cachedTransactions) setTransactions(JSON.parse(cachedTransactions))
    if (cachedBudgets) setBudgets(JSON.parse(cachedBudgets))
    if (cachedGoals) setGoals(JSON.parse(cachedGoals))
    if (cachedJournals) setJournals(JSON.parse(cachedJournals))
    if (cachedLastSync) setLastSyncedAt(cachedLastSync)

    // Load pending queues
    const cachedPendingUpserts = localStorage.getItem('self_pending_upserts')
    const cachedPendingDeletes = localStorage.getItem('self_pending_deletes')
    if (cachedPendingUpserts) setPendingUpserts(JSON.parse(cachedPendingUpserts))
    if (cachedPendingDeletes) setPendingDeletes(JSON.parse(cachedPendingDeletes))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sync to database
  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || syncing) return
    setSyncing(true)
    console.log('[SyncStore] Triggering server synchronization...')

    // Retrieve the current queues from localStorage to avoid stale state in async callback
    const freshUpsertsStr = localStorage.getItem('self_pending_upserts')
    const freshDeletesStr = localStorage.getItem('self_pending_deletes')

    const activeUpserts: PendingQueues = freshUpsertsStr 
      ? JSON.parse(freshUpsertsStr) 
      : { accounts: {}, transactions: {}, budgets: {}, goals: {}, journals: {} }
    
    const activeDeletes: DeletedQueues = freshDeletesStr 
      ? JSON.parse(freshDeletesStr) 
      : { accounts: [], transactions: [], budgets: [], goals: [], journals: [] }

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: Object.values(activeUpserts.accounts),
          transactions: Object.values(activeUpserts.transactions),
          budgets: Object.values(activeUpserts.budgets),
          goals: Object.values(activeUpserts.goals),
          journals: Object.values(activeUpserts.journals),
          deleted: activeDeletes
        })
      })

      if (res.ok) {
        const data = await res.json()
        
        // Update local datasets with confirmed server database records
        setAccounts(data.accounts)
        setTransactions(data.transactions)
        setBudgets(data.budgets)
        setGoals(data.goals)
        setJournals(data.journals)

        localStorage.setItem('self_vault_accounts', JSON.stringify(data.accounts))
        localStorage.setItem('self_vault_transactions', JSON.stringify(data.transactions))
        localStorage.setItem('self_vault_budgets', JSON.stringify(data.budgets))
        localStorage.setItem('self_vault_goals', JSON.stringify(data.goals))
        localStorage.setItem('self_journal_entries', JSON.stringify(data.journals))

        // Sync completed successfully: Clear pending queues
        const emptyUpserts: PendingQueues = { accounts: {}, transactions: {}, budgets: {}, goals: {}, journals: {} }
        const emptyDeletes: DeletedQueues = { accounts: [], transactions: [], budgets: [], goals: [], journals: [] }
        
        setPendingUpserts(emptyUpserts)
        setPendingDeletes(emptyDeletes)
        localStorage.setItem('self_pending_upserts', JSON.stringify(emptyUpserts))
        localStorage.setItem('self_pending_deletes', JSON.stringify(emptyDeletes))

        const syncTime = new Date().toISOString()
        setLastSyncedAt(syncTime)
        localStorage.setItem('self_last_synced_at', syncTime)
        console.log('[SyncStore] Server sync completed successfully at', syncTime)
      } else {
        console.error('[SyncStore] Server sync rejected by API:', res.statusText)
      }
    } catch (err) {
      console.error('[SyncStore] Network sync failed (offline or server error):', err)
    } finally {
      setSyncing(false)
    }
  }, [syncing])

  // Trigger sync automatically when online status shifts to active
  useEffect(() => {
    if (isOnline) {
      triggerSync()
    }
  }, [isOnline])

  // Save changes to client queues + localStorage helper
  const updatePendingUpserts = useCallback((key: keyof PendingQueues, id: string, data: any) => {
    setPendingUpserts(prev => {
      const next = {
        ...prev,
        [key]: { ...prev[key], [id]: data }
      }
      localStorage.setItem('self_pending_upserts', JSON.stringify(next))
      return next
    })
  }, [])

  const addPendingDelete = useCallback((key: keyof DeletedQueues, id: string) => {
    // 1. Remove from pending upsert list if it was never synced
    setPendingUpserts(prev => {
      const nextUpserts = { ...prev }
      if (nextUpserts[key] && nextUpserts[key][id]) {
        delete nextUpserts[key][id]
        localStorage.setItem('self_pending_upserts', JSON.stringify(nextUpserts))
      }
      return nextUpserts
    })

    // 2. Add to pending deletion queue
    setPendingDeletes(prev => {
      const list = prev[key] || []
      if (list.includes(id)) return prev
      const next = {
        ...prev,
        [key]: [...list, id]
      }
      localStorage.setItem('self_pending_deletes', JSON.stringify(next))
      return next
    })
  }, [])

  // MUTATIONS: ACCOUNTS
  const saveAccount = useCallback((acc: FinanceAccount) => {
    setAccounts(prev => {
      const filtered = prev.filter(x => x.id !== acc.id)
      const next = [...filtered, acc]
      localStorage.setItem('self_vault_accounts', JSON.stringify(next))
      return next
    })
    updatePendingUpserts('accounts', acc.id, acc)
    setTimeout(() => triggerSync(), 500)
  }, [updatePendingUpserts, triggerSync])

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => {
      const next = prev.filter(x => x.id !== id)
      localStorage.setItem('self_vault_accounts', JSON.stringify(next))
      return next
    })
    addPendingDelete('accounts', id)
    setTimeout(() => triggerSync(), 500)
  }, [addPendingDelete, triggerSync])

  // MUTATIONS: TRANSACTIONS
  const saveTransaction = useCallback((tx: FinanceTransaction) => {
    setTransactions(prev => {
      const filtered = prev.filter(x => x.id !== tx.id)
      const next = [tx, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      localStorage.setItem('self_vault_transactions', JSON.stringify(next))
      return next
    })
    updatePendingUpserts('transactions', tx.id, tx)
    setTimeout(() => triggerSync(), 500)
  }, [updatePendingUpserts, triggerSync])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const next = prev.filter(x => x.id !== id)
      localStorage.setItem('self_vault_transactions', JSON.stringify(next))
      return next
    })
    addPendingDelete('transactions', id)
    setTimeout(() => triggerSync(), 500)
  }, [addPendingDelete, triggerSync])

  // MUTATIONS: BUDGETS
  const saveBudget = useCallback((b: FinanceBudget) => {
    setBudgets(prev => {
      const filtered = prev.filter(x => x.id !== b.id)
      const next = [...filtered, b]
      localStorage.setItem('self_vault_budgets', JSON.stringify(next))
      return next
    })
    updatePendingUpserts('budgets', b.id, b)
    setTimeout(() => triggerSync(), 500)
  }, [updatePendingUpserts, triggerSync])

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => {
      const next = prev.filter(x => x.id !== id)
      localStorage.setItem('self_vault_budgets', JSON.stringify(next))
      return next
    })
    addPendingDelete('budgets', id)
    setTimeout(() => triggerSync(), 500)
  }, [addPendingDelete, triggerSync])

  // MUTATIONS: GOALS
  const saveGoal = useCallback((g: FinanceGoal) => {
    setGoals(prev => {
      const filtered = prev.filter(x => x.id !== g.id)
      const next = [...filtered, g]
      localStorage.setItem('self_vault_goals', JSON.stringify(next))
      return next
    })
    updatePendingUpserts('goals', g.id, g)
    setTimeout(() => triggerSync(), 500)
  }, [updatePendingUpserts, triggerSync])

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const next = prev.filter(x => x.id !== id)
      localStorage.setItem('self_vault_goals', JSON.stringify(next))
      return next
    })
    addPendingDelete('goals', id)
    setTimeout(() => triggerSync(), 500)
  }, [addPendingDelete, triggerSync])

  // MUTATIONS: JOURNALS
  const saveJournal = useCallback((j: JournalEntry) => {
    setJournals(prev => {
      const filtered = prev.filter(x => x.id !== j.id)
      const next = [j, ...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      localStorage.setItem('self_journal_entries', JSON.stringify(next))
      return next
    })
    updatePendingUpserts('journals', j.id, j)
    setTimeout(() => triggerSync(), 500)
  }, [updatePendingUpserts, triggerSync])

  const deleteJournal = useCallback((id: string) => {
    setJournals(prev => {
      const next = prev.filter(x => x.id !== id)
      localStorage.setItem('self_journal_entries', JSON.stringify(next))
      return next
    })
    addPendingDelete('journals', id)
    setTimeout(() => triggerSync(), 500)
  }, [addPendingDelete, triggerSync])

  return (
    <SyncStoreContext.Provider value={{
      accounts,
      transactions,
      budgets,
      goals,
      journals,
      isOnline,
      syncing,
      lastSyncedAt,
      triggerSync,
      saveAccount,
      deleteAccount,
      saveTransaction,
      deleteTransaction,
      saveBudget,
      deleteBudget,
      saveGoal,
      deleteGoal,
      saveJournal,
      deleteJournal
    }}>
      {children}
    </SyncStoreContext.Provider>
  )
}

export function useSyncStore() {
  const context = useContext(SyncStoreContext)
  if (context === undefined) {
    throw new Error('useSyncStore must be used within a SyncStoreProvider')
  }
  return context
}
