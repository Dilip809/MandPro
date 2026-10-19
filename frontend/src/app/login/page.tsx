
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useLoginMutation } from "@/features/auth/authApi";

type FieldName = "identifier" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

interface ParsedApiError {
  fieldErrors: FieldErrors;
  formError: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const indianPhonePattern = /^[6-9]\d{9}$/;
const allowedPhonePattern = /^\+?[\d\s()-]+$/;

function normalizeIdentifier(value: string): string {
  const identifier = value.trim();

  // Never modify email addresses as phone numbers.
  if (identifier.includes("@")) {
    return identifier;
  }

  // Reject arbitrary characters instead of stripping them.
  if (!allowedPhonePattern.test(identifier)) {
    return identifier;
  }

  let digits = identifier.replace(/\D/g, "");

  if (
    digits.length === 12 &&
    digits.startsWith("91") &&
    (identifier.startsWith("+91") || !identifier.startsWith("+"))
  ) {
    digits = digits.slice(2);
  }

  return digits;
}

function validateIdentifier(value: string): string {
  const identifier = normalizeIdentifier(value);

  if (!identifier) {
    return "Email address or phone number is required.";
  }

  if (identifier.length > 254 && identifier.includes("@")) {
    return "Enter a valid email address.";
  }

  const isEmail = emailPattern.test(identifier);
  const isIndianPhone = indianPhonePattern.test(identifier);

  if (!isEmail && !isIndianPhone) {
    return "Enter a valid email address or 10-digit Indian mobile number.";
  }

  return "";
}

function getApiError(error: unknown): ParsedApiError {
  const result: ParsedApiError = {
    fieldErrors: {},
    formError: "",
  };

  if (!error) return result;

  if (!isRecord(error)) {
    result.formError = "We couldn't log you in. Please try again.";
    return result;
  }

  const data = isRecord(error.data) ? error.data : {};
  const message =
    typeof data.message === "string"
      ? data.message.toLowerCase()
      : "";

  if (Array.isArray(data.errors)) {
    for (const item of data.errors) {
      if (
        !isRecord(item) ||
        typeof item.field !== "string" ||
        typeof item.message !== "string"
      ) {
        continue;
      }

      const field = item.field.toLowerCase().replace(/[_\s-]/g, "");

      if (["identifier", "email", "phone"].includes(field)) {
        result.fieldErrors.identifier =
          "Enter a valid email address or phone number.";
      } else if (field === "password") {
        result.fieldErrors.password =
          "Please check your password and try again.";
      }
    }
  }

  // Prefer field-level validation messages when available.
  if (
    result.fieldErrors.identifier ||
    result.fieldErrors.password
  ) {
    return result;
  }

  if (
    error.status === 401 ||
    message.includes("invalid credential") ||
    message.includes("incorrect password") ||
    message.includes("user not found") ||
    message.includes("invalid email or password") ||
    message.includes("invalid credentials")
  ) {
    result.formError = "Email/phone number or password is incorrect.";
  } else if (
    error.status === 429 ||
    message.includes("too many") ||
    message.includes("rate limit")
  ) {
    result.formError =
      "Too many attempts. Please wait a while before trying again.";
  } else if (
    message.includes("suspended") ||
    message.includes("not active") ||
    message.includes("account is inactive")
  ) {
    result.formError =
      "Your account is not active. Please contact Mandipro support.";
  } else {
    result.formError = "We couldn't log you in. Please try again.";
  }

  return result;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-green-700";

const errorClass = "mt-1 text-sm text-red-600";

export default function LoginPage() {
  const router = useRouter();

  const [login, { isLoading, error: apiError, reset }] =
    useLoginMutation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const serverError = getApiError(apiError);

  function validateForm(): boolean {
    const nextErrors: FieldErrors = {};

    const identifierError = validateIdentifier(identifier);

    if (identifierError) {
      nextErrors.identifier = identifierError;
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (new TextEncoder().encode(password).length > 72) {
      nextErrors.password = "Password must not exceed 72 UTF-8 bytes.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    setSubmitted(true);
    reset();

    if (!validateForm()) return;

    try {
      await login({
        identifier: normalizeIdentifier(identifier),
        password,
      }).unwrap();

      router.replace("/");
      router.refresh();
    } catch {
      // RTK Query errors are displayed through serverError.
    }
  }

  function handleIdentifierChange(value: string) {
    setIdentifier(value);
    reset();

    setErrors((previous) => ({
      ...previous,
      identifier: submitted ? validateIdentifier(value) : undefined,
    }));
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    reset();

    setErrors((previous) => ({
      ...previous,
      password: submitted
        ? !value
          ? "Password is required."
          : new TextEncoder().encode(value).length > 72
            ? "Password must not exceed 72 UTF-8 bytes."
            : undefined
        : undefined,
    }));
  }

  const identifierError =
    errors.identifier || serverError.fieldErrors.identifier;

  const passwordError =
    errors.password || serverError.fieldErrors.password;

  const formError = serverError.formError;

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-3xl font-bold">Welcome back</h1>

        <p className="mt-2 text-(--muted-foreground)">
          Log in to your Mandipro account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
          noValidate
        >
          <div>
            <label htmlFor="identifier" className="font-medium">
              Email address or phone number
            </label>

            <input
              id="identifier"
              name="identifier"
              type="text"
              className={inputClass}
              autoComplete="username"
              placeholder="Enter email or mobile number"
              value={identifier}
              required
              disabled={isLoading}
              aria-invalid={Boolean(identifierError)}
              aria-describedby={
                identifierError ? "identifier-error" : undefined
              }
              onChange={(event) =>
                handleIdentifierChange(event.target.value)
              }
            />

            {identifierError && (
              <p
                id="identifier-error"
                className={errorClass}
                role="alert"
              >
                {identifierError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="font-medium">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className={inputClass}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              required
              disabled={isLoading}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? "password-error" : undefined
              }
              onChange={(event) =>
                handlePasswordChange(event.target.value)
              }
            />

            {passwordError && (
              <p
                id="password-error"
                className={errorClass}
                role="alert"
              >
                {passwordError}
              </p>
            )}
          </div>

          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm">
          New to Mandipro?{" "}
          <Link className="font-semibold underline" href="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
