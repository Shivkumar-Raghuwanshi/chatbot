import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAnswer } from '@/lib/anthropic';

// POST handler to create a new question and generate an answer
export async function POST(request: NextRequest) {
  // Extract the question and userId from the request body
  const { question, userId } = await request.json();

  try {
    // Use Prisma client to find a unique user by their ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If no user is found, return a 404 error response
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate an answer for the question using the custom function
    const answer = await generateAnswer(question);

    // Create a new question in the database with the generated answer and associate it with the user
    const newQuestion = await prisma.question.create({
      data: {
        question,
        answer: answer || null, // Use the generated answer or null if no answer is returned
        user: {
          connect: {
            id: userId, // Connect the question to the user by their ID
          },
        },
      },
    });

    // Return the newly created question in the response with a 201 status code (Created)
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    // Log the error to the console for debugging
    console.error(error);

    // Return a 500 error response if there's an issue generating the answer or creating the question
    return NextResponse.json({ error: 'Error generating answer' }, { status: 500 });
  }
}
