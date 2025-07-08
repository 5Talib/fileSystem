import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/lib/getDataFromToken";
import FileSystemVersionModel from "@/models/fileSystemModel";
import { NextRequest, NextResponse } from "next/server";

// Ensure DB connection is established
connect();

type version = {
    fileSystem: object;
    message: string;
    timestamp: string;
    _id: string;
};

/**
 * API Endpoint: Set a specific version as the current version for the user.
 * Request body: { versionId: string }
 */
export async function POST(request: NextRequest) {
    try {
        // Parse versionId from the request body
        const { versionId } = await request.json();

        // Extract user ID from the authentication token in the request
        const userId = await getDataFromToken(request);

        // If user ID is not found (invalid or expired token), return 400 Bad Request
        if (!userId) {
            return NextResponse.json(
                { error: "User Not Found" },
                { status: 400 }
            );
        }

        // Fetch the user's file system document from the database
        const fileSystem = await FileSystemVersionModel.findOne({ userId });

        // If no file system is found for the user, return 404 Not Found
        if (!fileSystem) {
            return NextResponse.json(
                { error: "File system not found" },
                { status: 404 }
            );
        }

        // Find the version object in the versions array that matches the given versionId
        const matchedVersion = fileSystem.versions.find(
            (v: version) => v._id.toString() === versionId
        );

        // If the version is not found, return 404 Not Found
        if (!matchedVersion) {
            return NextResponse.json(
                { error: "Version not found" },
                { status: 404 }
            );
        }

        // Set the matched version as the current version
        fileSystem.current = matchedVersion;

        // Save the updated document to the database
        await fileSystem.save();

        // Return success response with the new current version
        return NextResponse.json({
            success: true,
            current: matchedVersion,
        });
    } catch (error) {
        // Handle unexpected errors and return a 500 Internal Server Error
        let message = "An unexpected error occurred";
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
