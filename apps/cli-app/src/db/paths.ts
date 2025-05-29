import path from 'path';
import fs from 'fs';
import { homedir } from 'os';

/**
 * Get the database file path, ensuring the directory exists
 */
export function getDatabasePath() {
  // Use the user's home directory for persistent storage
  const userDataPath = path.join(homedir(), '.one-logger');
  const dbDir = path.join(userDataPath, 'database');
  console.log("db path is ", dbDir);
  
  // Ensure the directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  return path.join(dbDir, 'projects-database');
}