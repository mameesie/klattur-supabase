import page from "@/app/page";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
     // create client from supabase
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

        // unpack json
        const { createdAt, chatUUID}: { createdAt: Text, chatUUID: Text} = await request.json();
        // Call the RPC function
        const { data: chats, error } = await supabase
          .rpc('get_user_chats', {user_id_arg: user.id, cursor_created_at: createdAt, cursor_chat_uuid: chatUUID, page_size: 20    });
    
        if (error) throw error
    
        return NextResponse.json(chats);
  } catch (error) {
    console.log(error)
  }
}
