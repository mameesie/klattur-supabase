import { createClient } from "@/supabase/auth/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import z from "zod";
import { th } from "zod/v4/locales";

export const userSchema = z.object({
  email: z
    .email("Dit is geen mailadres.")
    .min(1, { message: "Email is vereist." }),
  password: z
    .string()
    .min(6, { message: "Wachtwoord moet bestaan uit minimaal 6 tekens." }),
  token: z.string().optional(), // token is not jet in formData when validating (not optional on server side!)
  name: z.string().optional(),
  firstName: z.string().min(1, { message: "Naam is vereist." }),
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

    const supabase = await createClient();
    // check database if email already exist
    const { data: provider, error: emailCheckError } = await supabase.rpc(
      "does_email_exist",
      {
        user_email: validation.data.email,
      }
    );
    console.log("data: ", provider);
    console.log("error: ", emailCheckError);

    if (emailCheckError) {
      console.log("email check error: ", emailCheckError);
      return NextResponse.json(
        {
          message: emailCheckError.message,
          error: emailCheckError,
        },
        { status: 401 }
      );
    }
    if (provider === "google") {
      return NextResponse.json(
        { message: "Dit emailadres is al in gebruik via Google." },
        { status: 400 }
      );
    }
    if (provider === "email") {
      return NextResponse.json(
        { message: "Dit emailadres is al in gebruik." },
        { status: 400 }
      );
    } else if (provider === null || provider === "unverified") {
      // Email doesn't exist, proceed with signup

      // signUp
      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          data: {
            first_name: validation.data.firstName,
            // or any other custom fields:
          },
        },
      });
      if (error) {
        console.log("auth error: ", error);
        throw new Error(error.message);
      }
      return NextResponse.json(
        {
          message:
            "Er is een mail verstuurd naar jouw emailadres om je account te activeren.",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.log("error: ", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        message: errorMessage, // ✅ Now it's a string
        error: errorMessage,
      },
      { status: 401 }
    );
  }
}
