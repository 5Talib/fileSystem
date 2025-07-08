import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/lib/getDataFromToken";
import FileSystemVersionModel from "@/models/fileSystemModel";
import { NextRequest, NextResponse } from "next/server";

connect();

/**
 * API Handler: GET /api/filesystem/versions
 * 
 * Fetches all file system versions for the authenticated user.
 * 
 * Authentication:
 *   - Requires a valid authentication token (JWT) in the request.
 * 
 * Returns:
 *   - { success: true, versions: [...] } on success
 *   - { error: string } on error
 */
export async function GET(request: NextRequest) {
    try {
        // Extract user ID from the authentication token in the request.
        const userId = await getDataFromToken(request);

        // If user ID is not found (invalid or expired token), return 400 Bad Request.
        if (!userId) {
            return NextResponse.json(
                { error: "User Not Found" },
                { status: 400 }
            );
        }

        // Fetch the user's file system document from the database.
        const fileSystem = await FileSystemVersionModel.findOne({ userId });

        // Defensive: If no file system or versions exist, return an empty array.
        if (!fileSystem || !fileSystem.versions) {
            return NextResponse.json({
                success: true,
                versions: [],
            });
        }

        // Create a reversed copy of the versions array (latest version first).
        // .slice() creates a shallow copy to avoid mutating the original array.
        const versions = fileSystem.versions.slice().reverse();

        // Return the versions in the response, with a success flag.
        return NextResponse.json({
            success: true,
            versions,
        });
    } catch (error) {
        // Default error message for unexpected errors.
        let message = "An unexpected error occurred";

        // If the error is a standard Error object, use its message.
        if (error instanceof Error) {
            message = error.message;
        }

        // Return a 500 Internal Server Error with the error message.
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
