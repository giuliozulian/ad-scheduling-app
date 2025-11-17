import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function verifyCredentials(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'utf-8'
  );
  const [username, password] = credentials.split(':');

  return (
    username === process.env.NEXT_PUBLIC_DEBUG_AUTH_USERNAME &&
    password === process.env.NEXT_PUBLIC_DEBUG_AUTH_PASSWORD
  );
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!verifyCredentials(request)) {
      return new NextResponse('Autenticazione richiesta', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Debug Algorithm"',
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set('X-Debug-Auth', 'success');
    return response;
  }

  const headers = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers,
    },
  });

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
