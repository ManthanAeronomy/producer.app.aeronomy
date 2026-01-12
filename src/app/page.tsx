"use client";

import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <>
      {/* Redirect authenticated users to dashboard */}
      <SignedIn>
        <RedirectToDashboard />
      </SignedIn>

      {/* Show landing page with auth for guests */}
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-[#16325c] via-[#1e4a7a] to-[#0176d3]">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white">Aero</span>
                <span className="text-[#7dd3fc]">nomy</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                About
              </a>
              <a href="/marketplace" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                Marketplace
              </a>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex flex-col lg:flex-row items-center justify-center gap-12 px-8 py-12 lg:py-20">
            {/* Left Side - Hero Content */}
            <div className="flex-1 max-w-xl text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Sustainable Aviation Fuel
                <span className="block text-[#7dd3fc]">Procurement Platform</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Streamline your SAF procurement with our comprehensive dashboard.
                Manage bids, track deliveries, ensure compliance, and connect with
                verified producers and buyers.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/70">
                  <svg className="w-5 h-5 text-[#7dd3fc]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Real-time Bidding</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <svg className="w-5 h-5 text-[#7dd3fc]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Compliance Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <svg className="w-5 h-5 text-[#7dd3fc]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Secure Contracts</span>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Card */}
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                {/* Auth Toggle */}
                <div className="flex bg-[#f3f2f2] rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setShowSignUp(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!showSignUp
                      ? "bg-white text-[#16325c] shadow-sm"
                      : "text-[#706e6b] hover:text-[#181818]"
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowSignUp(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${showSignUp
                      ? "bg-white text-[#16325c] shadow-sm"
                      : "text-[#706e6b] hover:text-[#181818]"
                      }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Clerk Components */}
                <div className="flex justify-center">
                  {showSignUp ? (
                    <SignUp
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "shadow-none p-0 w-full",
                          headerTitle: "text-[#181818]",
                          headerSubtitle: "text-[#706e6b]",
                          formButtonPrimary: "bg-[#0176d3] hover:bg-[#015bb5]",
                          footer: "hidden",
                        },
                      }}
                      routing="hash"
                      afterSignUpUrl="/dashboard"
                    />
                  ) : (
                    <SignIn
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "shadow-none p-0 w-full",
                          headerTitle: "text-[#181818]",
                          headerSubtitle: "text-[#706e6b]",
                          formButtonPrimary: "bg-[#0176d3] hover:bg-[#015bb5]",
                          footer: "hidden",
                        },
                      }}
                      routing="hash"
                      afterSignInUrl="/dashboard"
                    />
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="px-8 py-6 text-center text-white/50 text-sm">
            © 2026 Aeronomy. All rights reserved.
          </footer>
        </div>
      </SignedOut>
    </>
  );
}

// Helper component to redirect authenticated users
function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f2f2]">
      <div className="text-[#706e6b]">Redirecting to dashboard...</div>
    </div>
  );
}
