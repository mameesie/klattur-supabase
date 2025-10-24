import React from "react";
import SidePanel from "../components/SidePanel";
import { getUser } from "@/supabase/auth/server";

async function ChatPage() {
  const user = await getUser();
  return (
  
    <SidePanel userName={user?.user_metadata?.first_name ?? user?.user_metadata?.name}/>
    // chatBox is inside SidePanel code
  )
}

export default ChatPage;
