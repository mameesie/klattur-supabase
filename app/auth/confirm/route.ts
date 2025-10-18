import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/chat'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    console.log('verifyOtp error:', error)
    console.log('token_hash:', token_hash)
    console.log('type:', type)
    
    if (!error) {
      const redirectTo = request.nextUrl.clone()
      redirectTo.pathname = next
      return NextResponse.redirect(redirectTo)
    }
  }

  // return the user to an error page with some instructions
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = '/auth/auth-code-error'
  return NextResponse.redirect(redirectTo)
}