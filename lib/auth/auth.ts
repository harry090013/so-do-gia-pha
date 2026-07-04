import { cookies } from 'next/headers';
import prisma from '../db/client';
import { User } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string;
}

// Cấu trúc adapter để gửi và xác minh OTP
export interface AuthAdapter {
  sendOtp(destination: string): Promise<{ success: boolean; token?: string }>;
  verifyOtp(destination: string, code: string): Promise<User | null>;
}

// Mock Auth Adapter dùng cho môi trường phát triển cục bộ (local/development)
export class MockAuthAdapter implements AuthAdapter {
  async sendOtp(destination: string): Promise<{ success: boolean; token?: string }> {
    console.log(`[MOCK AUTH] Gửi mã OTP tới: ${destination}. Mã xác thực là: 123456`);
    return { success: true, token: 'mock-otp-token' };
  }

  async verifyOtp(destination: string, code: string): Promise<User | null> {
    if (code !== '123456') {
      return null;
    }

    // Tìm kiếm user theo email hoặc sđt
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: destination },
          { phone: destination }
        ]
      }
    });

    // Nếu chưa có, tự động tạo mới (trong bản phát triển)
    if (!user) {
      user = await prisma.user.create({
        data: {
          displayName: `User ${destination.split('@')[0]}`,
          email: destination.includes('@') ? destination : null,
          phone: !destination.includes('@') ? destination : null,
          status: 'active'
        }
      });
    }

    return user;
  }
}

// Helper lấy Session User hiện tại từ Cookies
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId }
  });
}

// Yêu cầu có đăng nhập mới cho qua
export async function requireAuth(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Chưa đăng nhập - Unauthorized');
  }
  return user;
}

export async function loginUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('session_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 ngày
  });
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('session_user_id');
}
