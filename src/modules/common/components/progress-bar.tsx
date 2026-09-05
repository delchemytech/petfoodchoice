"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProgressBar
        height="4px"
        color="#2563eb"
        options={{ showSpinner: false }}
        shallowRouting
      />
      {children}
    </>
  );
}
