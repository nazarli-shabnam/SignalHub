import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <Link
        href="/"
        className="absolute top-6 left-6 text-zinc-400 hover:text-zinc-100 text-sm"
      >
        ← Back
      </Link>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none bg-zinc-900 border border-zinc-800",
          },
          variables: {
            colorPrimary: "#059669",
            colorBackground: "#18181b",
            colorInputBackground: "#27272a",
            colorInputText: "#fafafa",
            borderRadius: "0.5rem",
          },
        }}
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
