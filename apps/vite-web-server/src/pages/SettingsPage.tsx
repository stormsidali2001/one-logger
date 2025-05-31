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
    refetch: refreshLogs, 
    clearLogs,
    isClearingLogs
  } = useMCPServerLogs('all');

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
    port: 5173,
    corsOrigins: ['http://localhost:5173']
  });
  const [corsInput, setCorsInput] = useState('');
  const [isRestarting, setIsRestarting] = useState(false);

  // Query config values
  const { data: enabledConfig, isLoading: isEnabledLoading } = useConfigValue('server.enabled');
  const { data: portConfig, isLoading: isPortLoading } = useConfigValue('server.port');
  const { data: corsConfig, isLoading: isCorsLoading } = useConfigValue('server.corsOrigins');

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
        port: portConfig?.value ? parseInt(portConfig.value, 10) : 5173,
        corsOrigins: corsConfig?.value ? JSON.parse(corsConfig.value) : ['http://localhost:5173']
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
    port: 3000
  });
  const [isMCPRestarting, setIsMCPRestarting] = useState(false);

  // Add MCP server configuration queries
  const { data: mcpEnabledConfig, isLoading: isMCPEnabledLoading } = useConfigValue('mcpServer.enabled');
  const { data: mcpPortConfig, isLoading: isMCPPortLoading } = useConfigValue('mcpServer.port');

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
        port: mcpPortConfig?.value ? parseInt(mcpPortConfig.value, 10) : 3000,
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

  // Show loading state when config is loading
  if (isEnabledLoading || isPortLoading || isCorsLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="border-4 border-primary/30 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-muted-foreground mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
            <Server className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Configure your server and application settings for optimal performance.
          </p>
        </div>

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
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        Server Configuration
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-600">
                        Configure the built-in API server for receiving logs
                      </CardDescription>
                    </div>
                  </div>
                <Badge variant={serverConfig.enabled ? "default" : "outline"} className="mt-1">
                  {serverConfig.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="server-enabled">Server Status</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable the API server
                  </div>
                </div>
                <Switch
                  id="server-enabled"
                  checked={serverConfig.enabled}
                  onCheckedChange={(checked) => setServerConfig({...serverConfig, enabled: checked})}
                  disabled={isLoading || setConfigMutation.isPending}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="server-port">Server Port</Label>
                <Input
                  id="server-port"
                  type="number"
                  min="1000"
                  max="65535"
                  value={serverConfig.port}
                  onChange={(e) => setServerConfig({...serverConfig, port: parseInt(e.target.value, 10) || 5173})}
                  disabled={isLoading || !serverConfig.enabled || setConfigMutation.isPending}
                />
                <p className="text-sm text-muted-foreground">
                  The port number the server will listen on (default: 5173)
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>CORS Origins</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="http://example.com"
                    value={corsInput}
                    onChange={(e) => setCorsInput(e.target.value)}
                    disabled={isLoading || !serverConfig.enabled || setConfigMutation.isPending}
                  />
                  <Button 
                    variant="outline" 
                    onClick={addCorsOrigin}
                    disabled={isLoading || !serverConfig.enabled || !corsInput || setConfigMutation.isPending}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Specify allowed origins for Cross-Origin Resource Sharing
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {serverConfig.corsOrigins.map((origin) => (
                    <Badge 
                      key={origin} 
                      variant="secondary"
                      className="pl-2 flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      {origin}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCorsOrigin(origin)}
                        className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                        disabled={isLoading || !serverConfig.enabled || setConfigMutation.isPending}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {isRestarting && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-4 mt-6">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Server Restart Required
                      </h3>
                      <div className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        <p>You'll need to restart the server for the configuration changes to take effect.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsRestarting(false)}
                disabled={isLoading || !isRestarting || setConfigMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart Later
              </Button>
              {isRestarting && (
                <Button
                  variant="default"
                  onClick={handleRestartServer}
                  disabled={isLoading || restartServerMutation.isPending || setConfigMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Now
                </Button>
              )}
              <Button
                onClick={saveServerConfig}
                disabled={isLoading || setConfigMutation.isPending || restartServerMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="border shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Link className="h-5 w-5" />
                API Endpoints
              </CardTitle>
              <CardDescription>
                The server exposes these endpoints when enabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">API Root</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      http://localhost:{serverConfig.port}/api
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">Swagger UI</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      http://localhost:{serverConfig.port}/ui
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">API Documentation</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      http://localhost:{serverConfig.port}/doc
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Server logs section */}
          <ServerLogs />
        </TabsContent>

          <TabsContent value="mcpServer" className="mt-6">
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        MCP Server Configuration
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-600">
                        Configure the Model Context Protocol server for AI agent access
                      </CardDescription>
                    </div>
                  </div>
                <Badge variant={mcpServerConfig.enabled ? "default" : "outline"} className="mt-1">
                  {mcpServerConfig.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="mcp-server-enabled">MCP Server Status</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable the MCP server for LLM agents
                  </div>
                </div>
                <Switch
                  id="mcp-server-enabled"
                  checked={mcpServerConfig.enabled}
                  onCheckedChange={(checked) => setMCPServerConfig({...mcpServerConfig, enabled: checked})}
                  disabled={isLoading || setConfigMutation.isPending}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="mcp-server-port">MCP Server Port</Label>
                <Input
                  id="mcp-server-port"
                  type="number"
                  min="1000"
                  max="65535"
                  value={mcpServerConfig.port}
                  onChange={(e) => setMCPServerConfig({...mcpServerConfig, port: parseInt(e.target.value, 10) || 3000})}
                  disabled={isLoading || !mcpServerConfig.enabled || setConfigMutation.isPending}
                />
                <p className="text-sm text-muted-foreground">
                  The port number the MCP server will listen on (default: 3000)
                </p>
              </div>

              {isMCPRestarting && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-4 mt-6">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        MCP Server Restart Required
                      </h3>
                      <div className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        <p>You'll need to restart the MCP server for the configuration changes to take effect.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsMCPRestarting(false)}
                disabled={isLoading || !isMCPRestarting || setConfigMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart Later
              </Button>
              {isMCPRestarting && (
                <Button
                  variant="default"
                  onClick={handleRestartMCPServer}
                  disabled={isLoading || restartMCPServerMutation.isPending || setConfigMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Now
                </Button>
              )}
              <Button
                onClick={saveMCPServerConfig}
                disabled={isLoading || setConfigMutation.isPending || restartMCPServerMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="border shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Link className="h-5 w-5" />
                MCP Endpoint
              </CardTitle>
              <CardDescription>
                The MCP server exposes this endpoint when enabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium">MCP Endpoint</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    http://localhost:{mcpServerConfig.port}/mcp
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Card: Available MCP Tools */}
          <Card className="border shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Available MCP Tools
              </CardTitle>
              <CardDescription>
                Tools accessible to AI agents via the MCP protocol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  Mcp tools will be available in a future update
                </div>
              </div>
            </CardContent>
          </Card>

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