import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { initializeOneLogger, logger, wrappedSpan, flushTraces, ConsoleTraceTransport } from './index'; // Adjust path as needed
import { ConsoleLoggerTransport } from './logger/transports/console';

describe('OneLogger Integration Test (Console Transports)', () => {
  let consoleSpies: {
    log: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
    group: ReturnType<typeof vi.spyOn>;
    groupCollapsed: ReturnType<typeof vi.spyOn>;
    groupEnd: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(async () => {
    // Spy on console methods
    consoleSpies = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
    };

    // Initialize OneLogger with console transports
    // We pass isDev: false to ensure ConsoleLoggerTransport is used by the logger
    // And explicitly pass ConsoleTraceTransport for the tracer
    await initializeOneLogger({
      name: 'test-project',
      description: 'Test project description',
      isDev: false, // This ensures ConsoleLoggerTransport for the logger
      tracer: {
        // batchSize: 1, // Flush traces quickly for testing
        // flushInterval: 10, // Flush traces quickly for testing
        // Forcing ConsoleTraceTransport for the tracer part
        // This is a bit of a workaround as initializeOneLogger doesn't directly allow
        // specifying tracer transport when isDev is false (it defaults to ConsoleTraceTransport anyway if no projectId)
        // To be absolutely sure, we'd ideally have a more direct way or mock logger.projectId to be undefined.
        // However, the current initializeOneLogger logic when isDev is false and useHttpTransport is not explicitly true
        // should result in ConsoleTraceTransport if logger.projectId is not set (which it won't be if isDev:false and no HTTP call happens)
    // For this test, we will rely on the fact that isDev:false for logger means console, and tracer will also use console.
      }
    });
    // Override tracer transport to be certain it's ConsoleTraceTransport for the test
    const { initializeTracing } = await import('./tracing'); 
    initializeTracing({
        transport: new ConsoleTraceTransport('[VITEST_TRACE]'),
        batchSize: 1, 
        flushInterval: 10
    });

    // Reset spies after initialization to ignore setup logs
    Object.values(consoleSpies).forEach(spy => spy.mockClear());
  });

  afterEach(() => {
    // Restore console spies
    Object.values(consoleSpies).forEach(spy => spy.mockRestore());
  });

  it('should initialize and log messages with all levels to console', async () => {
    logger.log('This is a generic log message', { data: 'log-data' });
    logger.info('This is an info message', { data: 'info-data' });
    logger.warn('This is a warning message', { data: 'warn-data' });
    logger.error('This is an error message', { data: 'error-data' });

    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for async log processing

    expect(consoleSpies.log).toHaveBeenCalledTimes(1);
    expect(consoleSpies.log).toHaveBeenCalledWith(expect.stringContaining('[LOG] This is a generic log message') && expect.stringContaining('data=log-data'));
    
    expect(consoleSpies.info).toHaveBeenCalledTimes(1);
    expect(consoleSpies.info).toHaveBeenCalledWith(expect.stringContaining('[INFO] This is an info message') && expect.stringContaining('data=info-data'));

    expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
    expect(consoleSpies.warn).toHaveBeenCalledWith(expect.stringContaining('[WARN] This is a warning message') && expect.stringContaining('data=warn-data'));

    expect(consoleSpies.error).toHaveBeenCalledTimes(1);
    expect(consoleSpies.error).toHaveBeenCalledWith(expect.stringContaining('[ERROR] This is an error message') && expect.stringContaining('data=error-data'));

  });

  it('should trace a wrapped function and output to console', async () => {
    const testOperation = wrappedSpan(
      'testOperationSpan',
      async (param: string) => {
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate async work
        return `Operation completed with ${param}`;
      },
      (param) => ({ inputParam: param, type: 'test' })
    );

    const result = await testOperation('test-input');
    expect(result).toBe('Operation completed with test-input');

    await flushTraces(); // Ensure traces are processed
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for traces to be processed and logged

    // Check for console.group calls (indicative of ConsoleTraceTransport)
    expect(consoleSpies.group).toHaveBeenCalledTimes(1); // Top-level trace group
    expect(consoleSpies.group).toHaveBeenCalledWith(
      expect.stringContaining('[VITEST_TRACE] Trace ')
    );

    expect(consoleSpies.groupCollapsed).toHaveBeenCalledTimes(1);
    expect(consoleSpies.groupCollapsed).toHaveBeenCalledWith('Detailed Span Information');

    // Check the console.log calls
    // First log call is the hierarchy
    expect(consoleSpies.log.mock.calls[0][0]).toEqual(
      expect.stringContaining('↳ testOperationSpan ✓')
    );
    expect(consoleSpies.log.mock.calls[0][0]).toEqual(
      expect.stringContaining('metadata: {"inputParam":"test-input","type":"test"}')
    );

    // Second log call is the detailed span information
    expect(consoleSpies.log.mock.calls[1][0]).toEqual(expect.stringContaining('Span: testOperationSpan'));
    expect(consoleSpies.log.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        duration: expect.any(String), // Duration is a string in the transport
        status: 'completed',
        metadata: { inputParam: 'test-input', type: 'test' },
        error: undefined,
      })
    );

    expect(consoleSpies.groupEnd).toHaveBeenCalledTimes(2); // For trace and detailed spans
  });
});