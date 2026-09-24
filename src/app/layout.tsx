import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Entranced Beauty",
    template: "%s · Entranced Beauty",
  },
  description: "Book nails, makeup and hair with Entranced Beauty in Windhoek.",
  applicationName: "Entranced Beauty",
  appleWebApp: {
    capable: true,
    title: "Entranced Beauty",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFF9F8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
