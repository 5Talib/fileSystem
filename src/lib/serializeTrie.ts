import { FileNode } from "@/lib/FileSystemTrie";

/**
 * SerializableFileNode:
 * A plain object representation of FileNode,
 * where `children` is a plain object (not a Map) or undefined.
 * This allows for JSON serialization and storage in e.g. MongoDB.
 */
export type SerializableFileNode = Omit<FileNode, "children"> & {
    children?: { [key: string]: SerializableFileNode }
};

/**
 * Recursively serializes a FileNode (with Map-based children) into a plain JS object.
 * This makes it suitable for JSON.stringify, storage in MongoDB, or transmission over the network.
 * Converts Map children to plain objects for compatibility.
 */
export function serializeNode(node: FileNode): SerializableFileNode {
    return {
        ...node,
        // Convert the children Map to a plain object (recursively)
        children: node.children
            ? Object.fromEntries(
                Array.from(node.children.entries()).map(
                    ([k, v]) => [k, serializeNode(v)] // Recursively serialize each child node
                )
            )
            : undefined, // If no children, keep as undefined
    };
}

/**
 * Recursively deserializes a plain JS object into a FileNode with Map-based children.
 * This restores the original Trie structure after loading from JSON or the database.
 * Converts plain object children back to Map for efficient operations.
 */
export function deserializeNode(obj: SerializableFileNode): FileNode {
    return {
        ...obj,
        // Convert the children plain object back to a Map (recursively)
        children: obj.children
            ? new Map(
                Object.entries(obj.children).map(
                    ([k, v]) => [k, deserializeNode(v)] // Recursively deserialize each child node
                )
            )
            : undefined, // If no children, keep as undefined
    };
}
