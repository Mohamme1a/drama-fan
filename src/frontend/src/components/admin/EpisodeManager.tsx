import { createActor } from "@/backend";
import type { EpisodeView, TitleView } from "@/backend";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  EpisodeForm,
  type EpisodeFormValues,
} from "@/components/admin/EpisodeForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EpisodeManagerProps {
  title: TitleView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/**
 * Per-title episode manager: lists episodes and opens a form dialog to add or
 * edit one, with a confirmation before deletion.
 */
export function EpisodeManager({
  title,
  open,
  onOpenChange,
}: EpisodeManagerProps) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const episodesQuery = useQuery({
    queryKey: ["adminEpisodes", title.id.toString()],
    queryFn: async (): Promise<EpisodeView[]> => {
      if (!actor) return [];
      const episodes = await actor.listEpisodes(title.id);
      return [...episodes].sort((a, b) => Number(a.number - b.number));
    },
    enabled: !!actor && !isFetching,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EpisodeView | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EpisodeView | null>(null);

  const createMutation = useMutation({
    mutationFn: async (values: EpisodeFormValues) => {
      if (!actor) throw new Error("الخادم غير جاهز");
      return actor.adminCreateEpisode({
        titleId: title.id,
        title: values.title,
        number: BigInt(values.number),
        durationSeconds: BigInt(values.durationSeconds),
        videoSource: values.videoSource,
      });
    },
    onSuccess: () => {
      toast.success("تمت إضافة الحلقة.");
      setFormOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ["adminEpisodes", title.id.toString()],
      });
      void queryClient.invalidateQueries({ queryKey: ["adminTitles"] });
    },
    onError: () => toast.error("تعذّرت إضافة الحلقة."),
  });

  const updateMutation = useMutation({
    mutationFn: async (values: EpisodeFormValues) => {
      if (!actor || !editing) throw new Error("الخادم غير جاهز");
      return actor.adminUpdateEpisode(editing.id, {
        titleId: title.id,
        title: values.title,
        number: BigInt(values.number),
        durationSeconds: BigInt(values.durationSeconds),
        videoSource: values.videoSource,
      });
    },
    onSuccess: (result) => {
      if (result.__kind__ === "err") {
        toast.error("تعذّر تحديث الحلقة.");
        return;
      }
      toast.success("تم تحديث الحلقة.");
      setFormOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({
        queryKey: ["adminEpisodes", title.id.toString()],
      });
    },
    onError: () => toast.error("تعذّر تحديث الحلقة."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (episode: EpisodeView) => {
      if (!actor) throw new Error("الخادم غير جاهز");
      return actor.adminDeleteEpisode(episode.id);
    },
    onSuccess: (result) => {
      if (result.__kind__ === "err") {
        toast.error("تعذّر حذف الحلقة.");
        return;
      }
      toast.success("تم حذف الحلقة.");
      setPendingDelete(null);
      void queryClient.invalidateQueries({
        queryKey: ["adminEpisodes", title.id.toString()],
      });
      void queryClient.invalidateQueries({ queryKey: ["adminTitles"] });
    },
    onError: () => toast.error("تعذّر حذف الحلقة."),
  });

  const episodes = episodesQuery.data ?? [];

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(episode: EpisodeView) {
    setEditing(episode);
    setFormOpen(true);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[85dvh] overflow-y-auto sm:max-w-lg"
          data-ocid="admin.episode_manager_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              حلقات «{title.title}»
            </DialogTitle>
            <DialogDescription>
              أضف الحلقات وعدّلها أو احذفها. تظهر الحلقات مرتبة حسب الرقم.
            </DialogDescription>
          </DialogHeader>

          <Button
            type="button"
            data-ocid="admin.add_episode_button"
            onClick={openCreate}
            className="w-full"
          >
            <Plus className="size-4" aria-hidden="true" />
            إضافة حلقة
          </Button>

          {episodesQuery.isLoading ? (
            <div className="space-y-2" data-ocid="admin.episodes_loading">
              {Array.from({ length: 3 }, (_, i) => `ep-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-16 w-full rounded-lg" />
                ),
              )}
            </div>
          ) : episodes.length === 0 ? (
            <p
              className="py-8 text-center text-sm text-muted-foreground"
              data-ocid="admin.episodes_empty_state"
            >
              لا توجد حلقات بعد. ابدأ بإضافة أول حلقة.
            </p>
          ) : (
            <ul className="space-y-2" data-ocid="admin.episode_list">
              {episodes.map((episode, index) => (
                <li
                  key={episode.id}
                  data-ocid={`admin.episode_row.${index + 1}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-foreground">
                    {Number(episode.number)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {episode.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(Number(episode.durationSeconds))}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`تعديل الحلقة ${Number(episode.number)}`}
                    data-ocid={`admin.episode_edit_button.${index + 1}`}
                    onClick={() => openEdit(episode)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`حذف الحلقة ${Number(episode.number)}`}
                    data-ocid={`admin.episode_delete_button.${index + 1}`}
                    onClick={() => setPendingDelete(episode)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="max-h-[85dvh] overflow-y-auto sm:max-w-lg"
          data-ocid="admin.episode_form_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "تعديل الحلقة" : "حلقة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <EpisodeForm
            key={editing?.id ?? "new"}
            initial={
              editing
                ? {
                    title: editing.title,
                    number: Number(editing.number),
                    durationSeconds: Number(editing.durationSeconds),
                    videoSource: editing.videoSource,
                  }
                : undefined
            }
            submitLabel={editing ? "حفظ التعديلات" : "إضافة الحلقة"}
            pending={createMutation.isPending || updateMutation.isPending}
            onSubmit={(values) => {
              if (editing) updateMutation.mutate(values);
              else createMutation.mutate(values);
            }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف الحلقة"
        description={
          pendingDelete
            ? `سيتم حذف الحلقة «${pendingDelete.title}» نهائياً. لا يمكن التراجع عن هذا الإجراء.`
            : ""
        }
        confirmLabel="حذف"
        destructive
        pending={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete);
        }}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
      />

      {deleteMutation.isPending ? (
        <span className="sr-only" aria-live="polite">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          جارٍ الحذف
        </span>
      ) : null}
    </>
  );
}
