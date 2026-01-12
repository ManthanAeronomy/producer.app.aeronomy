import { SidebarNav } from "@/components/sidebar-nav";
import { NotificationCenter } from "@/components/notification-center";
import { AccountMenu } from "@/components/account-menu";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col bg-[#f3f2f2] text-[#181818]">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-white shadow-sm">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo and Navigation */}
                    <div className="flex h-full items-center">
                        {/* Logo with Dark Gradient Background */}
                        <a href="/dashboard" className="flex h-full items-center bg-gradient-to-r from-[#16325c] to-[#1e4a7a] px-6">
                            <span className="text-xl font-bold tracking-tight">
                                <span className="text-white">Aero</span>
                                <span className="text-[#0176d3]">nomy</span>
                            </span>
                        </a>

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
    );
}
