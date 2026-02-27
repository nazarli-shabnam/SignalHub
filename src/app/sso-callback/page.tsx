import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-950">
      <AuthenticateWithRedirectCallback signInForceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard" />
      <p className="text-zinc-500 text-sm">Completing sign-in…</p>
=======
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <AuthenticateWithRedirectCallback signInForceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard" />
      <p className="absolute bottom-8 text-zinc-500 text-sm">Completing sign-in…</p>
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
    </div>
  );
}
