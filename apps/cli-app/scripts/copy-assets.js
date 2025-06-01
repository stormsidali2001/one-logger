#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Cross-platform file and directory copying utility
 */
class FileCopier {
  /**
   * Recursively copy a directory
   * @param {string} src - Source directory
   * @param {string} dest - Destination directory
   */
  static copyDir(src, dest) {
    try {
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      // Read source directory
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          // Recursively copy subdirectory
          this.copyDir(srcPath, destPath);
        } else {
          // Copy file
          fs.copyFileSync(srcPath, destPath);
        }
      }

      console.log(`✓ Copied ${src} to ${dest}`);
    } catch (error) {
      console.warn(`⚠ Failed to copy ${src}: ${error.message}`);
    }
  }

  /**
   * Copy web assets from vite-web-server
   */
  static copyWebAssets() {
    const webSrcDir = path.resolve(__dirname, '../../vite-web-server/dist');
    const webDestDir = path.resolve(__dirname, '../dist/web');

    if (fs.existsSync(webSrcDir)) {
      // Ensure destination directory exists
      if (!fs.existsSync(webDestDir)) {
        fs.mkdirSync(webDestDir, { recursive: true });
      }

      this.copyDir(webSrcDir, webDestDir);
    } else {
      console.warn('⚠ Web build not found, skipping web assets copy');
    }
  }

  /**
   * Copy database migrations
   */
  static copyMigrations() {
    const migrationsSrcDir = path.resolve(__dirname, '../src/db/migrations');
    const migrationsDestDir = path.resolve(__dirname, '../dist/db/migrations');

    if (fs.existsSync(migrationsSrcDir)) {
      // Ensure destination directory exists
      const dbDestDir = path.resolve(__dirname, '../dist/db');
      if (!fs.existsSync(dbDestDir)) {
        fs.mkdirSync(dbDestDir, { recursive: true });
      }

      this.copyDir(migrationsSrcDir, migrationsDestDir);
    } else {
      console.warn('⚠ Migrations not found, skipping migrations copy');
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'web':
    console.log('📦 Copying web assets...');
    FileCopier.copyWebAssets();
    break;
  
  case 'migrations':
    console.log('📦 Copying database migrations...');
    FileCopier.copyMigrations();
    break;
  
  case 'all':
    console.log('📦 Copying all assets...');
    FileCopier.copyWebAssets();
    FileCopier.copyMigrations();
    break;
  
  default:
    console.log('Usage: node copy-assets.js [web|migrations|all]');
    console.log('  web        - Copy web assets from vite-web-server');
    console.log('  migrations - Copy database migrations');
    console.log('  all        - Copy both web assets and migrations');
    process.exit(1);
}

console.log('✅ Asset copying completed');