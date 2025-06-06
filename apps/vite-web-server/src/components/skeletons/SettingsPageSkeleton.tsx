import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Server, Brain, Plug } from "lucide-react";

export function SettingsPageSkeleton() {
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
            <ServerConfigSkeleton />
            <ApiEndpointsSkeleton />
            <ServerLogsSkeleton />
          </TabsContent>

          <TabsContent value="mcpServer" className="mt-6">
            <MCPServerConfigSkeleton />
            <MCPEndpointSkeleton />
            <MCPToolsSkeleton />
            <MCPServerLogsSkeleton />
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

function ServerConfigSkeleton() {
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
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>

        <Separator />

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-64" />
        </div>

        <Separator />

        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-16" />
          </div>
          <Skeleton className="h-3 w-72" />
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}

function MCPServerConfigSkeleton() {
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
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>

        <Separator />

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-64" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}

function ApiEndpointsSkeleton() {
  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          API Endpoints
        </CardTitle>
        <CardDescription>
          The server exposes these endpoints when enabled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-md border p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MCPEndpointSkeleton() {
  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          MCP Endpoint
        </CardTitle>
        <CardDescription>
          The MCP server exposes this endpoint when enabled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MCPToolsSkeleton() {
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
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ServerLogsSkeleton() {
  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          Server Logs
        </CardTitle>
        <CardDescription>
          View server stdout and stderr logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-11 rounded-full" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-96 overflow-y-auto">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full bg-gray-800" />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  );
}

function MCPServerLogsSkeleton() {
  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          MCP Server Logs
        </CardTitle>
        <CardDescription>
          View MCP server stdout and stderr logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-11 rounded-full" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-96 overflow-y-auto">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full bg-gray-800" />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  );
}