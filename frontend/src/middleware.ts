/**
 * Next.js Middleware - Route Protection
 * Chạy TRƯỚC KHI render page để bảo vệ protected routes
 * Hỗ trợ refresh token flow
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper: Decode JWT payload (không verify signature)
function decodeToken(token: string): { role?: string; authorities?: Array<{ authority: string }>; exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Helper: Check if token is expired
function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  
  // exp là Unix timestamp (seconds), Date.now() là milliseconds
  return payload.exp * 1000 < Date.now();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  // Nếu đã login và truy cập login page → redirect về dashboard
  if (accessToken && !isTokenExpired(accessToken) && (pathname === '/login' || pathname === '/spso-login')) {
    const payload = decodeToken(accessToken);
    const role = payload?.role || payload?.authorities?.[0]?.authority;
    
    const dashboardUrl = role === 'SPSO' ? '/spso/dashboard' : '/student/dashboard';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Bỏ qua middleware cho public routes
  const publicRoutes = ['/', '/login', '/spso-login', '/register', '/forgot-password'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Kiểm tra nếu là protected route
  const isStudentRoute = pathname.startsWith('/student');
  const isSpsoRoute = pathname.startsWith('/spso');
  const isProtectedRoute = isStudentRoute || isSpsoRoute;

  // Nếu không phải protected route, cho phép truy cập
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Nếu là protected route và không có token → redirect về login
  if (!accessToken) {
    const loginUrl = isSpsoRoute ? '/spso-login' : '/login';
    const url = request.nextUrl.clone();
    url.pathname = loginUrl;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Nếu có token nhưng đã hết hạn → xóa cookie và redirect về login
  if (isTokenExpired(accessToken)) {
    const loginUrl = isSpsoRoute ? '/spso-login' : '/login';
    const response = NextResponse.redirect(new URL(loginUrl, request.url));
    
    // Xóa cookies hết hạn
    response.cookies.delete('accessToken');
    response.cookies.delete('userRole');
    
    return response;
  }

  // Kiểm tra role-based access
  const payload = decodeToken(accessToken);
  const role = payload?.role || payload?.authorities?.[0]?.authority;

  // Student cố truy cập SPSO routes
  if (isSpsoRoute && role !== 'SPSO') {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // SPSO cố truy cập Student routes
  if (isStudentRoute && role === 'SPSO') {
    return NextResponse.redirect(new URL('/spso/dashboard', request.url));
  }

  return NextResponse.next();
}

// Cấu hình matcher - chỉ chạy middleware cho các routes này
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
