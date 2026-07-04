'use server';

import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, loginUser, logoutUser, MockAuthAdapter } from '@/lib/auth/auth';
import { requireFamilyAccess, canEditPerson } from '@/lib/permissions/checks';
import { wouldCreateCycle } from '@/lib/validators/cycle';
import { MembershipRole, PersonGender, LifeStatus, PrivacyLevel, ParentRole, ParentChildType, PartnershipType, PartnershipStatus, DatePrecision, DateCalendar } from '@prisma/client';

// 1. ĐĂNG NHẬP VÀ ĐĂNG XUẤT ACTIONS
export async function handleLogin(emailOrPhone: string, code: string) {
  const adapter = new MockAuthAdapter();
  const user = await adapter.verifyOtp(emailOrPhone, code);
  
  if (!user) {
    throw new Error('Mã OTP không chính xác. Vui lòng nhập 123456 để thử nghiệm.');
  }

  await loginUser(user.id);
  
  // Ghi nhật ký bảo mật đăng nhập
  await prisma.securityLog.create({
    data: {
      actorUserId: user.id,
      eventType: 'login',
      metadata: { emailOrPhone },
    },
  });

  redirect('/dashboard');
}

export async function handleLogout() {
  const user = await requireAuth();
  
  await prisma.securityLog.create({
    data: {
      actorUserId: user.id,
      eventType: 'logout',
    },
  });

  await logoutUser();
  redirect('/');
}

// 2. MEMBER CRUD ACTIONS
export async function createPersonAction(familyId: string, formData: any) {
  const user = await requireAuth();
  const membership = await requireFamilyAccess(user.id, familyId);

  // Chỉ Editor trở lên mới được tạo người
  if (membership.role === MembershipRole.viewer || membership.role === MembershipRole.member) {
    throw new Error('Bạn không có quyền thêm thành viên.');
  }

  // Đảm bảo nếu là Trưởng chi thì chỉ được thêm người vào chi của mình
  let branchId = formData.branchId || null;
  if (membership.role === MembershipRole.branch_manager && membership.branchId) {
    branchId = membership.branchId;
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Tạo Person
    const person = await tx.person.create({
      data: {
        familyId,
        branchId,
        primaryName: formData.primaryName,
        gender: formData.gender as PersonGender,
        lifeStatus: formData.lifeStatus as LifeStatus,
        isLiving: formData.lifeStatus === LifeStatus.living,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        birthDateValue: formData.birthDateValue ? new Date(formData.birthDateValue) : null,
        birthDatePrecision: formData.birthDateValue ? DatePrecision.exact : DatePrecision.unknown,
        birthDateCalendar: DateCalendar.gregorian,
        deathYear: formData.deathYear ? parseInt(formData.deathYear) : null,
        deathDateValue: formData.deathDateValue ? new Date(formData.deathDateValue) : null,
        deathDatePrecision: formData.deathDateValue ? DatePrecision.exact : DatePrecision.unknown,
        deathDateCalendar: DateCalendar.gregorian,
        phone: formData.phone || null,
        email: formData.email || null,
        currentAddress: formData.currentAddress || null,
        biographyPublic: formData.biographyPublic || null,
        privacyLevel: (formData.privacyLevel || PrivacyLevel.normal) as PrivacyLevel,
        createdByUserId: user.id,
      },
    });

    // 2. Tạo PersonName tương ứng
    await tx.personName.create({
      data: {
        familyId,
        personId: person.id,
        name: formData.primaryName,
        nameType: 'primary',
        isPrimary: true,
      },
    });

    // 3. Ghi nhận Audit Log
    await tx.auditLog.create({
      data: {
        familyId,
        actorUserId: user.id,
        action: 'create',
        entityType: 'person',
        entityId: person.id,
        afterData: person as any,
      },
    });

    return person;
  });

  revalidatePath('/dashboard/people');
  return result;
}

export async function updatePersonAction(personId: string, formData: any) {
  const user = await requireAuth();
  
  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) throw new Error('Hồ sơ không tồn tại.');

  const membership = await requireFamilyAccess(user.id, person.familyId);

  // Kiểm tra quyền chỉnh sửa
  if (!canEditPerson(membership, person)) {
    throw new Error('Bạn không có quyền chỉnh sửa thành viên này.');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Lấy dữ liệu trước khi sửa để lưu log
    const beforeData = await tx.person.findUnique({ where: { id: personId } });

    // Cập nhật Person
    const updated = await tx.person.update({
      where: { id: personId },
      data: {
        branchId: formData.branchId || null,
        primaryName: formData.primaryName,
        gender: formData.gender as PersonGender,
        lifeStatus: formData.lifeStatus as LifeStatus,
        isLiving: formData.lifeStatus === LifeStatus.living,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        birthDateValue: formData.birthDateValue ? new Date(formData.birthDateValue) : null,
        birthDatePrecision: formData.birthDateValue ? DatePrecision.exact : DatePrecision.unknown,
        deathYear: formData.deathYear ? parseInt(formData.deathYear) : null,
        deathDateValue: formData.deathDateValue ? new Date(formData.deathDateValue) : null,
        deathDatePrecision: formData.deathDateValue ? DatePrecision.exact : DatePrecision.unknown,
        phone: formData.phone || null,
        email: formData.email || null,
        currentAddress: formData.currentAddress || null,
        biographyPublic: formData.biographyPublic || null,
        privacyLevel: (formData.privacyLevel || PrivacyLevel.normal) as PrivacyLevel,
        updatedByUserId: user.id,
      },
    });

    // Cập nhật tên chính nếu có thay đổi
    if (beforeData?.primaryName !== formData.primaryName) {
      await tx.personName.updateMany({
        where: { personId, isPrimary: true },
        data: { name: formData.primaryName },
      });
    }

    // Ghi nhận Audit Log
    await tx.auditLog.create({
      data: {
        familyId: person.familyId,
        actorUserId: user.id,
        action: 'update',
        entityType: 'person',
        entityId: personId,
        beforeData: beforeData as any,
        afterData: updated as any,
      },
    });

    return updated;
  });

  revalidatePath('/dashboard/people');
  return result;
}

export async function archivePersonAction(personId: string) {
  const user = await requireAuth();

  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) throw new Error('Hồ sơ không tồn tại.');

  const membership = await requireFamilyAccess(user.id, person.familyId);

  // Chỉ Owner và Family Admin mới được lưu trữ/xóa mềm thành viên
  if (membership.role !== MembershipRole.owner && membership.role !== MembershipRole.family_admin) {
    throw new Error('Chỉ Quản trị viên cao nhất mới được xóa hoặc lưu trữ thành viên.');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.person.update({
      where: { id: personId },
      data: {
        status: 'archived',
        archivedAt: new Date(),
        archivedByUserId: user.id,
      },
    });

    // Ghi nhận Audit Log
    await tx.auditLog.create({
      data: {
        familyId: person.familyId,
        actorUserId: user.id,
        action: 'archive',
        entityType: 'person',
        entityId: personId,
        beforeData: person as any,
        afterData: updated as any,
      },
    });

    return updated;
  });

  revalidatePath('/dashboard/people');
  return result;
}

// 3. MỐI QUAN HỆ ACTIONS
export async function saveRelationshipAction(
  familyId: string,
  parentId: string,
  childId: string,
  parentRole: ParentRole,
  relationshipType: ParentChildType,
  childOrder?: number,
  childOrderLabel?: string
) {
  const user = await requireAuth();
  const membership = await requireFamilyAccess(user.id, familyId);

  if (membership.role === MembershipRole.viewer || membership.role === MembershipRole.member) {
    throw new Error('Bạn không có quyền sửa đổi mối quan hệ.');
  }

  // 1. Kiểm tra vòng lặp tổ tiên
  const isCycle = await wouldCreateCycle(parentId, childId, familyId);
  if (isCycle) {
    throw new Error('Mối quan hệ không hợp lệ: Người con không thể là tổ tiên của cha/mẹ.');
  }

  // 2. Kiểm tra xem người con đã có cha/mẹ sinh học xác nhận từ trước chưa
  if (relationshipType === ParentChildType.biological && parentRole !== ParentRole.unknown) {
    const existingParent = await prisma.parentChildRelationship.findFirst({
      where: {
        familyId,
        childId,
        parentRole,
        relationshipType: ParentChildType.biological,
        certaintyLevel: 'confirmed',
        archivedAt: null,
      },
    });
    if (existingParent && existingParent.parentId !== parentId) {
      throw new Error(`Người con này đã có ${parentRole === ParentRole.father ? 'cha' : 'mẹ'} sinh học chính thức trong hệ thống.`);
    }
  }

  // 3. Tạo quan hệ
  const relationship = await prisma.parentChildRelationship.create({
    data: {
      familyId,
      parentId,
      childId,
      parentRole,
      relationshipType,
      childOrder: childOrder ? parseInt(childOrder as any) : null,
      childOrderLabel: childOrderLabel || null,
      createdByUserId: user.id,
    },
  });

  // Ghi Audit Log
  await prisma.auditLog.create({
    data: {
      familyId,
      actorUserId: user.id,
      action: 'create',
      entityType: 'relationship',
      entityId: relationship.id,
      afterData: relationship as any,
    },
  });

  revalidatePath('/dashboard/relationships');
  return relationship;
}

export async function savePartnershipAction(
  familyId: string,
  person1Id: string,
  person2Id: string,
  partnershipType: PartnershipType,
  status: PartnershipStatus,
  startYear?: number
) {
  const user = await requireAuth();
  const membership = await requireFamilyAccess(user.id, familyId);

  if (membership.role === MembershipRole.viewer || membership.role === MembershipRole.member) {
    throw new Error('Bạn không có quyền sửa đổi quan hệ hôn nhân.');
  }

  if (person1Id === person2Id) {
    throw new Error('Không thể kết hôn với chính mình.');
  }

  // Sắp xếp UUID theo thứ tự từ điển để tránh trùng lặp quan hệ đảo ngược (A-B và B-A)
  const [canonicalPerson1Id, canonicalPerson2Id] = [person1Id, person2Id].sort();

  // Kiểm tra trùng lặp
  const existing = await prisma.partnership.findFirst({
    where: {
      familyId,
      person1Id: canonicalPerson1Id,
      person2Id: canonicalPerson2Id,
      archivedAt: null,
    },
  });

  if (existing) {
    throw new Error('Quan hệ hôn phối giữa hai người này đã tồn tại.');
  }

  const partnership = await prisma.partnership.create({
    data: {
      familyId,
      person1Id: canonicalPerson1Id,
      person2Id: canonicalPerson2Id,
      partnershipType,
      status,
      startYear: startYear ? parseInt(startYear as any) : null,
      createdByUserId: user.id,
    },
  });

  // Ghi Audit Log
  await prisma.auditLog.create({
    data: {
      familyId,
      actorUserId: user.id,
      action: 'create',
      entityType: 'partnership',
      entityId: partnership.id,
      afterData: partnership as any,
    },
  });

  revalidatePath('/dashboard/relationships');
  return partnership;
}
