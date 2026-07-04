'use client';

import React, { useState, useTransition } from 'react';
import { handleLogin } from '../actions';

export default function LoginPage() {
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) {
      setError('Vui lòng nhập Email hoặc Số điện thoại.');
      return;
    }
    setError(null);
    console.log(`[MOCK OTP] Gửi mã tới ${destination}. Mã xác thực: 123456`);
    setOtpSent(true);
  };

  const handleVerifyAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('Vui lòng nhập mã OTP.');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await handleLogin(destination, code);
      } catch (err: any) {
        setError(err.message || 'Mã xác nhận không chính xác.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-center items-center p-6 selection:bg-indigo-500 selection:text-white">
      
      <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white mx-auto text-lg">
            GP
          </div>
          <h2 className="text-xl font-bold text-zinc-950">Đăng nhập Gia tộc</h2>
          <p className="text-xs text-zinc-500">
            Hệ thống gia phả bảo mật. Vui lòng nhập thông tin xác thực.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-medium">
              ⚠️ {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500">Email hoặc Số điện thoại</label>
                <input
                  type="text"
                  placeholder="owner@giapha.vn hoặc sđt..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
                <strong className="text-zinc-700">Tài khoản Thử nghiệm:</strong>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Chủ gia phả: <code className="text-indigo-600">owner@giapha.vn</code></li>
                  <li>Khách xem: <code className="text-indigo-600">viewer@giapha.vn</code></li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-all shadow-md"
              >
                Nhận mã OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndLogin} className="space-y-4">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-250 flex items-center justify-between text-xs">
                <span className="text-zinc-600">Gửi tới: {destination}</span>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Đổi
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500">Nhập mã OTP</label>
                <input
                  type="text"
                  placeholder="Nhập 123456..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-center text-zinc-900 focus:outline-none focus:border-indigo-500 transition-all font-mono tracking-widest text-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md disabled:opacity-50"
              >
                {isPending ? 'Xác thực...' : 'Đăng nhập'}
              </button>
            </form>
          )}

        </div>

      </div>

      <a href="/" className="text-xs text-zinc-500 hover:text-zinc-400 mt-6 transition-colors">
        ← Trở lại trang chủ
      </a>

    </div>
  );
}
