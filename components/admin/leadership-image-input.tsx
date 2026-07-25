"use client";

import Image from "next/image";
import { ImagePlus, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

const maxImageSize = 5 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

interface LeadershipImageInputProps {
  currentImageUrl?: string | null;
  leaderName?: string;
}

export function LeadershipImageInput({
  currentImageUrl,
  leaderName = "Leadership profile",
}: LeadershipImageInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const visibleImage = previewUrl ?? currentImageUrl;

  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-[10px] font-black uppercase tracking-[0.11em] text-[#637186]">
        Leadership portrait
      </legend>
      <div className="mt-2 grid gap-4 rounded-2xl border border-[#d9e1e9] bg-[#f7f9fb] p-4 sm:grid-cols-[120px_1fr] sm:items-center">
        <div className="relative aspect-[4/5] w-full max-w-[120px] overflow-hidden rounded-xl border border-[#d4dce5] bg-[#e9eef3]">
          {visibleImage ? (
            <Image
              src={visibleImage}
              alt={`${leaderName} portrait preview`}
              fill
              sizes="120px"
              unoptimized
              className="object-cover object-top"
            />
          ) : (
            <div className="grid h-full place-items-center text-[#8491a0]">
              <UserRound className="size-12 stroke-[1.4]" aria-hidden="true" />
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-black text-[#26364b]">
            {currentImageUrl ? "Replace portrait image" : "Choose portrait image"}
            <input
              name="leadershipPhoto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 block w-full rounded-xl border border-[#d9e1e9] bg-white px-3 py-2.5 text-xs text-[#526176] file:mr-3 file:rounded-full file:border-0 file:bg-[#07172b] file:px-4 file:py-2 file:text-xs file:font-black file:text-white"
              aria-describedby="leadership-image-feedback"
              aria-invalid={invalid}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(undefined);
                setInvalid(false);

                if (!file) {
                  setMessage(undefined);
                  return;
                }

                if (!acceptedImageTypes.has(file.type)) {
                  event.currentTarget.value = "";
                  setInvalid(true);
                  setMessage("Choose a JPEG, PNG, or WebP portrait.");
                  return;
                }

                if (file.size > maxImageSize) {
                  event.currentTarget.value = "";
                  setInvalid(true);
                  setMessage("This portrait is larger than 5 MB. Choose a smaller image.");
                  return;
                }

                setPreviewUrl(URL.createObjectURL(file));
                setMessage(
                  `${file.name} selected · ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                );
              }}
            />
          </label>
          <p
            id="leadership-image-feedback"
            className={`mt-2 flex items-center gap-2 text-[11px] font-bold leading-5 ${invalid ? "text-[#b52b36]" : "text-[#68778a]"}`}
            role={invalid ? "alert" : undefined}
          >
            <ImagePlus className="size-3.5 shrink-0" aria-hidden="true" />
            {message ?? "Use a clear vertical JPEG, PNG, or WebP image up to 5 MB."}
          </p>
          {currentImageUrl && (
            <label className="mt-3 flex items-start gap-2 text-xs font-bold leading-5 text-[#7d3840]">
              <input
                name="removeLeadershipPhoto"
                type="checkbox"
                className="mt-1 accent-[#b52430]"
              />
              Remove the current portrait and show the placeholder.
            </label>
          )}
        </div>
      </div>
    </fieldset>
  );
}
