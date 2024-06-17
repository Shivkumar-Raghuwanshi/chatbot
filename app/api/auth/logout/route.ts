// Import necessary modules from Next.js, authService, and cookies-next
import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/authService";
import { getCookie } from "cookies-next";

// POST handler for logging out a user
export const POST = async (req: NextRequest, res: NextResponse) => {
  // Retrieve the refresh token from cookies
  const refreshToken = getCookie("refreshToken", { req });

  // If no refresh token is found, return an error response with a 401 status code
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token provided" }, { status: 401 });
  }

  try {
    // Call the logoutUser function with the refresh token
    await logoutUser(refreshToken);

    // If logout is successful, return a success message
    return NextResponse.json({ message: "Logout successful" });
  } catch (error) {
    // If an error occurs during logout, return an error response with a 401 status code
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
};
