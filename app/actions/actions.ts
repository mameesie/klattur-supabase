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