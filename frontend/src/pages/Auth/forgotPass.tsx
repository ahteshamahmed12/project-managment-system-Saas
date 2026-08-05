import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, MailCheck, ArrowLeft, SendHorizontal } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
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
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations";
import { authApi } from "@/lib/auth-api";

export default function ForgotPass() {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null);
    try {
      await authApi.forgotPassword(values);
      setSentTo(values.email);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Unable to send the reset link. Please try again.";
      setFormError(message);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      headline="We'll help you get back into your account in a couple of clicks."
    >
      <Card>
        {sentTo ? (
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
              <MailCheck
                className="h-6 w-6 text-success-500"
                aria-hidden="true"
              />
            </div>
            <CardTitle className="mb-2">Check your inbox</CardTitle>
            <CardDescription>
              We sent a password reset link to{" "}
              <span className="font-medium text-ink-900">{sentTo}</span>. The
              link expires in 15 minutes.
            </CardDescription>

            <Button
              variant="outline"
              size="lg"
              className="mt-6 w-full"
              onClick={() => onSubmit(getValues())}
              disabled={isSubmitting}
            >
              Resend link
            </Button>

            <Link
              to="/login"
              className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to sign in
            </Link>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Forgot password</CardTitle>
              <CardDescription>
                Enter the email linked to your account and we&apos;ll send you a
                reset link.
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
                      className="pl-10"
                      data-has-error={!!errors.email}
                      {...register("email")}
                    />
                  </div>
                  <FieldError message={errors.email?.message} />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {!isSubmitting && (
                    <SendHorizontal className="h-4 w-4" aria-hidden="true" />
                  )}
                  Send reset link
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
