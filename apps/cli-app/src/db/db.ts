import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient ,ResultSet} from '@libsql/client';
import { getDatabasePath } from './paths';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

import { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import { ExtractTablesWithRelations } from 'drizzle-orm';



/**
 * Database class that handles initialization and provides access to the database
 */
class DatabaseClient {
  private client: ReturnType<typeof createClient> | null = null;
  private _drizzle: (ReturnType<typeof drizzle>)  | null = null;

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
      
      // Check if migrations have already been applied
      const migrationsPath = path.resolve(__dirname, 'migrations');
      console.log('Migrations path:', migrationsPath);
      
      try {
        // Check if __drizzle_migrations table exists and has entries
        const existingMigrations = await this.client.execute(
          'SELECT COUNT(*) as count FROM __drizzle_migrations'
        );
        const migrationCount = existingMigrations.rows[0]?.count as number;
        
        if (migrationCount > 0) {
          console.log(`Database already has ${migrationCount} migrations applied, skipping migration`);
        } else {
          console.log('No migrations found, applying migrations...');
          await migrate(this._drizzle, {
            migrationsFolder: migrationsPath,
          });
          console.log('Database migrations applied successfully');
          
          // Set default config values after initial migration
          await this.setDefaultConfigValues();
        }
      } catch (error) {
        // If __drizzle_migrations table doesn't exist, apply migrations
        console.log('Migrations table not found, applying migrations...');
        await migrate(this._drizzle, {
          migrationsFolder: migrationsPath,
        });
        console.log('Database migrations applied successfully');
        
        // Set default config values after initial migration
        await this.setDefaultConfigValues();
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
   * Set default configuration values after initial migration
   */
  private async setDefaultConfigValues() {
    if (!this._drizzle) {
      throw new Error('Database not initialized');
    }

    console.log('Setting default configuration values...');
    
    const defaultConfigs = [
      { key: 'server.enabled', value: 'true' },
      { key: 'server.port', value: '8947' },
      { key: 'server.corsOrigins', value: JSON.stringify(['http://localhost:9284', 'http://localhost:8947', 'http://localhost:8081', 'http://localhost:2345']) },
      { key: 'mcpServer.enabled', value: 'false' },
      { key: 'mcpServer.port', value: '3000' }
    ];

    try {
      for (const config of defaultConfigs) {
        await this._drizzle.insert(schema.config)
          .values({ key: config.key, value: config.value })
          .onConflictDoNothing(); // Only insert if key doesn't exist
      }
      console.log('Default configuration values set successfully');
    } catch (error) {
      console.error('Failed to set default configuration values:', error);
      throw error;
    }
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
export type Drizzle = Awaited<ReturnType<typeof db.getDrizzle>>;
export type Schema = typeof schema;
export type DrizzleTransaction = SQLiteTransaction<'async',ResultSet,Schema,ExtractTablesWithRelations<Schema>>;