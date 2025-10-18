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

export const resetPassword = async (email: string) => {
  if (typeof email !== 'string' ) {
    throw new Error('Email must be a string');
    
  } else if (email.length === 0) {
    throw new Error('Email must not be empty');
  }
  const {auth} = await createClient()
  const { data, error } = await auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/account/update-password` // Change this!
  })
  console.log(error, data)
}
export const changePassword = async (password: string) => {
  if (typeof password !== 'string' ) {
    throw new Error('Password must be a string');
    
  } else if (password.length === 0) {
    throw new Error('Password must not be empty');
  }
  const {auth} = await createClient()
  const { data, error } = await auth.updateUser({
    password
  })
  console.log(error, data)
}
export const changeEmail = async (email: string) => {
  if (typeof email !== 'string' ) {
    throw new Error('Email must be a string');
    
  } else if (email.length === 0) {
    throw new Error('Email must not be empty');
  }
  const {auth} = await createClient()
  const { data, error } = await auth.updateUser({email: email})
  console.log(error, data)
}

