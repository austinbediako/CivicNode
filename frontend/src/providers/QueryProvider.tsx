"use client";

import { type ReactNode } from "react";
import { SWRConfig } from "swr";

export function QueryProvider({ children }: { children: ReactNode }): ReactNode {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 5000,
        revalidateOnFocus: true,
        shouldRetryOnError: true,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
