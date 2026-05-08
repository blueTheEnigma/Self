import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const connections = await prisma.partnerConnection.findMany({
    where: {
      OR: [
        { requesterId: userId },
        { responderId: userId }
      ]
    },
    include: {
      requester: { select: { id: true, name: true, image: true } },
      responder: { select: { id: true, name: true, image: true } }
    }
  });

  return NextResponse.json({ connections });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  // Check 5 partner constraint
  const currentCount = await prisma.partnerConnection.count({
    where: {
      OR: [
        { requesterId: userId, status: 'APPROVED' },
        { responderId: userId, status: 'APPROVED' }
      ]
    }
  });

  if (currentCount >= 5) {
    return NextResponse.json({ error: 'Maximum 5 partners allowed' }, { status: 400 });
  }

  // Generate unique link token
  const token = crypto.randomBytes(16).toString('hex');

  const connection = await prisma.partnerConnection.create({
    data: {
      requesterId: userId,
      status: 'PENDING',
      token
    }
  });

  return NextResponse.json({ 
    connection, 
    link: `${process.env.NEXTAUTH_URL}/partners/join?token=${token}` 
  });
}
