import { MembershipRole } from '@prisma/client';

// Cấp độ quyền lực (càng nhỏ càng cao) để so sánh thứ bậc
export const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  [MembershipRole.owner]: 0,
  [MembershipRole.family_admin]: 1,
  [MembershipRole.branch_manager]: 2,
  [MembershipRole.editor]: 3,
  [MembershipRole.member]: 4,
  [MembershipRole.viewer]: 5,
};

export function hasRoleAtLeast(userRole: MembershipRole, targetRole: MembershipRole): boolean {
  return ROLE_HIERARCHY[userRole] <= ROLE_HIERARCHY[targetRole];
}
