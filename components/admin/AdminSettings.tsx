'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      return adminApi.getSettings(token);
    }
  });

  // Update settings mutation
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const token = localStorage.getItem('token');
      return adminApi.updateSetting(token, key, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      toast.success('Setting updated successfully');
    },
    onError: () => {
      toast.error('Failed to update setting');
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Admin Settings</h2>
      <p className="text-gray-600 mb-6">Configure system settings</p>
      
      <div className="space-y-4">
        {Object.entries(settingsData || {}).map(([key, value]) => (
          <div key={key} className="border p-4 rounded-lg">
            <label className="block font-semibold mb-2 capitalize">
              {key.replace(/_/g, ' ')}
            </label>
            <input
              type="text"
              defaultValue={value as string}
              className="w-full p-2 border rounded"
              onBlur={(e) => updateSetting.mutate({ key, value: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
