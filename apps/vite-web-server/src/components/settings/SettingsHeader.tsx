import React from 'react';
import { Server } from "lucide-react";

export function SettingsHeader() {
  return (
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
  );
}