import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Epochs Lead — AI Voice Agent",
  description:
    "Vision 2030 investment lead generation powered by AI voice technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
