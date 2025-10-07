import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Protected routes that require authentication
  const protectedRoutes = ['/', '/finished', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
  );
  
  // Skip authentication for login page and public routes
  if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/form') {
    return NextResponse.next();
  }
  
  // Only check authentication for protected routes
  if (isProtectedRoute) {
    // Check for auth token (simple string-based for now)
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token || token !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/finished',
    '/admin/:path*',
    '/login',
    '/form'
  ]
};