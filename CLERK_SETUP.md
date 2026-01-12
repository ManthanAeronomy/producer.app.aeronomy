# Clerk Environment Variables Setup

Add the following variables to your `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Getting Your Keys

1. Go to [clerk.com/dashboard](https://clerk.com/dashboard)
2. Create or select your application
3. Go to **API Keys** in the sidebar
4. Copy your **Publishable key** and **Secret key**
5. Paste them into your `.env.local` file
