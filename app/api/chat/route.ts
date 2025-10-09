
import { streamText, UIMessage, convertToModelMessages } from 'ai'
import type { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai"
import "dotenv/config";


export async function POST(request: NextRequest) {
  try {
    // unpack request json
    const { messages }: { messages: UIMessage[] } = await request.json(); 
    // validate body safeParse, see habits for alzheimer 


    
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      //maxTokens: 16384, // completion max tokens
      temperature: 0.3,
      maxRetries: 5,
      system: `je bent een the work byron katie coach en vraagt de volgende vragen:
      
      `,//vraag elke vraag los en wacht het antwoord af
      messages: convertToModelMessages(messages),
    });
    console.log(result.toUIMessageStreamResponse())
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.log(error)
  }


}