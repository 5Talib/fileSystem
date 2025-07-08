export type FileNode = {
    name: string;
    isFile: boolean;
    fileURL?: string;
    children?: Map<string, FileNode>;
};

export type SearchResult = {
    node: FileNode;
    path: string;
};

/**
 * Generates a unique node name by appending ' copy', ' copy1', etc., if needed.
 * For files, preserves the extension.
 * 
 * @param name - The original name (e.g., "file.txt" or "folder")
 * @param existingNames - A Set or array of existing names in the parent
 * @returns A unique name (e.g., "file copy.txt", "file copy1.txt", etc.)
 */
function getUniqueNodeName(name: string, existingNames: Set<string> | string[]): string {
    let baseName = name;
    let ext = "";

    // If it's a file, split extension
    if (name.includes(".")) {
        const lastDot = name.lastIndexOf(".");
        baseName = name.substring(0, lastDot);
        ext = name.substring(lastDot);
    }

    let newName = name;
    let counter = 0;

    // Convert to Set for fast lookup if needed
    const namesSet = Array.isArray(existingNames) ? new Set(existingNames) : existingNames;

    while (namesSet.has(newName)) {
        counter++;
        if (counter === 1) {
            newName = `${baseName}_copy${ext}`;
        } else {
            newName = `${baseName}_copy${counter}${ext}`;
        }
    }
    return newName;
}


// FileSystem class implements a trie-based file/folder structure for each user.
export class FileSystem {
    root: FileNode;

    constructor() {
        // initialize root node
        // for every user this should run only once as root node should be unique
        this.root = {
            name: "root",
            isFile: false,
            children: new Map(),
        }
    }

    // function to find node by its path
    // eg - root/talib/work
    findNode(path: string): FileNode | null {
        if (!path || path === "root") return this.root;
        const parts = path.split("/").filter(Boolean); // ["root", "talib", "work"]
        let node: FileNode = this.root; // node = root
        for (const part of parts) {
            if (part === node.name) continue;
            if (!node.children || !node.children.has(part)) return null;  // if root/current node is empty or current node !contains part
            node = node.children.get(part)!; // node = talib, ! -> telling ts that surely this value isn't undefined
        }

        return node;
    }

    // function to insert node inside parent folder
    insertNode(parent: string, node: FileNode): boolean {
        console.log("info", parent, node);
        const parentNode = this.findNode(parent);
        if (!parentNode || parentNode.isFile) return false; // No insertion in file or non-existant folder
        if (!parentNode.children) parentNode.children = new Map(); // No children means no map so initialize one

        // Get all existing names in the parent folder
        const existingNames = new Set(parentNode.children.keys());

        // Generate a unique name
        node.name = getUniqueNodeName(node.name, existingNames);

        parentNode.children.set(node.name, node); // inserting node to parent
        return true;
    }

    // function to list all children of folder
    listChildren(path: string): FileNode[] {
        const node = this.findNode(path); // finding the current node
        if (!node || node.isFile || !node.children) return [];
        return Array.from(node.children.values()); // node.children.values() gives an iterator of all the FileNode objects and Array.from converts them to array
    }

    // function to delete a node
    // eg -> root/talib/work/abc.pdf
    deleteNode(path: string): boolean {
        const parts = path.split("/").filter(Boolean); // ["root", "talib", "work", "abc.pdf"]
        const nodeToBeDeleted = parts.pop(); // nodeToBeDeleted = abc.pdf
        const parentPath = parts.join("/"); // "root/talib/work"
        const parentNode = this.findNode(parentPath); // work
        if (parentNode && parentNode.children && nodeToBeDeleted && parentNode.children.has(nodeToBeDeleted)) {
            parentNode.children.delete(nodeToBeDeleted);
            return true;
        }
        return false;
    }

    /**
     * Recursively finds all nodes whose names start with the given prefix.
     * @param prefix - The prefix string to search for (case-insensitive)
     * @returns Array of { node, path }
    **/
    searchNodesByPrefix(prefix: string): SearchResult[] {
        const results: SearchResult[] = [];
        const lowerPrefix = prefix.toLowerCase();

        // Helper function for recursion
        function dfs(current: FileNode, currentPath: string) {
            if (current.name.toLowerCase().startsWith(lowerPrefix)) {
                results.push({ node: current, path: currentPath });
            }
            if (current.children) {
                for (const child of current.children.values()) {
                    dfs(child, `${currentPath}/${child.name}`);
                }
            }
        }

        dfs(this.root, this.root.name); // Start from root
        return results;
    }
}

// Wrapper type for cases where FileNode is wrapped under a "root" property.
type FileNodeWrapper = { root: FileNode };

// Type guard to check if an object is a FileNodeWrapper.
function isFileNodeWrapper(node: FileNode | FileNodeWrapper): node is FileNodeWrapper {
    return typeof node === "object" && node !== null && "root" in node;
}

/**
 * Checks if a node at a given path exists in the saved file system.
 * Used for versioning/status (e.g., "committed" vs "uncommitted").
 * 
 * @param path - Absolute path to the node.
 * @param current - Current FileNode (not used here, but could be for metadata comparison).
 * @param savedRoot - The saved root FileNode or wrapper.
 * @returns "committed" if the node exists in savedRoot, "uncommitted" otherwise.
 */
export function getNodeStatus(
    path: string,
    current: FileNode,
    savedRoot: FileNode | null
): "committed" | "uncommitted" {
    if (!savedRoot) return "uncommitted";

    // Defensive: if savedRoot is actually a wrapper, use .root
    const root: FileNode = isFileNodeWrapper(savedRoot) ? savedRoot.root : savedRoot;

    const parts = path.split("/").filter(Boolean);
    let node: FileNode | undefined = root;
    let startIdx = 0;
    if (parts.length > 0 && parts[0] === root.name) {
        startIdx = 1;
    }

    for (let i = startIdx; i < parts.length; i++) {
        if (!node?.children || !node.children.has(parts[i])) return "uncommitted";
        node = node.children.get(parts[i]);
    }

    // Optionally, compare file metadata for modifications here

    return "committed";
}

/**
 * Deeply clones a FileNode (including all children).
 * Ensures independent copies for versioning/snapshots.
 * 
 * @param node - The FileNode to clone.
 * @returns A deep clone of the node.
 */
export function deepCloneNode(node: FileNode): FileNode {
    return {
        name: node.name,
        isFile: node.isFile,
        fileURL: node.fileURL,
        children: node.children
            ? new Map(
                Array.from(node.children.entries()).map(
                    ([key, child]) => [key, deepCloneNode(child)]
                )
            )
            : undefined,
    };
}
