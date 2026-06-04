import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./Sidebar";
import ThemeProvider from "./ThemeProvider";
import ChatDrawer from "./components/ChatDrawer";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "Nova DVR",
  description: "Professional multi-platform media downloader",
  icons: {
    icon: "/nova_logo.png",
    apple: "/nova_logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* AppShell: activates background hooks (saved search monitor, etc.) */}
          <AppShell />
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-y-auto">
            {children}
          </main>
          <ChatDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
