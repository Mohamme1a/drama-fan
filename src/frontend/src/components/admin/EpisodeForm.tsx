import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ExternalBlob } from "@caffeineai/object-storage";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

export interface EpisodeFormValues {
  title: string;
  number: number;
  durationSeconds: number;
  videoSource: string;
}

interface EpisodeFormProps {
  initial?: EpisodeFormValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: EpisodeFormValues) => void;
  onCancel: () => void;
}

const EMPTY: EpisodeFormValues = {
  title: "",
  number: 1,
  durationSeconds: 0,
  videoSource: "",
};

/**
 * Create/edit form for an episode. The video source can be a direct URL or a
 * file uploaded through object storage (whose direct URL is then stored).
 */
export function EpisodeForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: EpisodeFormProps) {
  const [values, setValues] = useState<EpisodeFormValues>(initial ?? EMPTY);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof EpisodeFormValues>(
    key: K,
    value: EpisodeFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleVideoFile(file: File) {
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
      update("videoSource", blob.getDirectURL());
    } catch {
      setUploadError("تعذّر رفع ملف الفيديو. حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.title.trim()) {
      setFormError("عنوان الحلقة مطلوب.");
      return;
    }
    if (values.number < 1) {
      setFormError("رقم الحلقة يجب أن يكون 1 أو أكثر.");
      return;
    }
    if (!values.videoSource.trim()) {
      setFormError("أدخل رابط الفيديو أو ارفع ملفاً.");
      return;
    }
    setFormError(null);
    onSubmit({ ...values, title: values.title.trim() });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.episode_form"
    >
      <div className="space-y-2">
        <Label htmlFor="episode-title">عنوان الحلقة</Label>
        <Input
          id="episode-title"
          data-ocid="admin.episode_title_input"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="مثال: البداية"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="episode-number">رقم الحلقة</Label>
          <Input
            id="episode-number"
            data-ocid="admin.episode_number_input"
            type="number"
            inputMode="numeric"
            min={1}
            value={values.number}
            onChange={(event) =>
              update("number", Number(event.target.value) || 0)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="episode-duration">المدة (ثانية)</Label>
          <Input
            id="episode-duration"
            data-ocid="admin.episode_duration_input"
            type="number"
            inputMode="numeric"
            min={0}
            value={values.durationSeconds}
            onChange={(event) =>
              update("durationSeconds", Number(event.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="episode-video">رابط الفيديو</Label>
        <Input
          id="episode-video"
          data-ocid="admin.episode_video_input"
          value={values.videoSource}
          onChange={(event) => update("videoSource", event.target.value)}
          placeholder="https://…"
          dir="ltr"
        />
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleVideoFile(file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="admin.video_upload_button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            {uploading ? "جارٍ الرفع…" : "رفع ملف فيديو"}
          </Button>
          {values.videoSource ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="admin.video_clear_button"
              onClick={() => update("videoSource", "")}
            >
              <X className="size-4" aria-hidden="true" />
              مسح
            </Button>
          ) : null}
        </div>
        {uploading ? (
          <Progress
            value={uploadProgress}
            data-ocid="admin.video_upload_progress"
          />
        ) : null}
        {uploadError ? (
          <p
            className="text-xs text-destructive"
            data-ocid="admin.video_upload_error"
          >
            {uploadError}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p
          className="text-sm text-destructive"
          data-ocid="admin.episode_form_error"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.episode_cancel_button"
          onClick={onCancel}
          disabled={pending}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          data-ocid="admin.episode_submit_button"
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
