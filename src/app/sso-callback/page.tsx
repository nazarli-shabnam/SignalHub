import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <AuthenticateWithRedirectCallback signInForceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard" />
      <p className="absolute bottom-8 text-zinc-500 text-sm">Completing sign-in…</p>
    </div>
  );
}
