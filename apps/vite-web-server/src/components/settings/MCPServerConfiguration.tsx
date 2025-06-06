import React from 'react';
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
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Save,
  RefreshCw,
  Info
} from "lucide-react";
import { DEFAULT_MCP_SERVER_PORT } from "@/constants";

interface MCPServerConfig {
  enabled: boolean;
  port: number;
}

interface MCPServerConfigurationProps {
  mcpServerConfig: MCPServerConfig;
  setMCPServerConfig: (config: MCPServerConfig) => void;
  isLoading: boolean;
  isMCPRestarting: boolean;
  setIsMCPRestarting: (value: boolean) => void;
  onSave: () => void;
  onRestart: () => void;
  isSaving: boolean;
  isRestartingServer: boolean;
}

export function MCPServerConfiguration({
  mcpServerConfig,
  setMCPServerConfig,
  isLoading,
  isMCPRestarting,
  setIsMCPRestarting,
  onSave,
  onRestart,
  isSaving,
  isRestartingServer
}: MCPServerConfigurationProps) {
  return (
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
            disabled={isLoading || isSaving}
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
            onChange={(e) => setMCPServerConfig({...mcpServerConfig, port: parseInt(e.target.value, 10) || DEFAULT_MCP_SERVER_PORT})}
            disabled={isLoading || !mcpServerConfig.enabled || isSaving}
          />
          <p className="text-sm text-muted-foreground">
            The port number the MCP server will listen on (default: {DEFAULT_MCP_SERVER_PORT})
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
          disabled={isLoading || !isMCPRestarting || isSaving}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Restart Later
        </Button>
        {isMCPRestarting && (
          <Button
            variant="default"
            onClick={onRestart}
            disabled={isLoading || isRestartingServer || isSaving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart Now
          </Button>
        )}
        <Button
          onClick={onSave}
          disabled={isLoading || isSaving || isRestartingServer}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}