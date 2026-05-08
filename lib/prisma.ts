import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool, neonConfig } from "@neondatabase/serverless"
import ws from "ws"

if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined
}

const url = process.env.POSTGRES_URL?.trim()

function createPrismaClient() {
  if (!url) {
    console.error("[PRISMA DEBUG] No POSTGRES_URL found")
    return new PrismaClient()
  }

  console.log("[PRISMA DEBUG] Creating client with URL length:", url.length)
  const pool = new Pool({ connectionString: url })
  const adapter = new PrismaNeon(pool as any)
  
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma





