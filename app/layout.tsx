import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "LAB2PUB",
  description: "From laboratory data to publication.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
