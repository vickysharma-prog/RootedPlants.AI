import Link from "next/link";

const ITEMS = [
  { href: "/today", label: "Today", icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
  {
    href: "/plants",
    label: "Plants",
    icon: (
      <>
        <path d="M12 20V9" />
        <path d="M12 12C7 12 5 9 5 5c4 0 7 3 7 7z" />
        <path d="M12 14c5-1 7-4 7-8-4 0-7 3-7 8z" />
      </>
    ),
  },
  {
    href: "/rewards",
    label: "Rewards",
    icon: (
      <>
        <rect x="3" y="9" width="18" height="11" rx="2" />
        <path d="M3 13h18M12 9v11" />
        <path d="M12 9c-3 0-5-1-5-3s3-1 5 3c2-4 5-5 5-3s-2 3-5 3z" />
      </>
    ),
  },
  {
    href: "/me",
    label: "Me",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
      </>
    ),
  },
] as const;

/**
 * Four destinations, thumb reachable, and no chrome beyond a hairline. The
 * active one is named in the accent and carries a small marker, so which room
 * you are in is readable without reading.
 */
export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="sticky bottom-0 z-10 flex items-center justify-around border-t border-line-soft bg-bg/85 px-2 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
      {ITEMS.map((item) => {
        const on = item.href === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className="flex w-16 flex-col items-center gap-1.5 py-1"
            style={{ color: on ? "var(--moss)" : "var(--faint)" }}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {item.icon}
            </svg>
            <span className="text-[10.5px] tracking-[0.02em]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
