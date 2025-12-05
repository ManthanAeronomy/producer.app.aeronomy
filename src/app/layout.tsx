import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/sidebar-nav";
import { NotificationCenter } from "@/components/notification-center";
import { AccountMenu } from "@/components/account-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aeronomy SAF Dashboard",
  description:
    "Aeronomy dashboard for SAF producers to review airline tenders and submit competitive bids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen flex-col bg-[#f3f2f2] text-[#181818]">
          {/* Top Navbar */}
          <header className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-white shadow-sm">
            <div className="flex h-16 items-center justify-between">
              {/* Logo and Navigation */}
              <div className="flex h-full items-center">
                {/* Logo with Dark Gradient Background */}
                <div className="flex h-full items-center bg-gradient-to-r from-[#16325c] to-[#1e4a7a] px-6">
                  <span className="text-xl font-bold tracking-tight">
                    <span className="text-white">Aero</span>
                    <span className="text-[#0176d3]">nomy</span>
                  </span>
                </div>
                
                {/* Navigation */}
                <nav className="ml-8 flex items-center gap-1">
                  <SidebarNav />
                </nav>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3 px-6">
                <NotificationCenter />
                <div className="h-6 w-px bg-[#e5e5e5]"></div>
                <button className="rounded-lg px-3 py-2 text-sm font-medium text-[#706e6b] transition-colors hover:bg-[#f3f2f2] hover:text-[#181818]">
                  Help
                </button>
                <div className="h-6 w-px bg-[#e5e5e5]"></div>
                <AccountMenu />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-[#f3f2f2]">
            <div className="mx-auto w-full max-w-7xl px-6 py-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
