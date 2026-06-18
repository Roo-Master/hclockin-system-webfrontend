import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const currentAdminId = 'replace-with-auth-user-id';

export async function GET() {
  const user = await prisma.user.findUnique({
    where: { id: currentAdminId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      bio: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      role: user.role,
      initials: user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      joinedAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  const updated = await prisma.user.update({
    where: { id: currentAdminId },
    data: {
      name: body.name,
      email: body.email,
      bio: body.bio,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      bio: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return NextResponse.json({
    profile: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      bio: updated.bio,
      role: updated.role,
      initials: updated.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      joinedAt: updated.createdAt,
      lastLoginAt: updated.lastLoginAt,
    },
  });
}