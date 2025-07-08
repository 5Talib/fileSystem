import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/lib/getDataFromToken";
import FileSystemVersionModel from "@/models/fileSystemModel";
import { NextRequest, NextResponse } from "next/server";

connect();

/**
 * GET handler to retrieve a user's file system version document.
 * Expects a valid authentication token to identify the user.
 * Returns the file system document if found, or appropriate error messages.
 */
export async function GET(request: NextRequest) {
    try {
        // Extract user ID from the authentication token in the request.
        const userId = await getDataFromToken(request);
        console.log(userId); // For debugging; remove or replace with proper logging in production.

        // Validate that userId is provided.
        if (!userId) {
            return NextResponse.json(
                { error: "userId is missing" },
                { status: 400 }
            );
        }

        // Query the database for the file system document associated with the userId.
        const doc = await FileSystemVersionModel.findOne({ userId });

        // If no document is found, return an error response.
        if (!doc) {
            return NextResponse.json(
                { error: "No File System Exists" },
                { status: 400 }
            );
        }

        // Return success response with the file system document.
        return NextResponse.json({
            message: "File System found successfully",
            success: true,
            doc,
        });
    } catch (error) {
        // Default error message for unexpected errors.
        let message = "An unexpected error occurred";

        // If error is an instance of Error, extract its message.
        if (error instanceof Error) {
            message = error.message;
        }

        // Return error response with status 500.
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
