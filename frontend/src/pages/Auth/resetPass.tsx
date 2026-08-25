import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, KeyRound, ShieldAlert } from "lucide-react";

import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { FieldError, FormBanner } from "@/components/FormFeedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations";
import { authApi } from "@/lib/auth-api";

export default function ResetPass() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);

    try {
      await authApi.resetPassword({
        token: token ?? "",
        new_password: values.newPassword,
      });
      setSuccess(true);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Unable to reset the password. Please try again.";
      setFormError(message);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      headline="Choose a new password to secure your account."
    >
      <Card>
        {!token ? (
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <ShieldAlert
                className="h-6 w-6 text-red-500"
                aria-hidden="true"
              />
            </div>
            <CardTitle className="mb-2">Invalid reset link</CardTitle>
            <CardDescription>
              This link is missing its security token. Please request a new
              password reset link.
            </CardDescription>

            <Button variant="outline" size="lg" className="mt-6 w-full" asChild>
              <Link to="/forgot-password">Request a new link</Link>
            </Button>
          </CardContent>
        ) : success ? (
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
              <CheckCircle2
                className="h-6 w-6 text-success-500"
                aria-hidden="true"
              />
            </div>
            <CardTitle className="mb-2">Password updated</CardTitle>
            <CardDescription>
              Your password has been changed successfully. You can now sign in
              with your new password.
            </CardDescription>

            <Button size="lg" className="mt-6 w-full" asChild>
              <Link to="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Set a new password</CardTitle>
              <CardDescription>
                Your new password must be different from previously used
                passwords.
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
                  <Label htmlFor="new-password">New password</Label>

                  <div className="mt-1.5">
                    <PasswordInput
                      id="new-password"
                      autoComplete="new-password"
                      placeholder="Enter a strong new password"
                      hasError={!!errors.newPassword}
                      {...register("newPassword")}
                    />
                  </div>

                  <FieldError message={errors.newPassword?.message} />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm password</Label>

                  <div className="mt-1.5">
                    <PasswordInput
                      id="confirm-password"
                      autoComplete="new-password"
                      placeholder="Re-enter your new password"
                      hasError={!!errors.confirmPassword}
                      {...register("confirmPassword")}
                    />
                  </div>

                  <FieldError message={errors.confirmPassword?.message} />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {!isSubmitting && (
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isSubmitting ? "Updating..." : "Update password"}
                </Button>
              </form>

              <Link
                to="/login"
                className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to sign in
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </AuthShell>
  );
}
