import { Membership, Person, MembershipRole, PersonGender, LifeStatus, PrivacyLevel } from '@prisma/client';
import { canViewPerson, canEditPerson } from '../lib/permissions/checks';
import { maskPersonForViewer } from '../lib/privacy/masking';

// Giả lập dữ liệu
const mockFamilyId = 'family-uuid-123';

const viewerMembership: Membership = {
  id: 'membership-viewer',
  userId: 'user-viewer',
  familyId: mockFamilyId,
  role: MembershipRole.viewer,
  branchId: null,
  status: 'active',
  invitedByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  revokedAt: null,
};

const editorMembership: Membership = {
  id: 'membership-editor',
  userId: 'user-editor',
  familyId: mockFamilyId,
  role: MembershipRole.editor,
  branchId: 'branch-uuid-1',
  status: 'active',
  invitedByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  revokedAt: null,
};

const livingPerson: Person = {
  id: 'person-living-1',
  familyId: mockFamilyId,
  branchId: 'branch-uuid-1',
  primaryName: 'Nguyễn Văn Bản',
  gender: PersonGender.male,
  lifeStatus: LifeStatus.living,
  isLiving: true,
  birthDateValue: new Date('1968-05-15'),
  birthYear: 1968,
  birthDatePrecision: 'exact',
  birthDateCalendar: 'gregorian',
  birthDateText: null,
  deathDateValue: null,
  deathYear: null,
  deathDatePrecision: 'unknown',
  deathDateCalendar: 'unknown',
  deathDateText: null,
  memorialDateValue: null,
  memorialLunarDay: null,
  memorialLunarMonth: null,
  memorialLunarIsLeap: null,
  memorialDateText: null,
  generationCalculated: 3,
  generationManual: 3,
  generationDisplay: 3,
  generationSource: 'manual',
  biographyPublic: 'Kỹ sư nông nghiệp nghỉ hưu.',
  biographyPrivate: 'Ghi chú cực kỳ bảo mật.',
  achievements: null,
  occupation: 'Kỹ sư',
  education: 'Đại học',
  hometownPlaceId: null,
  birthPlaceId: null,
  deathPlaceId: null,
  burialPlaceId: null,
  phone: '0987654321',
  email: 'ban.nguyen@family.com',
  currentAddress: 'Hà Nội',
  profilePhotoMediaId: null,
  privacyLevel: PrivacyLevel.normal,
  status: 'active',
  mergedIntoPersonId: null,
  createdByUserId: 'user-owner',
  updatedByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  archivedAt: null,
  archivedByUserId: null,
};

const sensitivePerson: Person = {
  ...livingPerson,
  id: 'person-sensitive',
  primaryName: 'Nguyễn Thị Hoa',
  privacyLevel: PrivacyLevel.sensitive,
  phone: '0912345678',
};

const deceasedPerson: Person = {
  ...livingPerson,
  id: 'person-deceased',
  primaryName: 'Nguyễn Văn Cha',
  lifeStatus: LifeStatus.deceased,
  isLiving: false,
  birthYear: 1935,
  deathYear: 2010,
};

function runTests() {
  console.log('--- Bắt đầu chạy test phân quyền và bảo mật ---\n');

  // Test 1: Kiểm tra quyền xem
  console.log('Test 1: Quyền xem hồ sơ');
  console.log(' - Viewer có thể xem living person (normal)?:', canViewPerson(viewerMembership, livingPerson)); // true
  console.log(' - Viewer có thể xem sensitive person?:', canViewPerson(viewerMembership, sensitivePerson)); // false (sensitive chỉ editor+)
  console.log(' - Editor có thể xem sensitive person?:', canViewPerson(editorMembership, sensitivePerson)); // true
  console.log('');

  // Test 2: Kiểm tra quyền sửa
  console.log('Test 2: Quyền chỉnh sửa hồ sơ');
  console.log(' - Viewer có được sửa living person?:', canEditPerson(viewerMembership, livingPerson)); // false
  console.log(' - Editor có được sửa living person cùng chi?:', canEditPerson(editorMembership, livingPerson)); // true (cùng chi branch-uuid-1)
  
  const differentBranchPerson: Person = { ...livingPerson, branchId: 'branch-uuid-2' };
  console.log(' - Editor chi 1 có được sửa người thuộc chi 2?:', canEditPerson(editorMembership, differentBranchPerson)); // false (giới hạn theo chi)
  console.log('');

  // Test 3: Che giấu dữ liệu (Privacy Masking)
  console.log('Test 3: Che giấu thông tin người còn sống');
  
  const maskedForViewer = maskPersonForViewer(livingPerson, viewerMembership);
  console.log(' - Cho Viewer xem (Living):');
  console.log('   * Tên hiển thị:', maskedForViewer.primaryName);
  console.log('   * Ngày sinh đầy đủ (phải là null):', maskedForViewer.birthDateValue);
  console.log('   * Năm sinh (vẫn hiển thị):', maskedForViewer.birthYear);
  console.log('   * Số điện thoại (phải là null):', maskedForViewer.phone);
  console.log('   * Email (phải là null):', maskedForViewer.email);
  console.log('   * Địa chỉ (phải là null):', maskedForViewer.currentAddress);
  console.log('   * Tiểu sử (đã rút gọn):', maskedForViewer.biographyPublic);
  console.log('   * Đã che thông tin?:', maskedForViewer.privacyMasked);
  console.log('');

  const maskedForEditor = maskPersonForViewer(livingPerson, editorMembership);
  console.log(' - Cho Editor xem (Living):');
  console.log('   * Ngày sinh đầy đủ (hiển thị):', maskedForEditor.birthDateValue?.toISOString().slice(0, 10));
  console.log('   * Số điện thoại (hiển thị):', maskedForEditor.phone);
  console.log('   * Đã che thông tin?:', maskedForEditor.privacyMasked);
  console.log('');

  const maskedDeceased = maskPersonForViewer(deceasedPerson, viewerMembership);
  console.log(' - Cho Viewer xem (Deceased):');
  console.log('   * Số điện thoại (phải là null):', maskedDeceased.phone);
  console.log('   * Năm sinh (vẫn hiển thị):', maskedDeceased.birthYear);
  console.log('   * Đã che thông tin?:', maskedDeceased.privacyMasked);
  console.log('');

  console.log('--- Hoàn tất chạy test ---');
}

runTests();
