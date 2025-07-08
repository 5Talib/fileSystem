import { connect } from "@/dbConfig/dbConfig";
import FileSystemVersionModel from "@/models/fileSystemModel";
import { NextRequest, NextResponse } from "next/server";

connect();

/**
 * POST handler to save or update a user's file system version.
 * Expects JSON body with userId, fileSystem object, and optional message.
 * Saves the current file system state and appends a new version entry.
 */
export async function POST(request: NextRequest) {
    try {
        // Parse JSON body from the request
        const { userId, fileSystem, message } = await request.json();
        console.log({ userId, fileSystem, message });

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { error: "userId is missing" },
                { status: 400 }
            );
        }
        if (!fileSystem) {
            return NextResponse.json(
                { error: "File System is missing" },
                { status: 400 }
            );
        }

        // Create a new version object with timestamp and optional message
        const version = {
            fileSystem,
            timeStamp: new Date(),
            message: message || "",
        };

        // Find existing document for the user
        const doc = await FileSystemVersionModel.findOne({ userId });
        if (doc) {
            // Update current file system and append new version
            doc.current = {
                fileSystem,
                timeStamp: new Date(),
            };
            doc.versions.push(version);
            await doc.save();
        } else {
            // Create a new document if none exists
            await FileSystemVersionModel.create({
                userId,
                current: { fileSystem, timeStamp: new Date() },
                versions: [version],
            });
        }

        // Return success response with the document
        return NextResponse.json({
            message: "File system saved successfully",
            success: true,
            doc
        });
    } catch (error) {
        console.log(error);
        // Set a default error message
        let message = "An unexpected error occurred";

        // If error is an instance of Error, extract its message
        if (error instanceof Error) {
            message = error.message;
        }

        // Return an error response with status 500 and the error message
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
