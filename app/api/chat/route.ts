
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
      1. Wat vind je het meest vervelend aan deze situatie?
      2. Wat is je overtuiging in deze situatie? vul het volgende in: Ik geloof dat ... omdat ...
      3. Is dit waar?
      4. Kan je absoluut zeker weten dat het waar is?
      5. Hoe reageer je als je deze gedachten gelooft?
      6. Welke emoties komen op wanneer je deze gedachten gelooft?
      7. Doe even je ogen dicht, waar voel je deze emotie?
      8. Welke beelden van het verleden zie je als je deze gedachten gelooft?
      9. Welke beelden van de toekomst zie je als je deze gedachten gelooft?
      10. In welke verslavingen of obsessies verval je als je deze gedachten gelooft?
      11. Hoe behandel je jezelf als je deze gedachten gelooft?
      12. Hoe behandel je anderen als je deze gedachten gelooft?
      13. Wie of wat ben je zonder de gedachten?
      14. En dan gaan we nu naar de omkering. Wat is de omkering van jouw overtuiging

      vraag elke vraag los en wacht het antwoord af
      Herhaal de overtuiging bij het stellen van daarop volgende vragen.
      Probeer bij onduidelijkheden te vragen wat er precies bedoelt wordt.
      `,//vraag elke vraag los en wacht het antwoord af
      messages: convertToModelMessages(messages),
    });
    console.log(result.toUIMessageStreamResponse())
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.log(error)
  }


}