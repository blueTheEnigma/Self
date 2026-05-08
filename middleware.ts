import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Public paths that don't need PIN
    const publicPaths = ['/login', '/register', '/api/auth', '/api/auth/register']
    if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next()

    // PIN setup page: requires auth but not PIN
    if (pathname === '/pin' || pathname === '/pin/set') return NextResponse.next()

    // All app routes: require PIN to be verified
    if (token && !token.pinVerified) {
      return NextResponse.redirect(new URL('/pin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Allow unauthenticated access to login/register
        if (pathname.startsWith('/login') || pathname.startsWith('/register')) return true
        return !!token
      },
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png).*)'],
}
