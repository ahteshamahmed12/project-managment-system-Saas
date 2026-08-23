import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, UserPlus, Camera } from "lucide-react";

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
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";

const STRENGTH_LABEL = ["Very weak", "Weak", "Fair", "Good", "Strong"];

const STRENGTH_COLOR = [
  "bg-red-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-green-500",
];

export default function Signup() {
  const navigate = useNavigate();

  const { login } = useAuth();
  const { addUser } = useUsers();

  const [formError, setFormError] = React.useState<string | null>(null);
  const [avatar, setAvatar] = React.useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
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

  /* =========================================================
     AVATAR UPLOAD
  ========================================================= */

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Image size must be less than 2MB.");
      return;
    }

    setFormError(null);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);

    try {
      const { user, token } = await authApi.signup({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      /*
       * User object for UsersContext
       *
       * Signup users get:
       * Role       -> Member
       * Department -> Development
       * Status     -> Active
       */

      const signedUpUser = {
        ...user,
        avatar: avatar || user.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(user.email)}`,
      };

      // Save user in UsersContext
      addUser(signedUpUser);

      // Save authenticated user
      login(token, signedUpUser);

      navigate("/dashboard", {
        replace: true,
        state: { userId: user.id },
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Unable to create your account.";

      setFormError(message);
    }
  };

  return (
    <AuthShell
      eyebrow="Project Management SaaS"
      headline="Build better projects together."
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
            {/* =====================================================
                AVATAR
            ===================================================== */}

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-colors hover:bg-orange-600"
                  aria-label="Upload profile picture"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Profile picture (optional)
              </p>
            </div>

            {/* =====================================================
                NAME
            ===================================================== */}

            <div>
              <Label htmlFor="name">Full name</Label>

              <div className="relative mt-1.5">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className="pl-10"
                  {...register("name")}
                />
              </div>

              <FieldError message={errors.name?.message} />
            </div>

            {/* =====================================================
                EMAIL
            ===================================================== */}

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
                  className="pl-10"
                  {...register("email")}
                />
              </div>

              <FieldError message={errors.email?.message} />
            </div>

            {/* =====================================================
                PASSWORD
            ===================================================== */}

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
                          "h-1.5 flex-1 rounded-full bg-gray-200 transition-colors",
                          i < strength && STRENGTH_COLOR[strength],
                        )}
                      />
                    ))}
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    {STRENGTH_LABEL[strength]}
                  </p>
                </div>
              )}

              <FieldError message={errors.password?.message} />
            </div>

            {/* =====================================================
                CONFIRM PASSWORD
            ===================================================== */}

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

            {/* =====================================================
                TERMS
            ===================================================== */}

            <div>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/30"
                  {...register("agreeToTerms")}
                />

                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="font-medium text-orange-500 transition-colors hover:text-orange-600"
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

            {/* =====================================================
                SUBMIT
            ===================================================== */}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              {!isSubmitting && (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-orange-500 transition-colors hover:text-orange-600"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
