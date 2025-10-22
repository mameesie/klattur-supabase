import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createIdGenerator,
  generateId,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import type { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import "dotenv/config";
import { createClient } from "@/supabase/auth/server";

type DBMessage = {
  id: string;
  chat_id: string;
  role: string;
  content: any; // or JSONValue if you have that type
  created_at: string;
};

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
    const { messages, id }: { messages: UIMessage[]; id?: string | undefined } =
      await request.json(); // validate body safeParse, see habits for alzheimer
    const message = messages[messages.length - 1];
    console.log("id: ", id);
    let currentChatId = Number(id);
    console.log("id: ", currentChatId);
    // if there is no ChatId we need to create a new entry in the database
    if (!currentChatId) {
      console.log("no chat id so we create one in the database");
      const { data: chatIdFromDB, error: chatIdFromDBError } =
        await supabase.rpc("create_chat", { user_id_arg: user.id });
      if (chatIdFromDBError) throw chatIdFromDBError;
      currentChatId = chatIdFromDB;
    }

    const { data: previousMessages, error: loadError } = await supabase.rpc(
      "load_chat_messages",
      { chat_id_arg: currentChatId }
    );
    if (loadError) throw loadError;

    const dbMessages: UIMessage[] = (previousMessages || []).map(
      (msg: DBMessage) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        parts: msg.content,
      })
    );

    // Ensure new user message has an ID
    const messageWithId: UIMessage = {
      ...message,
      id: message.id || `user-${generateId()}`,
    };

    // Append the new user message
    const allMessages = [...dbMessages, messageWithId];

    // Create the UIMessageStream
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Send chatId as transient data
        writer.write({
          type: "data-chatId",
          data: { chatId: currentChatId },
          transient: true,
        });

        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const result = await streamText({
          model: openai("gpt-4o-mini"),
          temperature: 0.3,
          maxRetries: 5,
          system: `je bent een the work byron katie coach en vraagt de volgende vragen:`,
          messages: convertToModelMessages(allMessages),
          onFinish: async ({ text, finishReason, usage }) => {
            // Save messages after completion
            // Note: We need to construct the messages manually here
            const userMessage = messageWithId;
            const assistantMessage = {
              id: `asst-${generateId()}`,
              role: "assistant" as const,
              parts: [{ type: "text" as const, text }],
            };

            try {
              const { error: saveError } = await supabase.rpc(
                "save_message_pair",
                {
                  chat_id_arg: currentChatId,
                  user_id_arg: user.id,
                  user_msg_id: userMessage.id,
                  user_content: userMessage.parts,
                  assistant_msg_id: assistantMessage.id,
                  assistant_content: assistantMessage.parts,
                }
              );

              if (saveError) {
                console.error("Failed to save messages:", saveError);
              }
            } catch (error) {
              console.error("Error in onFinish:", error);
            }
          },
        });

        // Merge the text stream
        writer.merge(result.toUIMessageStream());
      },
    });
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.log(error);
    console.error(error);
  }
}
