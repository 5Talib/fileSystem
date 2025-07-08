import cloudinary from "@/lib/cloudinary"; // Cloudinary SDK instance for generating asset URLs
import { NextRequest, NextResponse } from "next/server"; // Next.js API types

/**
 * API Route: GET /api/file/url?publicId=...
 * 
 * Generates a public Cloudinary URL for a raw asset (e.g., PDF, ZIP, DOCX).
 * Requires a valid user token cookie for authentication.
 * 
 * Query Params:
 *   - publicId: string (required) - The Cloudinary public ID of the asset.
 * 
 * Returns:
 *   - { url: string } on success
 *   - { error: string } on error
 */
export async function GET(request: NextRequest) {
    try {
        // Parse query parameters from the request URL.
        const { searchParams } = new URL(request.url);

        // Extract user authentication token from cookies.
        // Ensures only authenticated users can access the asset URL.
        const token = request.cookies.get("token")?.value || "";

        // Authentication check: ensure user is logged in.
        if (!token) {
            // If no token is present, respond with 401 Unauthorized.
            return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
        }

        // Extract the publicId parameter from the query string.
        const publicId = searchParams.get("publicId");

        // Validate that publicId is provided.
        if (!publicId) {
            // If publicId is missing, respond with 400 Bad Request.
            return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
        }

        // TODO: Add authorization logic here.
        // Example: check in your DB/Trie if this user owns the file with this publicId.
        // This is important to ensure users can only access their own files.

        // Generate the Cloudinary URL for the raw asset.
        // resource_type: "raw" is used for non-image/video files (e.g., PDF, ZIP).
        // secure: true ensures the URL uses HTTPS.
        const url = cloudinary.url(publicId, {
            resource_type: "raw",
            secure: true,
        });

        // Return the generated URL to the client.
        return NextResponse.json({ success: true, url });

    } catch (error) {
        // Default error message for unexpected errors.
        let message = "An unexpected error occurred";

        // Extract and use the error message if available.
        if (error instanceof Error) {
            message = error.message;
        }

        // Log the error for server-side debugging (production best practice).
        console.error("Error in GET /api/file/url:", error);

        // Return error response with status 500 (Internal Server Error).
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
