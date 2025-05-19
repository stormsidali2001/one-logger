import { logger, initializeLogger } from 'logs-collector';

import { useEffect } from 'react';

export function useInitLogger() {
  useEffect(() => {
    initializeLogger({
        name: 'vite-example-project',
        description: 'A modular, Expo-based habit tracking app',
      });
  }, []);
}

export { logger }; 