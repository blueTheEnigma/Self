import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await req.json();
  const userId = (session.user as any).id;

  const connection = await prisma.partnerConnection.findUnique({ where: { token } });
  
  if (!connection) {
    return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
  }

  if (connection.requesterId === userId) {
    return NextResponse.json({ error: 'You cannot be your own partner' }, { status: 400 });
  }

  // Complete the connection (Wait for requester to approve, or auto-approve depending on specs)
  // The spec says: "They sign up through it. You approve them."
  // So the status remains PENDING, but responderId is set.

  const updatedConnection = await prisma.partnerConnection.update({
    where: { token },
    data: {
      responderId: userId
    }
  });

  return NextResponse.json({ success: true, connection: updatedConnection });
}
