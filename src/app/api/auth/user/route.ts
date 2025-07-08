import { connect } from "@/dbConfig/dbConfig"; // MongoDB connection helper
import { getDataFromToken } from "@/lib/getDataFromToken"; // Utility to extract user ID from JWT token in cookies
import User from "@/models/userModel"; // Mongoose User model
import { NextRequest, NextResponse } from "next/server"; // Next.js API types

// Establish a database connection as soon as the module loads.
// Ensures all subsequent DB operations have an active connection.
connect();

/**
 * Handles GET requests to fetch the authenticated user's profile.
 * Expects a valid JWT token in the request cookies.
 */
export async function GET(request: NextRequest) {
    try {
        // Extract user ID from JWT token stored in cookies.
        // Returns null/undefined if token is missing or invalid.
        const userId = await getDataFromToken(request);

        console.log(userId); // For debugging; remove or replace with proper logging in production.

        // If token is missing or invalid, respond with 400 Bad Request.
        if (!userId) {
            return NextResponse.json(
                { error: "Please Login to continue" },
                { status: 400 }
            );
        }

        // Query the database for the user by ID, excluding the password field for security.
        const user = await User.findOne({ _id: userId }).select("-password");

        // Return a success response with user data (excluding sensitive fields).
        return NextResponse.json({
            message: "User Found",
            user
        });
    } catch (error: unknown) {
        // Handle known and unknown errors gracefully.
        if (error instanceof Error) {
            // Handle JWT expiration errors with a specific message and status.
            if (
                error.message === "JWT_EXPIRED" ||
                error.message === "jwt expired" ||
                error.name === "TokenExpiredError"
            ) {
                return NextResponse.json(
                    { error: "Session expired. Please login again." },
                    { status: 401 }
                );
            }

            // Handle other known errors with their message.
            return NextResponse.json(
                { error: error.message || "An unexpected error occurred" },
                { status: 500 }
            );
        }

        // Handle unknown error types (not an Error instance).
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
