'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Save, Key, Settings as SettingsIcon } from 'lucide-react';

export function AdminSettings() {
  const qc = useQueryClient();
  const [showBinanceKey, setShowBinanceKey] = useState(false);
  const [showBybitKey, setShowBybitKey] = useState(false);
  const [binanceKeys, setBinanceKeys] = useState({ apiKey: '', apiSecret: '' });
  const [bybitKeys, setBybitKeys] = useState({ apiKey: '', apiSecret: '' });

  const { data: settings } = useQuery({ queryKey: ['admin-settings'], queryFn: () => adminApi.get('/admin/settings') });

  const exchangeKeyMutation = useMutation({
    mutationFn: (d: { exchange: string; apiKey: string; apiSecret: string }) => adminApi.post('/admin/settings/exchange-keys', d),
    onSuccess: (_, vars) => { toast.success(`${vars.exchange} API keys saved securely`); qc.invalidateQueries({ queryKey: ['admin-settings'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const settingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => adminApi.patch(`/admin/settings/${key}`, { value }),
    onSuccess: () => { toast.success('Setting updated'); qc.invalidateQueries({ queryKey: ['admin-settings'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const getSetting = (key: string) => {
    return settings?.find((s: any) => s.key === key)?.value;
  };

  const [withdrawFee, setWithdrawFee] = useState('');
  const [minWithdraw, setMinWithdraw] = useState('');
  const [minDeposit, setMinDeposit] = useState('');

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="w-6 h-6 text-gray-400" /> Platform Settings</h2>

      {/* Exchange API Keys */}
      <div className="card space-y-6">
        <h3 className="font-semibold flex items-center gap-2 border-b border-gray-800 pb-3"><Key className="w-4 h-4 text-yellow-400" /> Exchange API Keys</h3>
        <p className="text-sm text-gray-400">Keys are stored AES-256-GCM encrypted in the database. They are never logged or returned in API responses.</p>

        {/* Binance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-black text-xs font-bold">B</div>
            <h4 className="font-medium">Binance API Keys</h4>
            {getSetting('binance_api_key')?.configured && <span className="badge-green">Configured</span>}
          </div>
          <div>
            <label className="label">API Key</label>
            <div className="relative">
              <input
                type={showBinanceKey ? 'text' : 'password'}
                className="input pr-10"
                value={binanceKeys.apiKey}
                onChange={(e) => setBinanceKeys((k) => ({ ...k, apiKey: e.target.value }))}
                placeholder={getSetting('binance_api_key')?.configured ? '••••••••(configured)' : 'Enter Binance API Key'}
              />
              <button onClick={() => setShowBinanceKey(!showBinanceKey)} className="absolute right-3 top-2.5 text-gray-500">
                {showBinanceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">API Secret</label>
            <input
              type="password"
              className="input"
              value={binanceKeys.apiSecret}
              onChange={(e) => setBinanceKeys((k) => ({ ...k, apiSecret: e.target.value }))}
              placeholder={getSetting('binance_api_secret')?.configured ? '••••••••(configured)' : 'Enter Binance API Secret'}
            />
          </div>
          <button
            onClick={() => exchangeKeyMutation.mutate({ exchange: 'binance', ...binanceKeys })}
            disabled={!binanceKeys.apiKey || !binanceKeys.apiSecret || exchangeKeyMutation.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Binance Keys
          </button>
        </div>

        <hr className="border-gray-800" />

        {/* Bybit */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-black text-xs font-bold">By</div>
            <h4 className="font-medium">Bybit API Keys</h4>
            {getSetting('bybit_api_key')?.configured && <span className="badge-green">Configured</span>}
          </div>
          <div>
            <label className="label">API Key</label>
            <div className="relative">
              <input
                type={showBybitKey ? 'text' : 'password'}
                className="input pr-10"
                value={bybitKeys.apiKey}
                onChange={(e) => setBybitKeys((k) => ({ ...k, apiKey: e.target.value }))}
                placeholder={getSetting('bybit_api_key')?.configured ? '••••••••(configured)' : 'Enter Bybit API Key'}
              />
              <button onClick={() => setShowBybitKey(!showBybitKey)} className="absolute right-3 top-2.5 text-gray-500">
                {showBybitKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">API Secret</label>
            <input
              type="password"
              className="input"
              value={bybitKeys.apiSecret}
              onChange={(e) => setBybitKeys((k) => ({ ...k, apiSecret: e.target.value }))}
              placeholder={getSetting('bybit_api_secret')?.configured ? '••••••••(configured)' : 'Enter Bybit API Secret'}
            />
          </div>
          <button
            onClick={() => exchangeKeyMutation.mutate({ exchange: 'bybit', ...bybitKeys })}
            disabled={!bybitKeys.apiKey || !bybitKeys.apiSecret || exchangeKeyMutation.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Bybit Keys
          </button>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="card space-y-5">
        <h3 className="font-semibold border-b border-gray-800 pb-3">Financial Settings</h3>

        <div>
          <label className="label">Withdrawal Fee (USDT flat)</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="input"
              defaultValue={getSetting('withdrawal_fee_usdt')?.flat ?? 2}
              onChange={(e) => setWithdrawFee(e.target.value)}
              placeholder="2"
              min="0"
              step="0.1"
            />
            <button
              onClick={() => settingMutation.mutate({ key: 'withdrawal_fee_usdt', value: { flat: parseFloat(withdrawFee), percent: 0 } })}
              disabled={!withdrawFee}
              className="btn-primary px-6"
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <label className="label">Minimum Withdrawal (USDT)</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="input"
              defaultValue={getSetting('min_withdrawal_usdt')?.amount ?? 10}
              onChange={(e) => setMinWithdraw(e.target.value)}
              placeholder="10"
              min="1"
            />
            <button
              onClick={() => settingMutation.mutate({ key: 'min_withdrawal_usdt', value: { amount: parseFloat(minWithdraw) } })}
              disabled={!minWithdraw}
              className="btn-primary px-6"
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <label className="label">Minimum Deposit (USDT)</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="input"
              defaultValue={getSetting('min_deposit_usdt')?.amount ?? 10}
              onChange={(e) => setMinDeposit(e.target.value)}
              placeholder="10"
              min="1"
            />
            <button
              onClick={() => settingMutation.mutate({ key: 'min_deposit_usdt', value: { amount: parseFloat(minDeposit) } })}
              disabled={!minDeposit}
              className="btn-primary px-6"
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <label className="label">Referral Commission Rate</label>
          <div className="flex items-center gap-3">
            <div className="input bg-gray-800/50 text-gray-300 w-40">20% (first deposit)</div>
            <span className="text-sm text-gray-500">Fixed in code per specification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
