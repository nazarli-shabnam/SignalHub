import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-zinc-950 flex flex-col">
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-zinc-300 hover:text-white text-sm transition-colors z-10"
      >
        ← Back
      </Link>
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden">
        <SignInForm />
      </div>
    </div>
  );
}
