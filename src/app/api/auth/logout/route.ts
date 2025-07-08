import { NextResponse } from "next/server";

/**
 * Handles user logout requests.
 * This function removes the authentication token by setting the cookie
 * with an expired date, effectively logging the user out.
 */
export async function POST() {
  // Create a response indicating a successful logout
  const response = NextResponse.json({ success: true, message: "Logged out" });

  // Remove the authentication token by setting the cookie with:
  // - An empty value
  // - httpOnly for security (prevents JS access)
  // - maxAge: 0 to expire the cookie immediately
  // - path: "/" to ensure the cookie is removed for the entire site
  response.cookies.set("token", "", {
    httpOnly: true,
    maxAge: 0, // Expire immediately
    path: "/",
  });

  // Return the response to the client
  return response;
}
