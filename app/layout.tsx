import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Epochs Optometry — AI Front Desk",
  description:
    "Voice AI front desk for optometry clinics: appointment reminders, booking, and insurance coverage checks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
