"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [companyName, setCompanyName] = useState("");
    const [legalName, setLegalName] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [vatNumber, setVatNumber] = useState("");
    const [address, setAddress] = useState("");
    const [website, setWebsite] = useState("");
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/organization-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName,
                    legalName,
                    registrationNumber,
                    vatNumber,
                    address,
                    website,
                    onboardingComplete: true,
                    primaryContact: {
                        name: contactName,
                        email: contactEmail,
                        phone: contactPhone,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save organization settings");
            }

            // Redirect to dashboard after successful onboarding
            router.push("/dashboard");
        } catch (err) {
            console.error("Onboarding error:", err);
            setError("Failed to save your organization details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#16325c] via-[#1e4a7a] to-[#0176d3] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        <span className="text-white">Aero</span>
                        <span className="text-[#7dd3fc]">nomy</span>
                    </h1>
                    <p className="text-white/70 mt-2">SAF Procurement Platform</p>
                </div>

                {/* Onboarding Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#181818]">
                            Welcome! Let&apos;s set up your organization
                        </h2>
                        <p className="text-[#706e6b] mt-2">
                            Please provide your company details to get started
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-[#ffebee] px-4 py-3 text-sm font-medium text-[#c62828]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-[#181818] mb-4 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0176d3] text-xs text-white">
                                    1
                                </span>
                                Company Information
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                                    Company Name *
                                    <input
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g., GreenSky Bio Fuels"
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                                    Legal Entity Name
                                    <input
                                        value={legalName}
                                        onChange={(e) => setLegalName(e.target.value)}
                                        placeholder="e.g., GreenSky Bio Fuels B.V."
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                                    Registration Number
                                    <input
                                        value={registrationNumber}
                                        onChange={(e) => setRegistrationNumber(e.target.value)}
                                        placeholder="e.g., NL-12345678"
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                                    VAT Number
                                    <input
                                        value={vatNumber}
                                        onChange={(e) => setVatNumber(e.target.value)}
                                        placeholder="e.g., NL123456789B01"
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c] md:col-span-2">
                                    Business Address
                                    <input
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g., Europoort 123, 3198 LG Rotterdam, Netherlands"
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c] md:col-span-2">
                                    Website
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="e.g., https://greensky.bio"
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Primary Contact */}
                        <div>
                            <h3 className="text-sm font-semibold text-[#181818] mb-4 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0176d3] text-xs text-white">
                                    2
                                </span>
                                Primary Contact
                            </h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                                    Name *
                                    <input
                                        required
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                        placeholder="e.g., Jane Doe"
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                                    Email *
                                    <input
                                        required
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="e.g., contact@company.com"
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                                    Phone
                                    <input
                                        type="tel"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder="e.g., +31 10 123 4567"
                                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-lg bg-[#0176d3] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#014486] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Setting up your account..." : "Complete Setup & Continue"}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-white/60 text-sm mt-6">
                    You can update these details later in Settings
                </p>
            </div>
        </div>
    );
}
