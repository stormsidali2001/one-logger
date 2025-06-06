import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Link } from "lucide-react";

interface MCPEndpointProps {
  port: number;
}

const LOCALHOST_HOST = 'localhost';
const MCP_ENDPOINT_PATH = '/mcp';

export function MCPEndpoint({ port }: MCPEndpointProps) {
  return (
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
              http://{LOCALHOST_HOST}:{port}{MCP_ENDPOINT_PATH}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}