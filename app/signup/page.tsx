"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { userSchemaSignUp } from "@/app/types/userSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Script from "next/script";
import { createClient } from "@/supabase/auth/client";

type FormData = z.infer<typeof userSchemaSignUp>;

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validation, setValidation] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(userSchemaSignUp) });
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);



  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/auth/signup", {
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
          firstName: data.firstName,
        }),
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.message || "Registration failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      setValidation(true);
      // if (
      //   typeof window !== "undefined" &&
      //   window.turnstile &&
      //   turnstileRef.current
      // ) {
      //   window.turnstile.reset(turnstileRef.current);
      // }
    },
    onError: (error: Error) => {
      setError(error.message);
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
        
        setError("Voltooi de Cloudflare-uitdaging of vernieuw de pagina.")
        
          
        return;
      }
      const transferData = { ...data, token };
      console.log(transferData);
      startTransition(async () => {
        // so that ui doesn't freeze
        mutation.mutate(transferData);
      });
    } else {
      
       setError( "Er is een onverwachte error ontstaan. Probeer opnieuw.")
      
    }
  };

  return (
    <>
      
      {validation ? (
        <div>
          <p>
            Er is een mail verstuurd naar jouw emailadres om je account te
            activeren.
          </p>
        </div>
      ) : (
        <>
        <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      ></Script>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
          ref={formRef}
          className="flex flex-col gap-2 bg-gray-200"
        >
          <input
            {...form.register("name")}
            name="name"
            type="text"
            className="h-0 overflow-hidden"
          />
          <input
            {...form.register("firstName")}
            id="firstName"
            name="firstName"
            type="text"
            disabled={isPending}
          />
           {form.formState.errors.firstName && form.formState.errors.firstName.message}
          <input
            {...form.register("email")}
            id="email"
            name="email"
            type="email"
            disabled={isPending}
          />
          {form.formState.errors.email && form.formState.errors.email.message}
          <input
            {...form.register("password")}
            id="password"
            name="password"
            type="password"
            disabled={isPending}
          />
           {form.formState.errors.password && form.formState.errors.password.message}
          <div
            //className={`cf-turnstile ${interactive ? '.active' : ''}`}
            className="cf-turnstile rounded-xl overflow-hidden h-16"
            data-sitekey="0x4AAAAAAB5p_8LYVdoKaNAj" // using .env gives an error in browser console
            data-appearance="execute"
            ref={turnstileRef}
            // data-before-interactive-callback="handleBeforeInteractive"
            // data-callback="handleBeforeInteractive"
          ></div>
          {error && <div>{error}</div>}
          <button
            className="bg-amber-700 w-[40px] h-[40px] flex justify-center items-center"
            type="submit"
          >
            {isLoading ? (
              <div className="h-[10px] w-[10px] bg-black"></div>
            ) : (
              "Aanmelden"
            )}
          </button>
        </form>
        </>
      )}
    </>
  );
}

export default LoginForm;
