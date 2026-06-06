'use client'
import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NavBar } from '@/components/NavBar'
import { useSyncStore, generateUUID, FinanceAccount, FinanceTransaction, FinanceBudget, FinanceGoal } from '@/lib/syncStore'

const CATEGORIES = [
  { label: 'Food & Feeding', icon: '🍽' },
  { label: 'Transport', icon: '🚗' },
  { label: 'Rent/Housing', icon: '🏠' },
  { label: 'Airtime & Data', icon: '📱' },
  { label: 'Clothing', icon: '👕' },
  { label: 'Health', icon: '💊' },
  { label: 'Books & Learning', icon: '📚' },
  { label: 'Entertainment', icon: '🎭' },
  { label: 'Gifts', icon: '🎁' },
  { label: 'Transfers Out', icon: '💸' },
  { label: 'Miscellaneous', icon: '🔧' }
]

const CURRENCIES = ['NGN', 'USD', 'ADA']
const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  ADA: '₳'
}

export default function VaultPage() {
  const { status } = useSession()
  const router = useRouter()

  // Sync Store Context
  const {
    accounts,
    transactions,
    budgets,
    goals,
    saveAccount,
    deleteAccount,
    saveTransaction,
    deleteTransaction,
    saveBudget,
    deleteBudget,
    saveGoal,
    deleteGoal,
    syncing,
    isOnline
  } = useSyncStore()

  // Layout State
  const [activeTab, setActiveTab] = useState<'wallet' | 'budgets' | 'goals'>('wallet')
  
  // Interactive Logger Modal State
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null)
  const [logAmount, setLogAmount] = useState('0')
  const [logType, setLogType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [logAccountId, setLogAccountId] = useState('')
  const [logNote, setLogNote] = useState('')

  // Selected active currency for balance view
  const [activeCurrency, setActiveCurrency] = useState('NGN')

  // Modals
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddSavingsModal, setShowAddSavingsModal] = useState<FinanceGoal | null>(null)

  // Form states
  const [newAccName, setNewAccName] = useState('')
  const [newAccCurrency, setNewAccCurrency] = useState('NGN')

  const [newBudgCategory, setNewBudgCategory] = useState('Food & Feeding')
  const [newBudgLimit, setNewBudgLimit] = useState('')
  const [newBudgCurrency, setNewBudgCurrency] = useState('NGN')

  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalTarget, setNewGoalTarget] = useState('')
  const [newGoalCurrency, setNewGoalCurrency] = useState('NGN')
  const [newGoalDeadline, setNewGoalDeadline] = useState('')

  const [depositAmount, setDepositAmount] = useState('')
  const [depositSourceAccount, setDepositSourceAccount] = useState('')

  // Route protection
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Bootstrap default accounts if none exist
  useEffect(() => {
    if (status === 'authenticated' && accounts.length === 0) {
      console.log('[Vault] Bootstrapping default accounts...')
      const defaults = [
        { id: 'def-bank-ngn', name: 'Zaria Bank', currency: 'NGN' },
        { id: 'def-cash-ngn', name: 'Cash', currency: 'NGN' },
        { id: 'def-wallet-ada', name: 'Cardano Wallet', currency: 'ADA' },
        { id: 'def-bank-usd', name: 'USD Wallet', currency: 'USD' }
      ]
      defaults.forEach(acc => saveAccount(acc))
    }
  }, [status, accounts, saveAccount])

  // Set default log account when modal opens
  useEffect(() => {
    if (selectedCategory) {
      // Pick first account that matches active currency, or any
      const matching = accounts.find(a => a.currency === activeCurrency) || accounts[0]
      if (matching) setLogAccountId(matching.id)
    }
  }, [selectedCategory, accounts, activeCurrency])

  // Set default source account for savings deposits
  useEffect(() => {
    if (showAddSavingsModal) {
      const matching = accounts.find(a => a.currency === showAddSavingsModal.currency) || accounts[0]
      if (matching) setDepositSourceAccount(matching.id)
    }
  }, [showAddSavingsModal, accounts])

  // CALCULATIONS: Account Balances
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    
    // Initialize with 0
    accounts.forEach(acc => {
      balances[acc.id] = 0
    })

    // Sum transactions
    transactions.forEach(tx => {
      if (balances[tx.accountId] !== undefined) {
        if (tx.type === 'INCOME') {
          balances[tx.accountId] += tx.amount
        } else if (tx.type === 'EXPENSE') {
          balances[tx.accountId] -= tx.amount
        }
      }
    })

    return balances
  }, [accounts, transactions])

  // CALCULATIONS: Monthly Spending by Category
  const categorySpending = useMemo(() => {
    const spending: Record<string, Record<string, number>> = {} // { currency: { category: amount } }
    
    // Initialize currency objects
    CURRENCIES.forEach(curr => {
      spending[curr] = {}
      CATEGORIES.forEach(cat => {
        spending[curr][cat.label] = 0
      })
    })

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    transactions.forEach(tx => {
      const d = new Date(tx.date)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && tx.type === 'EXPENSE') {
        const acc = accounts.find(a => a.id === tx.accountId)
        if (acc) {
          const curr = acc.currency
          if (spending[curr] && spending[curr][tx.category] !== undefined) {
            spending[curr][tx.category] += tx.amount
          }
        }
      }
    })

    return spending
  }, [accounts, transactions])

  // Interactive Keypad Input
  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setLogAmount('0')
    } else if (key === '.') {
      if (!logAmount.includes('.')) {
        setLogAmount(prev => prev + '.')
      }
    } else {
      setLogAmount(prev => {
        if (prev === '0') return key
        return prev + key
      })
    }
  }

  // Save Transaction Log
  const handleSaveTransactionLog = () => {
    const numericAmount = parseFloat(logAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (!logAccountId) {
      alert('Please select an account')
      return
    }

    const tx: FinanceTransaction = {
      id: generateUUID(),
      accountId: logAccountId,
      amount: numericAmount,
      type: logType,
      category: selectedCategory?.label || 'Miscellaneous',
      note: logNote.trim() || null,
      date: new Date().toISOString()
    }

    saveTransaction(tx)

    // Reset log states
    setSelectedCategory(null)
    setLogAmount('0')
    setLogNote('')
    setLogType('EXPENSE')
  }

  // Add Custom Account
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccName.trim()) return

    const acc: FinanceAccount = {
      id: generateUUID(),
      name: newAccName.trim(),
      currency: newAccCurrency
    }
    saveAccount(acc)

    setNewAccName('')
    setShowAddAccount(false)
  }

  // Add Custom Budget
  const handleAddBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const limitNum = parseFloat(newBudgLimit)
    if (isNaN(limitNum) || limitNum <= 0) return

    // Find if budget already exists for this category/currency
    const existing = budgets.find(b => b.category === newBudgCategory && b.currency === newBudgCurrency)
    const bId = existing?.id || generateUUID()

    const b: FinanceBudget = {
      id: bId,
      category: newBudgCategory,
      limit: limitNum,
      currency: newBudgCurrency
    }
    saveBudget(b)

    setNewBudgLimit('')
    setShowAddBudget(false)
  }

  // Add Custom Goal
  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetNum = parseFloat(newGoalTarget)
    if (isNaN(targetNum) || targetNum <= 0) return

    const g: FinanceGoal = {
      id: generateUUID(),
      name: newGoalName.trim(),
      targetAmount: targetNum,
      savedAmount: 0,
      currency: newGoalCurrency,
      targetDate: newGoalDeadline ? new Date(newGoalDeadline).toISOString() : null
    }
    saveGoal(g)

    setNewGoalName('')
    setNewGoalTarget('')
    setNewGoalDeadline('')
    setShowAddGoal(false)
  }

  // Goal Savings Contribution
  const handleDepositSavings = (e: React.FormEvent) => {
    e.preventDefault()
    const depAmt = parseFloat(depositAmount)
    if (isNaN(depAmt) || depAmt <= 0 || !showAddSavingsModal) return

    // 1. Subtract from transaction ledger as a savings expense or transfer
    const tx: FinanceTransaction = {
      id: generateUUID(),
      accountId: depositSourceAccount,
      amount: depAmt,
      type: 'EXPENSE',
      category: 'Miscellaneous',
      note: `Savings allocation: ${showAddSavingsModal.name}`,
      date: new Date().toISOString()
    }
    saveTransaction(tx)

    // 2. Add to Goal amount
    const updatedGoal: FinanceGoal = {
      ...showAddSavingsModal,
      savedAmount: showAddSavingsModal.savedAmount + depAmt
    }
    saveGoal(updatedGoal)

    setDepositAmount('')
    setShowAddSavingsModal(null)
  }

  // Quick Account Balance List Filter
  const activeCurrencyAccounts = useMemo(() => {
    return accounts.filter(a => a.currency === activeCurrency)
  }, [accounts, activeCurrency])

  const totalActiveBalance = useMemo(() => {
    return activeCurrencyAccounts.reduce((acc, current) => {
      return acc + (accountBalances[current.id] || 0)
    }, 0)
  }, [activeCurrencyAccounts, accountBalances])

  return (
    <div className="app-shell" style={{ paddingBottom: 100 }}>
      {/* Page Header */}
      <header className="page-header" style={{ paddingBottom: 16 }}>
        <div>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--text-3)' }}>← Today</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Vault</h1>
          <p className="page-subtitle">Personal offline cashflow and budget tracker.</p>
        </div>
        {syncing && (
          <span style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '4px 8px', borderRadius: 12 }}>
            Syncing…
          </span>
        )}
        {!isOnline && !syncing && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--border)', padding: '4px 8px', borderRadius: 12 }}>
            Offline Mode
          </span>
        )}
      </header>

      {/* Currency Switcher */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        justifyContent: 'center'
      }}>
        {CURRENCIES.map(curr => (
          <button
            key={curr}
            onClick={() => setActiveCurrency(curr)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: activeCurrency === curr ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: activeCurrency === curr ? 'var(--accent-dim)' : 'var(--bg-surface)',
              color: activeCurrency === curr ? 'var(--text-1)' : 'var(--text-3)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {curr} ({CURRENCY_SYMBOLS[curr]})
          </button>
        ))}
      </div>

      {/* Big Balance Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24, background: 'var(--bg-surface)', textAlign: 'center' }}>
        <span className="label" style={{ color: 'var(--text-3)', fontSize: 10 }}>Net Worth ({activeCurrency})</span>
        <h2 style={{ fontSize: 32, fontWeight: 800, margin: '6px 0 16px', letterSpacing: '-0.03em' }}>
          {CURRENCY_SYMBOLS[activeCurrency]}{totalActiveBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        
        {/* Account Details list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          {activeCurrencyAccounts.map(acc => (
            <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-2)' }}>{acc.name}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                {CURRENCY_SYMBOLS[activeCurrency]}{(accountBalances[acc.id] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {activeCurrencyAccounts.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>No accounts in {activeCurrency}</div>
          )}
        </div>

        <button
          onClick={() => setShowAddAccount(true)}
          style={{
            marginTop: 20,
            background: 'transparent',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent)',
            fontSize: 12,
            padding: '8px 16px',
            width: '100%',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          ➕ Add Account
        </button>
      </div>

      {/* Primary Vault Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        background: 'var(--bg-surface)',
        padding: 4,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)'
      }}>
        {(['wallet', 'budgets', 'goals'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 'calc(var(--radius-sm) - 4px)',
              border: 'none',
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'var(--bg)' : 'var(--text-2)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'wallet' ? '💳 Ledger' : tab === 'budgets' ? '📊 Budgets' : '🎯 Goals'}
          </button>
        ))}
      </div>

      {/* VIEW: WALLET & FAST ENTRY */}
      {activeTab === 'wallet' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick-add category icon grid */}
          <div>
            <h3 className="label" style={{ marginBottom: 12, color: 'var(--text-2)' }}>Quick Log Spend</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              background: 'var(--bg-surface)',
              padding: 16,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backdropFilter: 'var(--glass)'
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid transparent',
                    background: 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '1px solid var(--border)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid transparent'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <span style={{ fontSize: 24 }}>{cat.icon}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.2, fontWeight: 500 }}>
                    {cat.label.replace(' & ', '\n').replace('/', '\n')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Ledger */}
          <div>
            <h3 className="label" style={{ marginBottom: 12, color: 'var(--text-2)' }}>Activity Ledger</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {transactions
                .filter(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId)
                  return acc?.currency === activeCurrency
                })
                .map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId)
                  const isExp = tx.type === 'EXPENSE'
                  return (
                    <div key={tx.id} style={{
                      padding: 16,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>
                            {CATEGORIES.find(c => c.label === tx.category)?.icon || '🔧'}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                            {tx.category}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-3)', background: 'var(--border)', padding: '2px 6px', borderRadius: 8 }}>
                            {acc?.name}
                          </span>
                        </div>
                        {tx.note && (
                          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, marginLeft: 26 }}>
                            {tx.note}
                          </p>
                        )}
                        <span style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, display: 'block', marginLeft: 26 }}>
                          {new Date(tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: isExp ? 'var(--missed-color)' : 'var(--success)'
                        }}>
                          {isExp ? '-' : '+'}{CURRENCY_SYMBOLS[activeCurrency]}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.4 }}
                          title="Delete transaction"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}

              {transactions.filter(tx => accounts.find(a => a.id === tx.accountId)?.currency === activeCurrency).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                  <p>No transactions logged in {activeCurrency} yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: BUDGETS */}
      {activeTab === 'budgets' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 className="label" style={{ color: 'var(--text-2)' }}>Monthly category budgets</h3>
            <button
              onClick={() => setShowAddBudget(true)}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: 12, borderRadius: 12 }}
            >
              Set Budget
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {budgets
              .filter(b => b.currency === activeCurrency)
              .map(b => {
                const spent = categorySpending[activeCurrency]?.[b.category] || 0
                const percent = Math.min(Math.round((spent / b.limit) * 100), 100)
                const overrun = spent > b.limit
                
                // Color computation based on limit ratio
                let barColor = 'var(--success)'
                if (spent >= b.limit) {
                  barColor = 'var(--missed-color)'
                } else if (spent >= b.limit * 0.8) {
                  barColor = '#f0a050' // Amber
                }

                return (
                  <div key={b.id} className="card-elevated" style={{ padding: 16, background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>
                          {b.category}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, opacity: 0.4 }}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Progress details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
                      <span>Spent: {CURRENCY_SYMBOLS[activeCurrency]}{spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span style={{ color: overrun ? 'var(--missed-color)' : 'var(--text-2)', fontWeight: overrun ? 600 : 'normal' }}>
                        Limit: {CURRENCY_SYMBOLS[activeCurrency]}{b.limit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({percent}%)
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: barColor,
                        borderRadius: 4,
                        transition: 'width 0.4s ease'
                      }} />
                    </div>

                    {spent >= b.limit * 0.8 && (
                      <span style={{ fontSize: 10, color: overrun ? 'var(--missed-color)' : '#f0a050', marginTop: 8, display: 'block', fontWeight: 600 }}>
                        {overrun ? '⚠️ Budget Limit Exceeded!' : '⚠️ Warning: 80% budget limit reached!'}
                      </span>
                    )}
                  </div>
                )
              })}

            {budgets.filter(b => b.currency === activeCurrency).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                <p>No budgets configured for {activeCurrency} yet.</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Tap "Set Budget" above to set category caps.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: SAVINGS GOALS */}
      {activeTab === 'goals' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 className="label" style={{ color: 'var(--text-2)' }}>Savings targets</h3>
            <button
              onClick={() => setShowAddGoal(true)}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: 12, borderRadius: 12 }}
            >
              Add Goal
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {goals
              .filter(g => g.currency === activeCurrency)
              .map(g => {
                const percent = Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100)
                
                return (
                  <div key={g.id} className="card-elevated" style={{ padding: 20, background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{g.name}</h4>
                        {g.targetDate && (
                          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                            Target Date: {new Date(g.targetDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button
                          onClick={() => setShowAddSavingsModal(g)}
                          style={{
                            background: 'var(--accent)',
                            color: 'var(--bg)',
                            border: 'none',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 12,
                            cursor: 'pointer'
                          }}
                        >
                          Contribute
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.4 }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Progress numbers */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
                      <span>Saved: {CURRENCY_SYMBOLS[activeCurrency]}{g.savedAmount.toLocaleString()}</span>
                      <span>Target: {CURRENCY_SYMBOLS[activeCurrency]}{g.targetAmount.toLocaleString()} ({percent}%)</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: 'var(--accent)',
                        borderRadius: 4,
                        boxShadow: '0 0 6px var(--accent-glow)'
                      }} />
                    </div>
                  </div>
                )
              })}

            {goals.filter(g => g.currency === activeCurrency).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                <p>No goals configured for {activeCurrency} yet.</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Tap "Add Goal" above to configure targets.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────── MODALS ─────────────────── */}

      {/* MODAL: Transaction Keypad Logger */}
      {selectedCategory && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 360, background: 'var(--bg-elevated)' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{selectedCategory.icon}</span>
                <span>Log {selectedCategory.label}</span>
              </h3>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Income/Expense Toggle */}
            <div style={{
              display: 'flex',
              gap: 8,
              background: 'var(--bg)',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
              marginBottom: 16
            }}>
              {(['EXPENSE', 'INCOME'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setLogType(type)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRadius: 'calc(var(--radius-sm) - 4px)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: logType === type ? (type === 'EXPENSE' ? 'var(--missed-color)' : 'var(--success)') : 'transparent',
                    color: logType === type ? 'var(--bg)' : 'var(--text-2)',
                    transition: 'all 0.15s'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Account Selector */}
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="label">Account Source</label>
              <select
                className="input"
                value={logAccountId}
                onChange={e => setLogAccountId(e.target.value)}
                style={{ padding: '8px 12px', fontSize: 13 }}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Note field */}
            <div className="field" style={{ marginBottom: 20 }}>
              <label className="label">Note (Optional)</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Lunch with friends, groceries..."
                value={logNote}
                onChange={e => setLogNote(e.target.value)}
                style={{ padding: '8px 12px', fontSize: 13 }}
              />
            </div>

            {/* Large Amount Display */}
            <div style={{
              background: 'var(--bg)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'right',
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--text-1)',
              marginBottom: 20,
              fontFamily: 'monospace',
              border: '1px solid var(--border)'
            }}>
              {CURRENCY_SYMBOLS[accounts.find(a => a.id === logAccountId)?.currency || 'NGN']}{logAmount}
            </div>

            {/* Number Keypad */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              marginBottom: 20
            }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C'].map(key => (
                <button
                  key={key}
                  onClick={() => handleKeypadPress(key)}
                  style={{
                    padding: '14px',
                    fontSize: 18,
                    fontWeight: 700,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: key === 'C' ? 'rgba(255, 95, 126, 0.1)' : 'var(--bg)',
                    color: key === 'C' ? 'var(--missed-color)' : 'var(--text-1)',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Confirm Submit */}
            <button
              onClick={handleSaveTransactionLog}
              className="btn btn-primary btn-full"
              style={{ padding: '14px' }}
            >
              Confirm Entry
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Add Account */}
      {showAddAccount && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 340, background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add Account</h3>
              <button
                onClick={() => setShowAddAccount(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label className="label">Account Name</label>
                <input
                  required
                  className="input"
                  type="text"
                  placeholder="e.g. Zaria Bank, Wallet, ADA Ledger"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Currency</label>
                <select
                  className="input"
                  value={newAccCurrency}
                  onChange={e => setNewAccCurrency(e.target.value)}
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
                Save Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Set Budget */}
      {showAddBudget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 340, background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Set Monthly Budget</h3>
              <button
                onClick={() => setShowAddBudget(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBudgetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label className="label">Category</label>
                <select
                  className="input"
                  value={newBudgCategory}
                  onChange={e => setNewBudgCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.label} value={c.label}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Currency</label>
                <select
                  className="input"
                  value={newBudgCurrency}
                  onChange={e => setNewBudgCurrency(e.target.value)}
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Monthly Limit</label>
                <input
                  required
                  className="input"
                  type="number"
                  placeholder="e.g. 50000"
                  value={newBudgLimit}
                  onChange={e => setNewBudgLimit(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
                Save Budget
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Goal */}
      {showAddGoal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 340, background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add Savings Goal</h3>
              <button
                onClick={() => setShowAddGoal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label className="label">Goal Name</label>
                <input
                  required
                  className="input"
                  type="text"
                  placeholder="e.g. Zaria Trip, Abuja flight"
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Target Amount</label>
                <input
                  required
                  className="input"
                  type="number"
                  placeholder="e.g. 250000"
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Currency</label>
                <select
                  className="input"
                  value={newGoalCurrency}
                  onChange={e => setNewGoalCurrency(e.target.value)}
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Target Date (Optional)</label>
                <input
                  className="input"
                  type="date"
                  value={newGoalDeadline}
                  onChange={e => setNewGoalDeadline(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
                Save Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Contribute Savings to Goal */}
      {showAddSavingsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 340, background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Contribute Savings</h3>
              <button
                onClick={() => setShowAddSavingsModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDepositSavings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'var(--bg-surface)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                color: 'var(--text-2)',
                lineHeight: 1.4,
                marginBottom: 8
              }}>
                Adding savings to: <strong>{showAddSavingsModal.name}</strong><br />
                Target Currency: <strong>{showAddSavingsModal.currency}</strong>
              </div>

              <div className="field">
                <label className="label">Source Account</label>
                <select
                  className="input"
                  value={depositSourceAccount}
                  onChange={e => setDepositSourceAccount(e.target.value)}
                >
                  {accounts
                    .filter(a => a.currency === showAddSavingsModal.currency)
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Bal: {CURRENCY_SYMBOLS[acc.currency]}{(accountBalances[acc.id] || 0).toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Contribution Amount</label>
                <input
                  required
                  className="input"
                  type="number"
                  placeholder="e.g. 15000"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
                Deposit Funds
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <NavBar />
    </div>
  )
}
