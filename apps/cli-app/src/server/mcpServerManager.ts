import express from 'express';
import type { Request, Response } from 'express';
import * as http from 'node:http';
import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import { ConfigRepository } from '../repositories/configRepository.js';
import { ServerLogger } from './serverLogger.js';


export class MCPServerManager {
  private serverInstance: http.Server | null = null;
  private mcpServer: McpServer | null = null;
  // Maintain separate transport maps for each type
  private transports = {
    streamable: {} as Record<string, StreamableHTTPServerTransport>,
    sse: {} as Record<string, SSEServerTransport>
  };
  // Store registered handlers for health endpoint
  private handlers: Record<string, (...args: any[]) => Promise<any>> = {};

  constructor(
    private configRepo: ConfigRepository,
    private serverLogger: ServerLogger
  ) { }


  // Start the server
  public async startServer(): Promise<void> {
    try {
      // Dynamic imports for modularity
      this.serverLogger.log('ConfigRepository imported successfully');

      if (this.serverInstance) {
        this.serverLogger.log('MCP Server is already running.');
        return;
      }

      const enabledConfig = await (this.configRepo as { getValue: (key: string) => Promise<string | null> }).getValue('mcpServer.enabled');
      const isEnabled = enabledConfig === 'true';
      if (!isEnabled) {
        this.serverLogger.log('MCP Server is disabled in settings, not starting');
        return;
      }

      const portConfig = await (this.configRepo as { getValue: (key: string) => Promise<string | null> }).getValue('mcpServer.port');
      const port = portConfig ? parseInt(portConfig, 10) : 3000;

      // Import MCP server and transport types
      const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
      const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
      const { SSEServerTransport } = await import('@modelcontextprotocol/sdk/server/sse.js');
      const { isInitializeRequest } = await import('@modelcontextprotocol/sdk/types.js');

      this.mcpServer = new McpServer({
        name: 'one-logger-mcp-server',
        version: '1.0.0',
      });

      await this.registerTools();

      const app = express();
      app.use(express.json());

      // Health check endpoint
      app.get('/health', (_, res) => {
        const toolCount = Object.keys(this.handlers).length;
        res.json({
          status: 'healthy',
          tools: toolCount,
          tool_names: Object.keys(this.handlers),
          transports: {
            sse: Object.keys(this.transports.sse).length,
            streamable: Object.keys(this.transports.streamable).length
          }
        });
      });

      // Modern endpoint - Streamable HTTP transport
      app.all('/mcp', async (req: Request, res: Response) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport = sessionId ? this.transports.streamable[sessionId] : undefined;

        if (req.method === 'POST') {
          if (sessionId && transport) {
            // Reuse existing transport
          } else if (!sessionId && isInitializeRequest(req.body)) {
            // New session
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: (id: string) => {
                this.transports.streamable[id] = transport!;
                this.serverLogger.log(`Streamable HTTP session initialized: ${id}`);
              }
            });
            (transport as StreamableHTTPServerTransport).onclose = () => {
              if (transport && 'sessionId' in transport && transport.sessionId) {
                delete this.transports.streamable[transport.sessionId];
                this.serverLogger.log(`Streamable HTTP session closed: ${transport.sessionId}`);
              }
            };
            await this.mcpServer!.connect(transport);
          } else {
            res.status(400).json({
              jsonrpc: '2.0',
              error: { code: -32000, message: 'Bad Request: No valid session ID provided' },
              id: null,
            });
            return;
          }
          await transport!.handleRequest(req, res, req.body);
        } else if (req.method === 'GET' || req.method === 'DELETE') {
          if (!sessionId || !transport) {
            res.status(400).send('Invalid or missing session ID');
            return;
          }
          await transport.handleRequest(req, res);
        } else {
          res.status(405).send('Method Not Allowed');
        }
      });

      // Legacy endpoint for SSE connections (for Cursor)
      app.get('/sse', async (_req: Request, res: Response) => {
        // Set explicit SSE headers at the very top before any other logic
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        if (typeof res.flushHeaders === 'function') res.flushHeaders();
        try {
          // Create new SSE transport for this connection
          const transport = new SSEServerTransport('/messages', res);
          const sessionId = transport.sessionId;

          this.serverLogger.log(`New SSE connection established with session ID: ${sessionId}`);
          this.transports.sse[sessionId] = transport;

          // Remove transport when connection is closed
          res.on('close', () => {
            this.serverLogger.log(`SSE connection closed: ${sessionId}`);
            delete this.transports.sse[sessionId];
          });

          // Connect the transport to the MCP server
          await this.mcpServer!.connect(transport);
        } catch (error) {
          this.serverLogger.error('Error establishing SSE connection:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
          }
        }
      });

      // Legacy endpoint for message posting (for Cursor)
      app.post('/messages', async (req: Request, res: Response) => {
        try {
          // Get session ID from query parameter (not headers like in Streamable HTTP)
          const sessionId = req.query.sessionId as string;

          if (!sessionId || !this.transports.sse[sessionId]) {
            this.serverLogger.error(`Invalid session ID: ${sessionId}`);
            res.status(400).send({ message: 'Invalid session ID' });
            return;
          }

          const transport = this.transports.sse[sessionId];
          await transport.handlePostMessage(req, res, req.body);
        } catch (error) {
          this.serverLogger.error('Error handling message:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
          }
        }
      });

      this.serverInstance = http.createServer(app).listen(port);
      this.serverLogger.log(`MCP server running with dual transport support:`);
      this.serverLogger.log(`- Modern clients: http://localhost:${port}/mcp`);
      this.serverLogger.log(`- Legacy clients (Cursor): http://localhost:${port}/sse`);
      this.serverLogger.log(`- Health check: http://localhost:${port}/health`);
    } catch (error) {
      this.serverLogger.error('Failed to start MCP server:', error);
    }
  }

  // Register tools that expose our API endpoints
  private async registerTools(): Promise<void> {
    if (!this.mcpServer) return;

    try {
      const { ProjectRepository } = await import('../repositories/projectRepository.js');
      const { LogRepository } = await import('../repositories/logRepository.js');
      // Import LogFilters types for Zod schema if not already available broadly
      // For simplicity, we'll define inline or assume they are compatible with Zod types here.

      const projectRepo = new ProjectRepository();
      const logRepo = new LogRepository();

      // Define Zod schema for LogLevel if not already defined elsewhere usable by Zod
      const LogLevelSchema = z.enum(["error", "warn", "info", "debug", "trace"]);

      // Define Zod schema for MetadataFilter
      const MetadataFilterSchema = z.object({
        key: z.string(),
        value: z.string(),
      });

      // Define Zod schema for Cursor
      const CursorSchema = z.object({
        id: z.string(),
        timestamp: z.string(), // Assuming timestamp is passed as string (ISO format)
      });

      this.handlers = {
        listProjects: async () => {
          try {
            const projects = await projectRepo.getAllProjects();
            return {
              content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
            };
          } catch (error) {
            return {
              content: [{ type: 'text', text: `Error listing projects: ${error}` }],
            };
          }
        },
        getProject: async (args: { id: string }) => {
          this.serverLogger.log('getProject args:', args);
          try {
            const project = await projectRepo.getProjectById(args.id);
            if (!project) {
              return {
                content: [{ type: 'text', text: `Project with ID ${args.id} not found` }],
              };
            }
            return {
              content: [{ type: 'text', text: JSON.stringify(project, null, 2) }],
            };
          } catch (error) {
            return {
              content: [{ type: 'text', text: `Error getting project: ${error}` }],
            };
          }
        },
        getProjectLogs: async (args: {
          projectId: string;
          limit?: number;
          level?: string | string[];
          messageContains?: string;
          fromDate?: string;
          toDate?: string;
          metadata?: Array<{ key: string; value: string }>;
          cursor?: { id: string; timestamp: string };
          sortDirection?: 'asc' | 'desc';
        }) => {
          this.serverLogger.log('getProjectLogs args:', args);
          try {
            const logs = await logRepo.getLogsWithFilters({
              projectId: args.projectId,
              limit: args.limit, // Pass through limit
              // Pass through all newly added optional filters
              level: args.level as any, // Cast to any if LogLevel type from DB doesn't match Zod enum directly
              messageContains: args.messageContains,
              fromDate: args.fromDate,
              toDate: args.toDate,
              metadata: args.metadata,
              cursor: args.cursor,
              sortDirection: args.sortDirection,
            });
            return {
              content: [{ type: 'text', text: JSON.stringify(logs, null, 2) }],
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.serverLogger.error('Error in getProjectLogs tool:', errorMessage, error);
            return {
              content: [{ type: 'text', text: `Error getting logs: ${errorMessage}` }],
            };
          }
        },
        searchLogs: async (args: { query: string; limit?: number }) => {
          this.serverLogger.log('searchLogs args:', args);
          try {
            // This is a placeholder - you would need to implement text search in your LogRepository
            const logs = await logRepo.getLogsWithFilters({
              projectId: '*',
              limit: args.limit || 10,
            });
            return {
              content: [{ type: 'text', text: `Search results for "${args.query}":\n${JSON.stringify(logs, null, 2)}` }],
            };
          } catch (error) {
            return {
              content: [{ type: 'text', text: `Error searching logs: ${error}` }],
            };
          }
        },
      };

      this.mcpServer.tool(
        'listProjects',
        {},
        this.handlers.listProjects
      );
      this.mcpServer.tool(
        'getProject',
        {
          id: z.string().describe('Project ID'),
        },
        this.handlers.getProject
      );
      this.mcpServer.tool(
        'getProjectLogs',
        {
          projectId: z.string().describe('Project ID'),
          limit: z.number().optional().describe('Limit number of logs'),
          level: z.union([LogLevelSchema, z.array(LogLevelSchema)]).optional().describe('Log level or array of log levels'),
          messageContains: z.string().optional().describe('Text to search in log messages'),
          fromDate: z.string().datetime({ message: "Invalid datetime string for fromDate, must be ISO 8601" }).optional().describe('Start date/time (ISO 8601 format)'),
          toDate: z.string().datetime({ message: "Invalid datetime string for toDate, must be ISO 8601" }).optional().describe('End date/time (ISO 8601 format)'),
          metadata: z.array(MetadataFilterSchema).optional().describe('Array of metadata key-value pairs to filter by'),
          cursor: CursorSchema.optional().describe('Cursor for pagination (id and timestamp)'),
          sortDirection: z.enum(['asc', 'desc']).optional().describe('Sort direction for logs (asc or desc by timestamp)'),
        },
        this.handlers.getProjectLogs
      );
      this.mcpServer.tool(
        'searchLogs',
        {
          query: z.string().describe('Search query'),
          limit: z.number().optional().describe('Limit number of logs'),
        },
        this.handlers.searchLogs
      );

      this.serverLogger.log(`Registered ${Object.keys(this.handlers).length} tools with MCP server`);
      this.serverLogger.log(`Tool names: ${Object.keys(this.handlers).join(', ')}`);
    } catch (error) {
      this.serverLogger.error('Error in registerTools:', error);
      throw error;
    }
  }

  // Stop the server
  public async stopServer(): Promise<{ success: boolean }> {
    try {
      if (this.serverInstance) {
        await new Promise<void>((resolve, reject) => {
          this.serverInstance!.close((err?: Error) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Clear all transports
        this.transports = {
          streamable: {},
          sse: {}
        };
        this.mcpServer = null;
        this.serverInstance = null;

        this.serverLogger.log('MCP Server stopped due to configuration change');
        return { success: true };
      }

      this.serverLogger.log('MCP Server was not running');
      return { success: false };
    } catch (error) {
      this.serverLogger.error('Failed to stop MCP server:', error);
      return { success: false };
    }
  }

  // Restart the server
  public async restartServer(): Promise<{ success: boolean }> {
    try {
      // First stop the server if it's running
      await this.stopServer();

      // Then start it again with new config
      this.serverLogger.log('Restarting MCP server due to configuration change');
      await this.startServer();

      return { success: true };
    } catch (error) {
      this.serverLogger.error('Failed to restart MCP server:', error);
      return { success: false };
    }
  }

  // Get logs by type - exposed for IPC handlers
  public getLogs(type: 'stdout' | 'stderr' | 'all') {
    return this.serverLogger.getLogs(type);
  }

  // Clear logs by type - exposed for IPC handlers
  public clearLogs(type: 'stdout' | 'stderr' | 'all'): boolean {
    return this.serverLogger.clearLogs(type);
  }
} 