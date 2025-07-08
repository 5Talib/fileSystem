import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware to protect routes and redirect users based on authentication status
export async function middleware(request: NextRequest) {
    // Get the current path from the request URL
    const path = request.nextUrl.pathname;

    // Define which paths are public (accessible without authentication)
    const isPublicPath = path === "/login" || path === "/register" || path === "/";

    // Retrieve the authentication token from cookies (if present)
    const token = request.cookies.get("token")?.value || "";

    // If user is authenticated and tries to access login/register, redirect to /home
    if (((path === "/login" || path === "/register") || path === "/home") && token) {
        try {
            // Verify and decode the JWT token using jose's jwtVerify (Edge Runtime compatible)
            // - token: the JWT from cookies
            // - new TextEncoder().encode(process.env.JWT_SECRET!): your secret key as a Uint8Array
            // jwtVerify returns a promise that resolves to an object with the decoded payload
            const { payload } = await jwtVerify(
                token,
                new TextEncoder().encode(process.env.JWT_SECRET!)
            );

            // Check if the decoded payload is an object and contains a username
            // This ensures we have the necessary info to build the redirect URL
            if (typeof payload === "object" && payload.username) {
                // Redirect authenticated user to their personalized home page
                return NextResponse.redirect(new URL(`/home/${payload.username}`, request.url));
            } else {
                // If username is missing in the payload, redirect to a generic home page
                return NextResponse.redirect(new URL("/login", request.url));
            }
        } catch (err) {
            // If token is invalid or verification fails, let the request proceed or redirect to login
            console.log(err);
            // if(err instanceof Error){
            //     return NextResponse.redirect(new URL("/login", request.url));
            // }
            // return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // If user is not authenticated and tries to access protected routes, redirect to /login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Allow the request to proceed if no redirect is needed
    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        "/",               // Home page
        "/register",       // Registration page
        "/login",          // Login page
        "/home/:path*",    // All routes under /home (note the :path* for wildcard matching)
        "/version-history",
    ],
}
