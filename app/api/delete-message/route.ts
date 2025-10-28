import { createClient } from "@/supabase/auth/server";
import { NextRequest, NextResponse } from "next/server";





export async function DELETE(request: NextRequest) {
  try {

    const body = await request.json();
    console.log("delete chatIdeId: ", body.chatId);
  
    const supabase = await createClient();
      // get user id from client
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      const { data: isChatDeleted, error: deletedError } = await supabase.rpc("delete_chat", { chat_uuid_arg: body.chatId });
  
      if (deletedError) {
        return NextResponse.json(
          { error: deletedError.message },
          { status: 500 }
        );
      }
  
      if (!isChatDeleted) {
        return NextResponse.json(
          { error: "Chat not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ message: "Chat deleted" });

  } catch (error) {
    console.error("verwijderen van chats is mislukt:", error);

  }

  return NextResponse.json({ message: "Chat deleted" });
  
}
