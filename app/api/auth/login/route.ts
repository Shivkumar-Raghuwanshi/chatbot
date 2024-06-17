import { NextResponse } from "next/server";
import { loginUser } from "@/lib/authService";

// POST handler for logging in a user
export async function POST(request: Request) {
  try {
    // Extract email and password from the request body
    const { email, password } = await request.json();
    
    // Call the loginUser function with the provided credentials
    const response = await loginUser(email, password);
    
    // Return the response from loginUser
    return response;
  } catch (error: any) {
    // If an error occurs, return a JSON response with the error message and a 401 status code
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// GET handler to prevent access via GET method
export async function GET() {
  // Return a JSON response indicating that the GET method is not allowed with a 405 status code
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
