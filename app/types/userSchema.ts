import z from "zod"

export const userSchema = z.object({
  email: z
  .email("Dit is geen mailadres.")
  .min(1, { message: "Email is vereist." }),
  password: z.string().min(6,{message: "Wachtwoord moet bestaan uit minimaal 6 tekens."}),
  token: z.string().optional(), // token is not jet in formData when validating (not optional on server side!)
  name: z.string().optional()
});


export const userSchemaSignUp = z.object({
  email: z
  .email("Dit is geen mailadres.")
  .min(1, { message: "Email is vereist." }),
  password: z.string().min(6,{message: "Wachtwoord moet bestaan uit minimaal 6 tekens."}),
  token: z.string().optional(), // token is not jet in formData when validating (not optional on server side!)
  name: z.string().optional(),
  firstName: z.string().min(1,{ message: "Naam is vereist." })
  
});

// window turnstile type declaration
declare global {
  interface Window {
    turnstile?: any;
  }
}