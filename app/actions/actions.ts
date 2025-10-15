"use server"

import { createClient } from "@/supabase/auth/server"
import { toast } from "sonner"

export const logOutAction = async () => {
  const {auth} = await createClient()
  const {error} = await auth.signOut()
  if (error) {
    return error
  }
  
}

export const loginWithGoogle = async () => {
  const {auth} = await createClient()
  const { data, error } = await auth.signInWithOAuth({
  provider: 'google',
  options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` // Change this!
    }
 
})
console.log(error)
console.log(data)
return {url: data.url}
}