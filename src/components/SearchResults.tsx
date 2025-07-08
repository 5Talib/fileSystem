"use client";
import React from "react";
import { DocumentIcon, FolderIcon } from "@heroicons/react/24/outline";

type SearchResult = {
  node: {
    name: string;
    isFile: boolean;
    fileURL?: string;
  };
  path: string;
};

type SearchResultsProps = {
  results: SearchResult[];
  fetchUrl: (publlicId: string | undefined, name: string) => void;
  setPath: (newPath: string) => void;
  onClose?: () => void;
  setSearchInput: (input: string) => void;
  loading?: boolean;
};

export default function SearchResults({
  results,
  fetchUrl,
  setPath,
  onClose,
  setSearchInput,
  loading = false,
}: SearchResultsProps) {
  function handleClick(result: SearchResult) {
    setSearchInput("");

    if (result.node.isFile) {
      fetchUrl(result.node.fileURL, result.node.name);
    } else {
      setPath(result.path);
    }

    if (onClose) {
      onClose();
    }
  }
  return (
    <div className="absolute left-0 top-12 w-[28rem] max-w-full bg-white border border-gray-200 rounded-lg shadow-lg z-40">
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500">Searching...</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-slate-400">No results found</div>
        ) : (
          results.map((result, idx) => (
            <button
              key={result.path + idx}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 transition text-left"
              onClick={() => handleClick(result)}
              tabIndex={0}
            >
              {result.node.isFile ? (
                <DocumentIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              ) : (
                <FolderIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <div className="font-medium text-slate-800 truncate">
                  {result.node.name}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {result.path}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
