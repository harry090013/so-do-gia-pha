import { getSessionUser } from "@/lib/auth/auth";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center border-b border-zinc-200 bg-white shadow-sm md:rounded-b-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            GP
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            Gia Phả Platform
          </span>
        </div>

        <div>
          {user ? (
            <a
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-md"
            >
              Vào ứng dụng
            </a>
          ) : (
            <a
              href="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md"
            >
              Đăng nhập
            </a>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl w-full mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center space-y-8 flex-grow justify-center">
        <div className="space-y-4">
          <span className="px-3.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 uppercase tracking-widest">
            Hệ thống gia tộc thế hệ mới
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Lưu Giữ Ký Ức, Kết Nối <br />
            <span className="text-indigo-600">Trăm Năm Dòng Họ</span>
          </h1>
          <p className="text-zinc-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Nền tảng số tối giản, trực quan giúp dòng họ quản lý sơ đồ phả hệ, tưởng nhớ ngày giỗ tổ tiên và bảo vệ thông tin riêng tư của người còn sống.
          </p>
        </div>

        <div className="flex gap-4">
          <a
            href={user ? "/dashboard" : "/login"}
            className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/10"
          >
            Bắt đầu trải nghiệm
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Gia Phả Platform. Tối giản - Bảo mật - Trường tồn.</p>
      </footer>

    </div>
  );
}
