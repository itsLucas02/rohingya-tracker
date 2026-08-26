import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col items-center justify-center gap-4 p-8 text-center antialiased">
        <h1 className="text-4xl font-semibold tracking-tight">404</h1>
        <p className="text-text-secondary">This page could not be found.</p>
        <a href="/" className="text-sm underline underline-offset-4">
          Go home
        </a>
      </body>
    </html>
  );
}
