'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

function BalanceCard({ label, amount, icon, color = 'blue' }: any) {
  const colors: any = {
    blue: 'border-blue-800 bg-blue-900/10',
    green: 'border-green-800 bg-green-900/10',
    yellow: 'border-yellow-800 bg-yellow-900/10',
    purple: 'border-purple-800 bg-purple-900/10',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm text-gray-400 mb-1">{icon} {label}</p>
      <p className="text-2xl font-bold font-mono">{Number(amount ?? 0).toFixed(2)}</p>
      <p className="text-xs text-gray-500 mt-1">USDT</p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); toast.success('Copied!'); }} className="text-gray-500 hover:text-gray-300">
      <Copy className="w-4 h-4" />
    </button>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'ledger'>('deposits');

  const { data: balance, refetch: refetchBalance } = useQuery({ queryKey: ['balance'], queryFn: () => api.get('/users/me/balance'), refetchInterval: 30000 });
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => api.get('/users/me') });
  const { data: addresses } = useQuery({ queryKey: ['deposit-addresses'], queryFn: () => api.get('/users/me/deposit-addresses') });
  const { data: deposits } = useQuery({ queryKey: ['my-deposits'], queryFn: () => api.get('/users/me/deposits'), enabled: activeTab === 'deposits' });
  const { data: withdrawals } = useQuery({ queryKey: ['my-withdrawals'], queryFn: () => api.get('/users/me/withdrawals'), enabled: activeTab === 'withdrawals' });
  const { data: ledger } = useQuery({ queryKey: ['my-ledger'], queryFn: () => api.get('/users/me/ledger'), enabled: activeTab === 'ledger' });
  const { data: referrals } = useQuery({ queryKey: ['my-referrals'], queryFn: () => api.get('/users/me/referrals') });

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${user?.referralCode}`;

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-xl">💎 YieldPlatform</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">{user?.email}</span>
          {user?.role === 'admin' && <a href="/admin" className="badge-yellow">Admin Panel</a>}
          <button onClick={() => { document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT'; window.location.href = '/auth/login'; }} className="text-gray-500 hover:text-red-400">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Balance Cards */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Portfolio</h1>
          <button onClick={() => refetchBalance()} className="text-gray-500 hover:text-gray-300"><RefreshCw className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <BalanceCard label="Available Balance" amount={balance?.availableBalance} icon="💰" color="blue" />
          <BalanceCard label="Deposited Principal" amount={balance?.depositedPrincipal} icon="🏦" color="green" />
          <BalanceCard label="Pending Profits" amount={balance?.pendingProfit} icon="📈" color="yellow" />
          <BalanceCard label="Referral Earnings" amount={balance?.referralCommission} icon="👥" color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deposit Addresses */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-4">Your Deposit Addresses</h2>
              <p className="text-sm text-gray-400 mb-4">Send USDT to your unique deposit addresses below. Your balance will be credited automatically after blockchain confirmation.</p>

              {addresses && Object.entries(addresses).map(([net, info]: any) => (
                <div key={net} className="bg-gray-800 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{info.network}</span>
                    <span className="badge-gray text-xs">{info.token}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-900 rounded px-3 py-2">
                    <code className="font-mono text-sm text-green-400 flex-1 break-all">{info.address}</code>
                    <CopyButton text={info.address} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Contract: {info.contract}</p>
                </div>
              ))}
            </div>

            {/* Transaction History */}
            <div className="card">
              <div className="flex gap-4 mb-4">
                {(['deposits', 'withdrawals', 'ledger'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`text-sm font-medium capitalize ${activeTab === tab ? 'text-white border-b-2 border-blue-500 pb-1' : 'text-gray-500'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'deposits' && (
                <div className="space-y-2">
                  {deposits?.items?.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No deposits yet</p>}
                  {deposits?.items?.map((d: any) => (
                    <div key={d.id} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-green-400">+{Number(d.amount).toFixed(2)} USDT</p>
                        <p className="text-xs text-gray-500">{d.network} · {new Date(d.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={d.status === 'confirmed' || d.status === 'manual_confirmed' ? 'badge-green' : d.status === 'confirming' ? 'badge-yellow' : 'badge-red'}>{d.status}</span>
                        {d.txHash && <a href={`https://${d.network === 'ETH' ? 'etherscan.io/tx/' : 'tronscan.org/#/transaction/'}${d.txHash}`} target="_blank" rel="noreferrer"><ExternalLink className="w-3 h-3 text-gray-500" /></a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'withdrawals' && (
                <div className="space-y-2">
                  {withdrawals?.items?.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No withdrawals yet</p>}
                  {withdrawals?.items?.map((w: any) => (
                    <div key={w.id} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-red-400">-{Number(w.amount).toFixed(2)} USDT</p>
                        <p className="text-xs text-gray-500">Net: {Number(w.netAmount).toFixed(2)} · {w.network}</p>
                      </div>
                      <span className={w.status === 'completed' ? 'badge-green' : w.status === 'pending' ? 'badge-yellow' : 'badge-red'}>{w.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ledger' && (
                <div className="space-y-1">
                  {ledger?.items?.map((e: any) => (
                    <div key={e.id} className="flex justify-between items-center px-3 py-2 hover:bg-gray-800 rounded">
                      <div>
                        <p className="text-xs font-mono text-gray-300">{e.entryType}</p>
                        <p className="text-xs text-gray-600">{e.memo}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-mono font-bold ${Number(e.amount) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {Number(e.amount) > 0 ? '+' : ''}{Number(e.amount).toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-600">{new Date(e.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Referral */}
            <div className="card">
              <h3 className="font-semibold mb-3">👥 Referral Program</h3>
              <div className="bg-gray-800 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">Your referral link</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-blue-400 flex-1 break-all">{referralLink}</code>
                  <CopyButton text={referralLink} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{referrals?.totalReferrals ?? 0}</p>
                  <p className="text-xs text-gray-500">Referrals</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-purple-400">{referrals?.totalCommissionEarned ?? '0.00'}</p>
                  <p className="text-xs text-gray-500">USDT Earned</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Earn 20% of profits from your referral's first deposit, paid automatically during profit distributions.</p>
            </div>

            {/* Stats */}
            <div className="card">
              <h3 className="font-semibold mb-3">📊 All-Time Stats</h3>
              <div className="space-y-2">
                {[
                  ['Total Withdrawn', balance?.totalWithdrawn, 'red'],
                  ['Total Profits Earned', balance?.totalProfitEarned, 'green'],
                  ['Referral Commissions', balance?.referralCommission, 'purple'],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{label as string}</span>
                    <span className={`font-mono font-bold text-${color}-400`}>{Number(val ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
