import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { getDatabasePath } from './paths';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/libsql/migrator';
import fs from 'fs';
import path from 'path';


/**
 * Database class that handles initialization and provides access to the database
 */
class DatabaseClient {
  private client: ReturnType<typeof createClient> | null = null;
  private _drizzle: ReturnType<typeof drizzle> | null = null;

  /**
   * Initialize the database connection
   */
  async init() {
    if (this.client) {
      return;
    }

    try {
      const dbPath = getDatabasePath();
      console.log(`Initializing database at: ${dbPath}`);
      
      // Create database directory if it doesn't exist
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Use file protocol for local libsql database
      this.client = createClient({
        url: `file:${dbPath}`,
      });
      
      // Create Drizzle instance
      this._drizzle = drizzle(this.client, { schema });
      
      // Apply migrations if available
      const migrationsFolder = path.join(__dirname, 'migrations');
      if (fs.existsSync(migrationsFolder)) {
        console.log('Applying migrations...');
        try {
          await migrate(this._drizzle, { migrationsFolder });
          console.log('Migrations applied successfully');
        } catch (error) {
          console.error('Migration failed:', error);
          throw error;
        }
      } else {
        console.log('No migrations folder found, skipping migration');
      }
      
      // Enable foreign keys
      await this.client.execute('PRAGMA foreign_keys = ON;');
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error; 
    }
  }

  /**
   * Get the Drizzle ORM instance
   */
  get drizzle() {
    if (!this._drizzle) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this._drizzle;
  }

  /**
   * Initialize the database and return the drizzle instance
   * This is useful for ensuring the database is initialized before using it
   */
  async getDrizzle() {
    if (!this._drizzle) {
      await this.init();
    }
    return this._drizzle!;
  }

  /**
   * Get the underlying libsql client
   */
  getClient() {
    if (!this.client) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.client;
  }

  /**
   * Close the database connection
   */
  async close() {
    if (this.client) {
      // No specific close method needed for libsql client
      this.client = null;
      this._drizzle = null;
      console.log('Database connection closed');
    }
  }
}

// Create a singleton instance
export const db = new DatabaseClient();