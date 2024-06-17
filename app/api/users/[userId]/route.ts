
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler to retrieve a user by their ID
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  // Extract the userId from the request parameters
  const { userId } = params;

  try {
    // Use Prisma client to find a unique user by their ID and select only username and email fields
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }, // Convert the userId to an integer
      select:{
        username:true, // Select the username field
        email:true     // Select the email field
      }
    });

    // If no user is found, return a 404 error response
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If a user is found, return their information in the response
    return NextResponse.json(user);
  } catch (error) {
    // Log the error to the console for debugging
    console.error(error);

    // Return a 500 error response if there's an issue retrieving the user
    return NextResponse.json({ error: 'Error retrieving user' }, { status: 500 });
  }
}
