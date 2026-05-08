import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const goals = await prisma.goal.findMany({ where: { userId } });
  
  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, title, color } = await req.json();
  const userId = (session.user as any).id;

  const goal = await prisma.goal.create({
    data: {
      userId,
      type,
      title: type === 'NAMED' ? title : null,
      color,
    }
  });

  return NextResponse.json({ goal });
}
