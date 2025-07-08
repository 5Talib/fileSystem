import cloudinary from "@/lib/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: POST /api/file/upload
 * 
 * Uploads a file to Cloudinary as a public raw asset (e.g., PDF, ZIP, DOCX).
 * Requires a valid user token cookie for authentication.
 * 
 * Expects multipart/form-data with:
 *   - file: File (required)
 *   - path: string (required, folder path in your app)
 *   - userId: string (required, user identifier)
 * 
 * Returns:
 *   - { publicId: string } on success
 *   - { error: string } on error
 */
export async function POST(request: NextRequest) {
    try {
        // Parse form data from the request
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const path = formData.get("path") as string;
        const userId = formData.get("userId") as string;

        // Validate required fields
        if (!file || !path || !userId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Extract the authentication token from cookies
        const token = request.cookies.get("token")?.value || "";
        if (!token) {
            return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
        }

        // File size check (50MB = 50 * 1024 * 1024 bytes)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size exceeds 50MB limit." },
                { status: 413 }
            );
        }

        // Convert the file to a buffer for Cloudinary upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload the file to Cloudinary as a public raw asset
        const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",           // For PDFs, ZIPs, DOCX, etc.
                    type: "upload",                 // Explicitly public (not authenticated)
                    folder: `user_${userId}`,       // Organize by user
                    filename_override: file.name,   // Keep original filename and extension
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result as UploadApiResponse);
                }
            ).end(buffer);
        });

        // Get the Cloudinary publicId for the uploaded file
        const publicId = uploadResult.public_id;

        // Return the publicId to the client (save this in your DB/Trie)
        return NextResponse.json({ success: true, publicId });

    } catch (error) {
        // Default error message
        let message = "An unexpected error occurred";
        if (error instanceof Error) {
            message = error.message;
        }

        // Log the error for server-side debugging
        console.error("Error in POST /api/file/upload:", error);

        // Return error response with status 500 (Internal Server Error)
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
