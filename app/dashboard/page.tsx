'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { useState } from 'react';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      return userApi.getMe(token);
    },
  });

  // Fetch balance
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      return userApi.getBalance(token);
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchUser(), refetchBalance()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  if (userLoading || balanceLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Welcome Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl mb-2">Welcome back,</h2>
          <p className="text-2xl font-bold text-blue-400">{userData?.email || 'User'}</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl mb-4">Your Balance</h2>
          <div className="text-4xl font-bold text-green-400">
            ${balanceData?.total?.toFixed(2) || '0.00'}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-400">Available</p>
              <p className="text-xl">${balanceData?.available?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-400">Locked</p>
              <p className="text-xl">${balanceData?.locked?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-left transition">
            <h3 className="text-lg font-semibold mb-2">Deposit</h3>
            <p className="text-sm text-gray-200">Add funds to your account</p>
          </button>
          <button className="bg-green-600 hover:bg-green-700 rounded-lg p-6 text-left transition">
            <h3 className="text-lg font-semibold mb-2">Withdraw</h3>
            <p className="text-sm text-gray-200">Withdraw your earnings</p>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 rounded-lg p-6 text-left transition">
            <h3 className="text-lg font-semibold mb-2">Referrals</h3>
            <p className="text-sm text-gray-200">Invite friends and earn</p>
          </button>
        </div>
      </div>
    </div>
  );
}
