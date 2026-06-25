import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./Sidebar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
import ThemeProvider from "./ThemeProvider";
import ChatDrawer from "./components/ChatDrawer";
import AppShell from "./components/AppShell";
import SplashScreen from "./components/SplashScreen";
import { AuthProvider } from "./context/AuthContext";
import OnboardingModal from "./components/OnboardingModal";
import { ToastProvider } from "./components/ui/Toast";
import ConnectionBanner from "./components/ConnectionBanner";
import KeyboardShortcuts from "./components/KeyboardShortcuts";

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
    <html lang="en" className={inter.variable}>
      <body
        className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {/* Splash screen — shown once per browser session */}
              <SplashScreen />
              {/* Onboarding tour — shown once for new users */}
              <OnboardingModal />
              {/* AppShell: activates background hooks (saved search monitor, etc.) */}
              <AppShell />
              <ConnectionBanner />
              <Sidebar />
              <main className="flex-1 min-h-screen overflow-y-auto pt-14 md:pt-0" suppressHydrationWarning>
                {children}
              </main>
              <ChatDrawer />
              <KeyboardShortcuts />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
