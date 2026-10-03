import { createActor } from "@/backend";
import { TitleType } from "@/backend";
import type { TitleView } from "@/backend";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EpisodeManager } from "@/components/admin/EpisodeManager";
import { TitleForm, type TitleFormValues } from "@/components/admin/TitleForm";
import { TitleTable } from "@/components/admin/TitleTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Film, Loader2, LogIn, Plus, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Every title, including unpublished drafts, for the admin dashboard. */
function useAdminTitles(enabled: boolean) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["adminTitles"],
    queryFn: async (): Promise<TitleView[]> => {
      if (!actor) return [];
      return actor.adminListTitles();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Admin dashboard: access gate, title CRUD, and per-title episode management. */
export function AdminPage() {
  const {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    login,
    isAdmin,
    isAdminLoading,
  } = useAuth();
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  const titlesQuery = useAdminTitles(isAuthenticated && isAdmin);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TitleView | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TitleView | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState<TitleView | null>(null);

  const createMutation = useMutation({
    mutationFn: async (values: TitleFormValues) => {
      if (!actor) throw new Error("الخادم غير جاهز");
      return actor.adminCreateTitle({
        title: values.title,
        description: values.description,
        category: values.category,
        kind: values.kind === "movie" ? TitleType.movie : TitleType.drama,
        coverImage: values.coverImage,
        releaseYear: BigInt(values.releaseYear),
        published: values.published,
      });
    },
    onSuccess: () => {
      toast.success("تمت إضافة العمل.");
      setFormOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["adminTitles"] });
    },
    onError: () => toast.error("تعذّرت إضافة العمل."),
  });

  const updateMutation = useMutation({
    mutationFn: async (values: TitleFormValues) => {
      if (!actor || !editing) throw new Error("الخادم غير جاهز");
      return actor.adminUpdateTitle(editing.id, {
        title: values.title,
        description: values.description,
        category: values.category,
        kind: values.kind === "movie" ? TitleType.movie : TitleType.drama,
        coverImage: values.coverImage,
        releaseYear: BigInt(values.releaseYear),
        published: values.published,
      });
    },
    onSuccess: (result) => {
      if (result.__kind__ === "err") {
        toast.error("تعذّر تحديث العمل.");
        return;
      }
      toast.success("تم تحديث العمل.");
      setFormOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["adminTitles"] });
    },
    onError: () => toast.error("تعذّر تحديث العمل."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (title: TitleView) => {
      if (!actor) throw new Error("الخادم غير جاهز");
      return actor.adminDeleteTitle(title.id);
    },
    onSuccess: (result) => {
      if (result.__kind__ === "err") {
        toast.error("تعذّر حذف العمل.");
        return;
      }
      toast.success("تم حذف العمل.");
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ["adminTitles"] });
    },
    onError: () => toast.error("تعذّر حذف العمل."),
  });

  // ── Access gate ────────────────────────────────────────────────────────
  if (isInitializing || (isAuthenticated && isAdminLoading)) {
    return (
      <div className="space-y-3 px-4 pt-6" data-ocid="admin.loading_state">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-4 pt-4" data-ocid="admin.page">
        <EmptyState
          icon={LogIn}
          title="تسجيل الدخول مطلوب"
          description="لوحة الإدارة متاحة للمشرفين فقط. سجّل الدخول بحساب يملك صلاحية الإدارة للمتابعة."
          action={
            <Button
              type="button"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="admin.login_button"
              className="h-11 rounded-full px-6"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {isLoggingIn ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
            </Button>
          }
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="px-4 pt-4" data-ocid="admin.page">
        <EmptyState
          icon={ShieldAlert}
          title="غير مصرح"
          description="حسابك لا يملك صلاحية الإدارة. تواصل مع مشرف النظام لمنحك الوصول إلى لوحة الإدارة."
          action={
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full px-6"
            >
              <Link to="/" data-ocid="admin.back_home_button">
                العودة إلى الرئيسية
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const titles = titlesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-5 px-4 pt-4" data-ocid="admin.page">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-foreground">
            لوحة الإدارة
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أضف الأعمال والحلقات وعدّلها أو احذفها.
          </p>
        </div>
        <Button
          type="button"
          data-ocid="admin.add_title_button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="shrink-0 rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          عمل جديد
        </Button>
      </header>

      {titlesQuery.isLoading ? (
        <div className="space-y-3" data-ocid="admin.titles_loading">
          {Array.from({ length: 4 }, (_, i) => `title-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-28 w-full rounded-xl" />
            ),
          )}
        </div>
      ) : titlesQuery.isError ? (
        <div
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center"
          data-ocid="admin.error_state"
        >
          <p className="text-sm text-destructive">
            تعذّر تحميل الأعمال. حاول مرة أخرى.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            data-ocid="admin.retry_button"
            onClick={() => void titlesQuery.refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : titles.length === 0 ? (
        <EmptyState
          icon={Film}
          title="لا توجد أعمال بعد"
          description="ابدأ بإضافة أول عمل درامي أو فيلم قصير ليظهر في الكتالوج."
          action={
            <Button
              type="button"
              data-ocid="admin.empty_add_button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="h-11 rounded-full px-6"
            >
              <Plus className="size-4" aria-hidden="true" />
              إضافة عمل
            </Button>
          }
        />
      ) : (
        <TitleTable
          titles={titles}
          onEdit={(title) => {
            setEditing(title);
            setFormOpen(true);
          }}
          onDelete={(title) => setPendingDelete(title)}
          onManageEpisodes={(title) => setEpisodeTitle(title)}
        />
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) setEditing(null);
        }}
      >
        <DialogContent
          className="max-h-[85dvh] overflow-y-auto sm:max-w-lg"
          data-ocid="admin.title_form_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "تعديل العمل" : "عمل جديد"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "حدّث بيانات العمل ثم احفظ التعديلات."
                : "أدخل بيانات العمل الجديد ثم احفظه."}
            </DialogDescription>
          </DialogHeader>
          <TitleForm
            key={editing?.id ?? "new"}
            initial={
              editing
                ? {
                    title: editing.title,
                    description: editing.description,
                    category: editing.category,
                    kind: editing.kind,
                    coverImage: editing.coverImage,
                    releaseYear: Number(editing.releaseYear),
                    published: editing.published,
                  }
                : undefined
            }
            submitLabel={editing ? "حفظ التعديلات" : "إضافة العمل"}
            pending={createMutation.isPending || updateMutation.isPending}
            onSubmit={(values) => {
              if (editing) updateMutation.mutate(values);
              else createMutation.mutate(values);
            }}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {episodeTitle ? (
        <EpisodeManager
          title={episodeTitle}
          open={episodeTitle !== null}
          onOpenChange={(next) => {
            if (!next) setEpisodeTitle(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف العمل"
        description={
          pendingDelete
            ? `سيتم حذف «${pendingDelete.title}» وجميع حلقاته نهائياً. لا يمكن التراجع عن هذا الإجراء.`
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
    </div>
  );
}
