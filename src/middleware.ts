import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl));
  }
}

// dont allow any user inside a organization if it is private only allow if he is subsc

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/organization/:path*/submit',
    '/organization/create',
    '/organization/:path*',
  ],
};
