import { NAV_ITEMS } from "@/lib/constants";
import { Link } from "@tanstack/react-router";

/** Fixed bottom navigation with the four primary RTL tabs. */
export function BottomNav() {
  return (
    <nav
      aria-label="التنقل الرئيسي"
      data-ocid="bottom_nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[oklch(var(--nav-bar-border))] bg-[oklch(var(--nav-bar))] shadow-nav"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                data-ocid={`nav.${item.to === "/" ? "home" : item.to.slice(1)}.tab`}
                className="group flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                activeProps={{
                  className: "text-[oklch(var(--nav-active))]",
                }}
                inactiveProps={{
                  className:
                    "text-[oklch(var(--nav-inactive))] hover:text-foreground",
                }}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
