import { streamText, UIMessage, convertToModelMessages } from "ai";
import type { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import "dotenv/config";
import { createClient } from "@/supabase/auth/server";

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

    // unpack request json
    const { message, chatId }: { message: UIMessage; chatId?: string } =
      await request.json(); // validate body safeParse, see habits for alzheimer
    let currentChatId = chatId;
    // if there is no ChatId we need to create a new entry in the database
    if (!currentChatId) {
      const { data: chatIdFromDB, error: chatIdFromDBError } =
        await supabase.rpc("create_chat", { user_id_arg: user.id });
      if (chatIdFromDBError) throw chatIdFromDBError;
      currentChatId = chatIdFromDB;
    }

    const { data: previousMessages, error: loadError } = await supabase.rpc("load_chat_messages", {chat_id_arg: currentChatId});
    if (loadError) throw loadError;

    const dbMessages: UIMessage[] = (previousMessages || []).map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      parts: msg.content,
      createdAt: new Date(msg.created_at),
    }));


    // Ensure the new user message has an ID
    const messageWithId = {
      ...message,
      id: message.id || generateId(),
      createdAt: message.createdAt || new Date(),
    };

     // Append the new user message
    const allMessages = [...dbMessages, messageWithId];
    
  

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      //maxTokens: 16384, // completion max tokens
      temperature: 0.3,
      maxRetries: 5,
      system: `je bent een the work byron katie coach en vraagt de volgende vragen:
      
      `, //vraag elke vraag los en wacht het antwoord af
      messages: convertToModelMessages(allMessages),
      
    });
    console.log(result.toUIMessageStreamResponse());
    return result.toUIMessageStreamResponse({
      originalMessages: allMessages,
      generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
      onFinish: async ({ messages }) => {
        // Save both messages atomically using RPC
        const userMessage = messages[messages.length - 2];
        const assistantMessage = messages[messages.length - 1];
        
        try {
          const { error: saveError } = await supabase.rpc('save_message_pair', {
            chat_id_arg: currentChatId,
            user_msg_id: userMessage.id,
            user_content: userMessage.parts,
            user_created_at: userMessage.createdAt?.toISOString() || new Date().toISOString(),
            assistant_msg_id: assistantMessage.id,
            assistant_content: assistantMessage.parts,
            assistant_created_at: assistantMessage.createdAt?.toISOString() || new Date().toISOString(),
          });
          
          if (saveError) {
            console.error('Failed to save messages:', saveError);
          }
        } catch (error) {
          console.error('Error in onFinish:', error);
        }
      },
    });
  } catch (error) {
    console.log(error);
  }
}
