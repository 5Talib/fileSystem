import { connect } from "@/dbConfig/dbConfig"; // MongoDB connection helper
import User from "@/models/userModel";         // Mongoose User model
import { NextRequest, NextResponse } from "next/server"; // Next.js API types
import bcrypt, { genSalt } from "bcryptjs";    // For password hashing
import jwt from "jsonwebtoken";

// Establish a connection to the database before handling requests.
// Ensures all database operations have an active connection.
connect();

/**
 * Handles user registration via POST request.
 * Expects JSON body: { username, email, password }
 */
export async function POST(request: NextRequest) {
    try {
        // Parse and destructure the request body from the incoming request.
        // Expects: { username: string, email: string, password: string }
        const reqBody = await request.json();
        const { username, email, password } = reqBody;

        // Check if a user already exists with the given username.
        // Prevents duplicate accounts with the same username.
        const user = await User.findOne({ username });
        if (user) {
            // If user exists, return a 400 Bad Request with a clear error message.
            return NextResponse.json(
                { error: "Username already exists" },
                { status: 400 }
            );
        }

        // Generate a cryptographic salt and hash the password securely.
        // Using a salt increases security against rainbow table attacks.
        const salt = await genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user document with the hashed password.
        // Never store plain text passwords in the database.
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // Save the new user to the database.
        // Returns the saved user document.
        const savedUser = await newUser.save();

        // Prepare a response with the saved user data (excluding sensitive info).
        const response = NextResponse.json({
            message: "User created successfully",
            success: true,
            savedUser,
        });

        // Prepare data to embed in the JWT.
        // Only include non-sensitive user information.
        const tokenData = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
        };

        // Sign a new JWT with the user's data.
        // The secret key is loaded from environment variables.
        // Token expires in 1 day.
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: "1d" });

        // Set the JWT as an HTTP-only cookie to enhance security.
        // The cookie cannot be accessed via client-side JavaScript.
        response.cookies.set("token", token, {
            httpOnly: true,       // Prevents client-side JS from accessing the cookie
            maxAge: 60 * 60 * 24, // Cookie expires in 1 day (in seconds)
        });

        // Return the response with the token cookie set.
        return response;

    } catch (error) {
        // Catch and handle any unexpected errors.
        // Ensure that sensitive error details are not leaked to the client.
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
