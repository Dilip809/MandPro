
"use client";

import { useState, type FormEvent } from "react";

import { useCreateSellerApplicationMutation } from "../sellerApplicationApi";
import type { CreateSellerApplicationInput } from "../types";
import type { CustomerType } from "@/features/auth/types";

const BUSINESS_TYPES: { value: CustomerType; label: string }[] = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "HOTEL_RESTAURANT", label: "Hotel / Restaurant" },
  { value: "CATERER", label: "Caterer" },
  { value: "FOOD_STALL", label: "Food stall" },
  { value: "RETAILER", label: "Retailer" },
  { value: "OTHER", label: "Other" },
];

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return "Unable to submit your application. Please try again.";
}

export default function SellerApplicationForm() {
  const [form, setForm] = useState<CreateSellerApplicationInput>({
    businessName: "",
    businessType: "INDIVIDUAL",
    businessAddress: "",
    contactPhone: "",
  });

  const [createApplication, { isLoading, error }] =
    useCreateSellerApplicationMutation();

  function updateField<K extends keyof CreateSellerApplicationInput>(
    field: K,
    value: CreateSellerApplicationInput[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createApplication({
        businessName: form.businessName.trim(),
        businessType: form.businessType,
        businessAddress: form.businessAddress.trim(),
        contactPhone: form.contactPhone.trim(),
      }).unwrap();
    } catch {
      // RTK Query exposes the API error through `error`.
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="businessName" className="font-medium">
          Business name
        </label>
        <input
          id="businessName"
          className={inputClass}
          value={form.businessName}
          onChange={(event) =>
            updateField("businessName", event.target.value)
          }
          minLength={2}
          maxLength={150}
          required
        />
      </div>

      <div>
        <label htmlFor="businessType" className="font-medium">
          Business type
        </label>
        <select
          id="businessType"
          className={inputClass}
          value={form.businessType}
          onChange={(event) =>
            updateField("businessType", event.target.value as CustomerType)
          }
          required
        >
          {BUSINESS_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="businessAddress" className="font-medium">
          Business address
        </label>
        <textarea
          id="businessAddress"
          className={inputClass}
          value={form.businessAddress}
          onChange={(event) =>
            updateField("businessAddress", event.target.value)
          }
          minLength={5}
          maxLength={500}
          rows={4}
          required
        />
      </div>

      <div>
        <label htmlFor="contactPhone" className="font-medium">
          Contact mobile number
        </label>
        <input
          id="contactPhone"
          className={inputClass}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="10-digit Indian mobile number"
          value={form.contactPhone}
          onChange={(event) =>
            updateField(
              "contactPhone",
              event.target.value.replace(/\D/g, "").slice(0, 10),
            )
          }
          pattern="[6-9][0-9]{9}"
          title="Enter a valid 10-digit Indian mobile number."
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {getErrorMessage(error)}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Submitting application..." : "Submit application"}
      </button>

      <p className="text-sm text-[var(--muted-foreground)]">
        Your application will be reviewed by the Mandipro administration team.
      </p>
    </form>
  );
}
