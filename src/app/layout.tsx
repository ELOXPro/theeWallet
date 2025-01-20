import "@/styles/globals.css"; // Global styles

import { GeistSans } from "geist/font/sans"; // Custom font
import { type Metadata } from "next"; // Metadata type from Next.js

import { TRPCReactProvider } from "@/trpc/react"; // TRPC provider for API interactions
import { Toaster } from "@/components/ui/sonner"; // Notification system
import Provider from "@/components/Provider"; // Additional providers (e.g., Auth, Theme)

export const metadata: Metadata = {
  title: "TheeWallet", // Application title
  description: "Manage your wallet with ease", // App description for SEO
  icons: [{ rel: "icon", url: "/icon.png" }], // Favicon
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        {/* Provider for TRPC to manage server-client communication */}
        <TRPCReactProvider>
          {/* Global App Providers (e.g., Authentication, Themes) */}
          <Provider>
            {/* Render the page content */}
            {children}
          </Provider>
        </TRPCReactProvider>
        
        {/* Toaster for notifications */}
        <Toaster />
      </body>
    </html>
  );
}
