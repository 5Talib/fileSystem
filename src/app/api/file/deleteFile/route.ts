import cloudinary from "@/lib/cloudinary"; // Cloudinary SDK instance for file operations
import { NextRequest, NextResponse } from "next/server"; // Next.js API types

/**
 * API Route: DELETE /api/file/delete?publicId=...
 * 
 * Deletes a file from Cloudinary if the user is authenticated and authorized.
 * 
 * Query Params:
 *   - publicId: string (required) - The Cloudinary public ID of the asset.
 * 
 * Returns:
 *   - { success: true } on success
 *   - { error: string } on error
 */
export async function DELETE(request: NextRequest) {
    try {
        // Parse the request URL to extract query parameters
        const { searchParams } = new URL(request.url);

        // Extract and validate the authentication token from cookies
        // Ensures only authenticated users can perform deletions
        const token = request.cookies.get("token")?.value || "";
        if (!token) {
            // If no token is present, respond with 401 Unauthorized
            return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
        }

        // Extract and validate the publicId parameter from the query string
        // publicId is required to identify the Cloudinary asset to delete
        const publicId = searchParams.get("publicId");
        if (!publicId) {
            // If publicId is missing, respond with 400 Bad Request
            return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
        }

        // Attempt to delete the file from Cloudinary
        // resource_type can be "raw", "image", or "video" depending on the asset type
        // invalidate: true ensures the asset is also removed from CDN cache
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw", // Change to "image" or "video" if needed
            invalidate: true,
        });

        // Check the result of the deletion operation
        if (result.result === "ok" || result.result === "not_found") {
            // Consider "not_found" as success (file already deleted)
            return NextResponse.json({ success: true });
        } else {
            // If deletion failed for other reasons, respond with 500 Internal Server Error
            return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
        }

    } catch (error) {
        // Log the error for debugging; avoid leaking sensitive details to the client
        console.log(error);
        let message = "An unexpected error occurred";
        if (error instanceof Error) {
            message = error.message;
        }
        console.error("Error in DELETE /api/file/delete:", error);
        // Respond with a generic error message and 500 Internal Server Error
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
