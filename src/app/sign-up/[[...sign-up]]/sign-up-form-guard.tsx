"use client";

import { useEffect, useRef } from "react";

/**
 * When Clerk shows a password (or other) validation error, disable the Continue
 * button so the user can't click repeatedly and get stuck in a loop. Re-enable
 * when the user edits the password field so they can submit again after fixing.
 */
export function SignUpFormGuard({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const form = () => container.querySelector("form");
    const submitBtn = () => container.querySelector(".cl-formButtonPrimary");
    const hasError = () => container.querySelector(".cl-formFieldError");
    const passwordInput = () =>
      container.querySelector('input[type="password"]') as HTMLInputElement | null;

    function updateButton() {
      const btn = submitBtn();
      if (!btn) return;
      const error = hasError();
      if (error) {
        btn.setAttribute("disabled", "");
        btn.setAttribute("aria-disabled", "true");
        (btn as HTMLButtonElement).style.pointerEvents = "none";
        (btn as HTMLButtonElement).style.opacity = "0.7";
      } else {
        btn.removeAttribute("disabled");
        btn.removeAttribute("aria-disabled");
        (btn as HTMLButtonElement).style.pointerEvents = "";
        (btn as HTMLButtonElement).style.opacity = "";
      }
    }

    const observer = new MutationObserver(() => {
      updateButton();
      const pw = passwordInput();
      if (pw && !pw.dataset.guardListening) {
        pw.dataset.guardListening = "1";
        pw.addEventListener("input", updateButton);
        pw.addEventListener("change", updateButton);
      }
    });

    let tick: ReturnType<typeof setInterval>;
    function attach() {
      const f = form();
      if (f) {
        observer.disconnect();
        observer.observe(container as Node, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["class", "data-state"],
        });
        updateButton();
        clearInterval(tick);
        return true;
      }
      return false;
    }

    if (!attach()) tick = setInterval(attach, 400);

    return () => {
      clearInterval(tick);
      observer.disconnect();
      const pw = passwordInput();
      if (pw) {
        pw.removeEventListener("input", updateButton);
        pw.removeEventListener("change", updateButton);
        delete pw.dataset.guardListening;
      }
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
