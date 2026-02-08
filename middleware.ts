import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
        if (!session || !(await decrypt(session))) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // Redirect admin login if already authenticated
    if (request.nextUrl.pathname === '/admin' && session && (await decrypt(session))) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
