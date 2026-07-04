import prisma from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/auth";
import { getMembership } from "@/lib/permissions/checks";
import { maskPersonForViewer } from "@/lib/privacy/masking";
import TreeViewer from "./tree/tree-viewer";
import { LifeStatus } from "@prisma/client";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await requireAuth();

  const family = await prisma.family.findFirst();
  if (!family) {
    return <div className="text-zinc-500 p-8 text-center bg-white rounded-xl border border-zinc-200">Không tìm thấy thông tin gia tộc.</div>;
  }

  const membership = await getMembership(user.id, family.id);
  if (!membership) {
    return <div className="text-zinc-500 font-bold p-8 text-center bg-white rounded-xl border border-zinc-200">Không có quyền truy cập.</div>;
  }

  // 1. Tải danh sách thành viên và quan hệ
  const people = await prisma.person.findMany({
    where: {
      familyId: family.id,
      status: {
        not: "archived",
      },
    },
    orderBy: { generationDisplay: "asc" },
  });

  const relationships = await prisma.parentChildRelationship.findMany({
    where: {
      familyId: family.id,
      status: "active",
      archivedAt: null,
    },
  });

  // 2. Áp dụng bảo mật che giấu thông tin
  const processedPeople = people.map((person) => {
    const masked = maskPersonForViewer(person, membership);
    return {
      ...person,
      ...masked,
    };
  });

  // 3. Lọc ngày giỗ trong tháng hiện tại (Tháng 7)
  const currentMonth = new Date().getMonth() + 1; // Lấy tháng Dương lịch hiện tại (Tháng 7)
  
  const monthlyAnniversaries = processedPeople.filter((p) => {
    if (p.lifeStatus !== LifeStatus.deceased) return false;

    // Xét tháng mất Dương lịch
    if (p.deathDateValue) {
      const deathMonth = new Date(p.deathDateValue).getMonth() + 1;
      if (deathMonth === currentMonth) return true;
    } else if (p.birthYear) {
      // Fallback nếu không có ngày cụ thể
    }

    // Xét tháng giỗ Âm lịch
    if (p.memorialLunarMonth === currentMonth) return true;

    return false;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white border border-zinc-200 px-6 py-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">Nguyễn Tộc Phả Hệ</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Hệ thống phả hệ số và tưởng nhớ tổ tiên</p>
        </div>
        <div className="text-xs text-zinc-400 font-mono">
          Tháng hiện tại: <span className="font-bold text-indigo-600">Tháng {currentMonth}</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sơ đồ cây (Bên trái, chiếm 2/3 chiều rộng) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">🌳 Bản Đồ Gia Hệ Trực Quan</h3>
              <span className="text-[10px] text-zinc-500">Giữ chuột để kéo • Lăn chuột để phóng to</span>
            </div>
            <TreeViewer people={processedPeople} relationships={relationships} />
          </div>
        </div>

        {/* Bảng sự kiện Ngày giỗ trong tháng (Bên phải, chiếm 1/3) */}
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>🕯️ Ngày Giỗ Trong Tháng {currentMonth}</span>
              </h3>
              <span className="px-2 py-0.5 text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full font-bold">
                {monthlyAnniversaries.length} cụ
              </span>
            </div>

            <div className="space-y-3">
              {monthlyAnniversaries.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 space-y-2">
                  <p className="text-lg">🌸</p>
                  <p className="text-xs italic">Không có ngày giỗ tổ tiên nào trong tháng {currentMonth}.</p>
                </div>
              ) : (
                monthlyAnniversaries.map((person) => (
                  <div
                    key={person.id}
                    className="p-3.5 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200 rounded-xl transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">{person.primaryName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Đời {person.generationDisplay}</span>
                    </div>

                    <div className="text-[11px] text-zinc-500 space-y-1">
                      {person.deathDateValue && (
                        <p>
                          📅 Ngày mất Dương lịch: <strong className="text-zinc-700">{new Date(person.deathDateValue).toLocaleDateString('vi-VN')}</strong>
                        </p>
                      )}
                      {(person.memorialLunarDay || person.memorialLunarMonth) && (
                        <p>
                          🌙 Ngày giỗ Âm lịch: <strong className="text-indigo-600">Ngày {person.memorialLunarDay} tháng {person.memorialLunarMonth}</strong>
                        </p>
                      )}
                    </div>

                    {person.biographyPublic && (
                      <p className="text-[11px] text-zinc-500 italic border-t border-zinc-200/60 pt-2 line-clamp-2">
                        "{person.biographyPublic}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-3 mt-6 text-[10px] text-zinc-400 text-center leading-relaxed">
            Danh sách tự động cập nhật theo tháng hiện tại của hệ thống.
          </div>
        </div>

      </div>

    </div>
  );
}
