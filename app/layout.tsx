import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "॥ बस एक और बाज़ी ॥ — Shakuni's Table",
  description: "Bas Ek Aur Baazi — Kurukshetra CTF AI Challenge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f0c] text-[#efe6cf] antialiased">
        {children}
      </body>
    </html>
  );
}
