import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { goalId, status } = await req.json(); // status: 'DONE' or 'MISSED'
  const userId = (session.user as any).id;

  // Validate the goal belongs to the user
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get the start of the current UTC day to prevent multiple check-ins
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const checkIn = await prisma.checkIn.upsert({
    where: {
      goalId_date: {
        goalId: goalId,
        date: today
      }
    },
    update: {
      status
    },
    create: {
      goalId,
      date: today,
      status
    }
  });

  return NextResponse.json({ checkIn });
}
