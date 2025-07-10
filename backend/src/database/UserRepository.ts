import crypto from 'crypto';
import { Database } from './Database';
import { User } from '../types';

export class UserRepository extends Database {
  async createUser(username: string): Promise<User> {
    const userId = crypto.randomUUID();
    await this.run(
      'INSERT INTO users (id, username) VALUES (?, ?)',
      [userId, username]
    );
    
    return {
      id: userId,
      username,
      createdAt: new Date()
    };
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const row = await this.get<any>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (!row) return null;
    
    return {
      id: row.id,
      username: row.username,
      createdAt: new Date(row.created_at)
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const row = await this.get<any>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (!row) return null;
    
    return {
      id: row.id,
      username: row.username,
      createdAt: new Date(row.created_at)
    };
  }
}