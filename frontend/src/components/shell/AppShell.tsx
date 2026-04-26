"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ServiceStatusBar } from "@/components/system/ServiceStatusBar";

const navItems = [
  { href: "/chat", label: "Chat (Triage)" },
  { href: "/planner", label: "Mission Planner" },
  { href: "/map", label: "Map" },
] as const;

function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-600 dark:focus-visible:ring-offset-zinc-950",
              active
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="text-base font-semibold leading-tight">
                CareCompass
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Capability matching, policy analytics, and desert mapping
              </div>
            </div>
            <div className="md:hidden">
              <Nav />
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:gap-4">
            <Nav />
            <div className="w-[360px]">
              <ServiceStatusBar />
            </div>
          </div>
          <div className="md:hidden">
            <ServiceStatusBar />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-zinc-200 py-4 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <div className="mx-auto flex w-full max-w-7xl justify-between px-4">
          <span>
            Frontend calls FastAPI only; no Databricks tokens in browser.
          </span>
          <a
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-200"
            href={`${process.env.NEXT_PUBLIC_CARECOMPASS_API_URL || "http://127.0.0.1:8000"}/openapi.json`}
            target="_blank"
            rel="noreferrer"
          >
            API schema
          </a>
        </div>
      </footer>
    </div>
  );
}

