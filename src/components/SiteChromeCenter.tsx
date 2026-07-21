"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

type SiteChromeCenterContextValue = {
  setCenter: (center: ReactNode) => void;
};

export const SiteChromeCenterContext =
  createContext<SiteChromeCenterContextValue | null>(null);

export function useSiteChromeCenter() {
  const ctx = useContext(SiteChromeCenterContext);
  if (!ctx) {
    throw new Error(
      "useSiteChromeCenter must be used within SiteChromeProvider",
    );
  }
  return ctx;
}

export function SiteChromeCenter({ children }: { children: ReactNode }) {
  const { setCenter } = useSiteChromeCenter();

  useEffect(() => {
    setCenter(children);
    return () => setCenter(null);
  }, [children, setCenter]);

  return null;
}
