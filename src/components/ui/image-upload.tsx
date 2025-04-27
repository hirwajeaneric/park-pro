"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { Progress } from "./progress";
import { toast } from "sonner";
import axios from "axios";

interface FileUploadProps {
  endpoint: "resumeUpload";
  value: string;
  onChange: (url?: string) => void;
}

export const ImageUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        toast.error("Only image files are accepted");
        return;
      }

      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      await uploadFile(selectedFile);
    },
  });

  const uploadFile = async (fileToUpload: File) => {
    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const { data } = await axios.post(`/api/upload/${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      onChange(data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Image upload failed. Please try again.");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    onChange("");
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="space-y-2">
      {!value && !file ? (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag & drop your image here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, JPEG, GIF, WEBP, SVG (max 5MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">
                  {file?.name || "Uploaded image"}
                </p>
                {uploading && (
                  <Progress value={progress} className="h-2 w-[200px]" />
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};