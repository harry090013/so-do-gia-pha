import { PrismaClient, UserStatus, MembershipRole, MembershipStatus, PersonGender, LifeStatus, PrivacyLevel, NameType, ParentRole, ParentChildType, PartnershipType, PartnershipStatus, DatePrecision } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu gieo dữ liệu demo...');

  // 1. Tạo Users
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@giapha.vn' },
    update: {},
    create: {
      displayName: 'Nguyễn Văn Chủ (Owner)',
      email: 'owner@giapha.vn',
      phone: '0901234567',
      status: UserStatus.active,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@giapha.vn' },
    update: {},
    create: {
      displayName: 'Lê Quản Trị (Admin)',
      email: 'admin@giapha.vn',
      phone: '0907654321',
      status: UserStatus.active,
    },
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@giapha.vn' },
    update: {},
    create: {
      displayName: 'Trần Thế Khách (Viewer)',
      email: 'viewer@giapha.vn',
      phone: '0909998888',
      status: UserStatus.active,
    },
  });

  console.log(`Đã tạo ${3} users.`);

  // 2. Tạo Family
  const family = await prisma.family.create({
    data: {
      name: 'Nguyễn Tộc Gia Phả',
      slug: 'nguyen-toc',
      description: 'Gia phả chi trưởng họ Nguyễn tại Thanh Oai, Hà Nội',
      createdByUserId: ownerUser.id,
      visibility: 'invite_only',
      livingPersonPolicy: 'strict',
    },
  });

  // Tạo FamilySettings
  await prisma.familySettings.create({
    data: {
      familyId: family.id,
      allowPublicAccess: false,
      blockSearchIndex: true,
      requireInvite: true,
    },
  });

  console.log(`Đã tạo gia tộc: ${family.name} (${family.slug})`);

  // 3. Tạo Memberships
  await prisma.membership.createMany({
    data: [
      {
        userId: ownerUser.id,
        familyId: family.id,
        role: MembershipRole.owner,
        status: MembershipStatus.active,
      },
      {
        userId: adminUser.id,
        familyId: family.id,
        role: MembershipRole.family_admin,
        status: MembershipStatus.active,
      },
      {
        userId: viewerUser.id,
        familyId: family.id,
        role: MembershipRole.viewer,
        status: MembershipStatus.active,
      },
    ],
  });

  console.log('Đã tạo memberships cho các user.');

  // 4. Tạo Branch
  const mainBranch = await prisma.branch.create({
    data: {
      familyId: family.id,
      name: 'Chi Trưởng Lâm Thao',
      slug: 'chi-truong-lam-thao',
      description: 'Nhánh con cháu cụ Nguyễn Văn Tổ định cư tại Lâm Thao',
      createdByUserId: ownerUser.id,
    },
  });

  console.log(`Đã tạo chi/nhánh: ${mainBranch.name}`);

  // 5. Tạo các Places
  const placeHN = await prisma.place.create({
    data: {
      familyId: family.id,
      name: 'Thanh Oai, Hà Nội',
      placeType: 'district',
      address: 'Huyện Thanh Oai, Thành phố Hà Nội',
    },
  });

  const placeBurial = await prisma.place.create({
    data: {
      familyId: family.id,
      name: 'Nghĩa trang Gò Dài',
      placeType: 'cemetery',
      address: 'Xã Bình Minh, Thanh Oai, Hà Nội',
    },
  });

  // 6. Tạo People (4 thế hệ)
  // Thế hệ 1: Cụ Tổ (Đã mất)
  const p1_ancestor = await prisma.person.create({
    data: {
      familyId: family.id,
      branchId: mainBranch.id,
      primaryName: 'Nguyễn Văn Tổ',
      gender: PersonGender.male,
      lifeStatus: LifeStatus.deceased,
      isLiving: false,
      birthYear: 1910,
      birthDatePrecision: DatePrecision.year_only,
      deathYear: 1980,
      deathDatePrecision: DatePrecision.year_only,
      generationCalculated: 1,
      generationDisplay: 1,
      generationSource: 'manual',
      biographyPublic: 'Cụ tổ sáng lập dòng họ Nguyễn Thanh Oai. Tham gia kháng chiến chống Pháp.',
      hometownPlaceId: placeHN.id,
      burialPlaceId: placeBurial.id,
      createdByUserId: ownerUser.id,
    },
  });

  // Lưu tên húy/tên phụ cụ Tổ
  await prisma.personName.create({
    data: {
      familyId: family.id,
      personId: p1_ancestor.id,
      name: 'Nguyễn Văn Húy Tổ',
      nameType: NameType.taboo_name,
      isPrimary: false,
    },
  });

  // Cập nhật rootPersonId cho Family
  await prisma.family.update({
    where: { id: family.id },
    data: { rootPersonId: p1_ancestor.id },
  });

  // Thế hệ 2: Cụ Nguyễn Văn Cha (Đã mất) và Cụ bà Lê Thị Mẹ (Đã mất)
  const p2_father = await prisma.person.create({
    data: {
      familyId: family.id,
      branchId: mainBranch.id,
      primaryName: 'Nguyễn Văn Cha',
      gender: PersonGender.male,
      lifeStatus: LifeStatus.deceased,
      isLiving: false,
      birthYear: 1935,
      birthDatePrecision: DatePrecision.year_only,
      deathYear: 2010,
      deathDatePrecision: DatePrecision.year_only,
      generationCalculated: 2,
      generationDisplay: 2,
      generationSource: 'manual',
      biographyPublic: 'Trưởng nam cụ Tổ, là nhà giáo ưu tú dạy học tại quê nhà.',
      createdByUserId: ownerUser.id,
    },
  });

  const p2_mother = await prisma.person.create({
    data: {
      familyId: family.id,
      branchId: mainBranch.id,
      primaryName: 'Lê Thị Mẹ',
      gender: PersonGender.female,
      lifeStatus: LifeStatus.deceased,
      isLiving: false,
      birthYear: 1940,
      birthDatePrecision: DatePrecision.year_only,
      deathYear: 2018,
      deathDatePrecision: DatePrecision.year_only,
      generationCalculated: 2,
      generationDisplay: 2,
      generationSource: 'manual',
      biographyPublic: 'Người vợ tảo tần của cụ Nguyễn Văn Cha.',
      createdByUserId: ownerUser.id,
    },
  });

  // Thế hệ 3: Nguyễn Văn Bản (Còn sống, normal) và Nguyễn Thị Hoa (Còn sống, sensitive)
  const p3_ban = await prisma.person.create({
    data: {
      familyId: family.id,
      branchId: mainBranch.id,
      primaryName: 'Nguyễn Văn Bản',
      gender: PersonGender.male,
      lifeStatus: LifeStatus.living,
      isLiving: true,
      birthYear: 1968,
      birthDateValue: new Date('1968-05-15'),
      birthDatePrecision: DatePrecision.exact,
      generationCalculated: 3,
      generationDisplay: 3,
      generationSource: 'manual',
      biographyPublic: 'Kỹ sư nông nghiệp nghỉ hưu, hiện đang giữ gia phả dòng họ.',
      phone: '0987654321',
      email: 'ban.nguyen@family.com',
      currentAddress: 'Thanh Oai, Hà Nội',
      privacyLevel: PrivacyLevel.normal,
      createdByUserId: ownerUser.id,
    },
  });

  const p3_hoa = await prisma.person.create({
    data: {
      familyId: family.id,
      branchId: mainBranch.id,
      primaryName: 'Nguyễn Thị Hoa',
      gender: PersonGender.female,
      lifeStatus: LifeStatus.living,
      isLiving: true,
      birthYear: 1975,
      birthDateValue: new Date('1975-10-12'),
      birthDatePrecision: DatePrecision.exact,
      generationCalculated: 3,
      generationDisplay: 3,
      generationSource: 'manual',
      biographyPublic: 'Con gái thứ hai cụ Nguyễn Văn Cha. Định cư tại TP. Hồ Chí Minh.',
      biographyPrivate: 'Thông tin cá nhân bảo mật cao.',
      phone: '0912345678',
      email: 'hoa.nguyen@family.com',
      currentAddress: 'Quận 1, TP. Hồ Chí Minh',
      privacyLevel: PrivacyLevel.sensitive,
      createdByUserId: ownerUser.id,
    },
  });

  // Thế hệ 4: Nguyễn Văn Con (Còn sống, con của Nguyễn Văn Bản)
  const p4_con = await prisma.person.create({
    data: {
      familyId: family.id,
      branchId: mainBranch.id,
      primaryName: 'Nguyễn Văn Con',
      gender: PersonGender.male,
      lifeStatus: LifeStatus.living,
      isLiving: true,
      birthYear: 1998,
      birthDateValue: new Date('1998-08-20'),
      birthDatePrecision: DatePrecision.exact,
      generationCalculated: 4,
      generationDisplay: 4,
      generationSource: 'manual',
      phone: '0966778899',
      email: 'con.nguyen@family.com',
      privacyLevel: PrivacyLevel.normal,
      createdByUserId: ownerUser.id,
    },
  });

  console.log('Đã tạo 5 hồ sơ người (people) qua 4 thế hệ.');

  // 7. Tạo Partnerships
  // Hôn nhân thế hệ 2
  // Chuẩn hóa sắp xếp UUID lexical trước khi lưu (person1 < person2)
  const [p2_p1Id, p2_p2Id] = [p2_father.id, p2_mother.id].sort();
  const marriageP2 = await prisma.partnership.create({
    data: {
      familyId: family.id,
      person1Id: p2_p1Id,
      person2Id: p2_p2Id,
      partnershipType: PartnershipType.marriage,
      status: PartnershipStatus.active,
      startYear: 1960,
      startDatePrecision: DatePrecision.year_only,
      createdByUserId: ownerUser.id,
    },
  });

  console.log('Đã tạo quan hệ hôn nhân cụ Cha và cụ Mẹ.');

  // 8. Tạo Parent-Child Relationships
  // Tổ tiên -> Cha
  await prisma.parentChildRelationship.create({
    data: {
      familyId: family.id,
      parentId: p1_ancestor.id,
      childId: p2_father.id,
      parentRole: ParentRole.father,
      relationshipType: ParentChildType.biological,
      childOrder: 1,
      childOrderLabel: 'Trưởng nam',
      createdByUserId: ownerUser.id,
    },
  });

  // Cha -> Bản (con trưởng)
  await prisma.parentChildRelationship.create({
    data: {
      familyId: family.id,
      parentId: p2_father.id,
      childId: p3_ban.id,
      parentRole: ParentRole.father,
      relationshipType: ParentChildType.biological,
      childOrder: 1,
      childOrderLabel: 'Trưởng nam',
      createdByUserId: ownerUser.id,
    },
  });

  // Mẹ -> Bản (con trưởng)
  await prisma.parentChildRelationship.create({
    data: {
      familyId: family.id,
      parentId: p2_mother.id,
      childId: p3_ban.id,
      parentRole: ParentRole.mother,
      relationshipType: ParentChildType.biological,
      childOrder: 1,
      childOrderLabel: 'Trưởng nam',
      createdByUserId: ownerUser.id,
    },
  });

  // Cha -> Hoa (con thứ)
  await prisma.parentChildRelationship.create({
    data: {
      familyId: family.id,
      parentId: p2_father.id,
      childId: p3_hoa.id,
      parentRole: ParentRole.father,
      relationshipType: ParentChildType.biological,
      childOrder: 2,
      childOrderLabel: 'Con thứ',
      createdByUserId: ownerUser.id,
    },
  });

  // Mẹ -> Hoa (con thứ)
  await prisma.parentChildRelationship.create({
    data: {
      familyId: family.id,
      parentId: p2_mother.id,
      childId: p3_hoa.id,
      parentRole: ParentRole.mother,
      relationshipType: ParentChildType.biological,
      childOrder: 2,
      childOrderLabel: 'Con thứ',
      createdByUserId: ownerUser.id,
    },
  });

  // Bản -> Con (Thế hệ 4)
  await prisma.parentChildRelationship.create({
    data: {
      familyId: family.id,
      parentId: p3_ban.id,
      childId: p4_con.id,
      parentRole: ParentRole.father,
      relationshipType: ParentChildType.biological,
      childOrder: 1,
      childOrderLabel: 'Trưởng nam',
      createdByUserId: ownerUser.id,
    },
  });

  console.log('Đã tạo các quan hệ cha/mẹ/con đầy đủ.');

  // 9. Cập nhật branch founder cho Chi trưởng
  await prisma.branch.update({
    where: { id: mainBranch.id },
    data: { founderPersonId: p1_ancestor.id },
  });

  console.log('Gieo dữ liệu demo thành công!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi gieo dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
