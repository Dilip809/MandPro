
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useRegisterMutation } from "@/features/auth/authApi";
import type { CustomerType } from "@/features/auth/types";

const customerTypes: { value: CustomerType; label: string }[] = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "HOTEL_RESTAURANT", label: "Hotel / Restaurant" },
  { value: "FOOD_STALL", label: "Food stall" },
  { value: "CATERER", label: "Caterer" },
  { value: "STREET_VENDOR", label: "Street vendor" },
  { value: "RETAIL_SHOP", label: "Retail shop" },
  { value: "WHOLESALER", label: "Wholesaler" },
  { value: "OTHER_BUSINESS", label: "Other business" },
];

type FormFields = {
  name: string;
  email: string;
  phone: string;
  password: string;
  customerType: CustomerType;
  businessName: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

type ApiFieldError = {
  field: string;
  message: string;
};

const initialForm: FormFields = {
  name: "",
  email: "",
  phone: "",
  password: "",
  customerType: "INDIVIDUAL",
  businessName: "",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-green-700";

const errorClass = "mt-1 text-sm text-red-600";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const indianPhonePattern = /^[6-9]\d{9}$/;
const allowedPhonePattern = /^\+?[\d\s()-]+$/;

function isAllowedPhoneInput(value: string): boolean {
  return allowedPhonePattern.test(value.trim());
}

function normalizeIndianPhone(value: string): string {
  const trimmed = value.trim();
  let digits = trimmed.replace(/\D/g, "");

  if (
    digits.length === 12 &&
    digits.startsWith("91") &&
    (trimmed.startsWith("+91") || !trimmed.startsWith("+"))
  ) {
    digits = digits.slice(2);
  }

  return digits;
}

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length;
}

function validateField(
  field: keyof FormFields,
  value: string,
  customerType: CustomerType,
): string {
  switch (field) {
    case "name": {
      const name = value.trim();

      if (!name) return "Full name is required.";
      if (name.length < 2) return "Enter at least 2 characters.";
      if (name.length > 100) return "Maximum 100 characters.";
      break;
    }

    case "email": {
      const email = value.trim();

      if (!email) return "Email address is required.";
      if (email.length > 254 || !emailPattern.test(email)) {
        return "Enter a valid email address.";
      }
      break;
    }

    case "phone": {
      if (!value.trim()) return "Mobile number is required.";

      if (!isAllowedPhoneInput(value)) {
        return "Enter a valid Indian mobile number.";
      }

      if (!indianPhonePattern.test(normalizeIndianPhone(value))) {
        return "Enter a valid 10-digit Indian mobile number.";
      }
      break;
    }

    case "password": {
      const bytes = utf8Length(value);

      // Matches the backend's string minimum and byte maximum.
      if (value.length < 8) {
        return "Password must contain at least 8 characters.";
      }

      if (bytes > 72) {
        return "Password must not exceed 72 UTF-8 bytes.";
      }
      break;
    }

    case "businessName": {
      const name = value.trim();

      if (customerType !== "INDIVIDUAL" && !name) {
        return "Business name is required for business accounts.";
      }

      if (name && name.length < 2) {
        return "Business name must contain at least 2 characters.";
      }

      if (name.length > 150) {
        return "Maximum 150 characters.";
      }
      break;
    }

    case "customerType":
      if (!customerTypes.some((item) => item.value === value)) {
        return "Select a valid customer type.";
      }
      break;
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseApiFieldErrors(error: unknown): ApiFieldError[] {
  if (!isRecord(error) || !isRecord(error.data)) return [];

  const data = error.data;

  if (!Array.isArray(data.errors)) return [];

  return data.errors.filter(
    (item): item is ApiFieldError =>
      isRecord(item) &&
      typeof item.field === "string" &&
      typeof item.message === "string",
  );
}

function getRegistrationError(error: unknown): string {
  if (!isRecord(error)) {
    return "We couldn't create your account. Please try again.";
  }

  const data = isRecord(error.data) ? error.data : {};
  const message =
    typeof data.message === "string"
      ? data.message.toLowerCase()
      : "";

  if (
    message.includes("already exists") ||
    message.includes("already registered") ||
    message.includes("duplicate") ||
    message.includes("unique constraint")
  ) {
    return "An account with these details may already exist. Try logging in or use different contact details.";
  }

  if (
    error.status === 429 ||
    message.includes("too many") ||
    message.includes("rate limit")
  ) {
    return "Too many attempts. Please wait a while before trying again.";
  }

  if (error.status === 409) {
    return "An account with these details may already exist. Try logging in.";
  }

  if (error.status === 400 || error.status === 422) {
    return "Some registration details are invalid. Please review the highlighted fields.";
  }

  return "We couldn't create your account. Please try again.";
}

function mapApiField(field: string): keyof FormFields | undefined {
  const normalized = field.toLowerCase().replace(/[_\s-]/g, "");

  const mapping: Record<string, keyof FormFields> = {
    name: "name",
    email: "email",
    phone: "phone",
    password: "password",
    customertype: "customerType",
    businessname: "businessName",
  };

  return mapping[normalized];
}

function getFriendlyFieldError(
  field: keyof FormFields,
  message: string,
): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already exists") ||
    normalized.includes("already registered") ||
    normalized.includes("duplicate") ||
    normalized.includes("unique constraint")
  ) {
    if (field === "email") {
      return "This email may already be registered. Try logging in.";
    }

    if (field === "phone") {
      return "This mobile number may already be registered. Try logging in.";
    }

    return "These details may already be registered.";
  }

  switch (field) {
    case "name":
      return "Please enter a valid full name.";
    case "email":
      return "Please enter a valid email address.";
    case "phone":
      return "Please enter a valid Indian mobile number.";
    case "password":
      return "Please check your password requirements.";
    case "businessName":
      return message.toLowerCase().includes("required")
        ? "Business name is required for business accounts."
        : "Please check your business name.";
    case "customerType":
      return "Please select a valid customer type.";
  }
}

export default function RegisterPage() {
  const router = useRouter();

  const [register, { isLoading, error, reset }] =
    useRegisterMutation();

  const [form, setForm] = useState<FormFields>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState("");

  function updateField<K extends keyof FormFields>(
    field: K,
    value: FormFields[K],
  ) {
    const nextForm = { ...form, [field]: value };

    setForm(nextForm);
    reset();
    setRequestError("");

    if (submitted || errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: validateField(
          field,
          String(value),
          nextForm.customerType,
        ),
        ...(field === "customerType" || field === "businessName"
          ? {
              businessName: validateField(
                "businessName",
                nextForm.businessName,
                nextForm.customerType,
              ),
            }
          : {}),
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    setSubmitted(true);
    reset();
    setRequestError("");

    const nextErrors: FormErrors = {};

    for (const field of Object.keys(initialForm) as (keyof FormFields)[]) {
      const message = validateField(
        field,
        String(form[field]),
        form.customerType,
      );

      if (message) nextErrors[field] = message;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: normalizeIndianPhone(form.phone),
        password: form.password,
        customerType: form.customerType,
        ...(form.businessName.trim()
          ? { businessName: form.businessName.trim() }
          : {}),
      }).unwrap();

      router.push("/login");
    } catch (caughtError: unknown) {
      const serverErrors = parseApiFieldErrors(caughtError);
      const mappedErrors: FormErrors = {};

      for (const item of serverErrors) {
        const field = mapApiField(item.field);

        if (field) {
          mappedErrors[field] = getFriendlyFieldError(
            field,
            item.message,
          );
        }
      }

      if (Object.keys(mappedErrors).length > 0) {
        setErrors((previous) => ({
          ...previous,
          ...mappedErrors,
        }));
      }

      // Avoid showing a duplicate form error when field errors
      // already explain the validation failure.
      if (Object.keys(mappedErrors).length === 0) {
        setRequestError(getRegistrationError(caughtError));
      }
    }
  }

  function fieldError(field: keyof FormFields) {
    const message = errors[field];

    return message ? (
      <p id={`${field}-error`} className={errorClass} role="alert">
        {message}
      </p>
    ) : null;
  }

  // Handles unexpected RTK Query errors outside the submit catch.
  const formError =
    requestError || (error && !requestError ? "" : "");

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-3xl font-bold">Create your account</h1>

        <p className="mt-2 text-(--muted-foreground)">
          Register to order fresh produce through Mandipro.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="font-medium">Full name</label>
            <input
              id="name"
              name="name"
              className={inputClass}
              autoComplete="name"
              required
              maxLength={100}
              value={form.name}
              disabled={isLoading}
              onChange={(event) => updateField("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {fieldError("name")}
          </div>

          <div>
            <label htmlFor="email" className="font-medium">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={inputClass}
              autoComplete="email"
              required
              maxLength={254}
              value={form.email}
              disabled={isLoading}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {fieldError("email")}
          </div>

          <div>
            <label htmlFor="phone" className="font-medium">
              Indian mobile number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              className={inputClass}
              autoComplete="tel"
              placeholder="9876543210 or +91 9876543210"
              required
              value={form.phone}
              disabled={isLoading}
              onChange={(event) => updateField("phone", event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {fieldError("phone")}
          </div>

          <div>
            <label htmlFor="customerType" className="font-medium">
              Customer type
            </label>
            <select
              id="customerType"
              name="customerType"
              className={inputClass}
              value={form.customerType}
              disabled={isLoading}
              onChange={(event) =>
                updateField("customerType", event.target.value as CustomerType)
              }
              aria-invalid={Boolean(errors.customerType)}
              aria-describedby={
                errors.customerType ? "customerType-error" : undefined
              }
            >
              {customerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {fieldError("customerType")}
          </div>

          <div>
            <label htmlFor="businessName" className="font-medium">
              Business name
              {form.customerType === "INDIVIDUAL" ? " (optional)" : ""}
            </label>
            <input
              id="businessName"
              name="businessName"
              className={inputClass}
              autoComplete="organization"
              maxLength={150}
              required={form.customerType !== "INDIVIDUAL"}
              value={form.businessName}
              disabled={isLoading}
              onChange={(event) =>
                updateField("businessName", event.target.value)
              }
              aria-invalid={Boolean(errors.businessName)}
              aria-describedby={
                errors.businessName ? "businessName-error" : undefined
              }
            />
            {fieldError("businessName")}
          </div>

          <div>
            <label htmlFor="password" className="font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={inputClass}
              autoComplete="new-password"
              required
              value={form.password}
              disabled={isLoading}
              onChange={(event) => updateField("password", event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "password-error password-hint" : "password-hint"
              }
            />
            <p
              id="password-hint"
              className="mt-1 text-sm text-(--muted-foreground)"
            >
              Use at least 8 characters and no more than 72 UTF-8 bytes.
            </p>
            {fieldError("password")}
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm">
          Already have an account?{" "}
          <Link className="font-semibold underline" href="/login">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
