import  { useState, useEffect, useRef,  useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Server, 
  Save,
  RefreshCw,
  Info,
  Globe,
  Link,
  Plug,
  TerminalSquare,
  XCircle,
  Check,
  AlertTriangle,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfigValue } from "@/hooks/queries/useConfigValue";
import { useServerLogs } from "@/hooks/queries/useServerLogs";
import { useConfigMutation, useRestartServerMutation } from "@/hooks/queries/useConfigMutation";
import { useMCPServerLogs } from "@/hooks/queries/useMCPServerLogs";
import { useRestartMCPServerMutation } from "@/hooks/queries/useMCPServerMutation";
import { DEFAULT_API_SERVER_PORT, DEFAULT_MCP_SERVER_PORT, DEFAULT_WEB_PORT } from "@/constants";
import { 
  SettingsPageSkeleton, 
  ServerLogsSkeleton, 
  MCPServerLogsSkeleton,
  ServerConfigurationSkeleton,
  MCPServerConfigurationSkeleton,
  ApiEndpointsSkeleton,
  MCPEndpointSkeleton,
  MCPToolsSkeleton
} from "@/components/skeletons";
import {
  ServerConfiguration,
  MCPServerConfiguration,
  ApiEndpoints,
  MCPEndpoint,
  MCPTools,
  ErrorDisplay,
  SettingsHeader
} from "@/components/settings";

// Constants for port numbers and CORS configuration
const LOCALHOST_HOST = 'localhost';
const API_PATH = '/api';
const SWAGGER_UI_PATH = '/ui';
const API_DOC_PATH = '/doc';
const MCP_ENDPOINT_PATH = '/mcp';
const CORS_PLACEHOLDER = 'http://example.com';

interface ServerConfig {
  enabled: boolean;
  port: number;
  corsOrigins: string[];
}

// Define a new component for server logs
function ServerLogs() {
  const [activeTab, setActiveTab] = useState<'stdout' | 'stderr'>('stdout');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  
  // Use server logs hook
  const { 
    logs: serverLogs, 
    isLoading, 
    error,
    refetch: refreshLogs, 
    clearLogs,
    isClearingLogs
  } = useServerLogs({ type: 'all' });

  // Parse logs
  const logs = useMemo(() => {
    if (!serverLogs) return { stdout: [], stderr: [] };
    if (Array.isArray(serverLogs)) return { stdout: serverLogs, stderr: [] };
    return serverLogs;
  }, [serverLogs]);
  
  // Auto-refresh logs every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshLogs();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshLogs]);

  // Scroll to bottom of logs when they change
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  // Handler to clear logs with proper type
  const handleClearLogs = (type: 'stdout' | 'stderr' | 'all') => {
    clearLogs(type);
    toast.success(`${type === 'all' ? 'All' : type === 'stdout' ? 'Standard output' : 'Error'} logs cleared`);
  };





  // Show skeleton while loading
  if (isLoading && !serverLogs) {
    return <ServerLogsSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <Card className="border shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <TerminalSquare className="h-5 w-5" />
            Server Logs
          </CardTitle>
          <CardDescription>
            View server stdout and stderr logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading server logs</h3>
            <p className="text-gray-600 mb-4">Failed to fetch server logs. Please try again.</p>
            <Button onClick={() => refreshLogs()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <TerminalSquare className="h-5 w-5" />
          Server Logs
        </CardTitle>
        <CardDescription>
          View server stdout and stderr logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'stdout' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab('stdout')}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Standard Output</span>
              <span className="inline sm:hidden">Stdout</span>
              <Badge variant="secondary" className="ml-1">{logs.stdout.length}</Badge>
            </Button>
            <Button
              variant={activeTab === 'stderr' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab('stderr')}
              className="gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Standard Error</span>
              <span className="inline sm:hidden">Stderr</span>
              <Badge variant="secondary" className="ml-1">{logs.stderr.length}</Badge>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto-refresh
              </Label>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refreshLogs()}
              disabled={isLoading || isClearingLogs}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleClearLogs(activeTab)}
              disabled={isLoading || isClearingLogs}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          ref={logsRef}
          className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-96 overflow-y-auto whitespace-pre-wrap"
        >
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-pulse">Loading logs...</div>
            </div>
          ) : (
            activeTab === 'stdout' ? (
              logs.stdout.length > 0 ? (
                logs.stdout.map((log: string, i: number) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              ) : (
                <div className="text-gray-500 italic">No standard output logs available</div>
              )
            ) : (
              logs.stderr.length > 0 ? (
                logs.stderr.map((log: string, i: number) => (
                  <div key={i} className="text-red-400 mb-1">{log}</div>
                ))
              ) : (
                <div className="text-gray-500 italic">No error logs available</div>
              )
            )
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {isLoading ? 'Loading logs...' : `Showing ${activeTab === 'stdout' ? logs.stdout.length : logs.stderr.length} log entries`}
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => handleClearLogs('all')}
          disabled={isLoading || isClearingLogs}
        >
          Clear All Logs
        </Button>
      </CardFooter>
    </Card>
  );
}

// Define a new component for MCP server logs
function MCPServerLogs() {
  const [activeTab, setActiveTab] = useState<'stdout' | 'stderr'>('stdout');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  
  // Use MCP server logs hook
  const { 
    logs: serverLogs, 
    isLoading, 
    error,
    refetch: refreshLogs, 
    clearLogs,
    isClearingLogs
  } = useMCPServerLogs('all');

  // Parse logs - this hook must be called before any early returns
  const logs = useMemo(() => {
    if (!serverLogs) return { stdout: [], stderr: [] };
    if (Array.isArray(serverLogs)) return { stdout: serverLogs, stderr: [] };
    return serverLogs;
  }, [serverLogs]);
  
  // Auto-refresh logs every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshLogs();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshLogs]);

  // Scroll to bottom of logs when they change
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  // Handler to clear logs with proper type
  const handleClearLogs = (type: 'stdout' | 'stderr' | 'all') => {
    clearLogs(type);
    toast.success(`${type === 'all' ? 'All' : type === 'stdout' ? 'Standard output' : 'Error'} logs cleared`);
  };

  // Show skeleton while loading - moved after all hooks
  if (isLoading && !serverLogs) {
    return <MCPServerLogsSkeleton />;
  }

  // Show error state - moved after all hooks
  if (error) {
    return (
      <Card className="border shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <TerminalSquare className="h-5 w-5" />
            MCP Server Logs
          </CardTitle>
          <CardDescription>
            View MCP server stdout and stderr logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading MCP server logs</h3>
            <p className="text-gray-600 mb-4">Failed to fetch MCP server logs. Please try again.</p>
            <Button onClick={() => refreshLogs()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <TerminalSquare className="h-5 w-5" />
          MCP Server Logs
        </CardTitle>
        <CardDescription>
          View MCP server stdout and stderr logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'stdout' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab('stdout')}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Standard Output</span>
              <span className="inline sm:hidden">Stdout</span>
              <Badge variant="secondary" className="ml-1">{logs.stdout.length}</Badge>
            </Button>
            <Button
              variant={activeTab === 'stderr' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab('stderr')}
              className="gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Standard Error</span>
              <span className="inline sm:hidden">Stderr</span>
              <Badge variant="secondary" className="ml-1">{logs.stderr.length}</Badge>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="mcp-auto-refresh" className="text-sm">
                Auto-refresh
              </Label>
              <Switch
                id="mcp-auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refreshLogs()}
              disabled={isLoading || isClearingLogs}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleClearLogs(activeTab)}
              disabled={isLoading || isClearingLogs}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          ref={logsRef}
          className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-96 overflow-y-auto whitespace-pre-wrap"
        >
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-pulse">Loading logs...</div>
            </div>
          ) : (
            activeTab === 'stdout' ? (
              logs.stdout.length > 0 ? (
                logs.stdout.map((log: string, i: number) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              ) : (
                <div className="text-gray-500 italic">No standard output logs available</div>
              )
            ) : (
              logs.stderr.length > 0 ? (
                logs.stderr.map((log: string, i: number) => (
                  <div key={i} className="text-red-400 mb-1">{log}</div>
                ))
              ) : (
                <div className="text-gray-500 italic">No error logs available</div>
              )
            )
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {isLoading ? 'Loading logs...' : `Showing ${activeTab === 'stdout' ? logs.stdout.length : logs.stderr.length} log entries`}
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => handleClearLogs('all')}
          disabled={isLoading || isClearingLogs}
        >
          Clear All Logs
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    enabled: true,
    port: DEFAULT_API_SERVER_PORT,
    corsOrigins: []
  });
  const [corsInput, setCorsInput] = useState('');
  const [isRestarting, setIsRestarting] = useState(false);

  // Query config values
  const { data: enabledConfig, isLoading: isEnabledLoading, error: enabledError } = useConfigValue('server.enabled');
  const { data: portConfig, isLoading: isPortLoading, error: portError } = useConfigValue('server.port');
  const { data: corsConfig, isLoading: isCorsLoading, error: corsError } = useConfigValue('server.corsOrigins');

  // Use the custom mutation hooks
  const setConfigMutation = useConfigMutation({ invalidateServerLogs: true });
  const restartServerMutation = useRestartServerMutation();

  // Add onSuccess to reset isRestarting
  useEffect(() => {
    if (restartServerMutation.isSuccess) {
      setIsRestarting(false);
    }
  }, [restartServerMutation.isSuccess]);

  // Load server configuration
  useEffect(() => {
    if (isEnabledLoading || isPortLoading || isCorsLoading) {
      return;
    }

    try {
      setIsLoading(true);
      
      console.log("cors config",corsConfig)
      setServerConfig({
        enabled: enabledConfig?.value ? enabledConfig.value === 'true' : true,
        port: portConfig?.value ? parseInt(portConfig.value, 10) : DEFAULT_API_SERVER_PORT,
        corsOrigins: corsConfig?.value ? JSON.parse(corsConfig.value) : []
      });
    } catch (error) {
      console.error('Failed to parse server configuration:', error);
      toast.error("Error loading settings", {
        description: "Could not load server configuration"
      });
    } finally {
      setIsLoading(false);
    }
  }, [enabledConfig, portConfig, corsConfig, isEnabledLoading, isPortLoading, isCorsLoading]);

  // Save server configuration
  const saveServerConfig = async () => {
    try {
      setIsLoading(true);
      
      // Save server enabled state
      await setConfigMutation.mutateAsync({
        key: 'server.enabled',
        value: serverConfig.enabled.toString()
      });
      
      // Save server port
      await setConfigMutation.mutateAsync({
        key: 'server.port',
        value: serverConfig.port.toString()
      });
      
      // Save CORS origins as JSON string
      await setConfigMutation.mutateAsync({
        key: 'server.corsOrigins',
        value: JSON.stringify(serverConfig.corsOrigins)
      });
      
      toast.success("Settings saved", {
        description: "Server configuration has been updated"
      });

      // Ask user to restart server for changes to take effect
      setIsRestarting(true);
    } catch (error) {
      console.error('Failed to save server configuration:', error);
      toast.error("Error saving settings", {
        description: "Could not save server configuration"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Restart server with new configuration
  const handleRestartServer = () => {
    restartServerMutation.mutate();
  };

  // Add CORS origin
  const addCorsOrigin = () => {
    if (corsInput && !serverConfig.corsOrigins.includes(corsInput)) {
      setServerConfig({
        ...serverConfig,
        corsOrigins: [...serverConfig.corsOrigins, corsInput]
      });
      setCorsInput('');
    }
  };

  // Remove CORS origin
  const removeCorsOrigin = (origin: string) => {
    setServerConfig({
      ...serverConfig,
      corsOrigins: serverConfig.corsOrigins.filter(o => o !== origin)
    });
  };

  // New state for MCP server
  const [mcpServerConfig, setMCPServerConfig] = useState<{
    enabled: boolean;
    port: number;
  }>({
    enabled: false,
    port: DEFAULT_MCP_SERVER_PORT
  });
  const [isMCPRestarting, setIsMCPRestarting] = useState(false);

  // Add MCP server configuration queries
  const { data: mcpEnabledConfig, isLoading: isMCPEnabledLoading, error: mcpEnabledError } = useConfigValue('mcpServer.enabled');
  const { data: mcpPortConfig, isLoading: isMCPPortLoading, error: mcpPortError } = useConfigValue('mcpServer.port');

  // Use the MCP server mutation hook
  const restartMCPServerMutation = useRestartMCPServerMutation();

  // Add onSuccess to reset isMCPRestarting
  useEffect(() => {
    if (restartMCPServerMutation.isSuccess) {
      setIsMCPRestarting(false);
    }
  }, [restartMCPServerMutation.isSuccess]);

  // Load MCP server configuration
  useEffect(() => {
    if (isMCPEnabledLoading || isMCPPortLoading) {
      return;
    }

    try {
      setMCPServerConfig({
        enabled: mcpEnabledConfig?.value === 'true',
        port: mcpPortConfig?.value ? parseInt(mcpPortConfig.value, 10) : DEFAULT_MCP_SERVER_PORT,
      });
    } catch (error) {
      console.error('Failed to parse MCP server configuration:', error);
      toast.error("Error loading MCP settings", {
        description: "Could not load MCP server configuration"
      });
    }
  }, [mcpEnabledConfig, mcpPortConfig, isMCPEnabledLoading, isMCPPortLoading]);

  // Save MCP server configuration
  const saveMCPServerConfig = async () => {
    try {
      setIsLoading(true);
      
      // Save MCP server enabled state
      await setConfigMutation.mutateAsync({
        key: 'mcpServer.enabled',
        value: mcpServerConfig.enabled.toString()
      });
      
      // Save MCP server port
      await setConfigMutation.mutateAsync({
        key: 'mcpServer.port',
        value: mcpServerConfig.port.toString()
      });
      
      toast.success("MCP Settings saved", {
        description: "MCP Server configuration has been updated"
      });

      // Ask user to restart server for changes to take effect
      setIsMCPRestarting(true);
    } catch (error) {
      console.error('Failed to save MCP server configuration:', error);
      toast.error("Error saving MCP settings", {
        description: "Could not save MCP server configuration"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Restart MCP server with new configuration
  const handleRestartMCPServer = () => {
    restartMCPServerMutation.mutate();
  };

  // Check for configuration errors
  const hasConfigError = enabledError || portError || corsError || mcpEnabledError || mcpPortError;
  const isConfigLoading = isEnabledLoading || isPortLoading || isCorsLoading || isMCPEnabledLoading || isMCPPortLoading;

  // Show loading state when config is loading
  if (isConfigLoading && !hasConfigError) {
    return <SettingsPageSkeleton />;
  }

  // Show error state if there are configuration errors
  if (hasConfigError) {
    return (
      <ErrorDisplay
        enabledError={enabledError}
        portError={portError}
        corsError={corsError}
        mcpEnabledError={mcpEnabledError}
        mcpPortError={mcpPortError}
      />
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <SettingsHeader />

        <Tabs defaultValue="server" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <TabsTrigger value="server" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Server className="h-4 w-4" />
              API Server
            </TabsTrigger>
            <TabsTrigger value="mcpServer" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Brain className="h-4 w-4" />
              MCP Server
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white" disabled>
              <Plug className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="server" className="mt-6">
            {isEnabledLoading || isPortLoading || isCorsLoading ? (
              <ServerConfigurationSkeleton />
            ) : (
              <ServerConfiguration
                serverConfig={serverConfig}
                setServerConfig={setServerConfig}
                corsInput={corsInput}
                setCorsInput={setCorsInput}
                isLoading={isLoading}
                isRestarting={isRestarting}
                setIsRestarting={setIsRestarting}
                onSave={saveServerConfig}
                onRestart={handleRestartServer}
                onAddCorsOrigin={addCorsOrigin}
                onRemoveCorsOrigin={removeCorsOrigin}
                isSaving={setConfigMutation.isPending}
                isRestartingServer={restartServerMutation.isPending}
              />
            )}

            <ApiEndpoints port={serverConfig.port} />

            {/* Server logs section */}
            <ServerLogs />
          </TabsContent>

          <TabsContent value="mcpServer" className="mt-6">
            {isMCPEnabledLoading || isMCPPortLoading ? (
              <MCPServerConfigurationSkeleton />
            ) : (
              <MCPServerConfiguration
                mcpServerConfig={mcpServerConfig}
                setMCPServerConfig={setMCPServerConfig}
                isLoading={isLoading}
                isMCPRestarting={isMCPRestarting}
                setIsMCPRestarting={setIsMCPRestarting}
                onSave={saveMCPServerConfig}
                onRestart={handleRestartMCPServer}
                isSaving={setConfigMutation.isPending}
                isRestartingServer={restartMCPServerMutation.isPending}
              />
            )}

            <MCPEndpoint port={mcpServerConfig.port} />

            <MCPTools />

            {/* MCP Server logs section */}
            <MCPServerLogs />
          </TabsContent>

          <TabsContent value="general">
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              General settings will be available in a future update
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}