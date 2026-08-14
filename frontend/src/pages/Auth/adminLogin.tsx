import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, LogIn } from "lucide-react";

import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { FieldError, FormBanner } from "@/components/FormFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { authApi } from "@/lib/auth-api";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      const { user, token } = await authApi.login(values);

      // Only Admin users can access Admin Login
      if (user.role !== "Admin") {
        setFormError("Access denied. Only administrators can sign in here.");
        return;
      }

      login(token, user);

      if (!values.remember) {
        window.addEventListener("beforeunload", () => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("current_user");
        });
      }

      navigate("/admin/dashboard", {
        replace: true,
        state: {
          userId: user.id,
        },
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Unable to sign in. Please try again.";

      setFormError(message);
    }
  };

  return (
    <AuthShell
      eyebrow="Administrator Portal"
      headline="Manage your workspace from one central dashboard."
    >
      <Card className="border-0 bg-white shadow-xl">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <CardTitle className="py-2 text-3xl font-bold text-black">
            Admin Sign in
          </CardTitle>

          <CardDescription className="text-gray-500">
            Sign in with your administrator account to access the admin
            dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {formError && (
            <div className="mb-5">
              <FormBanner variant="error" message={formError} />
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <Label htmlFor="admin-email">Email address</Label>

              <div className="relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className={errors.email ? "border-red-500 pl-10" : "pl-10"}
                  {...register("email")}
                />
              </div>

              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="admin-password">Password</Label>

              <div className="mt-1.5">
                <PasswordInput
                  id="admin-password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  hasError={!!errors.password}
                  {...register("password")}
                />
              </div>

              <FieldError message={errors.password?.message} />
            </div>

            {/* Remember */}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/30"
                {...register("remember")}
              />
              Keep me signed in
            </label>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              {!isSubmitting && (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              )}

              {isSubmitting ? "Signing in..." : "Admin Sign in"}
            </Button>
          </form>

          {/* Normal login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Not an administrator?{" "}
            <Link
              to="/login"
              className="font-medium text-orange-500 transition-colors hover:text-orange-600"
            >
              User Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
