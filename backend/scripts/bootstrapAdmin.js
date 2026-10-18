import "dotenv/config";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
const ask = (question) => {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
};
const askPassword = () => {
    return new Promise((resolve, reject) => {
        const input = process.stdin;
        if (!input.isTTY || typeof input.setRawMode !== "function") {
            reject(new Error("Password input requires an interactive terminal."));
            return;
        }
        process.stdout.write("Admin password (minimum 12 characters): ");
        input.setEncoding("utf8");
        input.setRawMode(true);
        input.resume();
        let password = "";
        const cleanup = () => {
            input.removeListener("data", onData);
            input.setRawMode(false);
            input.pause();
            process.stdout.write("\n");
        };
        const onData = (key) => {
            if (key === "\u0003") {
                cleanup();
                reject(new Error("Admin setup cancelled."));
                return;
            }
            if (key === "\r" || key === "\n") {
                cleanup();
                resolve(password);
                return;
            }
            if (key === "\u007f" || key === "\b") {
                password = password.slice(0, -1);
                return;
            }
            if (key >= " " && key !== "\u007f") {
                password += key;
                process.stdout.write("*");
            }
        };
        input.on("data", onData);
    });
};
const bootstrapAdmin = async () => {
    const name = await ask("Admin name: ");
    const email = (await ask("Admin email: ")).toLowerCase();
    const phone = await ask("Admin phone number: ");
    const password = await askPassword();
    if (name.length < 2 || name.length > 100) {
        throw new Error("Name must contain 2–100 characters.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Enter a valid email address.");
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
        throw new Error("Enter a valid 10-digit Indian mobile number.");
    }
    if (password.length < 12 ||
        Buffer.byteLength(password, "utf8") > 72) {
        throw new Error("Password must be at least 12 characters and no more than 72 UTF-8 bytes.");
    }
    await connectDB();
    const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
    }).select("+passwordHash");
    if (existingUser) {
        throw new Error("An account already uses this email or phone. No account was changed.");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await User.create({
        name,
        email,
        phone,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: false,
    });
    console.log("\nAdmin account created successfully.");
    console.log(`Admin ID: ${admin.id}`);
    console.log(`Admin email: ${admin.email}`);
    console.log("Role: ADMIN");
    console.log("Status: ACTIVE");
};
try {
    await bootstrapAdmin();
}
catch (error) {
    console.error("\nAdmin setup failed:", error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
}
finally {
    await mongoose.disconnect().catch(() => undefined);
}
