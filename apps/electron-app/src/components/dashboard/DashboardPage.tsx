import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConfigValue, useAllConfigs } from '../../hooks/queries/useConfigValue';
import { queryKeys } from '../../hooks/queries/queryKeys';

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-white to-blue-50">
      <div className="w-full max-w-2xl mt-16">
        <h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight text-blue-900 drop-shadow">
          🚀 Electron + shadcn/ui + Drizzle (SQLite) + TanStack Router + React Query Starter Kit
        </h1>
        <p className="text-center text-lg text-blue-700 mb-8">
          A beautiful, modern foundation for your next desktop app.
        </p>
        <ConfigDemo />
      </div>
    </div>
  );
}

function ConfigDemo() {
  const [key, setKey] = useState('example');
  const [value, setValue] = useState('');
  const queryClient = useQueryClient();

  const { data: fetched, isLoading, error, refetch, isFetching } = useConfigValue(key);
  const { data: allConfigs, isLoading: isLoadingAll, refetch: refetchAll } = useAllConfigs();

  const { mutate: setConfig, isPending, error: mutationError } = useMutation({
    mutationFn: async (val: string) => {
      // @ts-ignore
      await window.electronAPI.setConfig(key, val);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.config.get(key) });
      refetch();
      refetchAll();
    },
  });

  return (
    <div className="bg-white/80 shadow-xl rounded-xl p-6 w-full max-w-lg mx-auto flex flex-col gap-4 border border-blue-100">
      <h2 className="font-bold text-xl text-blue-900 mb-2 flex items-center gap-2">
        <span>⚙️</span> Minimal Config Demo
      </h2>
      <div className="flex flex-col gap-2">
        <input
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 transition"
          placeholder="Config key"
          value={key}
          onChange={e => setKey(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 transition"
          placeholder="Config value"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition disabled:opacity-50"
          onClick={() => setConfig(value)}
          disabled={isPending || !key}
        >
          Set Config
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition disabled:opacity-50"
          onClick={() => refetch()}
          disabled={isLoading || isFetching || !key}
        >
          Get Config
        </button>
      </div>
      {(isLoading || isFetching || isPending) && <div className="text-xs text-gray-500 mt-2">Loading...</div>}
      {(error || mutationError) && <div className="text-xs text-red-500 mt-2">{String(error || mutationError)}</div>}
      {fetched !== undefined && fetched !== null && (
        <div className="text-xs text-green-700 mt-2">
          <span className="font-mono">Value: {String(fetched)}</span>
        </div>
      )}
      <div className="mt-6">
        <h3 className="font-semibold mb-1 text-blue-900">All Configs</h3>
        {isLoadingAll ? (
          <div className="text-xs text-gray-500">Loading...</div>
        ) : (
          <ul className="text-xs">
            {allConfigs && allConfigs.length > 0 ? (
              allConfigs.map((c: { key: string; value: string }) => (
                <li key={c.key}>
                  <span className="font-mono">{c.key}</span>: <span className="font-mono">{c.value}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">No configs set.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
} 