
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mandipro | Fresh Produce Wholesale",
    template: "%s | Mandipro",
  },
  description:
    "A wholesale marketplace for fresh vegetables and produce, connecting suppliers with restaurants, hotels, caterers, and food businesses.",
};

const themeInitializationScript = `
(function () {
  try {
    var saved = localStorage.getItem("mandipro-theme");
    var preference =
      saved === "light" || saved === "dark" || saved === "system"
        ? saved
        : "system";

    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved =
      preference === "system" ? (dark ? "dark" : "light") : preference;

    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="mandipro-theme-initialization"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: themeInitializationScript,
          }}
        />
      </head>

      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
