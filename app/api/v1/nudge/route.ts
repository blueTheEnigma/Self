import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { receiverId } = await req.json();
  const senderId = (session.user as any).id;

  // Verify connection exists
  const connection = await prisma.partnerConnection.findFirst({
    where: {
      status: 'APPROVED',
      OR: [
        { requesterId: senderId, responderId: receiverId },
        { requesterId: receiverId, responderId: senderId }
      ]
    }
  });

  if (!connection) {
    return NextResponse.json({ error: 'Not an approved partner' }, { status: 403 });
  }

  // Create nudge record (acts as in-app fallback / history)
  const nudge = await prisma.nudge.create({
    data: {
      senderId,
      receiverId
    }
  });

  // In a full implementation, you would trigger a Web Push Notification here using web-push.
  // For V1, the DB record serves as the state for the in-app indicator.

  return NextResponse.json({ success: true, nudge });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  // Get unread nudges
  const nudges = await prisma.nudge.findMany({
    where: {
      receiverId: userId,
      read: false
    },
    include: {
      sender: { select: { name: true } }
    }
  });

  // Mark them as read once fetched (so they only show once as a knock)
  if (nudges.length > 0) {
    await prisma.nudge.updateMany({
      where: {
        id: { in: nudges.map(n => n.id) }
      },
      data: { read: true }
    });
  }

  return NextResponse.json({ nudges });
}
