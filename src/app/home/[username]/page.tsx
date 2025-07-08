"use client";
import Button from "@/components/Button";
import FileGrid from "@/components/FileGrid";
import FolderTree from "@/components/FolderTree";
import { deepCloneNode, FileNode, FileSystem } from "@/lib/FileSystemTrie";
import { deserializeNode, serializeNode } from "@/lib/serializeTrie";
import {
  ArrowUpTrayIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  FolderPlusIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ModalSpinner from "@/components/ModalSpinner";
import uploadAnimation from "@/animations/uploadAnimation.json";
import deleteAnimation from "@/animations/deleteAnimation.json";
import loadingAnimation from "@/animations/loadingAnimation.json";
import FilePreview from "@/components/FilePreview";
import SearchResults from "@/components/SearchResults";
import UniversalModal from "@/components/UniversalModal";

type userType = {
  _id: string;
  username: string;
  email: string;
};

type SearchResult = {
  node: {
    name: string;
    isFile: boolean;
    fileURL?: string;
  };
  path: string;
};

export default function Home() {
  const router = useRouter();
  const fileSystemRef = useRef(new FileSystem()); // to create root node once
  const savedTrieRef = useRef(new FileSystem());
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string>("root"); // current directory
  const [nodes, setNodes] = useState<FileNode[]>([]); // current folder contents
  const [userData, setUserData] = useState<userType | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchedData, setSearchedData] = useState<Array<object> | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    url: string;
    type?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  /**
   * Fetch user data on initial mount.
   */
  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * Load file system after user data is available.
   */
  useEffect(() => {
    if (userData) load();
  }, [userData]);

  /**
   * Refresh folder contents when the path changes.
   */
  useEffect(() => {
    refresh();
  }, [path]);

  /**
   * Run search when the search input changes.
   */
  useEffect(() => {
    handleSearch();
  }, [searchInput]);

  /**
   * Fetches the authenticated user's data.
   * Redirects to login if not authenticated.
   */
  async function fetchUserData(): Promise<void> {
    try {
      setLoading(true);
      const response = await axios.get("/api/auth/user");
      setUserData(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        router.push("/login");
        toast.error(error.response.data.error);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Saves the current file system state to the backend.
   * Optionally includes a snapshot message.
   */
  async function save(message?: string) {
    if (!userData) return;
    try {
      setLoading(true);
      const response = await axios.post("/api/file/save", {
        userId: userData._id,
        fileSystem: serializeNode(fileSystemRef.current.root),
        message: message || "Snapshot at " + new Date().toLocaleString(),
      });
      if (response.data.success) {
        toast.success("Files saved successfully");
        load();
      } else {
        toast.error("Save failed. Please try again.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Save failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setShowSaveModal(false);
    }
  }

  /**
   * Loads the file system structure from the backend and updates the trie.
   */
  async function load() {
    if (!userData) return;
    try {
      setLoading(true);
      const response = await axios.get("/api/file/load");
      const loadedTrie = deserializeNode(response.data.doc.current.fileSystem);
      fileSystemRef.current.root = loadedTrie;
      savedTrieRef.current.root = deepCloneNode(loadedTrie);
      refresh();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Refreshes the folder contents based on the current path.
   */
  function refresh(): void {
    const children = fileSystemRef.current.listChildren(path);
    setNodes(children);
  }

  /**
   * Adds a new folder at the current path.
   */
  function handleAddFolder(folderName: string | undefined): void {
    if (!folderName) return;
    const success = fileSystemRef.current.insertNode(path, {
      name: folderName,
      isFile: false,
      children: new Map(),
    });

    if (success) refresh();
    else alert("Folder already exists or invalid");

    setShowFolderModal(false);
  }

  /**
   * Handles file input change, uploads the file, and updates the trie.
   */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    if (userData?._id) {
      formData.append("userId", userData._id);
    }

    try {
      setIsUploading(true);
      const response = await axios.post("/api/file/upload", formData);
      if (response.data.success) {
        fileSystemRef.current.insertNode(path, {
          name: file.name,
          isFile: true,
          fileURL: response.data.publicId,
        });
        refresh();
      } else {
        toast.error("File upload failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      }
    } finally {
      setIsUploading(false);
    }
  }

  /**
   * Fetches a file's public URL for preview.
   */
  async function fetchUrl(publicId: string | undefined, name: string) {
    try {
      const response = await axios.get("/api/file/getURL", {
        params: { publicId },
      });
      if (response.data.success) {
        setPreviewOpen(true);
        setPreviewFile({
          name: name,
          url: response.data.url,
        });
      } else {
        toast.error("opening file failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      }
    }
  }

  /**
   * Deletes a file from the trie and updates the UI.
   * (The backend delete call is commented out.)
   */
  async function deleteFile(publicId: string | undefined, fileName: string) {
    try {
      setIsDeleting(true);
      //   const response = await axios.delete("/api/file/deleteFile", {
      //     params: { publicId },
      //   });
      //   if (response.data.success) {
      fileSystemRef.current.deleteNode(`${path}/${fileName}`);
      toast.success("Item removed successfully!");
      //   }
      refresh();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Can't remove file. Please try again later.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

   /**
   * Searches for files/folders using the current search input.
   */
  function handleSearch(): void {
    const data = fileSystemRef.current.searchNodesByPrefix(searchInput);
    setSearchedData(data);
  }

  /**
   * Handles folder selection from the sidebar tree.
   */
  function handleFolderSelect(newPath: string): void {
    setPath(newPath);
    setSidebarOpen(false);
  }

  // --- JSX Render ---

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-30">
        <div className="text-lg font-bold text-blue-700 tracking-tight">
          FileCloud
        </div>
        <button
          className="p-2 rounded-md hover:bg-blue-100 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-6 h-6 text-blue-700" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-blue-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static z-40 top-0 left-0 h-full md:h-auto w-4/5 max-w-xs md:w-1/5 bg-white/90 backdrop-blur p-4 flex flex-col
        transition-transform duration-200 ease-in-out border-r border-blue-100 shadow-lg md:shadow-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}
        style={{
          boxShadow: sidebarOpen ? "0 0 0 9999px rgba(0,0,0,0.3)" : undefined,
        }}
      >
        <div className="text-xl font-bold text-blue-700 mb-6 tracking-tight">
          FileCloud
        </div>
        <FolderTree
          node={fileSystemRef.current.root}
          onSelect={handleFolderSelect}
          fetchUrl={fetchUrl}
          selectedPath={path}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden">
        {/* Top Toolbar */}
        <div className="w-full relative z-30 flex flex-col sm:flex-row flex-wrap items-center justify-between border-b border-blue-100 bg-white/90 backdrop-blur px-2 sm:px-6 py-3 md:py-4 mb-3 gap-2 shadow-sm">
          <div className="flex gap-2 sm:gap-4 flex-wrap">
            <Button
              label={"New Folder"}
              Icon={FolderPlusIcon}
              onClick={() => setShowFolderModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Button
              label={"Upload"}
              Icon={ArrowUpTrayIcon}
              onClick={() => inputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <input
              type="file"
              ref={inputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              label={"Snapshot"}
              Icon={CameraIcon}
              onClick={() => setShowSaveModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Button
              label={"Version History"}
              Icon={ClockIcon}
              onClick={() => router.push("/version-history")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <MagnifyingGlassIcon className="w-5 h-5 text-blue-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search files and folders"
                className="pl-10 pr-4 py-2 rounded-full bg-blue-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition w-full sm:w-72"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && searchedData && (
                <SearchResults
                  results={searchedData as SearchResult[]}
                  fetchUrl={fetchUrl}
                  setPath={setPath}
                  onClose={() => setPreviewOpen(false)}
                  setSearchInput={setSearchInput}
                />
              )}
            </div>
            <UserCircleIcon className="w-10 h-10 text-blue-400 hidden sm:block" />
          </div>
        </div>

        <div className="w-full flex-1 flex flex-col px-3 sm:pl-4">
          <FileGrid
            files={nodes}
            path={path}
            setPath={setPath}
            fetchUrl={fetchUrl}
            deleteFile={deleteFile}
            savedTrieRef={savedTrieRef.current.root}
          />
        </div>
      </main>

      {/* Modals and Overlays */}
      {loading && (
        <ModalSpinner text={"Loading..."} animation={loadingAnimation} />
      )}
      {isUploading && (
        <ModalSpinner text={"Uploading..."} animation={uploadAnimation} />
      )}
      {isDeleting && (
        <ModalSpinner text={"Deleting..."} animation={deleteAnimation} />
      )}
      {previewOpen && (
        <FilePreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileName={previewFile?.name || ""}
          fileUrl={previewFile?.url || ""}
          fileType={previewFile?.type}
        />
      )}
      {showFolderModal && (
        <UniversalModal
          open={showFolderModal}
          title="New Folder"
          inputLabel="Folder Name"
          inputPlaceholder="e.g. Documents"
          showInput={true}
          confirmLabel="Create"
          cancelLabel="Cancel"
          onConfirm={handleAddFolder}
          onCancel={() => setShowFolderModal(false)}
        />
      )}
      {showSaveModal && (
        <UniversalModal
          open={showSaveModal}
          title="Save Version"
          inputLabel="Description"
          inputPlaceholder="e.g. Added myImages folder"
          showInput={true}
          confirmLabel="Save"
          cancelLabel="Cancel"
          onConfirm={() => save()}
          onCancel={() => setShowSaveModal(false)}
          fileSystemRef={fileSystemRef.current.root}
          savedTrieRef={savedTrieRef.current.root}
        />
      )}
    </div>
  );
}
