"use client";
import { useState, useRef, useEffect } from "react";
import { FileNode, getNodeStatus } from "@/lib/FileSystemTrie";
import {
  FolderIcon,
  DocumentIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

type FileGridProps = {
  files: FileNode[];
  path: string;
  setPath: (newPath: string) => void;
  fetchUrl: (publicId: string | undefined, name: string) => void;
  deleteFile?: (publicId: string | undefined, fileName: string) => void;
  onInfo?: (file: FileNode) => void;
  savedTrieRef: FileNode | null;
};

export default function FileGrid({
  files,
  path,
  setPath,
  fetchUrl,
  deleteFile,
  onInfo,
  savedTrieRef,
}: FileGridProps) {
  // Tracks which file's menu is open (by index), or null if none open
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Closes the menu if clicking outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenIndex(null);
      }
    }
    if (menuOpenIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenIndex]);

  // Converts the current path string to an array for breadcrumbs
  function pathToBreadcrumb(): Array<string> {
    const parts = path.split("/");
    return parts;
  }

  // Navigates to a folder when a breadcrumb is clicked
  function navigateViaBreadcrumb(index: number, arr: Array<string>): void {
    if (index < arr.length - 1) {
      const newPath = arr.slice(0, index + 1).join("/");
      setPath(newPath);
    }
  }

  // Handles clicking a file or folder in the grid
  function handleClick(
    isFile: boolean,
    publicId: string | undefined,
    fileName: string
  ) {
    if (isFile && publicId) {
      fetchUrl(publicId, fileName); // Preview or open file
    } else {
      setPath(`${path}/${fileName}`); // Navigate into folder
    }
  }

  return (
    <section className="bg-white border border-blue-100 rounded-2xl p-4 w-full h-full mb-3 overflow-auto shadow">
      {/* Breadcrumb navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2 cursor-pointer">
          {pathToBreadcrumb().map((part, index, arr) => (
            <span key={index} className="flex items-center gap-2">
              <span
                className={
                  index === arr.length - 1 ? "text-blue-600" : "text-blue-800"
                }
                onClick={() => navigateViaBreadcrumb(index, arr)}
              >
                {part}
              </span>
              {index < arr.length - 1 && (
                <ChevronRightIcon className="w-4 h-4 flex-shrink-0 text-blue-300" />
              )}
            </span>
          ))}
        </h2>
        {/* You can add sorting or view toggle controls here */}
      </div>
      {/* File/folder grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 z-0">
        {files.map((item, idx) => {
          const status = getNodeStatus(
            `${path}/${item.name}`,
            item,
            savedTrieRef
          );
          const borderClass =
            status === "committed"
              ? "border-1 border-blue-400"
              : "border-1 border-red-400";
          return (
            <div
              key={item.name}
              className={`group flex items-center justify-between p-4 rounded-xl bg-white hover:bg-blue-50 transition relative cursor-pointer shadow-sm ${borderClass}`}
            >
              {/* Main file/folder area */}
              <div
                className="flex items-center gap-3 w-full"
                onClick={() =>
                  handleClick(item.isFile, item.fileURL, item.name)
                }
                tabIndex={0}
                aria-label={
                  item.isFile
                    ? `Open file ${item.name}`
                    : `Open folder ${item.name}`
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClick(item.isFile, item.fileURL, item.name);
                  }
                }}
              >
                {!item.isFile ? (
                  <FolderIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                ) : (
                  <DocumentIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="relative group">
                    <div className="font-medium text-slate-900 truncate max-w-xs md:max-w-sm lg:max-w-md">
                      {item.name}
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute left-0 top-full mt-1 z-30 hidden group-hover:block bg-blue-600 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-pre-wrap max-w-xs md:max-w-sm lg:max-w-md">
                      {item.name}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-xs">
                    {/* Optionally show file info here */}
                  </div>
                </div>
              </div>
              {/* Ellipsis icon and contextual menu */}
              <div className="relative">
                <button
                  className="opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenIndex(menuOpenIndex === idx ? null : idx);
                  }}
                  aria-label="Show file options"
                  tabIndex={0}
                >
                  <EllipsisVerticalIcon className="w-6 h-6 text-blue-400 hover:text-blue-700 flex-shrink-0" />
                </button>
                {/* Contextual dropdown menu */}
                {menuOpenIndex === idx && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-8 z-30 bg-white border rounded shadow-md min-w-[120px] py-1"
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm cursor-pointer"
                      onClick={() => {
                        setMenuOpenIndex(null);
                        onInfo?.(item);
                      }}
                    >
                      Info
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-red-500 cursor-pointer"
                      onClick={() => {
                        setMenuOpenIndex(null);
                        deleteFile?.(item.fileURL, item.name);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
