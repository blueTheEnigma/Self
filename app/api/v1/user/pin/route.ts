import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pin } = await req.json();
  if (!pin || pin.length < 4) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
  }

  const userId = (session.user as any).id;

  await prisma.user.update({
    where: { id: userId },
    data: { pin } // In a production app, hash this PIN using bcrypt!
  });

  return NextResponse.json({ success: true });
}
