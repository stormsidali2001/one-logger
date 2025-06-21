import { OneLoggerSDK } from '@notjustcoders/one-logger-server-sdk';

// Initialize the One Logger SDK with the CLI server URL
const API_BASE_URL = 'http://localhost:8947'; // This should match the CLI server port

export const sdk = new OneLoggerSDK({
  baseUrl: API_BASE_URL,
});