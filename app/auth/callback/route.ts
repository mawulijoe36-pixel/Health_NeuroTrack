import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // Handle OAuth errors from provider
  if (error_description) {
    console.log('[v0] OAuth error from provider:', error_description)
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('message', error_description)
    return NextResponse.redirect(errorUrl.toString())
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.log('[v0] Error exchanging code for session:', error.message)
      const errorUrl = new URL('/auth/error', origin)
      errorUrl.searchParams.set('message', error.message)
      return NextResponse.redirect(errorUrl.toString())
    }
    
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
