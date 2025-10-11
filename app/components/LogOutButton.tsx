"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { logOutAction } from '../actions/actions'

const LogOutButton = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const handleLogOut = async () => {
      setLoading(true)
      const error = await logOutAction()
      if (error) {
        toast("error", {description: error.message})
      }
      const errorMessage = null
      if (errorMessage) {
        toast("Error", {description: errorMessage})
      } else {
        toast("Uitgelogd", {description: "Je bent succesvol uitgelogd"})
      }
      setLoading(false)
      router.push("/")
    }

return (
    <button onClick={handleLogOut}
        disabled={loading}
        >Log out</button>
  )
}

export default LogOutButton