import prisma from '../db/client';
import { Membership, Person, MembershipRole } from '@prisma/client';
import { hasRoleAtLeast } from './roles';

// Tìm membership của user trong gia phả
export async function getMembership(userId: string, familyId: string): Promise<Membership | null> {
  return prisma.membership.findFirst({
    where: {
      userId,
      familyId,
      status: 'active',
      revokedAt: null
    }
  });
}

// Yêu cầu user phải có quyền truy cập vào gia tộc
export async function requireFamilyAccess(userId: string, familyId: string): Promise<Membership> {
  const membership = await getMembership(userId, familyId);
  if (!membership) {
    throw new Error('Bạn không có quyền truy cập vào gia tộc này.');
  }
  return membership;
}

// Kiểm tra xem viewer có thể xem hồ sơ người này không
export function canViewPerson(membership: Membership, person: Person): boolean {
  if (person.familyId !== membership.familyId) {
    return false;
  }

  // Nếu người đó bị archive, chỉ Owner/Admin mới thấy
  if (person.status === 'archived' && !hasRoleAtLeast(membership.role, MembershipRole.family_admin)) {
    return false;
  }

  // Phân cấp mức độ riêng tư (privacy_level) của hồ sơ
  // normal: tất cả thành viên trong gia tộc đều xem được
  // restricted: xem được
  // sensitive: chỉ editor trở lên xem được
  // private: chỉ owner và family_admin xem được
  if (person.privacyLevel === 'private') {
    return hasRoleAtLeast(membership.role, MembershipRole.family_admin);
  }
  if (person.privacyLevel === 'sensitive') {
    return hasRoleAtLeast(membership.role, MembershipRole.editor);
  }

  return true;
}

// Kiểm tra xem viewer có thể chỉnh sửa hồ sơ người này không
export function canEditPerson(membership: Membership, person: Person): boolean {
  if (person.familyId !== membership.familyId) {
    return false;
  }

  // Phải có quyền editor trở lên mới được sửa
  if (!hasRoleAtLeast(membership.role, MembershipRole.editor)) {
    return false;
  }

  // Nếu membership bị giới hạn theo chi/phánh (branch_id)
  if (membership.branchId && person.branchId !== membership.branchId) {
    // Trưởng chi chỉ được sửa người thuộc chi mình (ở MVP chỉ so khớp đơn giản, sau này kiểm tra cây chi con)
    return false;
  }

  return true;
}

// Kiểm tra xem viewer có thể quản lý chi này không
export async function canManageBranch(membership: Membership, branchId: string): Promise<boolean> {
  if (!hasRoleAtLeast(membership.role, MembershipRole.branch_manager)) {
    return false;
  }

  if (membership.role === MembershipRole.owner || membership.role === MembershipRole.family_admin) {
    return true;
  }

  // Nếu là branch_manager, chỉ được quản lý chi mình phụ trách
  if (membership.role === MembershipRole.branch_manager) {
    return membership.branchId === branchId;
  }

  return false;
}
