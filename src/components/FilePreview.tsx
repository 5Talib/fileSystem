"use client";
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type FilePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
  fileType?: string; // e.g., "image/png", "application/pdf"
};

export default function FilePreview({
  open,
  onClose,
  fileName,
  fileUrl,
}: FilePreviewModalProps) {
  if (!open) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm w-full">
      <div className="relative bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-3xl h-[96vh] flex flex-col border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
          <div className="font-bold text-lg text-blue-700 truncate">
            {fileName}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-blue-100 transition cursor-pointer"
            aria-label="Close preview"
          >
            <XMarkIcon className="w-6 h-6 text-blue-500" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-blue-50 rounded-b-2xl">
          {fileUrl ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-[70vh] rounded shadow border border-blue-100 bg-white"
            />
          ) : fileUrl ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="text-5xl mb-2">📄</div>
              <div className="text-slate-600 mb-4">Preview not available</div>
              <a
                href={fileUrl}
                download={fileName}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow"
              >
                Download
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="text-5xl mb-2">❓</div>
              <div className="text-slate-600 mb-4">No file to preview</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
