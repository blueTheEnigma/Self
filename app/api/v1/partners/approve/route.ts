import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { connectionId } = await req.json();
  const userId = (session.user as any).id;

  const connection = await prisma.partnerConnection.findUnique({ where: { id: connectionId } });
  if (!connection) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Only the requester can approve the connection
  if (connection.requesterId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updatedConnection = await prisma.partnerConnection.update({
    where: { id: connectionId },
    data: { status: 'APPROVED' }
  });

  return NextResponse.json({ success: true, connection: updatedConnection });
}
