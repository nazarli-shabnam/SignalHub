"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AFTER_SIGN_IN = "/dashboard";

export function SignInForm() {
  const { signIn, setActive: setActiveSession, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      let signInAttempt = await signIn.create({ identifier: email.trim() });
      signInAttempt = await signInAttempt.attemptFirstFactor({
        strategy: "password",
        password,
      });
      if (signInAttempt.status === "complete" && signInAttempt.createdSessionId) {
        await setActiveSession({ session: signInAttempt.createdSessionId });
        router.push(AFTER_SIGN_IN);
        return;
      }
      if (signInAttempt.status === "needs_second_factor") {
        setError("Two-factor authentication is required. Use the default Clerk flow for this account.");
        return;
      }
      setError("Sign-in could not be completed. Check your email and password.");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "errors" in err
        ? (err as { errors: Array<{ message?: string }> }).errors?.[0]?.message
        : err instanceof Error
          ? err.message
          : "Something went wrong.";
      setError(typeof msg === "string" ? msg : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    if (!isLoaded || !signIn) return;
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: AFTER_SIGN_IN,
    });
  }

  return (
    <div className="w-full max-w-[400px] flex flex-col items-center">
      <div className="text-center mb-4 shrink-0">
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
        <p className="text-zinc-300 text-sm mt-1">Welcome back to SignalHub.</p>
      </div>

      <div className="w-full shadow-none bg-zinc-900/90 border border-zinc-700 rounded-xl p-5 sm:p-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-zinc-700 border border-zinc-600 hover:bg-zinc-600 text-white rounded-lg font-medium h-11 flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-600" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-zinc-900 px-2 text-zinc-300">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signin-email" className="block text-zinc-200 text-sm font-medium mb-1.5">
              Email address
            </label>
            <Input
              id="signin-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-400 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="signin-password" className="block text-zinc-200 text-sm font-medium mb-1.5">
              Password
            </label>
            <Input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-400 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium h-11"
          >
            {loading ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <p className="text-zinc-300 text-sm text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>

      <p className="text-zinc-400 text-xs mt-4 text-center">
        Secured by Clerk
      </p>
    </div>
  );
}
