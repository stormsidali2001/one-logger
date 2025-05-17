import { describe, it, expect, afterAll } from 'vitest';
import { initializeLogger } from '../initialize';
import { ProjectClient } from '../projectClient';

const BASE_URL = 'http://127.0.0.1:5173';

function uniqueProjectName() {
  return `logger-integration-test-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Logger integration with Electron Hono server', () => {
  let projectId: string;
  const name = uniqueProjectName();
  const description = 'Integration test project';
  const projectClient = new ProjectClient(BASE_URL);

  afterAll(async () => {
    if (projectId) {
      await projectClient.delete(projectId);
    }
  });

  it('should create a new project if it does not exist', async () => {
    const logger = await initializeLogger({ name, description, endpoint: BASE_URL });
    // The logger should have a valid projectId
    // @ts-expect-error: accessing private field for test
    projectId = logger.projectId;
    expect(typeof projectId).toBe('string');
    expect(projectId.length).toBeGreaterThan(0);
  });

  it('should return the same projectId if the project already exists', async () => {
    const logger2 = await initializeLogger({ name, description, endpoint: BASE_URL });
    // @ts-expect-error: accessing private field for test
    const projectId2 = logger2.projectId;
    expect(projectId2).toBe(projectId);
  });

  it('should send a log and retrieve it from the server', async () => {
    const logger = await initializeLogger({ name, description, endpoint: BASE_URL });
    const testMessage = 'Integration test log message';
    const testMeta = { foo: 'bar', integration: true };
    await logger.info(testMessage, testMeta);
    // Wait for the log to be processed
    await new Promise(res => setTimeout(res, 200));
    // Fetch logs for this project
    const logs = await projectClient.getLogs(projectId);
    // Find the log we just sent
    const found = logs.find(l => l.message === testMessage && l.level === 'info');
    expect(found).toBeDefined();
    expect(found?.projectId).toBe(projectId);
    expect(found?.meta).toMatchObject(testMeta);
  });
}); 