import crypto from 'crypto';
import prisma from '../db/client';
import { MembershipRole } from '@prisma/client';

export function generateToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export async function createInvite(params: {
  familyId: string;
  invitedEmail?: string;
  invitedPhone?: string;
  role: MembershipRole;
  branchId?: string;
  createdByUserId: string;
}) {
  const { token, hash } = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Hạn dùng 7 ngày

  const invite = await prisma.invite.create({
    data: {
      familyId: params.familyId,
      invitedEmail: params.invitedEmail,
      invitedPhone: params.invitedPhone,
      role: params.role,
      branchId: params.branchId,
      tokenHash: hash,
      expiresAt,
      createdByUserId: params.createdByUserId,
      status: 'pending',
    },
  });

  return { invite, token };
}

export async function verifyInviteToken(token: string) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  
  const invite = await prisma.invite.findFirst({
    where: {
      tokenHash: hash,
      status: 'pending',
      expiresAt: {
        gt: new Date()
      }
    }
  });

  return invite;
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await verifyInviteToken(token);
  if (!invite) {
    throw new Error('Lời mời không hợp lệ hoặc đã hết hạn.');
  }

  // Chạy transaction để đổi trạng thái invite và tạo membership
  return prisma.$transaction(async (tx) => {
    // 1. Đổi trạng thái invite
    const updatedInvite = await tx.invite.update({
      where: { id: invite.id },
      data: {
        status: 'accepted',
        acceptedByUserId: userId,
        acceptedAt: new Date()
      }
    });

    // 2. Tạo hoặc cập nhật membership
    const membership = await tx.membership.upsert({
      where: {
        userId_familyId: {
          userId,
          familyId: invite.familyId
        }
      },
      update: {
        role: invite.role,
        branchId: invite.branchId,
        status: 'active',
        revokedAt: null
      },
      create: {
        userId,
        familyId: invite.familyId,
        role: invite.role,
        branchId: invite.branchId,
        status: 'active',
        invitedByUserId: invite.createdByUserId
      }
    });

    // 3. Ghi log bảo mật (Security Log)
    await tx.securityLog.create({
      data: {
        familyId: invite.familyId,
        actorUserId: userId,
        eventType: 'accept_invite',
        entityType: 'invite',
        entityId: invite.id,
        metadata: {
          role: invite.role,
          branchId: invite.branchId
        }
      }
    });

    return { invite: updatedInvite, membership };
  });
}
