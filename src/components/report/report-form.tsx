"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CATEGORY_ORDER } from "@/lib/categories";
import { reverseGeocode } from "@/lib/map/geocode";
import { uploadReportImages } from "@/lib/images/upload";
import { createReport } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LocationPicker, type LatLng } from "@/components/map/location-picker";
import type { ReportCategory } from "@/types/database";

export function ReportForm() {
  const t = useTranslations();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [acknowledged, setAcknowledged] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [addressEdited, setAddressEdited] = useState(false);
  const [locating, setLocating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleLocationChange(next: LatLng) {
    setLocation(next);
    if (addressEdited) return;
    setLocating(true);
    const resolved = await reverseGeocode(next.latitude, next.longitude);
    if (resolved) setAddress(resolved);
    setLocating(false);
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked].slice(0, 3));
    e.target.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location) return toast.error(t("report.tapMap"));
    if (!category) return;
    if (title.trim().length < 3) return;

    setSubmitting(true);
    try {
      const { photoUrls, thumbnailUrls } = await uploadReportImages(files);
      const result = await createReport({
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: location.latitude,
        longitude: location.longitude,
        address: address.trim() || undefined,
        photoUrls,
        thumbnailUrls,
      });
      if (result?.error) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }
      router.push(`/report/${result.id}`);
    } catch (err) {
      console.error("Report submission failed:", err);
      toast.error(
        err instanceof Error ? err.message : t("common.error"),
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-xl space-y-6 p-4 pb-24">
      <Dialog open={!acknowledged} onOpenChange={(o) => !o && router.back()}>
        <DialogContent className="glass-elevated">
          <DialogHeader>
            <DialogTitle>{t("report.guidelines.title")}</DialogTitle>
            <DialogDescription className="text-text-secondary">
              {t("report.guidelines.body")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setAcknowledged(true)}>
              {t("report.guidelines.agree")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h1 className="text-lg font-semibold">{t("report.new")}</h1>

      <div className="space-y-1.5">
        <Label>{t("report.location")}</Label>
        <LocationPicker value={location} onChange={handleLocationChange} />
        <Input
          placeholder={locating ? t("common.loading") : t("report.location")}
          value={address}
          onChange={(e) => {
            setAddressEdited(true);
            setAddress(e.target.value);
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t("report.category")}</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("report.category")} />
          </SelectTrigger>
          <SelectContent className="glass-elevated">
            {CATEGORY_ORDER.map((c) => (
              <SelectItem key={c} value={c}>
                {t(`categories.${c}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">{t("report.titleLabel")}</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("report.titlePlaceholder")}
          maxLength={140}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t("report.description")}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("report.descriptionPlaceholder")}
          rows={5}
          maxLength={4000}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          {t("report.photos")}{" "}
          <span className="text-text-muted">({t("report.photosHint")})</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="relative size-20 overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
              <button
                type="button"
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {files.length < 3 && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex size-20 items-center justify-center rounded-lg border border-dashed border-border text-text-muted hover:bg-hover"
            >
              <ImagePlus className="size-5" />
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onPickFiles}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {t("report.post")}
      </Button>
    </form>
  );
}
