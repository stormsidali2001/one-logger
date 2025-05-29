import { ipcMain } from 'electron';
import { GetConfig } from '../use-cases/getConfig.js';
import { SetConfig } from '../use-cases/setConfig.js';
import { GetAllConfig } from '../use-cases/getAllConfig.js';
import { ConfigRepository } from '../repositories/configRepository.js';

export function registerConfigHandlers() {
  const configRepository = new ConfigRepository();
  const getConfig = new GetConfig(configRepository);
  const setConfig = new SetConfig(configRepository);
  const getAllConfig = new GetAllConfig(configRepository);

  ipcMain.handle('config:get', async (_event, key: string) => {
    return getConfig.execute(key);
  });

  ipcMain.handle('config:set', async (_event, key: string, value: string) => {
    return setConfig.execute(key, value);
  });

  ipcMain.handle('config:getAll', async () => {
    return getAllConfig.execute();
  });
}