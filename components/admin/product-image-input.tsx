"use client";

import { useState } from "react";

const maxImageSize = 5 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

interface ProductImageInputProps {
  className: string;
}

export function ProductImageInput({ className }: ProductImageInputProps) {
  const [message, setMessage] = useState<string>();
  const [invalid, setInvalid] = useState(false);

  return (
    <>
      <input
        name="primaryImage"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={className}
        aria-describedby="product-image-feedback"
        aria-invalid={invalid}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          setInvalid(false);

          if (!file) {
            setMessage(undefined);
            return;
          }

          if (!acceptedImageTypes.has(file.type)) {
            event.currentTarget.value = "";
            setInvalid(true);
            setMessage("Choose a JPEG, PNG, or WebP image.");
            return;
          }

          if (file.size > maxImageSize) {
            event.currentTarget.value = "";
            setInvalid(true);
            setMessage("This image is larger than 5 MB. Choose a smaller or compressed image.");
            return;
          }

          setMessage(`${file.name} selected · ${(file.size / (1024 * 1024)).toFixed(1)} MB`);
        }}
      />
      <span
        id="product-image-feedback"
        className={`mt-2 block text-[11px] font-bold leading-5 ${invalid ? "text-[#b52b36]" : "text-[#557263]"}`}
        role={invalid ? "alert" : undefined}
      >
        {message ?? "Maximum file size: 5 MB."}
      </span>
    </>
  );
}
