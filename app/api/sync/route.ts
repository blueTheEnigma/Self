export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = (session.user as any).id

  try {
    const body = await req.json()
    const {
      accounts = [],
      transactions = [],
      budgets = [],
      goals = [],
      journals = [],
      deleted = {}
    } = body

    // 1. Process Deletions
    if (deleted.accounts?.length) {
      await prisma.financeAccount.deleteMany({
        where: { userId, id: { in: deleted.accounts } }
      })
    }
    if (deleted.transactions?.length) {
      await prisma.financeTransaction.deleteMany({
        where: { userId, id: { in: deleted.transactions } }
      })
    }
    if (deleted.budgets?.length) {
      await prisma.financeBudget.deleteMany({
        where: { userId, id: { in: deleted.budgets } }
      })
    }
    if (deleted.goals?.length) {
      await prisma.financeGoal.deleteMany({
        where: { userId, id: { in: deleted.goals } }
      })
    }
    if (deleted.journals?.length) {
      await prisma.journalEntry.deleteMany({
        where: { userId, id: { in: deleted.journals } }
      })
    }

    // 2. Process Upserts (Accounts)
    for (const acc of accounts) {
      if (!acc.id || !acc.name || !acc.currency) continue
      await prisma.financeAccount.upsert({
        where: { id: acc.id },
        update: {
          name: acc.name.trim(),
          currency: acc.currency.trim()
        },
        create: {
          id: acc.id,
          userId,
          name: acc.name.trim(),
          currency: acc.currency.trim()
        }
      })
    }

    // 3. Process Upserts (Transactions)
    for (const tx of transactions) {
      if (!tx.id || !tx.accountId || tx.amount === undefined || !tx.type || !tx.category) continue
      await prisma.financeTransaction.upsert({
        where: { id: tx.id },
        update: {
          accountId: tx.accountId,
          amount: parseFloat(tx.amount),
          type: tx.type,
          category: tx.category,
          note: tx.note?.trim() || null,
          date: new Date(tx.date)
        },
        create: {
          id: tx.id,
          userId,
          accountId: tx.accountId,
          amount: parseFloat(tx.amount),
          type: tx.type,
          category: tx.category,
          note: tx.note?.trim() || null,
          date: new Date(tx.date)
        }
      })
    }

    // 4. Process Upserts (Budgets)
    for (const b of budgets) {
      if (!b.id || !b.category || b.limit === undefined || !b.currency) continue
      await prisma.financeBudget.upsert({
        where: { id: b.id },
        update: {
          category: b.category,
          limit: parseFloat(b.limit),
          currency: b.currency
        },
        create: {
          id: b.id,
          userId,
          category: b.category,
          limit: parseFloat(b.limit),
          currency: b.currency
        }
      })
    }

    // 5. Process Upserts (Goals)
    for (const g of goals) {
      if (!g.id || !g.name || g.targetAmount === undefined || !g.currency) continue
      await prisma.financeGoal.upsert({
        where: { id: g.id },
        update: {
          name: g.name.trim(),
          targetAmount: parseFloat(g.targetAmount),
          savedAmount: parseFloat(g.savedAmount || 0),
          currency: g.currency,
          targetDate: g.targetDate ? new Date(g.targetDate) : null
        },
        create: {
          id: g.id,
          userId,
          name: g.name.trim(),
          targetAmount: parseFloat(g.targetAmount),
          savedAmount: parseFloat(g.savedAmount || 0),
          currency: g.currency,
          targetDate: g.targetDate ? new Date(g.targetDate) : null
        }
      })
    }

    // 6. Process Upserts (Journal Entries)
    for (const j of journals) {
      if (!j.id || !j.content) continue
      await prisma.journalEntry.upsert({
        where: { id: j.id },
        update: {
          title: j.title?.trim() || null,
          content: j.content.trim(),
          createdAt: j.createdAt ? new Date(j.createdAt) : undefined
        },
        create: {
          id: j.id,
          userId,
          title: j.title?.trim() || null,
          content: j.content.trim(),
          createdAt: j.createdAt ? new Date(j.createdAt) : undefined
        }
      })
    }

    // 7. Query Latest Dataset from DB
    const dbAccounts = await prisma.financeAccount.findMany({
      where: { userId }
    })
    const dbTransactions = await prisma.financeTransaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    })
    const dbBudgets = await prisma.financeBudget.findMany({
      where: { userId }
    })
    const dbGoals = await prisma.financeGoal.findMany({
      where: { userId }
    })
    const dbJournals = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      accounts: dbAccounts,
      transactions: dbTransactions,
      budgets: dbBudgets,
      goals: dbGoals,
      journals: dbJournals
    })
  } catch (error: any) {
    console.error("[SYNC API ERROR]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
