import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-zinc-950 flex flex-col">
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-zinc-400 hover:text-zinc-100 text-sm transition-colors z-10"
      >
        ← Back
      </Link>
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-[400px] flex flex-col items-center h-full max-h-full overflow-hidden">
          <div className="text-center mb-3 shrink-0">
            <h1 className="text-2xl font-semibold text-zinc-100">Sign in</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Welcome back to SignalHub.
            </p>
          </div>
          <div className="w-full min-h-0 overflow-y-auto [scrollbar-gutter:stable] rounded-xl">
            <SignIn
              appearance={{
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none bg-zinc-900/90 border border-zinc-700 rounded-xl p-5 sm:p-6 w-full shrink-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "w-full bg-zinc-700 border border-zinc-600 hover:bg-zinc-600 text-white rounded-lg font-medium h-11",
                  dividerLine: "bg-zinc-600",
                  dividerText: "text-zinc-400 text-xs",
                  formFieldLabel: "text-zinc-300 text-sm",
                  formFieldInput:
                    "bg-zinc-800 border-zinc-600 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
                  formButtonPrimary:
                    "w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium h-11",
                  footer: "text-zinc-400",
                  footerAction: "text-zinc-300",
                  footerActionLink: "text-emerald-400 hover:text-emerald-300 font-medium",
                },
                variables: {
                  colorPrimary: "#059669",
                  colorBackground: "#18181b",
                  colorInputBackground: "#27272a",
                  colorInputText: "#fafafa",
                  borderRadius: "0.5rem",
                },
              }}
              afterSignInUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
