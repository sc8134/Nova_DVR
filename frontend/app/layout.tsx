import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "./Sidebar";
import ThemeProvider from "./ThemeProvider";
import ChatDrawer from "./components/ChatDrawer";
import AppShell from "./components/AppShell";
import SplashScreen from "./components/SplashScreen";
import { AuthProvider } from "./context/AuthContext";
import OnboardingModal from "./components/OnboardingModal";

export const metadata: Metadata = {
  title: "Nova DVR",
  description: "Professional multi-platform media downloader",
  icons: {
    icon: "/nova_logo.png",
    apple: "/nova_logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
          {/* Splash screen — shown once per browser session */}
          <SplashScreen />
          {/* Onboarding tour — shown once for new users */}
          <OnboardingModal />
          {/* AppShell: activates background hooks (saved search monitor, etc.) */}
          <AppShell />
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-y-auto pt-14 md:pt-0" suppressHydrationWarning>
            {children}
          </main>
          <ChatDrawer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
