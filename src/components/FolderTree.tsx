"use client";
import { useState } from "react";
import { FileNode } from "@/lib/FileSystemTrie";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { FolderIcon, FolderOpenIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";

type FolderTreeProps = {
  node: FileNode;
  level?: number;
  onSelect?: (path: string) => void;
  fetchUrl: (publicId: string | undefined, name: string) => void;
  path?: string;
  selectedPath?: string;
};

export default function FolderTree({
  node,
  level = 0,
  onSelect,
  fetchUrl,
  path = "root",
  selectedPath,
}: FolderTreeProps) {
  const [isOpen, setIsOpen] = useState<boolean>(level === 0); // root open by default
  const children: Array<FileNode> = node.children
    ? Array.from(node.children.values())
    : [];

  const isSelected = selectedPath === path;

  function toggleFolder(e: React.MouseEvent) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  // Render a folder or file node
  function renderNode() {
  if (node.isFile) {
    // File node
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer transition
          ${isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50"}
        `}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => fetchUrl(node.fileURL, node.name)}
        tabIndex={0}
        role="treeitem"
        aria-selected={isSelected}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fetchUrl(node.fileURL, node.name);
        }}
      >
        <DocumentIcon className={`w-5 h-5 flex-shrink-0 ${isSelected ? "text-white" : "text-blue-400"}`} />
        <span className={`font-medium truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
          {node.name}
        </span>
      </div>
    );
  } else {
    // Folder node
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer transition
          ${isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50"}
        `}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => onSelect?.(path)}
        tabIndex={0}
        role="treeitem"
        aria-expanded={isOpen}
        aria-selected={isSelected}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect?.(path);
          if (e.key === "ArrowRight" && !isOpen) setIsOpen(true);
          if (e.key === "ArrowLeft" && isOpen) setIsOpen(false);
        }}
      >
        {/* Expand/collapse chevron */}
        {children.length > 0 ? (
          isOpen ? (
            <ChevronDownIcon
              className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-white" : "text-blue-400"}`}
              onClick={toggleFolder}
              tabIndex={-1}
              aria-label="Collapse folder"
            />
          ) : (
            <ChevronRightIcon
              className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-white" : "text-blue-400"}`}
              onClick={toggleFolder}
              tabIndex={-1}
              aria-label="Expand folder"
            />
          )
        ) : (
          <div className="w-4 h-4 flex-shrink-0" />
        )}
        {/* Folder icon */}
        {isOpen ? (
          <FolderOpenIcon className={`w-5 h-5 flex-shrink-0 ${isSelected ? "text-white" : "text-blue-500"}`} />
        ) : (
          <FolderIcon className={`w-5 h-5 flex-shrink-0 ${isSelected ? "text-white" : "text-blue-500"}`} />
        )}
        <span className={`font-medium truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
          {node.name}
        </span>
      </div>
    );
  }
}


  return (
    <div className="overflow-auto" role={level === 0 ? "tree" : undefined}>
      {renderNode()}
      {/* Animate children for folders */}
      {!node.isFile && (
        <AnimatePresence initial={false}>
          {isOpen && children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              role="group"
            >
              {children.map((child) => (
                <FolderTree
                  key={child.name}
                  node={child}
                  level={level + 1}
                  path={`${path}/${child.name}`}
                  fetchUrl={fetchUrl}
                  onSelect={onSelect}
                  selectedPath={selectedPath}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
