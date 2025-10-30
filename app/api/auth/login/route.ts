import { createClient } from "@/supabase/auth/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import z from "zod";

export const userSchema = z.object({
  email: z
    .email("Dit is geen mailadres.")
    .min(1, { message: "Email is vereist." }),
  password: z
    .string()
    .min(6, { message: "Wachtwoord moet bestaan uit minimaal 6 tekens." }),
  token: z.string().optional(), // token is not jet in formData when validating (not optional on server side!)
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // get data from frontend
    const body = await request.json();

    // validation of email and password with zod
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: "Geen geldige input", errors: validation.error.message },
        { status: 400 }
      );
    }
    // honeypot for bots to fill in
    if (validation.data.name !== "" && validation.data.name !== undefined) {
      console.log("name: ", validation.data.name);
      return NextResponse.json(
        {
          message: "Refresh de pagina en probeer opnieuw.",
          error: "Server error",
        },
        { status: 400 }
      );
    }

    //cloudflare turnstile validation
    const ip = request.headers.get("CF-Connecting-IP");
    const formData = new FormData();

    console.log("remote ip: ", ip);
    formData.append("secret", process.env.CLOUDFLARE_SECRET_KEY ?? "");
    formData.append("response", validation.data.token ?? ""); // ?? will return nothing if token is undefined or null, || also if 0 or NaN
    formData.append("remoteIp", ip ?? "");

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const cfResult = await fetch(url, {
      body: formData,
      method: "POST",
    });

    const outcome = await cfResult.json();
    if (!outcome.success) {
      console.log(outcome);
      return NextResponse.json(
        {
          message: "Refresh de pagina en probeer opnieuw.",
          error: "Server error",
        },
        { status: 403 }
      );
    }

    // signIn
    const { auth } = await createClient();
    const { data, error } = await auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password
    });
    if (error) {
      console.log("auth error: ",error)
      return NextResponse.json(
        {
          message: error.message,
          error: error,
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        message: "Succesvol login",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
        {
          message: "Refresh de pagina en probeer opnieuw.",
          error: error,
        },
        { status: 401 }
      );
  }
}
