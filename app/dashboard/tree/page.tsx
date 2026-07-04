import prisma from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/auth";
import { getMembership } from "@/lib/permissions/checks";
import { maskPersonForViewer } from "@/lib/privacy/masking";
import TreeViewer from "./tree-viewer";

export const revalidate = 0;

export default async function TreePage() {
  const user = await requireAuth();

  const family = await prisma.family.findFirst();
  if (!family) {
    return <div className="text-zinc-400">Không tìm thấy thông tin gia tộc.</div>;
  }

  const membership = await getMembership(user.id, family.id);
  if (!membership) {
    return <div className="text-zinc-400 font-bold">Không có quyền truy cập.</div>;
  }

  // Tải danh sách người đang hoạt động (không bao gồm người bị gộp)
  const people = await prisma.person.findMany({
    where: {
      familyId: family.id,
      status: {
        not: "merged",
      },
    },
    orderBy: { generationDisplay: "asc" },
  });

  // Tải danh sách các mối quan hệ trực hệ đang hoạt động
  const relationships = await prisma.parentChildRelationship.findMany({
    where: {
      familyId: family.id,
      status: "active",
      archivedAt: null,
    },
  });

  // Áp dụng bộ lọc bảo mật người còn sống ở server-side
  const processedPeople = people.map((person) => {
    const masked = maskPersonForViewer(person, membership);
    return {
      ...person,
      ...masked,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Sơ Đồ Phả Hệ (Cây Gia Phả)</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Bản đồ phả hệ trực quan dòng họ {family.name}. Nhấp chuột để kéo thả, sử dụng con lăn để thu phóng.
        </p>
      </div>

      {/* Tree Diagram */}
      <TreeViewer
        people={processedPeople}
        relationships={relationships}
      />

    </div>
  );
}
