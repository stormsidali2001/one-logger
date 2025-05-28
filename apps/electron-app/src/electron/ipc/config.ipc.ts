import { ipcMain } from 'electron';
import { GetConfigUseCase, SetConfigUseCase, GetAllConfigUseCase } from '../use-cases/config.use-cases.js';

export function registerConfigHandlers() {
  const getConfigUseCase = new GetConfigUseCase();
  const setConfigUseCase = new SetConfigUseCase();
  const getAllConfigUseCase = new GetAllConfigUseCase();

  ipcMain.handle('config:get', async (_event, key: string) => {
    return getConfigUseCase.execute(key);
  });

  ipcMain.handle('config:set', async (_event, key: string, value: string) => {
    return setConfigUseCase.execute(key, value);
  });

  ipcMain.handle('config:getAll', async () => {
    return getAllConfigUseCase.execute();
  });
}