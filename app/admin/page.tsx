'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, ArrowDownCircle, ArrowUpCircle,
  RefreshCw, DollarSign, Wallet, Settings, FileText,
  ChevronRight, Shield, BarChart3, AlertTriangle
} from 'lucide-react';

// ── Sub-views ─────────────────────────────────────────────
import { MasterWalletSettings } from '@/components/admin/MasterWalletSettings';
import { DistributeProfit } from '@/components/admin/DistributeProfit';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminDeposits } from '@/components/admin/AdminDeposits';
import { AdminWithdrawals } from '@/components/admin/AdminWithdrawals';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AuditLogs } from '@/components/admin/AuditLogs';

type View = 'dashboard' | 'wallets' | 'distribute' | 'users' | 'deposits' | 'withdrawals' | 'settings' | 'audit';

const NAV: { id: View; label: string; icon: any; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallets', label: 'Master Wallets', icon: Wallet },
  { id: 'distribute', label: 'Distribute Profits', icon: DollarSign },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'deposits', label: 'Deposits', icon: ArrowDownCircle },
  { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpCircle },
  { id: 'settings', label: 'Settings & API Keys', icon: Settings },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
];

function StatCard({ label, value, icon: Icon, color = 'blue', sub }: any) {
  const colors: any = {
    blue: 'text-blue-400 bg-blue-900/20 border-blue-800',
    green: 'text-green-400 bg-green-900/20 border-green-800',
    yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-800',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-800',
    red: 'text-red-400 bg-red-900/20 border-red-800',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <Icon className="w-5 h-5 opacity-70" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminApi.get('/admin/dashboard') });

  const syncMutation = useMutation({
    mutationFn: () => adminApi.post('/admin/exchange/sync'),
    onSuccess: (data: any) => {
      toast.success('Exchange balances synced');
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  const s = data?.stats ?? {};
  const wallets = data?.masterWallets ?? {};
  const hasEthWallet = wallets.eth?.address;
  const hasTrxWallet = wallets.trx?.address;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="btn-secondary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          Sync Exchange Balances
        </button>
      </div>

      {/* Master Wallet Alert */}
      {(!hasEthWallet || !hasTrxWallet) && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-semibold">Master Wallet Not Configured</p>
            <p className="text-yellow-300/80 text-sm mt-1">
              You haven't set your master wallet addresses yet.
              {!hasEthWallet && ' ETH wallet missing.'} {!hasTrxWallet && ' TRX wallet missing.'}
              {' '}Go to <strong>Master Wallets</strong> to configure them so users know where to send funds.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={s.totalUsers?.toLocaleString() ?? '0'} icon={Users} color="blue" />
        <StatCard label="Total Deposits" value={`$${Number(s.totalDepositsUSDT ?? 0).toLocaleString()} USDT`} icon={ArrowDownCircle} color="green" sub={`${s.totalDepositsCount ?? 0} transactions`} />
        <StatCard label="Active Earning" value={`$${Number(s.totalActiveDeposits ?? 0).toLocaleString()} USDT`} icon={BarChart3} color="purple" />
        <StatCard label="Profits Distributed" value={`$${Number(s.totalProfitsDistributed ?? 0).toLocaleString()} USDT`} icon={DollarSign} color="yellow" sub={`${s.distributionsCount ?? 0} distributions`} />
        <StatCard label="Commissions Paid" value={`$${Number(s.totalCommissionsPaid ?? 0).toLocaleString()} USDT`} icon={Users} color="purple" />
        <StatCard label="Pending Confirmations" value={s.pendingConfirmations ?? '0'} icon={ArrowDownCircle} color={s.pendingConfirmations > 0 ? 'yellow' : 'blue'} />
        <StatCard label="Pending Withdrawals" value={s.pendingWithdrawals ?? '0'} icon={ArrowUpCircle} color={s.pendingWithdrawals > 0 ? 'red' : 'blue'} />
      </div>

      {/* Master Wallets Summary */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-blue-400" /> Master Wallets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['eth', 'trx'].map((net) => (
            <div key={net} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{net.toUpperCase()} Master Wallet</span>
                {(wallets[net]?.address ? <span className="badge-green">Configured</span> : <span className="badge-red">Not set</span>)}
              </div>
              <p className="font-mono text-sm text-white break-all">
                {wallets[net]?.address || <span className="text-gray-500 italic">Not configured</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exchange Balances */}
      {data?.exchangeBalances?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-green-400" /> Exchange Balances (last sync)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.exchangeBalances.map((eb: any) => (
              <div key={eb.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium">{eb.exchange}</span>
                  <span className="text-green-400 font-bold">{Number(eb.totalUsdt).toFixed(2)} USDT</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Synced: {new Date(eb.syncedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [view, setView] = useState<View>('dashboard');

  const views: Record<View, JSX.Element> = {
    dashboard: <Dashboard />,
    wallets: <MasterWalletSettings />,
    distribute: <DistributeProfit />,
    users: <AdminUsers />,
    deposits: <AdminDeposits />,
    withdrawals: <AdminWithdrawals />,
    settings: <AdminSettings />,
    audit: <AuditLogs />,
  };

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                view === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {view === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300">← User Dashboard</a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {views[view]}
      </main>
    </div>
  );
}
