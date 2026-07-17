"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface SiteLoaderProps {
  autoHide?: boolean;
}

type LoaderPhase = "visible" | "leaving" | "hidden";

export function SiteLoader({ autoHide = true }: SiteLoaderProps) {
  const [phase, setPhase] = useState<LoaderPhase>("visible");

  useEffect(() => {
    if (!autoHide) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const exitTimer = window.setTimeout(() => setPhase("leaving"), reducedMotion ? 60 : 460);
    const hideTimer = window.setTimeout(() => setPhase("hidden"), reducedMotion ? 100 : 680);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [autoHide]);

  if (phase === "hidden") return null;

  return (
    <div
      className={cn("site-loader", phase === "leaving" && "site-loader--leaving")}
      role="status"
      aria-live="polite"
      aria-label="Loading Mutsimoto Motor Company"
    >
      <div className="site-loader__grid" aria-hidden="true" />
      <div className="site-loader__content">
        <div className="site-loader__mark" aria-hidden="true">
          <Image
            src="/images/main-logo.png"
            alt=""
            width={96}
            height={96}
            priority
          />
        </div>
        <p className="site-loader__brand">MUTSIMOTO</p>
        <p className="site-loader__company">MOTOR COMPANY</p>
        <div className="site-loader__progress" aria-hidden="true"><span /></div>
        <p className="site-loader__message">Loading filtration catalogue</p>
        <div className="site-loader__systems" aria-hidden="true">
          <span className="site-loader__oil">Oil</span><i />
          <span className="site-loader__fuel">Fuel</span><i />
          <span className="site-loader__air">Air</span>
        </div>
      </div>
      <span className="sr-only">Loading, please wait.</span>
    </div>
  );
}
