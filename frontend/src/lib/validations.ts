import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username is too long")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Only letters, numbers, and underscores are allowed"
      ),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string(),

    agreeToTerms: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the Terms & Privacy Policy",
      }),
    }),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }
  );

export type SignupFormValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues =
  z.infer<typeof forgotPasswordSchema>;

export function getPasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password))
    score++;

  if (/[0-9]/.test(password))
    score++;

  if (/[^A-Za-z0-9]/.test(password))
    score++;

  return score;
}