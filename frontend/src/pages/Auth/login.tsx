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
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [formError, setFormError] = React.useState<string | null>(null);
  const { login } = useAuth();
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
      login(token, user);
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
      <Card className="border-0 bg-white shadow-xl">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold py-4 text-black">
            Sign in
          </CardTitle>
          <CardDescription className="text-gray-500">
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
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                  className="text-xs font-medium text-orange-500 transition-colors hover:text-orange-600"
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

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/30"
                {...register("remember")}
              />
              Keep me signed in
            </label>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              {!isSubmitting && (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              )}
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-orange-500 transition-colors hover:text-orange-600"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
