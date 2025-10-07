import React from 'react'
import {createClient} from "@supabase/supabase-js"
function LoginForm() {
  const signIn = async () => {
    // 'use server'
    // const supabase = createClient()
    // await supabase.auth.
  }
  
  return (
    <form action={signIn}>
      <button className='bg-amber-700 w-[40px] h-[40px]'  type='submit' ></button>
    </form>
  )
}

export default LoginForm
