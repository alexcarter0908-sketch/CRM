import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM",
  description: "Simple CRM for contacts, pipeline and follow-ups",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
