import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Brain } from "lucide-react";

export function MCPTools() {
  return (
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
            MCP tools will be available in a future update
          </div>
        </div>
      </CardContent>
    </Card>
  );
}