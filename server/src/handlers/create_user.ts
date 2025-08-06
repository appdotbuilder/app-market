
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type User } from '../schema';

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        email: input.email,
        username: input.username,
        full_name: input.full_name,
        avatar_url: input.avatar_url || null,
        role: input.role
      })
      .returning()
      .execute();

    const user = result[0];
    return {
      ...user,
      avatar_url: user.avatar_url || null
    };
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
};
