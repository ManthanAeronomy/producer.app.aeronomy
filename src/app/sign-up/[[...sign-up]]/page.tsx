import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#16325c] via-[#1e4a7a] to-[#0176d3] flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="text-3xl font-bold tracking-tight">
                            <span className="text-white">Aero</span>
                            <span className="text-[#7dd3fc]">nomy</span>
                        </span>
                    </Link>
                    <p className="text-white/70 mt-2">Create your account</p>
                </div>

                {/* Sign Up Component */}
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "shadow-2xl border border-[#e5e5e5] rounded-2xl",
                            headerTitle: "text-[#181818]",
                            headerSubtitle: "text-[#706e6b]",
                            formButtonPrimary: "bg-[#0176d3] hover:bg-[#015bb5]",
                            footer: "hidden",
                        },
                    }}
                    afterSignUpUrl="/dashboard"
                />

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
