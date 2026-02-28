'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DistributeProfit() {
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  // Get profit data
  const { data: profitData } = useQuery({
    queryKey: ['profit'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      return adminApi.getProfitData(token);
    }
  });

  // Distribute profit mutation
  const distributeProfit = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      return adminApi.distributeProfit(token, { amount: parseFloat(amount) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit'] });
      toast.success('Profit distributed successfully');
      setAmount('');
    },
    onError: () => {
      toast.error('Failed to distribute profit');
    }
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Distribute Profit</h2>
      <p className="text-gray-600 mb-6">Distribute profits to users</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Available Profit</label>
          <p className="text-2xl font-bold text-green-600">
            ${profitData?.available || '0.00'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Amount to Distribute</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
          />
        </div>
        
        <button
          onClick={() => distributeProfit.mutate()}
          disabled={distributeProfit.isPending || !amount}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {distributeProfit.isPending ? 'Distributing...' : 'Distribute Profit'}
        </button>
      </div>
    </div>
  );
}
