import {
  Bookmark,
  Compass,
  Home,
  type LucideIcon,
  Search,
  User,
} from "lucide-react";

/** Bottom navigation tabs, in RTL reading order (right → left). */
export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/search", label: "البحث", icon: Search },
  { to: "/favorites", label: "المفضلة", icon: Bookmark },
  { to: "/profile", label: "حسابي", icon: User },
];

/** Catalogue categories used by filters and admin forms. */
export const CATEGORIES: string[] = [
  "دراما رومانسية",
  "دراما عائلية",
  "إثارة وتشويق",
  "كوميديا",
  "تاريخي",
  "جريمة",
  "خيال علمي",
  "دراما اجتماعية",
];

/** Human labels for the two catalogue kinds. */
export const KIND_LABELS: Record<string, string> = {
  drama: "مسلسل قصير",
  movie: "فيلم قصير",
};

/** App identity. */
export const APP_NAME = "drama fan";
export const APP_TAGLINE = "دراما قصيرة وأفلام قصيرة";

/** localStorage key for the persisted theme preference. */
export const THEME_STORAGE_KEY = "dramafan-theme";

/** Fallback poster used when a title has no cover image. */
export const FALLBACK_COVER = "/assets/images/placeholder.svg";

/** Route paths, kept in one place so links and navigation stay in sync. */
export const ROUTES = {
  home: "/",
  search: "/search",
  favorites: "/favorites",
  profile: "/profile",
  title: "/title/$id",
  watch: "/watch/$titleId/$episodeId",
  admin: "/admin",
} as const;
