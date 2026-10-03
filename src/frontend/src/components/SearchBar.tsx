import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  /** Committed search term (from the URL). */
  value: string;
  /** Called with the debounced term as the user types. */
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DEBOUNCE_MS = 250;

/**
 * Debounced search input. Keeps a local draft so typing stays instant while
 * the committed term (and the URL) updates after a short pause.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "ابحث عن عمل أو وصف…",
  className,
}: SearchBarProps) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync the draft when the committed term changes from outside (e.g. a
  // shared link or a reset action), but never while the user is typing.
  useEffect(() => {
    setDraft((current) => (current === value ? current : value));
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => onChange(draft), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, value, onChange]);

  const clear = () => {
    setDraft("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label="البحث في الأعمال"
        data-ocid="search.input"
        className="h-12 w-full rounded-2xl border border-input bg-card pr-11 pl-11 text-sm text-foreground shadow-subtle outline-none transition-smooth placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft.length > 0 ? (
        <button
          type="button"
          onClick={clear}
          aria-label="مسح البحث"
          data-ocid="search.clear_button"
          className="absolute left-2.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
