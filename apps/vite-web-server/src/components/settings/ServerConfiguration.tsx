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
  Server,
  Save,
  RefreshCw,
  Info,
  Globe
} from "lucide-react";
import { DEFAULT_WEB_PORT } from "@/constants";

interface ServerConfig {
  enabled: boolean;
  port: number;
  corsOrigins: string[];
}

interface ServerConfigurationProps {
  serverConfig: ServerConfig;
  setServerConfig: (config: ServerConfig) => void;
  corsInput: string;
  setCorsInput: (value: string) => void;
  isLoading: boolean;
  isRestarting: boolean;
  setIsRestarting: (value: boolean) => void;
  onSave: () => void;
  onRestart: () => void;
  onAddCorsOrigin: () => void;
  onRemoveCorsOrigin: (origin: string) => void;
  isSaving: boolean;
  isRestartingServer: boolean;
}

const CORS_PLACEHOLDER = 'http://example.com';

export function ServerConfiguration({
  serverConfig,
  setServerConfig,
  corsInput,
  setCorsInput,
  isLoading,
  isRestarting,
  setIsRestarting,
  onSave,
  onRestart,
  onAddCorsOrigin,
  onRemoveCorsOrigin,
  isSaving,
  isRestartingServer
}: ServerConfigurationProps) {
  return (
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
            disabled={isLoading || isSaving}
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
            onChange={(e) => setServerConfig({...serverConfig, port: parseInt(e.target.value, 10) })}
            disabled={isLoading || !serverConfig.enabled || isSaving}
          />
          <p className="text-sm text-muted-foreground">
            The port number the server will listen on (default: {DEFAULT_WEB_PORT})
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>CORS Origins</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder={CORS_PLACEHOLDER}
              value={corsInput}
              onChange={(e) => setCorsInput(e.target.value)}
              disabled={isLoading || !serverConfig.enabled || isSaving}
            />
            <Button 
              variant="outline" 
              onClick={onAddCorsOrigin}
              disabled={isLoading || !serverConfig.enabled || !corsInput || isSaving}
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
                  onClick={() => onRemoveCorsOrigin(origin)}
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || !serverConfig.enabled || isSaving}
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
          disabled={isLoading || !isRestarting || isSaving}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Restart Later
        </Button>
        {isRestarting && (
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