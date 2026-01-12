"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function AccountMenu() {
  return (
    <>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
              userButtonPopoverCard: "shadow-xl border border-[#e5e5e5]",
            },
          }}
          afterSignOutUrl="/sign-in"
        />
      </SignedIn>
      <SignedOut>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#706e6b] transition-colors hover:bg-[#f3f2f2] hover:text-[#181818]"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#015bb5]"
          >
            Sign Up
          </Link>
        </div>
      </SignedOut>
    </>
  );
}
