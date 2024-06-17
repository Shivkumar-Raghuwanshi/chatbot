
import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/authService";

// POST handler for user registration
export const POST = async (req: NextRequest) => {
  // Extract the username, email, and password from the request body
  const { username, email, password } = await req.json();

  try {
    // Call the registerUser function with the provided credentials
    const user = await registerUser(username, email, password);

    // If registration is successful, return a success message with a 201 status code (Created)
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    // If an error occurs during registration, return an error response with a 500 status code
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
};
