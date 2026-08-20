"use client";

import { useEffect, useState } from "react";
import BlackHoleHeroSection from "./BlackHoleHeroSection";

/** True while the viewport is narrow. Drives the layout swap below. */
function useNarrow(query = "(max-width: 767px)") {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, [query]);
  return narrow;
}

/** True once we know the user is logged in. Starts false until the check resolves. */
function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLoggedIn(data.loggedIn);
      })
      .catch(() => {
        if (!cancelled) setLoggedIn(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return loggedIn;
}

/**
 * A hero built around the picture rather than laid on top of it.
 *
 * The hole is pushed off centre with `focus`, so the busy half and the reading
 * half never overlap, and `scrim` darkens only the edge the copy sits on. A
 * flat overlay could not do that without greying the halo as well.
 *
 * A phone has no room to stand the two side by side, so there the whole thing
 * turns through 90°: hole low, copy high, veil from the top — and the ray
 * count drops, because a phone pays for every step.
 */
export default function BlackHoleHeroSectionDemo() {
  const narrow = useNarrow();
  const loggedIn = useAuth();

  return (
    <section className="relative h-screen w-screen overflow-hidden">
      <BlackHoleHeroSection
        focus={narrow ? [0.5, 0.76] : [0.72, 0.46]}
        scrim={narrow ? "top" : "left"}
        scrimStrength={0.9}
        distance={24}
        elevation={narrow ? -7 : -5.5}
        fov={narrow ? 58 : 42}
        glow={narrow ? 0.85 : 1}
        steps={narrow ? 200 : 300}
        resolution={narrow ? 0.6 : 0.7}
      >
        <div className="flex h-full w-full items-start px-6 pt-14 sm:px-10 md:items-center md:pt-0 lg:px-20">
          <div className="max-w-[34rem]">
            <h1 className="text-[2.5rem] font-light leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]">
              Your identity
              <br />
              stays yours
            </h1>

            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-white/60 md:mt-7">
              One account, secured end to end. Sign in once and every session
              after it is verified, encrypted, and yours alone.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
              <a
                href={loggedIn ? "/dashboard" : "/sign-in"}
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                {loggedIn ? "Open app" : "Get started"}
              </a>
              <a
                href="#"
                className="rounded-full border border-white/20 px-6 py-3 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Read the maths
              </a>
            </div>
          </div>
        </div>
      </BlackHoleHeroSection>
    </section>
  );
}