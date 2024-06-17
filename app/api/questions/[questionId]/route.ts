
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler to retrieve a question by its ID
export async function GET(request: Request, { params }: { params: { questionId: string } }) {
  // Extract the questionId from the request parameters
  const { questionId } = params;

  try {
    // Use Prisma client to find a unique question by its ID
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) }, // Convert the questionId to an integer
    });

    // If no question is found, return a 404 error response
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // If a question is found, return it in the response
    return NextResponse.json(question);
  } catch (error) {
    // Log the error to the console for debugging
    console.error(error);

    // Return a 500 error response if there's an issue retrieving the question
    return NextResponse.json({ error: 'Error retrieving question' }, { status: 500 });
  }
}
