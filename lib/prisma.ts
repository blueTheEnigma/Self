import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool, neonConfig } from "@neondatabase/serverless"
import ws from "ws"

// Required for Node.js runtime (Vercel serverless functions)
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const url = process.env.POSTGRES_URL?.trim()
  console.log("[PRISMA DEBUG] URL present:", !!url)
  if (url) {
    console.log("[PRISMA DEBUG] URL prefix:", url.substring(0, 15))
    console.log("[PRISMA DEBUG] URL length:", url.length)
  }

  if (!url) {
    console.error("[PRISMA DEBUG] CRITICAL: POSTGRES_URL is missing")
    return new PrismaClient({ log: ["error"] } as any)
  }
  
  try {
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaNeon(pool as any)
    return new PrismaClient({ adapter } as any)
  } catch (e: any) {
    console.error("[PRISMA DEBUG] Pool/Adapter Error:", e.message)
    return new PrismaClient({ log: ["error"] } as any)
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma




