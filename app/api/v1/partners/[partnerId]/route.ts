import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { partnerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const partnerId = params.partnerId;

  // Validate connection
  const connection = await prisma.partnerConnection.findFirst({
    where: {
      status: 'APPROVED',
      OR: [
        { requesterId: userId, responderId: partnerId },
        { requesterId: partnerId, responderId: userId }
      ]
    }
  });

  if (!connection) {
    return NextResponse.json({ error: 'Not an approved partner' }, { status: 403 });
  }

  // Fetch partner's goals and check-ins
  const goals = await prisma.goal.findMany({
    where: { userId: partnerId },
    include: {
      checkIns: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
          }
        },
        orderBy: { date: 'desc' }
      }
    }
  });

  const partnerInfo = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { name: true }
  });

  const sanitizedGoals = goals.map(g => {
    let streak = 0;
    for (const c of g.checkIns) {
      if (c.status === 'DONE') streak++;
      else break;
    }
    
    return {
      id: g.id,
      type: g.type,
      title: g.type === 'NAMED' ? g.title : null,
      color: g.color,
      streak,
      // Pass the last 7 days checkins for the dots UI
      checkIns: g.checkIns.slice(0, 7).map(c => ({ date: c.date, status: c.status }))
    };
  });

  return NextResponse.json({ partner: partnerInfo, goals: sanitizedGoals });
}
