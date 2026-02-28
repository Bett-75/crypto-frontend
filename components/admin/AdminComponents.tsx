'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Freeze, UserX, UserCheck } from 'lucide-react';

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.get(`/admin/users?page=${page}&search=${search}`),
  });

  const freezeMut = useMutation({
    mutationFn: ({ id, freeze, reason }: any) => adminApi.patch(`/admin/users/${id}/freeze`, { freeze, reason }),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Management</h2>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input className="input pl-9" placeholder="Search by email or referral code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400">Email</th>
              <th className="text-left px-4 py-3 text-gray-400">Balance</th>
              <th className="text-left px-4 py-3 text-gray-400">KYC</th>
              <th className="text-left px-4 py-3 text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-gray-400">Joined</th>
              <th className="text-left px-4 py-3 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : data?.users?.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-800/30">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{u.email}</p>
                    <p className="text-xs text-gray-500">Code: {u.referralCode}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono text-green-400">{Number(u.balance?.availableBalance ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Principal: {Number(u.balance?.depositedPrincipal ?? 0).toFixed(2)}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={u.kycStatus === 'approved' ? 'badge-green' : u.kycStatus === 'pending' ? 'badge-yellow' : 'badge-red'}>{u.kycStatus}</span>
                </td>
                <td className="px-4 py-3">
                  {u.isFrozen ? <span className="badge-red">Frozen</span> : <span className="badge-green">Active</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => freezeMut.mutate({ id: u.id, freeze: !u.isFrozen, reason: u.isFrozen ? undefined : 'Admin action' })}
                    className={`text-xs px-2 py-1 rounded ${u.isFrozen ? 'bg-green-800 text-green-300 hover:bg-green-700' : 'bg-red-900 text-red-300 hover:bg-red-800'}`}
                  >
                    {u.isFrozen ? 'Unfreeze' : 'Freeze'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
            <span>{data.total} total users</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-xs">Prev</button>
              <span>Page {data.page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={data.users?.length < 50} className="btn-secondary px-3 py-1 text-xs">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminDeposits() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-deposits', page, status],
    queryFn: () => adminApi.get(`/admin/deposits?page=${page}${status ? '&status=' + status : ''}`),
  });

  const confirmMut = useMutation({
    mutationFn: (id: string) => adminApi.post(`/admin/deposits/${id}/manual-confirm`),
    onSuccess: () => { toast.success('Deposit confirmed'); qc.invalidateQueries({ queryKey: ['admin-deposits'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Deposit Management</h2>
      <div className="flex gap-2">
        {['', 'pending', 'confirming', 'confirmed', 'manual_confirmed', 'failed'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded text-sm ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400">User</th>
              <th className="text-left px-4 py-3 text-gray-400">Amount</th>
              <th className="text-left px-4 py-3 text-gray-400">Network</th>
              <th className="text-left px-4 py-3 text-gray-400">Confirmations</th>
              <th className="text-left px-4 py-3 text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-gray-400">Date</th>
              <th className="text-left px-4 py-3 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
              : data?.items?.map((d: any) => (
              <tr key={d.id} className="hover:bg-gray-800/30">
                <td className="px-4 py-3 text-xs text-gray-400">{d.user?.email}</td>
                <td className="px-4 py-3 font-bold text-green-400">{Number(d.amount).toFixed(2)} USDT</td>
                <td className="px-4 py-3"><span className={d.network === 'ETH' ? 'badge-gray' : 'badge-yellow'}>{d.network}</span></td>
                <td className="px-4 py-3 text-xs">{d.confirmations}/{d.requiredConfirmations}</td>
                <td className="px-4 py-3"><span className={d.status === 'confirmed' || d.status === 'manual_confirmed' ? 'badge-green' : d.status === 'confirming' ? 'badge-yellow' : 'badge-red'}>{d.status}</span></td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(d.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {!['confirmed', 'manual_confirmed'].includes(d.status) && (
                    <button onClick={() => confirmMut.mutate(d.id)} className="text-xs bg-blue-800 text-blue-300 hover:bg-blue-700 px-2 py-1 rounded">
                      Manual Confirm
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminWithdrawals() {
  const [status, setStatus] = useState('pending');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', status],
    queryFn: () => adminApi.get(`/admin/withdrawals?status=${status}`),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => adminApi.post(`/admin/withdrawals/${id}/approve`),
    onSuccess: () => { toast.success('Withdrawal approved'); qc.invalidateQueries({ queryKey: ['admin-withdrawals'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.post(`/admin/withdrawals/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Withdrawal rejected'); qc.invalidateQueries({ queryKey: ['admin-withdrawals'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Withdrawal Management</h2>
      <div className="flex gap-2">
        {['pending', 'approved', 'completed', 'rejected', ''].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded text-sm ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400">User</th>
              <th className="text-left px-4 py-3 text-gray-400">Amount</th>
              <th className="text-left px-4 py-3 text-gray-400">Net</th>
              <th className="text-left px-4 py-3 text-gray-400">Network</th>
              <th className="text-left px-4 py-3 text-gray-400">Address</th>
              <th className="text-left px-4 py-3 text-gray-400">Email Confirmed</th>
              <th className="text-left px-4 py-3 text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? <tr><td colSpan={8} className="text-center py-8 text-gray-500">Loading...</td></tr>
              : data?.items?.map((w: any) => (
              <tr key={w.id} className="hover:bg-gray-800/30">
                <td className="px-4 py-3 text-xs text-gray-400">{w.user?.email}</td>
                <td className="px-4 py-3 font-bold">{Number(w.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-green-400">{Number(w.netAmount).toFixed(2)}</td>
                <td className="px-4 py-3">{w.network}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[120px] truncate">{w.toAddress}</td>
                <td className="px-4 py-3">{w.emailConfirmed ? <span className="badge-green">Yes</span> : <span className="badge-red">No</span>}</td>
                <td className="px-4 py-3"><span className={w.status === 'completed' ? 'badge-green' : w.status === 'pending' ? 'badge-yellow' : w.status === 'rejected' ? 'badge-red' : 'badge-gray'}>{w.status}</span></td>
                <td className="px-4 py-3 flex gap-1">
                  {w.status === 'pending' && w.emailConfirmed && (
                    <button onClick={() => approveMut.mutate(w.id)} className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded">Approve</button>
                  )}
                  {['pending', 'approved'].includes(w.status) && (
                    <button onClick={() => rejectMut.mutate({ id: w.id, reason: 'Admin decision' })} className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">Reject</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AuditLogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => adminApi.get(`/admin/audit-logs?page=${page}`),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Audit Logs</h2>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400">Time</th>
              <th className="text-left px-4 py-3 text-gray-400">Action</th>
              <th className="text-left px-4 py-3 text-gray-400">Target</th>
              <th className="text-left px-4 py-3 text-gray-400">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading...</td></tr>
              : data?.items?.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-800/30">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-400">{log.action}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{log.targetType} {log.targetId?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{JSON.stringify(log.newValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-800 flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-xs">Prev</button>
          <span className="text-sm text-gray-400">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!data?.items?.length} className="btn-secondary px-3 py-1 text-xs">Next</button>
        </div>
      </div>
    </div>
  );
}
