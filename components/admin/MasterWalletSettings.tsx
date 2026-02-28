'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Wallet, Save, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';

export function MasterWalletSettings() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['master-wallets'],
    queryFn: () => adminApi.get('/admin/wallets'),
  });

  const [ethAddress, setEthAddress] = useState('');
  const [ethLabel, setEthLabel] = useState('Company ETH Master Wallet');
  const [trxAddress, setTrxAddress] = useState('');
  const [trxLabel, setTrxLabel] = useState('Company TRX Master Wallet');

  useEffect(() => {
    if (data) {
      setEthAddress(data.eth?.address ?? '');
      setEthLabel(data.eth?.label ?? 'Company ETH Master Wallet');
      setTrxAddress(data.trx?.address ?? '');
      setTrxLabel(data.trx?.label ?? 'Company TRX Master Wallet');
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: any) => adminApi.patch('/admin/wallets', payload),
    onSuccess: () => {
      toast.success('Master wallet addresses saved successfully!');
      qc.invalidateQueries({ queryKey: ['master-wallets'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const validateEth = (addr: string) => !addr || /^0x[a-fA-F0-9]{40}$/.test(addr);
  const validateTrx = (addr: string) => !addr || /^T[A-Za-z0-9]{33}$/.test(addr);

  const ethValid = validateEth(ethAddress);
  const trxValid = validateTrx(trxAddress);

  const handleSave = () => {
    if (!ethValid) { toast.error('Invalid ETH address format'); return; }
    if (!trxValid) { toast.error('Invalid TRX address format'); return; }

    mutation.mutate({
      eth: { address: ethAddress, label: ethLabel },
      trx: { address: trxAddress, label: trxLabel },
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  const hasEth = !!data?.eth?.address;
  const hasTrx = !!data?.trx?.address;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6 text-blue-400" />
          Master Wallet Configuration
        </h2>
        <p className="text-gray-400 mt-1">
          These are YOUR company wallets where users will send their deposits.
          After users send to their personal deposit addresses, you manually sweep funds to these master wallets,
          then move them to Binance/Bybit.
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">How master wallets work:</p>
          <ol className="space-y-1 text-blue-300/80 list-decimal list-inside">
            <li>Each user gets a unique deposit address (auto-generated)</li>
            <li>Users send USDT to their personal address</li>
            <li>The platform monitors and credits their balance automatically</li>
            <li>You (admin) manually sweep those funds to the master wallet below</li>
            <li>You then move master wallet funds to Binance/Bybit for earning</li>
          </ol>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl border p-4 ${hasEth ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
          <div className="flex items-center gap-2 mb-1">
            {hasEth ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span className={`text-sm font-medium ${hasEth ? 'text-green-400' : 'text-red-400'}`}>
              ETH Wallet {hasEth ? 'Configured' : 'Not Set'}
            </span>
          </div>
          {hasEth && <p className="font-mono text-xs text-gray-400 break-all">{data.eth.address}</p>}
        </div>
        <div className={`rounded-xl border p-4 ${hasTrx ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
          <div className="flex items-center gap-2 mb-1">
            {hasTrx ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span className={`text-sm font-medium ${hasTrx ? 'text-green-400' : 'text-red-400'}`}>
              TRX Wallet {hasTrx ? 'Configured' : 'Not Set'}
            </span>
          </div>
          {hasTrx && <p className="font-mono text-xs text-gray-400 break-all">{data.trx.address}</p>}
        </div>
      </div>

      {/* ETH Wallet Form */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-blue-400 font-bold text-sm">Ξ</div>
          <div>
            <h3 className="font-semibold">Ethereum (ERC-20) Master Wallet</h3>
            <p className="text-xs text-gray-500">Receives USDT on the Ethereum network</p>
          </div>
        </div>

        <div>
          <label className="label">Wallet Label / Name</label>
          <input
            className="input"
            value={ethLabel}
            onChange={(e) => setEthLabel(e.target.value)}
            placeholder="Company ETH Master Wallet"
          />
        </div>

        <div>
          <label className="label">
            ETH Wallet Address
            <span className="text-gray-600 ml-1">(0x... format, 42 characters)</span>
          </label>
          <input
            className={`input font-mono ${ethAddress && !ethValid ? 'border-red-600' : ''}`}
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value.trim())}
            placeholder="0xYourEthereumWalletAddress..."
            spellCheck={false}
          />
          {ethAddress && !ethValid && (
            <p className="text-red-400 text-xs mt-1">Invalid ETH address. Must start with 0x and be 42 characters.</p>
          )}
          {ethAddress && ethValid && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-green-400 text-xs">Valid ETH address format ✓</p>
              <a href={`https://etherscan.io/address/${ethAddress}`} target="_blank" rel="noreferrer" className="text-blue-400 text-xs flex items-center gap-1 hover:underline">
                View on Etherscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
          <strong className="text-gray-300">USDT Contract:</strong> 0xdAC17F958D2ee523a2206206994597C13D831ec7 (Tether USD on Ethereum)
        </div>
      </div>

      {/* TRX Wallet Form */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
          <div className="w-8 h-8 rounded-full bg-red-900 flex items-center justify-center text-red-400 font-bold text-sm">T</div>
          <div>
            <h3 className="font-semibold">TRON (TRC-20) Master Wallet</h3>
            <p className="text-xs text-gray-500">Receives USDT on the TRON network</p>
          </div>
        </div>

        <div>
          <label className="label">Wallet Label / Name</label>
          <input
            className="input"
            value={trxLabel}
            onChange={(e) => setTrxLabel(e.target.value)}
            placeholder="Company TRX Master Wallet"
          />
        </div>

        <div>
          <label className="label">
            TRX Wallet Address
            <span className="text-gray-600 ml-1">(T... format, 34 characters)</span>
          </label>
          <input
            className={`input font-mono ${trxAddress && !trxValid ? 'border-red-600' : ''}`}
            value={trxAddress}
            onChange={(e) => setTrxAddress(e.target.value.trim())}
            placeholder="TYourTronWalletAddress..."
            spellCheck={false}
          />
          {trxAddress && !trxValid && (
            <p className="text-red-400 text-xs mt-1">Invalid TRX address. Must start with T and be 34 characters.</p>
          )}
          {trxAddress && trxValid && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-green-400 text-xs">Valid TRX address format ✓</p>
              <a href={`https://tronscan.org/#/address/${trxAddress}`} target="_blank" rel="noreferrer" className="text-blue-400 text-xs flex items-center gap-1 hover:underline">
                View on Tronscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
          <strong className="text-gray-300">USDT Contract:</strong> TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t (Tether USD on TRON)
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-yellow-400 font-semibold">Important Security Notice</p>
          <p className="text-yellow-300/70 mt-1">
            Only enter wallet addresses that YOU control and have the private keys for.
            Use a hardware wallet or cold storage for maximum security.
            Never enter exchange hot wallet addresses — always use your own custodial wallet.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={mutation.isPending || (!ethValid) || (!trxValid)}
        className="btn-primary flex items-center gap-2 w-full justify-center py-3"
      >
        <Save className="w-4 h-4" />
        {mutation.isPending ? 'Saving...' : 'Save Master Wallet Addresses'}
      </button>
    </div>
  );
}
