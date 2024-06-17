
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler to retrieve all questions associated with a specific user by their ID
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  // Extract the userId from the request parameters
  const { userId } = params;
  // Parse the userId to an integer
  const parsedUserId = parseInt(userId);

  // Check if the parsed userId is not a number and return an error response if so
  if (isNaN(parsedUserId)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  try {
    // Use Prisma client to find a unique user by their ID and include their associated questions
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      include: {
        questions: true, // Include the questions associated with the user
      },
    });

    // If no user is found, return a 404 error response
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If the user has no questions, return a message indicating so
    if (user.questions.length === 0) {
      return NextResponse.json({ message: 'No questions found for this user' }, { status: 404 });
    }

    // If questions are found, return them in the response
    return NextResponse.json(user.questions);
  } catch (error) {
    // Log the error to the console for debugging
    console.error(error);

    // Return a 500 error response if there's an issue retrieving the questions
    return NextResponse.json({ error: 'Error retrieving questions' }, { status: 500 });
  }
}
