import prisma from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/auth";
import { getMembership } from "@/lib/permissions/checks";
import { MembershipRole } from "@prisma/client";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AuditPage() {
  const user = await requireAuth();

  const family = await prisma.family.findFirst();
  if (!family) {
    return <div className="text-zinc-500">Không tìm thấy thông tin gia tộc.</div>;
  }

  const membership = await getMembership(user.id, family.id);
  if (!membership) {
    return <div className="text-zinc-500 font-bold">Không có quyền truy cập.</div>;
  }

  if (membership.role !== MembershipRole.owner && membership.role !== MembershipRole.family_admin) {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    where: { familyId: family.id },
    orderBy: { createdAt: "desc" },
    include: {
      actorUser: true,
    },
    take: 50,
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">Nhật Ký Thay Đổi Dữ Liệu</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Theo dõi toàn bộ lịch sử chỉnh sửa, lưu trữ (soft delete) và khởi tạo trên hệ thống phả hệ.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            
            <thead className="bg-zinc-50 text-zinc-500 uppercase font-semibold border-b border-zinc-200">
              <tr>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Người thực hiện</th>
                <th className="p-4">Hành động</th>
                <th className="p-4">Đối tượng</th>
                <th className="p-4">Dữ liệu trước (Before)</th>
                <th className="p-4">Dữ liệu sau (After)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 bg-white text-zinc-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 italic">
                    Chưa có nhật ký ghi nhận thay đổi nào.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                    
                    <td className="p-4 text-zinc-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    
                    <td className="p-4">
                      <div className="font-bold text-zinc-900">{log.actorUser?.displayName || "Hệ thống"}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{log.actorUser?.email || ""}</div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        log.action === "create" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        log.action === "update" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-indigo-600 font-bold uppercase">
                      {log.entityType}
                    </td>

                    <td className="p-4 max-w-xs">
                      {log.beforeData ? (
                        <pre className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-[10px] font-mono text-zinc-600 overflow-x-auto max-h-24">
                          {JSON.stringify(log.beforeData, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-zinc-400 italic">N/A</span>
                      )}
                    </td>

                    <td className="p-4 max-w-xs">
                      {log.afterData ? (
                        <pre className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-[10px] font-mono text-zinc-600 overflow-x-auto max-h-24">
                          {JSON.stringify(log.afterData, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-zinc-400 italic">N/A</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
