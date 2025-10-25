"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { userSchema } from "@/app/types/userSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Script from "next/script";
import { createClient } from "@/supabase/auth/client";
import { loginWithGoogle } from "../actions/actions";
import "@/app/globals.css";
type FormData = z.infer<typeof userSchema>;

function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormData>({ resolver: zodResolver(userSchema) });
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/auth/login", {
        // is this cached?
        // don't need try catch is managed by useMutation
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          token: data.token,
        }),
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.message || "Registration failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast("Succes", { description: data.message });
      // if (
      //   typeof window !== "undefined" &&
      //   window.turnstile &&
      //   turnstileRef.current
      // ) {
      //   window.turnstile.reset(turnstileRef.current);
      // }

      window.location.href = "/chat";
    },
    onError: (error: Error) => {
      setError(error.message);
      if (error.message === "Email not confirmed") {
        setError(
          "Je account is nog niet geactiveerd. Controleer je spambox of meld je opnieuw aan."
        );
      }
      console.log("Registration error:", error);
      if (
        typeof window !== "undefined" &&
        window.turnstile &&
        turnstileRef.current
      ) {
        window.turnstile.reset(turnstileRef.current);
      }
    },
  });
  const handleSubmit = (data: FormData) => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const token = formData.get("cf-turnstile-response") as string;

      if (!token) {
        setError("Voltooi de Cloudflare-uitdaging of vernieuw de pagina.");
        return;
      }
      const transferData = { ...data, token };
      console.log(transferData);
      startTransition(async () => {
        // so that ui doesn't freeze
        mutation.mutate(transferData);
      });
    } else {
      setError("Er is een onverwachte error ontstaan. Probeer opnieuw.");
    }
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result) {
      console.log(result);

      if (result.url) {
        // Redirect to Google OAuth
        window.location.href = result.url;
      }
    }
  };
  return (
    <div className="flex flex-col items-center bg-pink-mid">
      <div className="w-[350px] rounded-[20px] flex flex-col items-center bg-pink-dark mt-[50px]">
        <h1 className="font-semibold mt-[10px] ">Welkom terug</h1>
        <p>Log in met je Google account</p>
        <button
          onClick={handleGoogleLogin}
          className=" bg-pink-light w-[300px] h-[40px] rounded-[10px] mt-[20px] "
          type="submit"
        >
          GOOGLE
        </button>
        <div className="w-[300px] mt-[30px]">
          <h2><span>Of login met je email</span></h2>
        </div>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></Script>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
          ref={formRef}
          className="flex flex-col gap-2"
        >
          
          <input
            {...form.register("name")}
            name="name"
            type="text"
            className="h-0 overflow-hidden"
          />
          <div className="flex justify-start">
            email:
          </div>
          <input
            {...form.register("email")}
            className="w-[300px] bg-white rounded-[10px] h-[40px]"
            id="email"
            name="email"
            type="email"
            disabled={isPending}
          />
          {form.formState.errors.email && form.formState.errors.email.message}
          <div className="flex justify-start">
            wachtwoord:
          </div>
          <input
            {...form.register("password")}
            className="w-[300px] bg-white rounded-[10px] h-[40px]"
            id="password"
            name="password"
            type="password"
            disabled={isPending}
          />
          {form.formState.errors.password &&
            form.formState.errors.password.message}
          <div
            //className={`cf-turnstile ${interactive ? '.active' : ''}`}
            className="cf-turnstile rounded-xl overflow-hidden h-16 mt-[10px]"
            data-sitekey="0x4AAAAAAB5p_8LYVdoKaNAj" // using .env gives an error in browser console
            data-appearance="execute"
            ref={turnstileRef}
            // data-before-interactive-callback="handleBeforeInteractive"
            // data-callback="handleBeforeInteractive"
          ></div>
          {error && <div>{error} </div>}
          <button
            className="bg-pink-light w-[300px] h-[40px] rounded-[10px] mt-[10px] mb-[25px]"
            type="submit"
          >
            {isPending ? (
              <div className="h-[10px] w-[10px] bg-black"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
