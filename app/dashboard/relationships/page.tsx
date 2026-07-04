import prisma from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/auth";
import { getMembership } from "@/lib/permissions/checks";
import { MembershipRole } from "@prisma/client";
import { redirect } from "next/navigation";
import RelationshipManager from "./relationship-manager";

export const revalidate = 0;

export default async function RelationshipsPage() {
  const user = await requireAuth();

  const family = await prisma.family.findFirst();
  if (!family) {
    return <div className="text-zinc-400">Không tìm thấy thông tin gia tộc.</div>;
  }

  const membership = await getMembership(user.id, family.id);
  if (!membership) {
    return <div className="text-zinc-400 font-bold">Không có quyền truy cập.</div>;
  }

  // Chỉ Editor trở lên mới được truy cập trang này
  if (membership.role === MembershipRole.viewer || membership.role === MembershipRole.member) {
    redirect("/dashboard");
  }

  // Tải danh sách người đang hoạt động
  const people = await prisma.person.findMany({
    where: {
      familyId: family.id,
      status: {
        not: "archived",
      },
    },
    orderBy: { primaryName: "asc" },
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Thiết lập Mối Quan Hệ</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Nối kết các thành viên gia tộc thành sơ đồ huyết thống và hôn phối chính xác.
        </p>
      </div>

      {/* Interface */}
      <RelationshipManager
        people={people}
        familyId={family.id}
      />

    </div>
  );
}
