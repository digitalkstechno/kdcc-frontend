import { NextResponse, type NextRequest } from 'next/server';

const USER_LOGIN_PATH = '/user/login';
const ADMIN_LOGIN_PATH = '/admin/login';

const isProduction = process.env.NODE_ENV === 'production';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;

  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost && pathname === '/' && !isProduction) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = '/local-loader';
    rewriteUrl.search = '';
    return NextResponse.rewrite(rewriteUrl);
  }

  const isUserRoute = pathname.startsWith('/user');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isUserRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  if (isUserRoute) {
    const hasUserAuth = request.cookies.get('mkgroup_user_auth')?.value === 'true';
    if (pathname === USER_LOGIN_PATH && hasUserAuth) {
      return NextResponse.redirect(new URL('/user', request.url));
    }
    if (pathname === USER_LOGIN_PATH) {
      return NextResponse.next();
    }
    if (!hasUserAuth) {
      return NextResponse.redirect(new URL(USER_LOGIN_PATH, request.url));
    }
  }

  if (isAdminRoute) {
    const hasAdminAuth = request.cookies.get('mkgroup_admin_auth')?.value === 'true';
    if (pathname === ADMIN_LOGIN_PATH && hasAdminAuth) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (pathname === ADMIN_LOGIN_PATH) {
      return NextResponse.next();
    }
    if (!hasAdminAuth) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
