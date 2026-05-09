import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const url = (process.env.POSTGRES_URL || process.env.DATABASE_URL)?.trim()

function createPrismaClient() {
  if (!url) {
    console.error("[PRISMA DEBUG] CRITICAL: No database URL found (POSTGRES_URL or DATABASE_URL)")
    return new PrismaClient({ log: ["error"] })
  }

  try {
    console.log("[PRISMA DEBUG] Initializing Prisma with PG adapter. URL length:", url.length)
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter } as any)
  } catch (e: any) {
    console.error("[PRISMA DEBUG] PG Adapter Error:", e.message)
    return new PrismaClient({ log: ["error"] } as any)
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
