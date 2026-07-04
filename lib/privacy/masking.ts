import { Person, Membership, MembershipRole } from '@prisma/client';
import { hasRoleAtLeast } from '../permissions/roles';

export interface MaskedPerson extends Partial<Person> {
  privacyMasked: boolean;
}

/**
 * Che giấu các trường thông tin nhạy cảm của người còn sống
 * nếu tài khoản xem không phải là Editor/Admin/Owner hoặc chính họ.
 */
export function maskPersonForViewer(
  person: Person,
  membership: Membership,
  linkedPersonId?: string | null
): MaskedPerson {
  // 1. Nếu là Editor, Family Admin, hoặc Owner -> Xem đầy đủ không che
  if (hasRoleAtLeast(membership.role, MembershipRole.editor)) {
    return { ...person, privacyMasked: false };
  }

  // 2. Nếu người đang xem chính là hồ sơ này -> Xem đầy đủ không che
  if (linkedPersonId && person.id === linkedPersonId) {
    return { ...person, privacyMasked: false };
  }

  // 3. Nếu là người còn sống (isLiving === true) -> Tiến hành che giấu thông tin
  if (person.isLiving) {
    return {
      ...person,
      birthDateValue: null,          // Ẩn ngày sinh đầy đủ
      phone: null,                   // Ẩn SĐT
      email: null,                   // Ẩn Email
      currentAddress: null,          // Ẩn địa chỉ hiện tại
      biographyPublic: person.biographyPublic ? 'Sinh năm ' + person.birthYear : null, // Thay bằng năm sinh sơ lược
      biographyPrivate: null,        // Ẩn tiểu sử riêng tư
      profilePhotoMediaId: null,     // Ẩn ảnh đại diện nếu có chính sách bảo mật
      privacyMasked: true,
    };
  }

  // 4. Với người đã mất (deceased) -> Vẫn ẩn các thông tin liên lạc nhạy cảm/tiểu sử riêng tư nếu có
  return {
    ...person,
    phone: null,
    email: null,
    currentAddress: null,
    biographyPrivate: null,
    privacyMasked: false,
  };
}
