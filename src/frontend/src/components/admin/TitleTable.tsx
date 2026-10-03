import type { TitleView } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KIND_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

interface TitleTableProps {
  titles: TitleView[];
  onEdit: (title: TitleView) => void;
  onDelete: (title: TitleView) => void;
  onManageEpisodes: (title: TitleView) => void;
}

/**
 * Admin list of every title, including unpublished ones, with edit, delete,
 * and episode-management actions.
 */
export function TitleTable({
  titles,
  onEdit,
  onDelete,
  onManageEpisodes,
}: TitleTableProps) {
  return (
    <ul className="space-y-3" data-ocid="admin.title_list">
      {titles.map((title, index) => (
        <li
          key={title.id}
          data-ocid={`admin.title_row.${index + 1}`}
          className="flex gap-3 rounded-xl border border-border bg-card p-3"
        >
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            {title.coverImage ? (
              <img
                src={title.coverImage}
                alt=""
                className="size-full object-cover"
                loading="lazy"
              />
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 truncate font-display text-sm font-bold text-foreground">
                {title.title}
              </h3>
              <Badge
                variant={title.published ? "secondary" : "outline"}
                className={cn(
                  "shrink-0 gap-1",
                  !title.published && "text-muted-foreground",
                )}
              >
                {title.published ? (
                  <Eye className="size-3" aria-hidden="true" />
                ) : (
                  <EyeOff className="size-3" aria-hidden="true" />
                )}
                {title.published ? "منشور" : "مسودة"}
              </Badge>
            </div>

            <p className="mt-1 truncate text-xs text-muted-foreground">
              {KIND_LABELS[title.kind] ?? title.kind} · {title.category} ·{" "}
              {Number(title.releaseYear)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {Number(title.episodeCount)} حلقة
            </p>

            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid={`admin.episodes_button.${index + 1}`}
                onClick={() => onManageEpisodes(title)}
              >
                الحلقات
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid={`admin.edit_button.${index + 1}`}
                onClick={() => onEdit(title)}
              >
                <Pencil className="size-4" aria-hidden="true" />
                تعديل
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid={`admin.delete_button.${index + 1}`}
                onClick={() => onDelete(title)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                حذف
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
