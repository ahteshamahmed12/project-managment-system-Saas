import { AlertCircle, CheckCircle2 } from "lucide-react";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger-500">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export function FormBanner({
  variant,
  message,
}: {
  variant: "error" | "success";
  message: string;
}) {
  const isError = variant === "error";
  return (
    <div
      role="alert"
      className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
        isError
          ? "border-danger-500/20 bg-danger-50 text-danger-500"
          : "border-success-500/20 bg-success-50 text-success-500"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{message}</span>
    </div>
  );
}
