// hooks/useFilePreview.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UseFilePreviewParams {
  bucket: string;
  initialPath?: string | null;
}

export function useFilePreview({ bucket, initialPath }: UseFilePreviewParams) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!initialPath) return;

    const loadPreview = async () => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(initialPath);

      setPreview(data.publicUrl);
      setFileName(initialPath.split("/").pop() ?? null);
    };

    loadPreview();
  }, [initialPath, bucket]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleUpload = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);

    if (selectedFile.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  return {
    file,
    preview,
    fileName,
    handleUpload,
  };
}
