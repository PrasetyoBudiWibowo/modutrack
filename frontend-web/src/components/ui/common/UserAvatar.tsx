"use client";

import { useState } from "react";

interface Props {
  name: string;
  src: string | null;
  className?: string;
}

export default function UserAvatar({
  name,
  src,
  className = "h-8 w-8 text-xs",
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && failedSrc !== src;

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 font-semibold text-gray-400 ${className}`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        name.charAt(0)
      )}
    </div>
  );
}
