import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const getDataFromToken = (request: NextRequest): string => {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            throw new Error("No token found");
        }

        // jwt.verify returns string | JwtPayload
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        // Type guard to ensure decoded is an object and has the required fields
        if (
            typeof decoded === "object" &&
            decoded !== null &&
            "id" in decoded
        ) {
            return decoded.id;
        } else {
            throw new Error("Invalid token payload");
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unknown error occurred");
        }
    }
};
