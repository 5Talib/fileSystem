"use client";
import { FileNode } from "@/lib/FileSystemTrie";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";

type ModalProps = {
  open: boolean;
  title?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputDefaultValue?: string;
  showInput?: boolean; // If true, show input field
  confirmLabel?: string; // e.g., "Yes", "OK"
  cancelLabel?: string; // e.g., "No", "Cancel"
  onConfirm: (inputValue: string | undefined) => void;
  onCancel: () => void;
  fileSystemRef?: FileNode;
  savedTrieRef?: FileNode;
};

export default function UniversalModal({
  open,
  title = "Confirm",
  inputLabel,
  inputPlaceholder,
  inputDefaultValue = "",
  showInput = false,
  confirmLabel = "Yes",
  cancelLabel = "No",
  onConfirm,
  onCancel,
  fileSystemRef,
  savedTrieRef,
}: ModalProps) {
  const changes = useMemo(() => {
    if (!fileSystemRef || !savedTrieRef) return { added: [], removed: [] };

    const currentPathsArr = getAllPaths(fileSystemRef, "");
    const savedPathsArr = getAllPaths(savedTrieRef, "");
    const currentPaths = new Set(currentPathsArr);
    const savedPaths = new Set(savedPathsArr);

    const added = currentPathsArr.filter((p) => !savedPaths.has(p));
    const removed = savedPathsArr.filter((p) => !currentPaths.has(p));

    return { added, removed };
  }, [fileSystemRef, savedTrieRef]);

  const [inputValue, setInputValue] = useState(inputDefaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && showInput && inputRef.current) {
      inputRef.current.focus();
    }
    if (open) setInputValue(inputDefaultValue);
  }, [open, showInput, inputDefaultValue]);

  if (!open) return null;

  function getAllPaths(node: FileNode, prefix = ""): string[] {
    let paths: string[] = [];
    const currentPath = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.isFile) {
      paths.push(currentPath);
    } else if (node.children && node.children instanceof Map) {
      for (const child of node.children.values()) {
        paths = paths.concat(getAllPaths(child, currentPath));
      }
      paths.push(currentPath);
    }
    return paths;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100/80 to-white/80 backdrop-blur-sm">
      <div className="relative bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 w-[92vw] max-w-sm sm:max-w-md md:max-w-lg border border-blue-100">
        <div className="flex flex-col items-center space-y-4 w-full">
          {/* Title */}
          {title && (
            <div className="text-xl font-extrabold text-blue-700 text-center tracking-tight">
              {title}
            </div>
          )}

          {/* Changes Summary */}
          {changes &&
            (changes.added.length > 0 || changes.removed.length > 0) && (
              <div className="w-full bg-blue-50/60 rounded-lg p-3 shadow-inner">
                <div className="font-semibold text-blue-700 mb-2">Changes</div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {changes.added.map((item, i) => (
                    <div
                      key={"added-" + i}
                      className="flex items-center text-green-500 text-sm gap-2"
                    >
                      <PlusIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                  {changes.removed.map((item, i) => (
                    <div
                      key={"removed-" + i}
                      className="flex items-center text-red-500 text-sm gap-2"
                    >
                      <MinusIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Input */}
          {showInput && (
            <div className="w-full">
              {inputLabel && (
                <label className="block mb-1 text-sm font-medium text-blue-700">
                  {inputLabel}
                </label>
              )}
              <input
                ref={inputRef}
                type="text"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-blue-50 text-base"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onConfirm(inputValue);
                }}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex w-full gap-3 pt-2">
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-white hover:bg-red-500 hover:text-white text-blue-700 font-semibold border border-blue-100 shadow transition cursor-pointer"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition cursor-pointer"
              onClick={() => onConfirm(showInput ? inputValue : undefined)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
