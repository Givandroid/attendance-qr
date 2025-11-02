import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = 'admin123' // GANTI INI!

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('admin_authenticated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}