import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUpdateProjectConfig } from './queries/useProjectConfig';

export function useProjectConfigManager(projectId: string, projectConfig: any) {
  const updateProjectConfigMutation = useUpdateProjectConfig();
  
  // State for config editing
  const [configText, setConfigText] = useState('');
  const [configError, setConfigError] = useState('');
  const [isConfigModified, setIsConfigModified] = useState(false);

  // Update config text when projectConfig changes
  useEffect(() => {
    if (projectConfig) {
      const formattedConfig = JSON.stringify(projectConfig, null, 2);
      setConfigText(formattedConfig);
      setIsConfigModified(false);
      setConfigError('');
    }
  }, [projectConfig]);

  // Config handlers
  const handleConfigChange = (value: string) => {
    setConfigText(value);
    setIsConfigModified(true);
    
    // Validate JSON
    try {
      JSON.parse(value);
      setConfigError('');
    } catch (error) {
      setConfigError('Invalid JSON format');
    }
  };

  const handleSaveConfig = () => {
    try {
      const parsedConfig = JSON.parse(configText);
      updateProjectConfigMutation.mutate(
        { projectId, config: parsedConfig },
        {
          onSuccess: () => {
            toast.success('Project configuration updated successfully');
            setIsConfigModified(false);
            setConfigError('');
          },
          onError: (error) => {
            toast.error('Failed to update project configuration', {
              description: error instanceof Error ? error.message : 'Unknown error occurred'
            });
          }
        }
      );
    } catch (error) {
      setConfigError('Invalid JSON format');
      toast.error('Invalid JSON format');
    }
  };

  const handleResetConfig = () => {
    if (projectConfig) {
      const formattedConfig = JSON.stringify(projectConfig, null, 2);
      setConfigText(formattedConfig);
      setIsConfigModified(false);
      setConfigError('');
    }
  };

  return {
    // State
    configText,
    configError,
    isConfigModified,
    
    // Handlers
    handleConfigChange,
    handleSaveConfig,
    handleResetConfig,
    
    // Mutation
    updateProjectConfigMutation
  };
}