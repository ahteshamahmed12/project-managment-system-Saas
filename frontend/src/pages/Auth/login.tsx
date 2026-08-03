import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, LogIn } from "lucide-react";

import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { FieldError, FormBanner } from "@/components/FormFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { authApi } from "@/lib/auth-api";

export default function Login() {
  const navigate = useNavigate();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });
  const onSubmit = async (values: LoginFormValues) => {
    console.log("Submitted:", values);

    setFormError(null);

    try {
      const { user, token } = await authApi.login(values);
      localStorage.setItem("auth_token", token);
      if (!values.remember) {
        // Session-only: clear the token once the browser tab closes.
        window.addEventListener("beforeunload", () =>
          localStorage.removeItem("auth_token"),
        );
      }
      navigate("/dashboard", { replace: true, state: { userId: user.id } });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Unable to sign in. Please try again.";
      setFormError(message);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      headline="Pick up right where your team left off."
    >
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && <FormBanner variant="error" message={formError} />}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={errors.email ? "pl-10 border-red-500" : "pl-10"}
                  {...register("email")}
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5">
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  hasError={!!errors.password}
                  {...register("password")}
                />
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                {...register("remember")}
              />
              Keep me signed in
            </label>

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {!isSubmitting && (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              )}
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-brand-600 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
