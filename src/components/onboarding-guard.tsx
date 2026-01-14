"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface OnboardingGuardProps {
    children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isSignedIn, isLoaded } = useAuth();
    const [isChecking, setIsChecking] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkOnboarding() {
            // Skip check if not signed in, on onboarding page, or on auth pages
            if (!isLoaded) return;

            if (!isSignedIn) {
                setIsChecking(false);
                return;
            }

            if (pathname?.startsWith("/onboarding") || pathname?.startsWith("/sign-")) {
                setIsChecking(false);
                return;
            }

            try {
                const response = await fetch("/api/onboarding-status");
                if (response.ok) {
                    const data = await response.json();
                    setOnboardingComplete(data.onboardingComplete);

                    if (!data.onboardingComplete) {
                        router.push("/onboarding");
                        return;
                    }
                }
            } catch (error) {
                console.error("Error checking onboarding status:", error);
            } finally {
                setIsChecking(false);
            }
        }

        checkOnboarding();
    }, [isSignedIn, isLoaded, pathname, router]);

    // Show loading state while checking
    if (isChecking && isSignedIn) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f3f2f2]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0176d3] border-r-transparent"></div>
                    <p className="mt-4 text-[#706e6b]">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
