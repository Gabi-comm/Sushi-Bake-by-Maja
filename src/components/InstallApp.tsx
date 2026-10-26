"use client";

import { useState } from "react";
import { promptInstall, useInstallState } from "@/lib/pwa";

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" className="inline size-5 align-[-4px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M10 13V2M6 6l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9H4v9h12V9h-1" strokeLinecap="round" />
    </svg>
  );
}

/** "Install the app": Chrome/Android gets the native sheet, iPhone gets Add-to-Home-Screen steps. */
export default function InstallApp({ className = "" }: { className?: string }) {
  const state = useInstallState();
  const [help, setHelp] = useState(false);
  if (state === "installed") return null;

  const onClick = async () => {
    if (!(await promptInstall())) setHelp(true);
  };

  return (
    <>
      <button type="button" onClick={onClick} className={className}>
        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="5" y="1.5" width="10" height="17" rx="2.5" />
          <path d="M10 6v6M7.5 9.5 10 12l2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Install the app
      </button>

      {help && (
        <div role="dialog" aria-modal="true" aria-labelledby="install-title" className="fixed inset-0 z-[90] grid items-end bg-black/50 p-3 backdrop-blur-sm sm:place-items-center" onClick={() => setHelp(false)}>
          <div className="w-full max-w-sm rounded-[1.8rem] bg-paper p-6 text-ink shadow-2xl [animation:fadeUp_.4s_both]" onClick={(e) => e.stopPropagation()}>
            <p id="install-title" className="display text-3xl">
              Sushi Bake on your <span className="italic">home screen</span>
            </p>
            {state === "ios" ? (
              <ol className="mt-4 space-y-3 text-[0.95rem]">
                <li>
                  1. Tap <ShareIcon /> <b>Share</b> in Safari&apos;s toolbar.
                </li>
                <li>
                  2. Choose <b>Add to Home Screen</b>.
                </li>
                <li>
                  3. Tap <b>Add</b>. The tray icon appears with your apps.
                </li>
              </ol>
            ) : (
              <p className="mt-4 text-[0.95rem]">
                Open your browser menu <b>⋮</b> and choose <b>Install app</b> or <b>Add to Home screen</b>.
              </p>
            )}
            <button type="button" onClick={() => setHelp(false)} className="btn mt-6 w-full justify-center bg-ink text-paper">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
