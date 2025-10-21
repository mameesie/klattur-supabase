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
    const { messages, chatId }: { messages: UIMessage[]; chatId?: string } =
      await request.json(); // validate body safeParse, see habits for alzheimer
    let currentChatId = chatId;
    // if there is no ChatId we need to create a new entry in the database
    if (!currentChatId) {
      const { data: chatIdFromDB, error: chatIdFromDBError } =
        await supabase.rpc("create_chat", { user_id_arg: user.id });
      console.log(
        "chatIdFromDBError: ",
        chatIdFromDBError,
        "chatIdFromDB: ",
        chatIdFromDB
      );
      currentChatId = chatIdFromDB;
    }

    // safe last user message to db
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      const { data: createdMessage, error: createdMessageError } =
        await supabase.rpc("save_message", {
          user_id_arg: user.id,
          chat_id_arg: currentChatId,
          role_arg: "user",
          content_arg: lastUserMessage.parts,
        });
      console.log(
        "createdMessageError: ",
        createdMessageError,
        "createdMessage: ",
        createdMessage
      );
    }
    // check database if email already exist

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      //maxTokens: 16384, // completion max tokens
      temperature: 0.3,
      maxRetries: 5,
      system: `je bent een the work byron katie coach en vraagt de volgende vragen:
      
      `, //vraag elke vraag los en wacht het antwoord af
      messages: convertToModelMessages(messages),
      async onFinish({ text }) {
        console.log("text: ", text);
        const { data: createdMessage, error: createdMessageError } =
          await supabase.rpc("create_message", {
            chat_id: currentChatId,
            role: "assistant",
            content: text,
          });
        console.log(
          "createdMessageError: ",
          createdMessageError,
          "createdMessage: ",
          createdMessage
        );
        if (createdMessageError) throw createdMessageError;
      },
    });
    console.log(result.toUIMessageStreamResponse());
    return {result: result.toUIMessageStreamResponse(),chatId: currentChatId};
  } catch (error) {
    console.log(error);
  }
}
