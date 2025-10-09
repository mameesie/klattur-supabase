
import {NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import z from "zod"

export const userSchema = z.object({
  email: z
  .email("Dit is geen mailadres.")
  .min(1, { message: "Email is vereist." }),
  password: z.string().min(6,{message: "Wachtwoord moet bestaan uit minimaal 6 tekens."}),
  token: z.string().optional(), // token is not jet in formData when validating (not optional on server side!)
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    let body = await request.json();
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: "Geen geldige input", errors: validation.error.message },
        { status: 400 }
      );
    }
    if (validation.data.name !== "") {
      return NextResponse.json(
        {
          message: "Refresh de pagina en probeer opnieuw.",
          error: "Server error",
        },
        { status: 400 }
      );
    }
  } catch (error) {

  }
}