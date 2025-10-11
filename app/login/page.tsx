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

type FormData = z.infer<typeof userSchema>;

function LoginForm() {
  const router = useRouter();
  const form = useForm<FormData>({ resolver: zodResolver(userSchema) });
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (form.formState.errors.email) {
      toast("Error", { description: form.formState.errors.email.message });
    } else if (form.formState.errors.password) {
      toast("Error", { description: form.formState.errors.password.message });
    }
  }, [form.formState.errors.email, form.formState.errors.password]);

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
          token: data.token
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
      if (
        typeof window !== "undefined" &&
        window.turnstile &&
        turnstileRef.current
      ) {
        window.turnstile.reset(turnstileRef.current);
      } 
    },
    onError: (error: Error) => {
      toast("Error", { description: error.message });
      console.error("Registration error:", error);
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
        toast("Error", {description: "Voltooi de Cloudflare-uitdaging of vernieuw de pagina."})
        return;
      }
      const transferData = { ...data, token };
      console.log(transferData);
      startTransition(async () => {
        // so that ui doesn't freeze
        mutation.mutate(transferData);
      });
    } else {
      toast("Error", {
        description: "Er is een onverwachte error ontstaan. Probeer opnieuw.",
      });
    }
  };

  return (
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
          {...form.register("email")}
          id="email"
          name="email"
          type="email"
          disabled={isPending}
        />
        <input
          {...form.register("password")}
          id="password"
          name="password"
          type="password"
          disabled={isPending}
        />
        <div
          //className={`cf-turnstile ${interactive ? '.active' : ''}`}
          className="cf-turnstile rounded-xl overflow-hidden h-16"
          data-sitekey='0x4AAAAAAB5p_8LYVdoKaNAj' // using .env gives an error in browser console
          data-appearance="execute"
          ref={turnstileRef}
          // data-before-interactive-callback="handleBeforeInteractive"
          // data-callback="handleBeforeInteractive"
        ></div>
        <button
          className="bg-amber-700 w-[40px] h-[40px] flex justify-center items-center"
          type="submit"
        >
          {isPending ? (
            <div className="h-[10px] w-[10px] bg-black"></div>
          ) : (
            "Login"
          )}
        </button>
      </form>
      
    </>
  );
}

export default LoginForm;
