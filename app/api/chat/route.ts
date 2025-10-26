import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createIdGenerator,
  generateId,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  GenerateTextResult,
  ToolSet,
} from "ai";
import type { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import "dotenv/config";
import { createClient } from "@/supabase/auth/server";
import { changeEmail } from "@/app/actions/actions";

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
    let currentChatId = id
    console.log("id: ", currentChatId);
    // if there is no ChatId we need to create a new entry in the database
    const { data: doesChatExist, error: doesChatExistError } = await supabase.rpc("does_chat_exist", { chat_id_arg: currentChatId });
    
    console.log("textpart of UIMessage: ", message.parts[0].type === 'text' ? message.parts[0].text : '');
    if (doesChatExistError) { throw doesChatExistError }
    let title: string = 'Untitled'; 
    if (!doesChatExist) {
      console.log("chatId does not exist yet");
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const result = await generateText({
          model: openai("gpt-4o-mini"),
          temperature: 0.3,
          maxRetries: 5,
          system: `vat dit stukje tekst samen en maak daar een titel van. Dit mag maximaal 30 characters bevatten. Antwoord alleen de titel zonder andere informatie.`,
          prompt: message.parts[0].type === 'text' ? message.parts[0].text : ''})

      console.log("titel:", result.content)
      title = result.content[0].type === 'text' ? result.content[0].text : 'Untitled';
          const { data: chatIdFromDB, error: chatIdFromDBError } =
        await supabase.rpc("create_chat", { user_id_arg: user.id, chat_uuid_arg: currentChatId, title_arg: title });
      if (chatIdFromDBError) throw chatIdFromDBError;
      currentChatId = chatIdFromDB;
    }

    const { data: previousMessages, error: loadError } = await supabase.rpc(
      "load_chat_messages",
      { chat_uuid_arg: currentChatId }
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
      id: message.id || generateId(),
    };

    // Append the new user message
    const allMessages = [...dbMessages, messageWithId];

    console.log("dit is de titel: ", title)
    console.log("dit zijn alle messages: ",allMessages)
    // Create the UIMessageStream
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Send chatId as transient data
        writer.write({
          type: "data-doesChatExist", //chatId
          data: { doesChatExist: doesChatExist, chatId: currentChatId, title: title },
          transient: true,
        });

        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const result = await streamText({
          model: openai("gpt-4o-mini"),
          temperature: 0.3,
          maxRetries: 5,
          system: `je bent een the work byron katie coach en vraagt de volgende vragen:
          1. is het waar. 2. kun je absoluut zeker weten dat het waar is. 3. wie zou je zijn zonder de gedachten. 4. draai de gedachten om. vraag één vraag tegelijk en werk ze stuk voor stuk af.`,
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
