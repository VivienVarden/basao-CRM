import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Middleware này chạy ở Edge Runtime, bảo vệ routes TRƯỚC khi page được render
// Đây là lớp bảo vệ server-side — ngăn bypass từ phía client

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Nếu không có token hợp lệ → redirect về login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // authorized() được gọi trước middleware function
      // Trả về false → redirect đến signIn page tự động
      authorized: ({ token }) => !!token,
    },
  }
)

// Các routes sẽ được bảo vệ bởi middleware này
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/deals/:path*',
    '/network/:path*',
    '/outreach/:path*',
    '/settings/:path*',
  ],
}
