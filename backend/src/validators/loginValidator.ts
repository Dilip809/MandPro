
import { z } from "zod";

const identifierSchema = z
    .string()
    .trim()
    .min(1, "Email or phone number is required")
    .max(254, "Identifier is too long")
    .refine(
        (value) =>
            z.email().safeParse(value).success ||
            /^[6-9]\d{9}$/.test(value),
        "Enter a valid email address or mobile number"
    )
    .transform((value) =>
        /^[6-9]\d{9}$/.test(value)
            ? value
            : value.toLowerCase()
    );

export const loginSchema = z
    .object({
        identifier: identifierSchema,

        password: z
            .string()
            .min(1, "Password is required")
            .max(72, "Password cannot exceed 72 characters")
            .refine(
                (value) => Buffer.byteLength(value, "utf8") <= 72,
                "Password cannot exceed 72 UTF-8 bytes"
            ),
    })
    .strict();

export type LoginInput = z.infer<typeof loginSchema>;
