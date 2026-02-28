'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function MasterWalletSettings() {
  const [wallets, setWallets] = useState([]);
  const queryClient = useQueryClient();

  // Fetch wallets
  const { data: walletsData, isLoading } = useQuery({
    queryKey: ['masterWallets'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      return adminApi.getWallets(token);
    }
  });

  // Update wallet mutation
  const updateWallet = useMutation({
    mutationFn: async ({ chain, address }: { chain: string; address: string }) => {
      const token = localStorage.getItem('token');
      return adminApi.updateWallet(token, { chain, address });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterWallets'] });
      toast.success('Wallet updated successfully');
    },
    onError: () => {
      toast.error('Failed to update wallet');
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Master Wallet Settings</h2>
      <p className="text-gray-600 mb-6">Configure master wallets for different chains</p>
      
      <div className="space-y-4">
        {walletsData?.map((wallet: any) => (
          <div key={wallet.chain} className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{wallet.chain}</h3>
            <input
              type="text"
              defaultValue={wallet.address}
              className="w-full p-2 border rounded"
              onBlur={(e) => updateWallet.mutate({ 
                chain: wallet.chain, 
                address: e.target.value 
              })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
