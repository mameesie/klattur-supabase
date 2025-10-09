'use client'

import { useRouter } from "next/navigation";
import { title } from "process";
import React, { useState } from "react";
import { toast } from "sonner"


function Header() {
  const user = null;
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const handleLogOut = () => {
    setLoading(true)
    console.log("loging out...")
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
    <div className="h-[100px] bg-white sticky top-0 flex-shrink-0 z-10">
      <a href="/chat">Logo</a>
      {user ? (
        <button onClick={handleLogOut}
        disabled={loading}
        >Log out</button>
      ) : (
        <>
          
          <a href="/login">Login</a>
          <a href="/sign-up">Sign up</a>
        </>
      )}
    </div>
  );
}

export default Header;
