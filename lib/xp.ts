import { prisma } from "./prisma"

/**
 * Adds XP to a user and handles leveling up.
 * Basic logic: Level = floor(sqrt(XP / 100)) + 1
 */
export async function addXP(userId: string, amount: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true }
  })

  if (!user) return

  const newXP = user.xp + amount
  const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel > user.level ? newLevel : user.level
    }
  })

  return { xp: newXP, level: newLevel, leveledUp: newLevel > user.level }
}
