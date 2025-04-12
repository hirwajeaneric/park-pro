import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access-token')?.value;

    // Skip auth routes and public routes
    if (
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/public') // Add other public routes if needed
    ) {
        return NextResponse.next();
    }

    // Redirect protected routes if no token
    if (!token) {
        if (request.nextUrl.pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/auth/admin', request.url));
        }
        if (request.nextUrl.pathname.startsWith('/finance')) {
            return NextResponse.redirect(new URL('/auth/finance', request.url));
        }
        if (request.nextUrl.pathname.startsWith('/manager')) {
            return NextResponse.redirect(new URL('/auth/manager', request.url));
        }
        if (request.nextUrl.pathname.startsWith('/government')) {
            return NextResponse.redirect(new URL('/auth/government', request.url));
        }
        if (request.nextUrl.pathname.startsWith('/auditor')) {
            return NextResponse.redirect(new URL('/auth/auditor', request.url));
        }
    }

    // Allow authenticated or non-protected routes
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/finance/:path*',
        '/manager/:path*',
        '/government/:path*',
        '/auditor/:path*',
        '/:path*',
    ],
};