import { createClient } from "@/supabase/auth/server";
import { UIMessage } from "ai";
import { NextRequest, NextResponse } from "next/server";

type DBMessage = {
  id: string;
  chat_id: string;
  role: string;
  content: any; // or JSONValue if you have that type
  created_at: string;
};

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
    const chatUUID = searchParams.get("chatUUID") || null;

    // Call the RPC function
    const { data: messages, error } = await supabase.rpc("load_chat_messages", {
      chat_uuid_arg: chatUUID,
      sort_order: "ASC",
    });


    if (error) throw error;
    console.log("messages: ", messages)
    const orderedMessages: UIMessage[] = (messages || []).map(
      (msg: DBMessage) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        parts: msg.content,
      })
    );

    return NextResponse.json(orderedMessages);
  } catch (error) {
    console.log(error);
  }
}
