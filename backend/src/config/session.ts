
import session from "express-session";
import MongoStore from "connect-mongo";

const sessionSecret = process.env.SESSION_SECRET;
const mongoUri = process.env.MONGODB_URI;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET must be configured with a strong secret"
  );
}

if (!mongoUri) {
  throw new Error("MONGODB_URI is not configured");
}

const isProduction = process.env.NODE_ENV === "production";

const maxAge = Number(
  process.env.SESSION_MAX_AGE_MS ?? 604800000
);

if (!Number.isSafeInteger(maxAge) || maxAge <= 0) {
  throw new Error("SESSION_MAX_AGE_MS must be a positive integer");
}

export const sessionMiddleware = session({
  name: process.env.SESSION_COOKIE_NAME ?? "mandipro.sid",
  secret: sessionSecret,

  store: MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: "sessions",
    ttl: Math.floor(maxAge / 1000),
  }),

  resave: false,
  saveUninitialized: false,
  rolling: false,

  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge,
    path: "/",
  },
});
