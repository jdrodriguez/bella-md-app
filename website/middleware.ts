import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')

  if (ref && /^[A-Z0-9]{8}$/i.test(ref)) {
    const response = NextResponse.next()
    response.cookies.set('bellamd_ref', ref.toUpperCase(), {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|opengraph-image|twitter-image).*)',
  ],
}
