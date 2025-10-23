
import { createClient } from "@/supabase/auth/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

            // Get query parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const createdAt = searchParams.get('createdAt') || null;
    const chatUUID = searchParams.get('chatUUID') || null;
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

       
        // Call the RPC function
        const { data: chats, error } = await supabase
          .rpc('get_chats_paginated', {user_id_arg: user.id, cursor_created_at: createdAt, cursor_chat_uuid: chatUUID, page_size: pageSize    });
    
        if (error) throw error
    
        return NextResponse.json(chats);
  } catch (error) {
    console.log(error)
  }
}
