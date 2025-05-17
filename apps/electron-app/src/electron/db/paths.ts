import { app } from 'electron';
import path from 'path';
import fs from 'fs';

/**
 * Get the database file path, ensuring the directory exists
 */
export function getDatabasePath() {
  // Use the user data directory for persistent storage
  const userDataPath = app.getPath('userData');
  const dbDir = path.join(userDataPath, 'database');
  
  // Ensure the directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  return path.join(dbDir, 'life-os.db');
} 