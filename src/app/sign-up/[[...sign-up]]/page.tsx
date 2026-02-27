import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { SignUpFormGuard } from "./sign-up-form-guard";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-zinc-400 hover:text-zinc-100 text-sm transition-colors z-10"
      >
        ← Back
      </Link>

      <SignUpFormGuard>
        <div className="flex flex-col items-center px-4 pt-14 pb-12 sm:pt-16 sm:pb-16">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-semibold text-zinc-100">
              Create your account
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Use at least 8 characters for your password.
            </p>
          </div>

          <div className="w-full max-w-[400px]">
            <SignUp
              appearance={{
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                  showOptionalFields: true,
                },
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none bg-zinc-900/90 border border-zinc-700 rounded-xl p-5 sm:p-6 w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "w-full bg-zinc-700 border border-zinc-600 hover:bg-zinc-600 text-white rounded-lg font-medium h-11",
                  dividerLine: "bg-zinc-600",
                  dividerText: "text-zinc-400 text-xs",
                  formFieldLabel: "text-zinc-300 text-sm",
                  formFieldInput:
                    "bg-zinc-800 border-zinc-600 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
                  formFieldInputShowPasswordButton: "text-zinc-400 hover:text-zinc-100",
                  formFieldErrorText: "text-red-400 text-sm",
                  formButtonPrimary:
                    "w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium h-11",
                  footer: "text-zinc-400",
                  footerAction: "text-zinc-300",
                  footerActionLink: "text-emerald-400 hover:text-emerald-300 font-medium",
                  identityPreviewEditButton: "text-emerald-400",
                },
                variables: {
                  colorPrimary: "#059669",
                  colorBackground: "#18181b",
                  colorInputBackground: "#27272a",
                  colorInputText: "#fafafa",
<<<<<<< HEAD
                  colorText: "#e4e4e7",
                  colorTextSecondary: "#a1a1aa",
                  colorSuccess: "#4ade80",
                  colorWarning: "#fbbf24",
                  colorDanger: "#f87171",
=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
                  borderRadius: "0.5rem",
                },
              }}
              afterSignUpUrl="/dashboard"
            />
          </div>
        </div>
      </SignUpFormGuard>
    </div>
  );
}
