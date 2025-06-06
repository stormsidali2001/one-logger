import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  enabledError?: Error | null;
  portError?: Error | null;
  corsError?: Error | null;
  mcpEnabledError?: Error | null;
  mcpPortError?: Error | null;
}

export function ErrorDisplay({
  enabledError,
  portError,
  corsError,
  mcpEnabledError,
  mcpPortError
}: ErrorDisplayProps) {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Configuration Error
            </CardTitle>
            <CardDescription className="text-red-600">
              Failed to load application settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enabledError && <p className="text-sm text-red-600">• Failed to load server enabled status</p>}
              {portError && <p className="text-sm text-red-600">• Failed to load server port configuration</p>}
              {corsError && <p className="text-sm text-red-600">• Failed to load CORS configuration</p>}
              {mcpEnabledError && <p className="text-sm text-red-600">• Failed to load MCP server enabled status</p>}
              {mcpPortError && <p className="text-sm text-red-600">• Failed to load MCP server port configuration</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}