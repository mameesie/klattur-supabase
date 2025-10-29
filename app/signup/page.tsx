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
    <>
      
      {validation ? (
        <div className="flex justify-center text-center">
          <p className="mt-[30px] mx-[40px]">
            Er is een mail verstuurd naar jouw emailadres om je account te
            activeren.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center bg-pink-mid">
          <div className="w-[350px] rounded-[20px] flex flex-col items-center bg-pink-dark mt-[70px]">
            <h1 className="font-semibold mt-[60px] ">Welkom</h1>
        <p>Meld je aan met je Google account</p>
        <button
          onClick={handleGoogleLogin}
          className=" bg-pink-light w-[300px] h-[55px] rounded-[10px] mt-[30px] cursor-pointer font-semibold "
          type="submit"
        >
          Google
        </button>
        <div className="w-[300px] mt-[30px] text-center font-semibold">
          Of meld je aan met je email
          {/* <h2><span>Of login met je email</span></h2> */}
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
            className="flex flex-col"
          >
            <input
              {...form.register("name")}
              name="name"
              type="text"
              className="h-5 overflow-hidden"
            />
            <div className="flex justify-start mt-[10px]">
            Voornaam
          </div>
            <input className="w-[300px] bg-white rounded-[10px] h-[55px] p-[10px]"
              {...form.register("firstName")}
              id="firstName"
              name="firstName"
              type="text"
              disabled={isPending}
            />
             {form.formState.errors.firstName && <p className="w-[300px] text-red-900">{form.formState.errors.firstName.message}</p>}
            <div className="flex justify-start mt-[10px]">
            Email
          </div>
            <input className="w-[300px] bg-white rounded-[10px] h-[55px] p-[10px]"
              {...form.register("email")}
              id="email"
              name="email"
              type="email"
              disabled={isPending}
            />
            {form.formState.errors.email && <p className="w-[300px] text-red-900">{form.formState.errors.email.message}</p>}
            <div className="flex justify-start mt-[10px]">
            Wachtwoord
          </div>
            <input className="w-[300px] bg-white rounded-[10px] h-[55px] p-[10px]"
              {...form.register("password")}
              id="password"
              name="password"
              type="password"
              disabled={isPending}
            />
             {form.formState.errors.password && <p className="w-[300px] text-red-900">{form.formState.errors.password.message}</p>}
            <div
              //className={`cf-turnstile ${interactive ? '.active' : ''}`}
              className="cf-turnstile rounded-xl overflow-hidden h-16 mt-[30px]"
              data-sitekey="0x4AAAAAAB5p_8LYVdoKaNAj" // using .env gives an error in browser console
              data-appearance="execute"
              ref={turnstileRef}
              // data-before-interactive-callback="handleBeforeInteractive"
              // data-callback="handleBeforeInteractive"
            ></div>
            {error && <div className="w-[300px] text-red-900">{error} </div>}
            <button
              className="bg-pink-light w-[300px] h-[55px] rounded-[10px] mt-[30px] mb-[25px] cursor-pointer"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="h-[10px] w-[10px] bg-black"></div>
              ) : (
                <p className="font-semibold">Aanmelden</p>
              )}
            </button>
          </form>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginForm;
