import { requireAuth } from "@/lib/auth/auth";
import prisma from "@/lib/db/client";
import { getMembership } from "@/lib/permissions/checks";
import { MembershipRole } from "@prisma/client";
import { handleLogout } from "../actions";

export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  const family = await prisma.family.findFirst();
  if (!family) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-600">
        <p className="text-sm">Vui lòng chạy seed dữ liệu trước.</p>
      </div>
    );
  }

  const membership = await getMembership(user.id, family.id);
  if (!membership) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center space-y-4">
        <p className="text-sm text-zinc-600">Bạn không có quyền truy cập vào gia tộc này.</p>
        <form action={handleLogout}>
          <button type="submit" className="text-xs text-indigo-600 hover:underline">Đăng xuất</button>
        </form>
      </div>
    );
  }

  const isEditor = membership.role !== MembershipRole.viewer && membership.role !== MembershipRole.member;
  const isAdmin = membership.role === MembershipRole.owner || membership.role === MembershipRole.family_admin;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-zinc-200 p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-8">
          
          {/* Brand/Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
              GP
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 text-sm tracking-tight">Nguyễn Tộc</h2>
              <p className="text-[10px] text-zinc-400 font-mono">Gia Phả Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            <a
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all shrink-0"
            >
              🌳 Sơ đồ & Ngày giỗ
            </a>
            <a
              href="/dashboard/people"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all shrink-0"
            >
              👥 Thành viên
            </a>
            
            {isEditor && (
              <a
                href="/dashboard/relationships"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all shrink-0"
              >
                🔗 Thiết lập Quan hệ
              </a>
            )}

            {isAdmin && (
              <a
                href="/dashboard/audit"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all shrink-0"
              >
                📜 Nhật ký Audit
              </a>
            )}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="border-t border-zinc-200 pt-4 mt-6 md:mt-0 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-zinc-800 max-w-[130px] truncate">{user.displayName}</p>
            <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded uppercase">
              {membership.role}
            </span>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="p-2 rounded-lg bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 border border-zinc-200 hover:border-red-100 transition-all text-xs"
              title="Đăng xuất"
            >
              🚪
            </button>
          </form>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
