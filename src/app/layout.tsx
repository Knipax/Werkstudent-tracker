import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Werkstudent Tracker",
  description: "Track your Werkstudent job applications",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
