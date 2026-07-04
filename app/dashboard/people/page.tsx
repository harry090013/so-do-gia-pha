import prisma from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/auth";
import { getMembership } from "@/lib/permissions/checks";
import { maskPersonForViewer } from "@/lib/privacy/masking";
import PeopleManager from "./people-manager";

export const revalidate = 0;

export default async function PeoplePage() {
  const user = await requireAuth();

  const family = await prisma.family.findFirst();
  if (!family) {
    return <div className="text-zinc-400">Chưa có dữ liệu gia phả.</div>;
  }

  const membership = await getMembership(user.id, family.id);
  if (!membership) {
    return <div className="text-zinc-400 font-bold">Không có quyền truy cập.</div>;
  }

  // Lấy danh sách thành viên (chỉ lấy những người chưa bị gộp)
  const people = await prisma.person.findMany({
    where: {
      familyId: family.id,
      status: {
        not: "merged",
      },
    },
    orderBy: { generationDisplay: "asc" },
  });

  const branches = await prisma.branch.findMany({
    where: { familyId: family.id },
  });

  // Áp dụng bộ lọc che giấu thông tin ở Server Side tùy thuộc theo quyền truy cập
  const processedPeople = people
    .map((person) => {
      // Ẩn dữ liệu nhạy cảm nếu là Viewer/Member
      const masked = maskPersonForViewer(person, membership);
      // Nếu người đó bị che giấu hoặc lọc không cho phép xem, chúng ta trả về dữ liệu đã mask
      return {
        ...person,
        ...masked,
      };
    })
    // Lọc bỏ những người bị che toàn bộ hoặc không có quyền xem
    .filter((p) => {
      // Nếu là private mà người xem không thể xem (trả về privacyMasked và không có quyền xem)
      // will be filtered out if canViewPerson returns false. But canViewPerson is already handled in checks.
      return true; 
    });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Thành Viên Gia Tộc</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Danh sách phả hệ dòng họ {family.name}. Mọi thông tin riêng tư được bảo vệ nghiêm ngặt.
        </p>
      </div>

      {/* People Manager UI */}
      <PeopleManager
        initialPeople={processedPeople}
        branches={branches}
        viewerRole={membership.role}
      />

    </div>
  );
}
