import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Link } from "lucide-react";

interface ApiEndpointsProps {
  port: number;
}

const LOCALHOST_HOST = 'localhost';
const API_PATH = '/api';
const SWAGGER_UI_PATH = '/ui';
const API_DOC_PATH = '/doc';

export function ApiEndpoints({ port }: ApiEndpointsProps) {
  return (
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
                http://{LOCALHOST_HOST}:{port}{API_PATH}
              </p>
            </div>
            <div className="rounded-md border p-4">
              <h3 className="font-medium">Swagger UI</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                http://{LOCALHOST_HOST}:{port}{SWAGGER_UI_PATH}
              </p>
            </div>
            <div className="rounded-md border p-4">
              <h3 className="font-medium">API Documentation</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                http://{LOCALHOST_HOST}:{port}{API_DOC_PATH}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}