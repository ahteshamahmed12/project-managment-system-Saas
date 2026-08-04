import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail } from "lucide-react";

import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { FieldError, FormBanner } from "@/components/FormFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authApi } from "@/lib/auth-api";
import { loginSchema, type LoginFormValues } from "@/lib/validations";

export default function Login() {
  const navigate = useNavigate();

  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "" as string,
      password: "" as string,
      remember: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      await authApi.login({
        email: values.email!,
        password: values.password!,
        
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error: any) {
      setFormError(
        error?.message ?? "Unable to sign in. Please try again."
      );
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      headline="Pick up right where your team left off."
    >
      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">
            Sign in
          </CardTitle>

          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {formError && (
            <FormBanner
              variant="error"
              message={formError}
            />
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <div>
              <Label htmlFor="email">
                Email Address
              </Label>

              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`pl-10 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  {...register("email")}
                />
              </div>

              <FieldError
                message={errors.email?.message}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Password
                </Label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="mt-2">
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  hasError={!!errors.password}
                  {...register("password")}
                />
              </div>

              <FieldError
                message={errors.password?.message}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                {...register("remember")}
              />

              Keep me signed in
            </label>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                "Signing In..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}