'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { DollarSign, Users, TrendingUp, CheckCircle } from 'lucide-react';

export function DistributeProfit() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ totalProfit: '', exchangeSource: 'binance', periodStart: '', periodEnd: '', notes: '' });
  const [result, setResult] = useState<any>(null);

  const { data: dashboard } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminApi.get('/admin/dashboard') });
  const { data: distributions } = useQuery({ queryKey: ['distributions'], queryFn: () => adminApi.get('/admin/distributions?limit=5') });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => adminApi.post('/admin/distribute-profit', { ...d, totalProfit: parseFloat(d.totalProfit) }),
    onSuccess: (data: any) => {
      setResult(data);
      toast.success('Profits distributed successfully!');
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      qc.invalidateQueries({ queryKey: ['distributions'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalActive = Number(dashboard?.stats?.totalActiveDeposits ?? 0);

  const preview = form.totalProfit && totalActive > 0
    ? { perUser: ((parseFloat(form.totalProfit) / totalActive) * 100).toFixed(4), roi: ((parseFloat(form.totalProfit) / totalActive) * 100).toFixed(2) }
    : null;

  if (result) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="card border-green-800 bg-green-900/10">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-xl font-bold text-green-400">Distribution Complete!</h2>
              <p className="text-sm text-gray-400">Distribution ID: {result.distributionId}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400">Total Profit</p>
              <p className="text-xl font-bold text-green-400">{result.totalProfit} USDT</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400">Users Credited</p>
              <p className="text-xl font-bold">{result.totalUsersCredited}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400">Total Active Deposits</p>
              <p className="text-xl font-bold">{result.totalDeposits} USDT</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400">Referral Commissions</p>
              <p className="text-xl font-bold text-purple-400">{result.totalCommissionsPaid} USDT</p>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-gray-500 border-b border-gray-700">
                <tr>
                  <th className="text-left py-2">User</th>
                  <th className="text-right py-2">Deposit</th>
                  <th className="text-right py-2">Profit</th>
                  <th className="text-right py-2">Referral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {result.report?.map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="py-1.5 text-gray-400">{row.userId.slice(0, 8)}...</td>
                    <td className="text-right py-1.5">{row.depositAmount}</td>
                    <td className="text-right py-1.5 text-green-400">{row.profitShare}</td>
                    <td className="text-right py-1.5 text-purple-400">{row.referralCommission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={() => setResult(null)} className="btn-secondary w-full mt-4">New Distribution</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-6 h-6 text-green-400" /> Distribute Profits</h2>
        <p className="text-gray-400 mt-1">Distribute profits pro-rata to all active depositors. Referral commissions are calculated automatically (20% of first-deposit profits only).</p>
      </div>

      {/* Active pool info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{totalActive.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">USDT Active Pool</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{dashboard?.stats?.totalUsers ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Total Users</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-400">{dashboard?.stats?.distributionsCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Past Distributions</p>
        </div>
      </div>

      {/* Form */}
      <div className="card space-y-4">
        <div>
          <label className="label">Total Profit to Distribute (USDT) *</label>
          <input
            type="number"
            className="input text-xl font-bold"
            value={form.totalProfit}
            onChange={(e) => setForm((f) => ({ ...f, totalProfit: e.target.value }))}
            placeholder="e.g. 10000"
            min="0.01"
            step="0.01"
          />
          {preview && (
            <p className="text-green-400 text-sm mt-1">
              ≈ {preview.roi}% ROI across pool | Rate: {preview.perUser}% per USDT
            </p>
          )}
        </div>

        <div>
          <label className="label">Exchange Source</label>
          <select className="input" value={form.exchangeSource} onChange={(e) => setForm((f) => ({ ...f, exchangeSource: e.target.value }))}>
            <option value="binance">Binance</option>
            <option value="bybit">Bybit</option>
            <option value="mixed">Mixed (both)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Period Start</label>
            <input type="date" className="input" value={form.periodStart} onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))} />
          </div>
          <div>
            <label className="label">Period End</label>
            <input type="date" className="input" value={form.periodEnd} onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input h-20 resize-none" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. Weekly yield from Binance flexible savings" />
        </div>

        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 text-sm text-yellow-300">
          ⚠️ This action will immediately credit profits to all {dashboard?.stats?.totalUsers ?? '?'} active users and is irreversible. Verify the amount before proceeding.
        </div>

        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending || !form.totalProfit || parseFloat(form.totalProfit) <= 0}
          className="btn-success w-full py-3 text-lg font-bold"
        >
          {mutation.isPending ? '⏳ Processing...' : `💰 Distribute ${form.totalProfit || '0'} USDT`}
        </button>
      </div>

      {/* Recent distributions */}
      {distributions?.items?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Recent Distributions</h3>
          <div className="space-y-2">
            {distributions.items.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                <div>
                  <p className="text-sm font-medium">{Number(d.totalProfit).toFixed(2)} USDT</p>
                  <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()} · {d.totalUsersCredited} users</p>
                </div>
                <span className={d.status === 'completed' ? 'badge-green' : 'badge-yellow'}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
