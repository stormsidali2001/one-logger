import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Settings, Save } from "lucide-react";

interface ProjectConfigurationTabProps {
  isLoadingConfig: boolean;
  configText: string;
  configError: string;
  isConfigModified: boolean;
  onConfigChange: (value: string) => void;
  onSaveConfig: () => void;
  onResetConfig: () => void;
  isSaving: boolean;
}

export function ProjectConfigurationTab({
  isLoadingConfig,
  configText,
  configError,
  isConfigModified,
  onConfigChange,
  onSaveConfig,
  onResetConfig,
  isSaving
}: ProjectConfigurationTabProps) {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white">
              <Settings className="h-3 w-3" />
            </div>
            Project Configuration
          </h3>
          <div className="flex items-center gap-2">
            {isConfigModified && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetConfig}
                disabled={isSaving}
              >
                Reset
              </Button>
            )}
            <Button
              size="sm"
              onClick={onSaveConfig}
              disabled={!isConfigModified || !!configError || isSaving}
            >
              {isSaving ? (
                <span className="mr-2 border-2 border-primary/30 border-t-primary rounded-full w-4 h-4 animate-spin inline-block" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        {isLoadingConfig ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="border-4 border-primary/30 border-t-primary rounded-full w-8 h-8 animate-spin"></div>
              <p className="text-muted-foreground text-sm">Loading configuration...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Configuration JSON</label>
              <p className="text-xs text-muted-foreground">
                Edit the project configuration in JSON format. This configuration can be used to store project-specific settings.
              </p>
            </div>
            <div className="space-y-2">
              <Textarea
                value={configText}
                onChange={(e) => onConfigChange(e.target.value)}
                placeholder="{}"
                className={`font-mono text-sm min-h-[300px] resize-y ${
                  configError ? 'border-destructive focus:border-destructive' : ''
                }`}
              />
              {configError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {configError}
                </p>
              )}
              {isConfigModified && !configError && (
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Configuration has been modified. Don't forget to save your changes.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}