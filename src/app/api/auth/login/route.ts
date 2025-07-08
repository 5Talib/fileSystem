import { connect } from "@/dbConfig/dbConfig"; // Database connection utility
import User from "@/models/userModel"; // Mongoose User model
import bcrypt from "bcryptjs"; // Library for password hashing and comparison
import jwt from 'jsonwebtoken'; // Library for creating and verifying JWTs
import { NextRequest, NextResponse } from "next/server"; // Next.js API types

// Establish a database connection as soon as the module is imported.
// Ensures all subsequent DB operations have an active connection.
connect();

/**
 * Handles user login requests.
 * Expects a POST request with JSON body containing 'username' and 'password'.
 * Returns a JWT in an HTTP-only cookie if authentication is successful.
 */
export async function POST(request: NextRequest) {
    try {
        // Parse and destructure the JSON body from the incoming request.
        // Expects: { username: string, password: string }
        const { username, password } = await request.json();

        // Attempt to find a user in the database matching the provided username.
        const user = await User.findOne({ username });
        if (!user) {
            // User not found: return 400 Bad Request with a clear error message.
            return NextResponse.json(
                { error: "User doesn't exist, please register" },
                { status: 400 }
            );
        }

        // Compare the provided password with the stored hashed password.
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            // Password mismatch: return 400 Bad Request with a clear error message.
            return NextResponse.json(
                { error: "Incorrect password" },
                { status: 400 }
            );
        }

        // Prepare data to embed in the JWT.
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email,
        };

        // Sign a new JWT with the user's data.
        // The secret key is loaded from environment variables.
        // Token expires in 1 day.
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: "1d" });

        // Create a successful response payload.
        const response = NextResponse.json({
            message: "Login Successfull",
            success: true,
        });

        // Set the JWT as an HTTP-only cookie to enhance security.
        // The cookie cannot be accessed via client-side JavaScript.
        response.cookies.set("token", token, {
            httpOnly: true,    // Prevents client-side JS from accessing the cookie
            maxAge: 60 * 60 * 24, // Cookie expires in 1 day (seconds)
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
