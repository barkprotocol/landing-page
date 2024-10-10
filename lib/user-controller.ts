import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new user
export const createUser = async (userData: {
  email: string;
  password: string;
  name?: string;
}) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password, // Normally, you'd hash the password first
        name: userData.name,
      },
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
};

// Get a user by ID
export const getUser = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
};

// Update a user by ID
export const updateUser = async (
  userId: string,
  updateData: { name?: string; email?: string; password?: string }
) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};

// Delete a user by ID
export const deleteUser = async (userId: string) => {
  try {
    const user = await prisma.user.delete({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};
