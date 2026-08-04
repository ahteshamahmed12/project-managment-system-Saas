import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, UserPlus } from "lucide-react";

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
import {
  signupSchema,
  getPasswordStrength,
  type SignupFormValues,
} from "@/lib/validations";
import { authApi } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

const STRENGTH_LABEL = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = [
  "bg-danger-500",
  "bg-danger-500",
  "bg-amber-500",
  "bg-brand-500",
  "bg-success-500",
];

export default function Signup() {
  const navigate = useNavigate();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: undefined,
    },
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const strength = getPasswordStrength(password);

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);
    try {
      await authApi.signup({
        username: values.username,
        email: values.email,
        password: values.password,
      });
  
      const { user } = await authApi.login({
        email: values.email,
        password: values.password,
      });
  
      navigate("/dashboard", { replace: true, state: { userId: user.id } });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Unable to create your account.";
      setFormError(message);
    }
  };

  return (
    <AuthShell
      eyebrow="Get started"
      headline="Create an account and ship your first project in minutes."
    >
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            It only takes a minute to get started.
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
              <Label htmlFor="name">Full name</Label>
              <div className="relative mt-1.5">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                  aria-hidden="true"
                />
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className="pl-10"
                  {...register("username")}
                />
              </div>
              <FieldError message={errors.username?.message} />
            </div>

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
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1.5">
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  hasError={!!errors.password}
                  {...register("password")}
                />
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full bg-ink-100 transition-colors",
                          i < strength && STRENGTH_COLOR[strength],
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {STRENGTH_LABEL[strength]}
                  </p>
                </div>
              )}
              <FieldError message={errors.password?.message} />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="mt-1.5">
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  hasError={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
              </div>
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  {...register("agreeToTerms")}
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="font-medium text-brand-600 hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="font-medium text-brand-600 hover:underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
              <FieldError message={errors.agreeToTerms?.message} />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {!isSubmitting && (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-brand-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
