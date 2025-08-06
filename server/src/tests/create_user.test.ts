
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test inputs
const basicUserInput: CreateUserInput = {
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  role: 'user'
};

const developerInput: CreateUserInput = {
  email: 'dev@example.com',
  username: 'developer',
  full_name: 'App Developer',
  avatar_url: 'https://example.com/avatar.jpg',
  role: 'developer'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a basic user', async () => {
    const result = await createUser(basicUserInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.username).toEqual('testuser');
    expect(result.full_name).toEqual('Test User');
    expect(result.avatar_url).toBeNull();
    expect(result.role).toEqual('user');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a developer user with avatar', async () => {
    const result = await createUser(developerInput);

    // Developer-specific validation
    expect(result.email).toEqual('dev@example.com');
    expect(result.username).toEqual('developer');
    expect(result.full_name).toEqual('App Developer');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.role).toEqual('developer');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(basicUserInput);

    // Query database to verify persistence
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].username).toEqual('testuser');
    expect(users[0].full_name).toEqual('Test User');
    expect(users[0].role).toEqual('user');
    expect(users[0].avatar_url).toBeNull();
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle optional avatar_url field', async () => {
    const inputWithoutAvatar: CreateUserInput = {
      email: 'noavatar@example.com',
      username: 'noavatar',
      full_name: 'No Avatar User',
      role: 'user'
    };

    const result = await createUser(inputWithoutAvatar);

    expect(result.avatar_url).toBeNull();

    // Verify in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users[0].avatar_url).toBeNull();
  });

  it('should enforce unique email constraint', async () => {
    // Create first user
    await createUser(basicUserInput);

    // Try to create another user with same email
    const duplicateEmailInput: CreateUserInput = {
      email: 'test@example.com', // Same email
      username: 'differentuser',
      full_name: 'Different User',
      role: 'user'
    };

    await expect(createUser(duplicateEmailInput)).rejects.toThrow();
  });

  it('should enforce unique username constraint', async () => {
    // Create first user
    await createUser(basicUserInput);

    // Try to create another user with same username
    const duplicateUsernameInput: CreateUserInput = {
      email: 'different@example.com',
      username: 'testuser', // Same username
      full_name: 'Different User',
      role: 'user'
    };

    await expect(createUser(duplicateUsernameInput)).rejects.toThrow();
  });
});
