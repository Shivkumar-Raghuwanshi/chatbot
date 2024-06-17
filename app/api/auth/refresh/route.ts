// Import necessary modules from Next.js, authService, and cookies-next
import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/authService";
import { getCookie } from "cookies-next";

// POST handler for refreshing an access token
export const POST = async (req: NextRequest) => {
  // Retrieve the refresh token from cookies
  const refreshToken = getCookie("refreshToken", { req });

  // If no refresh token is found, return an error response with a 401 status code
  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token provided" },
      { status: 401 }
    );
  }

  try {
    // Call the refreshAccessToken function with the refresh token
    const { accessToken } = await refreshAccessToken(refreshToken);

    // Prepare a response with a success message
    const response = NextResponse.json({
      message: "Access token refreshed successfully",
    });

    // Set the new access token in the response cookies with appropriate security settings
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true, // Cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Cookie is sent over HTTPS only in production
      sameSite: "strict", // Cookie is not sent with cross-site requests
      maxAge: 60 * 15, // Cookie expires after 15 minutes
      path: "/", // Cookie is available throughout the site
    });

    // Return the response with the new access token cookie set
    return response;
  } catch (error: any) {
    // If an error occurs during token refresh, return an error response with a 401 status code
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
};

// GET handler to prevent access via GET method
export const GET = async () => {
  // Return a JSON response indicating that the GET method is not allowed with a 405 status code
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
};
