import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/constants";
import { ExternalBlob } from "@caffeineai/object-storage";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

/** The two catalogue kinds, with their Arabic labels. */
const KIND_OPTIONS: { value: "drama" | "movie"; label: string }[] = [
  { value: "drama", label: "دراما" },
  { value: "movie", label: "فيلم قصير" },
];

export interface TitleFormValues {
  title: string;
  description: string;
  category: string;
  kind: "drama" | "movie";
  coverImage: string;
  releaseYear: number;
  published: boolean;
}

interface TitleFormProps {
  /** Existing values when editing; omitted when creating. */
  initial?: TitleFormValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: TitleFormValues) => void;
  onCancel: () => void;
}

const EMPTY: TitleFormValues = {
  title: "",
  description: "",
  category: CATEGORIES[0],
  kind: "drama",
  coverImage: "",
  releaseYear: new Date().getFullYear(),
  published: true,
};

/**
 * Create/edit form for a catalogue title. The cover image is uploaded through
 * object storage and its direct URL is stored on the title record.
 */
export function TitleForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: TitleFormProps) {
  const [values, setValues] = useState<TitleFormValues>(initial ?? EMPTY);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof TitleFormValues>(
    key: K,
    value: TitleFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleCoverFile(file: File) {
    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(
        bytes,
        file.type,
        file.name,
      ).withUploadProgress((pct) => setUploadProgress(pct));
      const url = blob.getDirectURL();
      update("coverImage", url);
    } catch {
      setUploadError("تعذّر رفع صورة الغلاف. حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.title.trim()) {
      setFormError("العنوان مطلوب.");
      return;
    }
    if (!values.category) {
      setFormError("التصنيف مطلوب.");
      return;
    }
    setFormError(null);
    onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-ocid="admin.title_form"
    >
      <div className="space-y-2">
        <Label htmlFor="title-name">العنوان</Label>
        <Input
          id="title-name"
          data-ocid="admin.title_input"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="مثال: حكاية الحي القديم"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title-description">الوصف</Label>
        <Textarea
          id="title-description"
          data-ocid="admin.description_textarea"
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="ملخّص قصير عن العمل…"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title-category">التصنيف</Label>
          <Select
            value={values.category}
            onValueChange={(value) => update("category", value)}
          >
            <SelectTrigger
              id="title-category"
              data-ocid="admin.category_select"
              className="w-full"
            >
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title-kind">النوع</Label>
          <Select
            value={values.kind}
            onValueChange={(value) =>
              update("kind", value as TitleFormValues["kind"])
            }
          >
            <SelectTrigger
              id="title-kind"
              data-ocid="admin.kind_select"
              className="w-full"
            >
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              {KIND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title-year">سنة الإصدار</Label>
        <Input
          id="title-year"
          data-ocid="admin.year_input"
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          value={values.releaseYear}
          onChange={(event) =>
            update("releaseYear", Number(event.target.value) || 0)
          }
        />
      </div>

      <div className="space-y-2">
        <Label>الغلاف</Label>
        <div className="flex items-start gap-3">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            {values.coverImage ? (
              <img
                src={values.coverImage}
                alt="معاينة الغلاف"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImagePlus
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleCoverFile(file);
                event.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="admin.cover_upload_button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="size-4" aria-hidden="true" />
                )}
                {uploading ? "جارٍ الرفع…" : "رفع صورة"}
              </Button>
              {values.coverImage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid="admin.cover_remove_button"
                  onClick={() => update("coverImage", "")}
                >
                  <X className="size-4" aria-hidden="true" />
                  إزالة
                </Button>
              ) : null}
            </div>
            {uploading ? (
              <Progress
                value={uploadProgress}
                data-ocid="admin.cover_upload_progress"
              />
            ) : null}
            {uploadError ? (
              <p
                className="text-xs text-destructive"
                data-ocid="admin.cover_upload_error"
              >
                {uploadError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
        <div className="min-w-0">
          <Label htmlFor="title-published" className="cursor-pointer">
            منشور
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            يظهر العمل للزوّار في الكتالوج.
          </p>
        </div>
        <Switch
          id="title-published"
          data-ocid="admin.published_switch"
          checked={values.published}
          onCheckedChange={(checked) => update("published", checked)}
        />
      </div>

      {formError ? (
        <p className="text-sm text-destructive" data-ocid="admin.form_error">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.title_cancel_button"
          onClick={onCancel}
          disabled={pending}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          data-ocid="admin.title_submit_button"
          disabled={pending || uploading}
          className="min-w-28"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {pending ? "جارٍ الحفظ…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
