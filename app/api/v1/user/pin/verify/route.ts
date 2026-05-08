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
  if (!pin) {
    return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.pin === pin) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
  }
}
