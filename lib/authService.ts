// Import necessary modules
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Define JWT secret and expiration times
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';

// Function to generate a token (access or refresh) and store it in the database if it's a refresh token
const generateToken = async (userId: number, expiresIn: string, isRefreshToken: boolean) => {
  const payload = { userId };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

  if (isRefreshToken) {
    // Store the refresh token in the database
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
      },
    });
  } else {
    // Store the access token in the database
    await prisma.accessToken.create({
      data: {
        userId,
        token,
      },
    });
  }

  return token;
};

// Function to register a new user with hashed password and store in the database
export const registerUser = async (username: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });
  return user;
};

// Function to log in a user, validate credentials, and generate tokens
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate access and refresh tokens for the user
  const accessToken = await generateToken(user.id, JWT_ACCESS_TOKEN_EXPIRES_IN, false);
  const refreshToken = await generateToken(user.id, JWT_REFRESH_TOKEN_EXPIRES_IN, true);

  // Create a new NextResponse instance with login success message and tokens
  const response = NextResponse.json({ message: 'Login successful', accessToken, refreshToken }, { status: 201 });

  // Set cookies for access and refresh tokens with appropriate security settings
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 15, // Access token expires in 15 minutes
    path: '/',
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // Refresh token expires in 7 days
    path: '/',
  });

  return response;
};

// Function to log out a user by deleting their refresh token from the database
export const logoutUser = async (refreshToken: string) => {
  try {
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Function to refresh an access token using a valid refresh token
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const tokenData = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenData) {
      throw new Error('Invalid refresh token');
    }

    // Generate a new access token using the userId from the refresh token data
    const { userId } = tokenData;
    const accessToken = await generateToken(userId, JWT_ACCESS_TOKEN_EXPIRES_IN, false);

    return { accessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Function to verify an access token and retrieve associated user data
export const verifyToken = async (token: string) => {
  try {
    // Decode the JWT and extract userId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Fetch user data from the database using userId
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
  } catch (error) {
    throw new Error('Invalid access token');
  }
}